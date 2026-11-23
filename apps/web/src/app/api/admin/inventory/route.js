import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all inventory (admin only)
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

    const bases = await sql`SELECT * FROM pizza_bases ORDER BY name`;
    const sauces = await sql`SELECT * FROM sauces ORDER BY name`;
    const cheeses = await sql`SELECT * FROM cheeses ORDER BY name`;
    const veggies = await sql`SELECT * FROM veggies ORDER BY name`;
    const meats = await sql`SELECT * FROM meats ORDER BY name`;

    return Response.json({
      bases,
      sauces,
      cheeses,
      veggies,
      meats,
    });
  } catch (err) {
    console.error("GET /api/admin/inventory error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update inventory item (admin only)
export async function PATCH(request) {
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

    const body = await request.json();
    const { itemType, itemId, stockQuantity, price, name } = body;

    if (!itemType || !itemId) {
      return Response.json(
        { error: "Item type and ID are required" },
        { status: 400 },
      );
    }

    const tableMap = {
      pizza_base: "pizza_bases",
      sauce: "sauces",
      cheese: "cheeses",
      veggie: "veggies",
      meat: "meats",
    };

    const tableName = tableMap[itemType];
    if (!tableName) {
      return Response.json({ error: "Invalid item type" }, { status: 400 });
    }

    // Build update query
    const setClauses = [];
    const values = [];
    let paramCount = 0;

    if (stockQuantity !== undefined) {
      paramCount++;
      setClauses.push(`stock_quantity = $${paramCount}`);
      values.push(stockQuantity);
    }

    if (price !== undefined) {
      paramCount++;
      setClauses.push(`price = $${paramCount}`);
      values.push(price);
    }

    if (name !== undefined) {
      paramCount++;
      setClauses.push(`name = $${paramCount}`);
      values.push(name);
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    paramCount++;
    const query = `UPDATE ${tableName} SET ${setClauses.join(", ")} WHERE id = $${paramCount} RETURNING *`;
    values.push(itemId);

    const rows = await sql(query, values);

    if (rows.length === 0) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    return Response.json({ item: rows[0] });
  } catch (err) {
    console.error("PATCH /api/admin/inventory error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
