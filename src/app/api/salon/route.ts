import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==================== GET ALL SALONS ====================
export async function GET() {
  try {
    const result = await pool.query(
      `SELECT id, name, type, services
       FROM salon
       ORDER BY created_at DESC;`
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (err) {
    console.error("Error fetching salons:", err);
    return NextResponse.json(
      { error: "Failed to fetch salons" },
      { status: 500 }
    );
  }
}

// ==================== CREATE NEW SALON ====================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, type, services } = body;

    if (!name || !type || !services) {
      return NextResponse.json(
        { error: "name, type, and services are required" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `INSERT INTO salon (id, name, type, services, created_at, updated_at)
       VALUES (uuid_generate_v4(), $1, $2, $3, now(), now())
       RETURNING id, name, type, services;`,
      [name, type, services]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("Error inserting salon:", err);
    return NextResponse.json(
      { error: "Failed to create salon" },
      { status: 500 }
    );
  }
}
