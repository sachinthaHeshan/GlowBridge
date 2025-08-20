import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

export async function GET() {
  try {
    // Test basic connection
    const timeResult = await db.query('SELECT NOW() as current_time');
    
    // Get table counts
    const tables = [
      'user', 'salon', 'product', 'shopping_cart_item', 
      'order', 'order_item', 'service', 'appointment'
    ];
    
    const counts: Record<string, number> = {};
    
    for (const table of tables) {
      try {
        const result = await db.query(`SELECT COUNT(*) as count FROM "${table}"`);
        counts[table] = parseInt(result.rows[0].count);
      } catch (error) {
        counts[table] = -1; // Error counting
      }
    }

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        currentTime: timeResult.rows[0].current_time,
        tables: counts
      }
    });

  } catch (error) {
    console.error('Database status API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}
