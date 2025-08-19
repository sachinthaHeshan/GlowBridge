import { Salon } from '@/types/product';

const mockSalons: Salon[] = [
  { id: 'salon-1', name: 'Bella Beauty Salon' },
  { id: 'salon-2', name: 'Glamour Studio' },
  { id: 'salon-3', name: 'Elite Beauty Center' },
];

export async function GET() {
  try {
    return new Response(JSON.stringify(mockSalons), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching salons:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch salons' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
