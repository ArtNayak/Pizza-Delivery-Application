import sql from "@/app/api/utils/sql";
import pool from "@/app/api/utils/pool";
import { auth } from "@/auth";

// Get user's orders
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const orders = await sql`
      SELECT o.*, 
        json_agg(
          json_build_object(
            'id', oi.id,
            'price', oi.price,
            'base', (SELECT name FROM pizza_bases WHERE id = oi.pizza_base_id),
            'sauce', (SELECT name FROM sauces WHERE id = oi.sauce_id),
            'cheese', (SELECT name FROM cheeses WHERE id = oi.cheese_id),
            'veggies', (
              SELECT json_agg(v.name)
              FROM order_item_veggies oiv
              JOIN veggies v ON v.id = oiv.veggie_id
              WHERE oiv.order_item_id = oi.id
            ),
            'meats', (
              SELECT json_agg(m.name)
              FROM order_item_meats oim
              JOIN meats m ON m.id = oim.meat_id
              WHERE oim.order_item_id = oi.id
            )
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = ${userId}
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    return Response.json({ orders });
  } catch (err) {
    console.error("GET /api/orders error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

class OrderError extends Error {}

const isId = (v) => Number.isInteger(v) && v > 0;
const isIdList = (v) => Array.isArray(v) && v.length <= 20 && v.every(isId);

// Take one unit from stock and return the item's current price. Fails if the item is missing or sold out.
// `table` always comes from the fixed lists below, never from the request.
async function takeOne(client, table, id) {
  const { rows } = await client.query(
    `UPDATE ${table} SET stock_quantity = stock_quantity - 1
     WHERE id = $1 AND stock_quantity > 0 RETURNING name, price`,
    [id],
  );
  if (rows.length === 0) {
    throw new OrderError(`An ingredient (${table} #${id}) is unavailable or out of stock`);
  }
  return Math.round(parseFloat(rows[0].price) * 100); // work in paise/cents to avoid float drift
}

// Create a new order. Prices and stock are always taken from the database, never from the client.
export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { items, paymentId } = await request.json();

    if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
      return Response.json({ error: "No items in order" }, { status: 400 });
    }
    const valid = items.every(
      (i) =>
        isId(i?.baseId) &&
        isId(i?.sauceId) &&
        isId(i?.cheeseId) &&
        isIdList(i.veggieIds ?? []) &&
        isIdList(i.meatIds ?? []),
    );
    if (!valid) {
      return Response.json({ error: "Invalid order items" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // pass 1: reserve stock and price every item from the database
      const priced = [];
      let totalCents = 0;
      for (const item of items) {
        const veggieIds = item.veggieIds ?? [];
        const meatIds = item.meatIds ?? [];
        let cents = 0;
        cents += await takeOne(client, "pizza_bases", item.baseId);
        cents += await takeOne(client, "sauces", item.sauceId);
        cents += await takeOne(client, "cheeses", item.cheeseId);
        for (const id of veggieIds) cents += await takeOne(client, "veggies", id);
        for (const id of meatIds) cents += await takeOne(client, "meats", id);
        priced.push({ ...item, veggieIds, meatIds, price: cents / 100 });
        totalCents += cents;
      }

      // pass 2: write the order
      const payment = typeof paymentId === "string" ? paymentId.slice(0, 100) : null;
      const { rows: orderRows } = await client.query(
        `INSERT INTO orders (user_id, total_price, payment_id, payment_status, status)
         VALUES ($1, $2, $3, $4, 'Order Received') RETURNING *`,
        [userId, totalCents / 100, payment, payment ? "completed" : "pending"],
      );
      const order = orderRows[0];

      for (const item of priced) {
        const { rows } = await client.query(
          `INSERT INTO order_items (order_id, pizza_base_id, sauce_id, cheese_id, price)
           VALUES ($1, $2, $3, $4, $5) RETURNING id`,
          [order.id, item.baseId, item.sauceId, item.cheeseId, item.price],
        );
        for (const id of item.veggieIds) {
          await client.query(
            "INSERT INTO order_item_veggies (order_item_id, veggie_id) VALUES ($1, $2)",
            [rows[0].id, id],
          );
        }
        for (const id of item.meatIds) {
          await client.query(
            "INSERT INTO order_item_meats (order_item_id, meat_id) VALUES ($1, $2)",
            [rows[0].id, id],
          );
        }
      }

      await client.query("COMMIT");

      // Check for low stock and send alerts (asynchronous, don't block response)
      checkLowStockAlerts().catch((err) =>
        console.error("Low stock check failed:", err),
      );

      return Response.json({ order });
    } catch (err) {
      await client.query("ROLLBACK").catch(() => {});
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    if (err instanceof OrderError) {
      return Response.json({ error: err.message }, { status: 400 });
    }
    console.error("POST /api/orders error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function checkLowStockAlerts() {
  try {
    const alerts = await sql`
      SELECT ia.*, 
        CASE ia.item_type
          WHEN 'pizza_base' THEN (SELECT stock_quantity FROM pizza_bases WHERE id = ia.item_id)
          WHEN 'sauce' THEN (SELECT stock_quantity FROM sauces WHERE id = ia.item_id)
          WHEN 'cheese' THEN (SELECT stock_quantity FROM cheeses WHERE id = ia.item_id)
          WHEN 'veggie' THEN (SELECT stock_quantity FROM veggies WHERE id = ia.item_id)
          WHEN 'meat' THEN (SELECT stock_quantity FROM meats WHERE id = ia.item_id)
        END as current_stock
      FROM inventory_alerts ia
    `;

    for (const alert of alerts) {
      if (alert.current_stock <= alert.threshold_value) {
        // Check if alert was sent recently (within last 24 hours)
        const shouldSend =
          !alert.last_alert_sent ||
          new Date() - new Date(alert.last_alert_sent) > 24 * 60 * 60 * 1000;

        if (shouldSend) {
          // Send email alert (this would integrate with an email service)
          console.log(
            `LOW STOCK ALERT: ${alert.item_type} ID ${alert.item_id} has ${alert.current_stock} items remaining (threshold: ${alert.threshold_value})`,
          );

          // Update last alert sent time
          await sql`
            UPDATE inventory_alerts 
            SET last_alert_sent = NOW() 
            WHERE id = ${alert.id}
          `;
        }
      }
    }
  } catch (err) {
    console.error("Check low stock alerts error:", err);
  }
}
