import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==================== GET SINGLE SERVICE ====================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `SELECT s.id, s.salon_id, s.is_completed, s.name, s.description, s.duration, 
              s.price, s.is_public, s.discount, s.service_feedbacks
       FROM service s
       WHERE s.id = $1;`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("Error fetching service:", err);
    return NextResponse.json({ error: "Failed to fetch service" }, { status: 500 });
  }
}

// ==================== UPDATE SERVICE ====================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const {
      salon_id,
      is_completed,
      name,
      description,
      duration,
      price,
      is_public,
      discount,
      service_feedbacks,
    } = body;

    const result = await pool.query(
      `UPDATE service
       SET salon_id = $1, is_completed = $2, name = $3, description = $4, duration = $5, 
           price = $6, is_public = $7, discount = $8, service_feedbacks = $9
       WHERE id = $10
       RETURNING id, salon_id, is_completed, name, description, duration, price, is_public, discount, service_feedbacks;`,
      [salon_id, is_completed, name, description, duration, price, is_public, discount, service_feedbacks, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("Error updating service:", err);
    return NextResponse.json({ error: "Failed to update service" }, { status: 500 });
  }
}

// ==================== DELETE SERVICE ====================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `DELETE FROM service WHERE id = $1 RETURNING id;`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Service deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting service:", err);
    return NextResponse.json({ error: "Failed to delete service" }, { status: 500 });
  }
}
