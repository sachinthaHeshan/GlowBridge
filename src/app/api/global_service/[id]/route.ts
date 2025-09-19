import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ==================== GET SINGLE GLOBAL SERVICE ====================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `SELECT id, name, description
       FROM global_service WHERE id = $1;`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Global service not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("Error fetching global service:", err);
    return NextResponse.json(
      { error: "Failed to fetch global service" },
      { status: 500 }
    );
  }
}

// ==================== UPDATE GLOBAL SERVICE ====================
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, description } = body;

    const result = await pool.query(
      `UPDATE global_service
       SET name = $1, description = $2
       WHERE id = $3
       RETURNING id, name, description;`,
      [name, description, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Global service not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0], { status: 200 });
  } catch (err) {
    console.error("Error updating global service:", err);
    return NextResponse.json(
      { error: "Failed to update global service" },
      { status: 500 }
    );
  }
}

// ==================== DELETE GLOBAL SERVICE ====================
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `DELETE FROM global_service WHERE id = $1 RETURNING id;`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Global service not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Global service deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Error deleting global service:", err);
    return NextResponse.json(
      { error: "Failed to delete global service" },
      { status: 500 }
    );
  }
}
