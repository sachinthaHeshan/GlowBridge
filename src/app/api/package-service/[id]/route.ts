import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==================== GET SINGLE PACKAGE-SERVICE LINK ====================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `SELECT ps.id, ps.package_id, ps.service_id,
              p.name AS package_name,
              s.name AS service_name
       FROM package_service ps
       JOIN package p ON ps.package_id = p.id
       JOIN service s ON ps.service_id = s.id
       WHERE ps.id = $1;`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Package-service link not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("Error fetching package-service link:", err);
    return NextResponse.json({ error: "Failed to fetch package-service link" }, { status: 500 });
  }
}

// ==================== UPDATE PACKAGE-SERVICE LINK ====================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { package_id, service_id } = body;

    if (!package_id || !service_id) {
      return NextResponse.json({ error: "package_id and service_id are required" }, { status: 400 });
    }

    const result = await pool.query(
      `UPDATE package_service
       SET package_id = $1, service_id = $2
       WHERE id = $3
       RETURNING id, package_id, service_id;`,
      [package_id, service_id, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Package-service link not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("Error updating package-service link:", err);
    return NextResponse.json({ error: "Failed to update package-service link" }, { status: 500 });
  }
}

// ==================== DELETE PACKAGE-SERVICE LINK ====================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `DELETE FROM package_service WHERE id = $1 RETURNING id;`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Package-service link not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Package-service link deleted successfully" }, { status: 200 });
  } catch (err) {
    console.error("Error deleting package-service link:", err);
    return NextResponse.json({ error: "Failed to delete package-service link" }, { status: 500 });
  }
}
