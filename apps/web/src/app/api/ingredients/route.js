import sql from "@/app/api/utils/sql";

export async function GET() {
  try {
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
    console.error("GET /api/ingredients error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
