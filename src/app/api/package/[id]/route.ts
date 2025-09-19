import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==================== GET SINGLE PACKAGE ====================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(`
      SELECT p.id, p.name, p.description, p.is_public,
             COALESCE(json_agg(ps.service_id) FILTER (WHERE ps.service_id IS NOT NULL), '[]') AS services
      FROM package p
      LEFT JOIN package_service ps ON ps.package_id = p.id
      WHERE p.id = $1
      GROUP BY p.id;
    `, [id]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("Error fetching package:", err);
    return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 });
  }
}

// ==================== UPDATE PACKAGE ====================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, description, is_public } = body;

    const result = await pool.query(
      `UPDATE package
       SET name = $1, description = $2, is_public = $3
       WHERE id = $4
       RETURNING id, name, description, is_public;`,
      [name, description, is_public, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("Error updating package:", err);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  }
}

// ==================== DELETE PACKAGE ====================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `DELETE FROM package WHERE id = $1 RETURNING id;`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Package deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting package:", err);
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  }
}
