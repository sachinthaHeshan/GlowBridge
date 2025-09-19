import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==================== GET SINGLE SALON ====================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `SELECT id, name, type, services
       FROM salon WHERE id = $1;`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("Error fetching salon:", err);
    return NextResponse.json(
      { error: "Failed to fetch salon" },
      { status: 500 }
    );
  }
}

// ==================== UPDATE SALON ====================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, type, services } = body;

    const result = await pool.query(
      `UPDATE salon
       SET name = $1, type = $2, services = $3, updated_at = now()
       WHERE id = $4
       RETURNING id, name, type, services;`,
      [name, type, services, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("Error updating salon:", err);
    return NextResponse.json(
      { error: "Failed to update salon" },
      { status: 500 }
    );
  }
}

// ==================== DELETE SALON ====================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `DELETE FROM salon WHERE id = $1 RETURNING id;`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Salon deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting salon:", err);
    return NextResponse.json(
      { error: "Failed to delete salon" },
      { status: 500 }
    );
  }
}
