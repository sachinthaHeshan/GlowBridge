import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Get all salons from database
    const result = await db.query(`
      SELECT 
        id,
        name,
        type,
        bio,
        location,
        contact_number,
        created_at,
        updated_at
      FROM salon
      ORDER BY name ASC
    `);

    const salons = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      type: row.type,
      bio: row.bio,
      location: row.location,
      contactNumber: row.contact_number,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return NextResponse.json({
      success: true,
      salons
    });

  } catch (error) {
    console.error('Salons API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch salons',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
