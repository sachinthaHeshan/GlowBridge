import { GetServerSideProps } from 'next';
import { BeautyMarketplace } from '../components/BeautyMarketplace';

interface HomeProps {
  initialProducts?: any[];
}

export default function Home({ initialProducts }: HomeProps) {
  return <BeautyMarketplace initialProducts={initialProducts} />;
}

// Optional: Fetch initial data on the server
export const getServerSideProps: GetServerSideProps = async () => {
  try {
    // Fetch initial products from API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/products?limit=12&page=1`);
    
    if (response.ok) {
      const data = await response.json();
      return {
        props: {
          initialProducts: data.data || []
        }
      };
    }
  } catch (error) {
    console.error('Failed to fetch initial products:', error);
  }
  
  return {
    props: {
      initialProducts: []
    }
  };
};
