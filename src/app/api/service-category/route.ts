import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==================== GET ALL UNIQUE SERVICE CATEGORIES ====================
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (sc.name) 
             sc.id, sc.name, sc.description
      FROM service_category sc
      ORDER BY sc.name, sc.id;
    `);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (err) {
    console.error("Error fetching service categories:", err);
    return NextResponse.json({ error: "Failed to fetch service categories" }, { status: 500 });
  }
}

// ==================== CREATE NEW SERVICE CATEGORY ====================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { service_id, name, description } = body;

    if (!service_id || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO service_category (id, service_id, name, description)
       VALUES (uuid_generate_v4(), $1, $2, $3)
       RETURNING id, service_id, name, description;`,
      [service_id, name, description]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("Error creating service category:", err);
    return NextResponse.json({ error: "Failed to create service category" }, { status: 500 });
  }
}
