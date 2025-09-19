import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==================== GET ALL PACKAGES ====================
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.description, p.is_public,
             COALESCE(json_agg(ps.service_id) FILTER (WHERE ps.service_id IS NOT NULL), '[]') AS services
      FROM package p
      LEFT JOIN package_service ps ON ps.package_id = p.id
      GROUP BY p.id
      ORDER BY p.name ASC;
    `);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (err) {
    console.error("Error fetching packages:", err);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

// ==================== CREATE NEW PACKAGE ====================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, is_public = true } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO package (id, name, description, is_public)
       VALUES (uuid_generate_v4(), $1, $2, $3)
       RETURNING id, name, description, is_public;`,
      [name, description, is_public]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("Error creating package:", err);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
