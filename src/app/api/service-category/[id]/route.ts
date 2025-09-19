import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==================== GET SINGLE SERVICE CATEGORY ====================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `SELECT sc.id, sc.service_id, sc.name, sc.description,
              s.name AS service_name
       FROM service_category sc
       JOIN service s ON sc.service_id = s.id
       WHERE sc.id = $1;`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Service category not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("Error fetching service category:", err);
    return NextResponse.json({ error: "Failed to fetch service category" }, { status: 500 });
  }
}

// ==================== UPDATE SERVICE CATEGORY ====================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { service_id, name, description } = body;

    const result = await pool.query(
      `UPDATE service_category
       SET service_id = $1, name = $2, description = $3
       WHERE id = $4
       RETURNING id, service_id, name, description;`,
      [service_id, name, description, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Service category not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("Error updating service category:", err);
    return NextResponse.json({ error: "Failed to update service category" }, { status: 500 });
  }
}

// ==================== DELETE SERVICE CATEGORY ====================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `DELETE FROM service_category WHERE id = $1 RETURNING id;`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Service category not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Service category deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting service category:", err);
    return NextResponse.json({ error: "Failed to delete service category" }, { status: 500 });
  }
}
