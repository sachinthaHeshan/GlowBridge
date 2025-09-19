import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==================== GET ALL GLOBAL SERVICES ====================
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, name, description
       FROM global_service
       ORDER BY name ASC;`
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (err) {
    console.error("Error fetching global services:", err);
    return NextResponse.json(
      { error: "Failed to fetch global services" },
      { status: 500 }
    );
  }
}

// ==================== CREATE NEW GLOBAL SERVICE ====================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: "name and description are required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO global_service (id, name, description)
       VALUES (uuid_generate_v4(), $1, $2)
       RETURNING id, name, description;`,
      [name, description]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("Error inserting global service:", err);
    return NextResponse.json(
      { error: "Failed to create global service" },
      { status: 500 }
    );
  }
}
