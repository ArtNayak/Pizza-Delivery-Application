import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all orders (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const userRows =
      await sql`SELECT role FROM auth_users WHERE id = ${session.user.id}`;
    if (!userRows[0] || userRows[0].role !== "admin") {
      return Response.json(
        { error: "Forbidden - Admin only" },
        { status: 403 },
      );
    }

    const orders = await sql`
      SELECT o.*, 
        u.email as user_email,
        u.name as user_name,
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
      LEFT JOIN auth_users u ON u.id = o.user_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id, u.email, u.name
      ORDER BY o.created_at DESC
    `;

    return Response.json({ orders });
  } catch (err) {
    console.error("GET /api/admin/orders error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
