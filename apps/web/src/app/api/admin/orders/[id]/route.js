import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Update order status (admin only)
export async function PATCH(request, { params }) {
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

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return Response.json({ error: "Status is required" }, { status: 400 });
    }

    const validStatuses = [
      "Order Received",
      "In the Kitchen",
      "Sent to Delivery",
      "Delivered",
    ];
    if (!validStatuses.includes(status)) {
      return Response.json({ error: "Invalid status" }, { status: 400 });
    }

    const rows = await sql`
      UPDATE orders 
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json({ order: rows[0] });
  } catch (err) {
    console.error("PATCH /api/admin/orders/[id] error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
