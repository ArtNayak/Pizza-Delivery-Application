import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Bootstrap endpoint: promotes the current user to admin, but only while no admin exists yet.
// Once the first admin is created it always returns 403, so nobody can escalate their own role.
export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // single atomic statement: the NOT EXISTS check and the update cannot race
    const rows = await sql`
      UPDATE auth_users
      SET role = 'admin'
      WHERE id = ${session.user.id}
        AND NOT EXISTS (SELECT 1 FROM auth_users WHERE role = 'admin')
      RETURNING id, email, role
    `;

    if (rows.length === 0) {
      return Response.json(
        { error: "Forbidden - an admin already exists" },
        { status: 403 },
      );
    }

    return Response.json({
      message: "Successfully promoted to admin",
      user: rows[0],
    });
  } catch (err) {
    console.error("POST /api/admin/promote error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
