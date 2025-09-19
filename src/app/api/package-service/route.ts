import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==================== GET ALL PACKAGE-SERVICE LINKS ====================
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT ps.id, ps.package_id, ps.service_id,
             p.name AS package_name,
             s.name AS service_name
      FROM package_service ps
      JOIN package p ON ps.package_id = p.id
      JOIN service s ON ps.service_id = s.id
      ORDER BY p.name ASC, s.name ASC;
    `);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (err) {
    console.error("Error fetching package-service links:", err);
    return NextResponse.json({ error: "Failed to fetch package-service links" }, { status: 500 });
  }
}

// ==================== CREATE NEW PACKAGE-SERVICE LINK ====================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { package_id, service_id } = body;

    if (!package_id || !service_id) {
      return NextResponse.json({ error: "package_id and service_id are required" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO package_service (id, package_id, service_id)
       VALUES (uuid_generate_v4(), $1, $2)
       RETURNING id, package_id, service_id;`,
      [package_id, service_id]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("Error creating package-service link:", err);
    return NextResponse.json({ error: "Failed to create package-service link" }, { status: 500 });
  }
}
