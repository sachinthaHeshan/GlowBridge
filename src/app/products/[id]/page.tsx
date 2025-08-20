'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ProductDetail } from '@/components/ProductDetail';
import { AppLayout } from '@/components/AppLayout';

export default function ProductPage() {
  const params = useParams();
  const productId = params?.id as string;

  if (!productId) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <ProductDetail productId={productId} />
    </AppLayout>
  );
}
