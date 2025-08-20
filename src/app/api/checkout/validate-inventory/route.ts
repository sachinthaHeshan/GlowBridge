import { NextRequest, NextResponse } from 'next/server';
import { CartItem } from '@/types/cart';

// Validate inventory for checkout
export async function POST(request: NextRequest) {
  try {
    const { items }: { items: CartItem[] } = await request.json();

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Invalid items data' },
        { status: 400 }
      );
    }

    const issues: string[] = [];

    // Check each item's availability
    for (const item of items) {
      if (!item.product) {
        issues.push(`Product information missing for cart item`);
        continue;
      }

      if (item.product.available_quantity < item.quantity) {
        issues.push(
          `Only ${item.product.available_quantity} units of "${item.product.name}" are available (you requested ${item.quantity})`
        );
      }
    }

    return NextResponse.json({
      available: issues.length === 0,
      issues
    });

  } catch (error) {
    console.error('Error validating inventory:', error);
    return NextResponse.json(
      { error: 'Failed to validate inventory' },
      { status: 500 }
    );
  }
}
