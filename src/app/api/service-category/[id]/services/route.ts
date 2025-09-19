import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params; // but this is actually category name, not row id

    const result = await pool.query(
      `
      SELECT s.id,
             s.salon_id,
             s.is_completed,
             s.name,
             s.description,
             s.duration,
             s.price,
             s.is_public,
             COALESCE(s.discount, 0)::int AS discount,
             s.service_feedbacks
      FROM service s
      JOIN service_category sc ON sc.service_id = s.id
      WHERE sc.name = $1
      ORDER BY s.name ASC;
      `,
      [decodeURIComponent(id)]
    );

    return NextResponse.json(result.rows, { status: 200 });
  } catch (err) {
    console.error("Error fetching services for category:", err);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
