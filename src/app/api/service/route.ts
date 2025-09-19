import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==================== GET ALL SERVICES ====================
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT s.id, s.salon_id, s.is_completed, s.name, s.description, s.duration, 
             s.price, s.is_public, s.discount, s.service_feedbacks
      FROM service s
      ORDER BY s.name ASC;
    `);

    return NextResponse.json(result.rows, { status: 200 });
  } catch (err) {
    console.error("Error fetching services:", err);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}

// ==================== CREATE NEW SERVICE ====================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      salon_id,
      is_completed = false,
      name,
      description,
      duration,
      price,
      is_public,
      discount = 0,
      service_feedbacks = null,
    } = body;

    if (!salon_id || !name || !description || !duration || is_public === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO service 
       (id, salon_id, is_completed, name, description, duration, price, is_public, discount, service_feedbacks)
       VALUES (uuid_generate_v4(), $1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, salon_id, is_completed, name, description, duration, price, is_public, discount, service_feedbacks;`,
      [salon_id, is_completed, name, description, duration, price, is_public, discount, service_feedbacks]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (err) {
    console.error("Error inserting service:", err);
    return NextResponse.json({ error: "Failed to create service" }, { status: 500 });
  }
}
