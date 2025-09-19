"use client";

import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ServiceForm from "@/components/ServiceForm";

export default function EditServicePage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 px-6 md:px-16 py-10 flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <ServiceForm
            mode="edit"
            serviceId={serviceId}
            onCancel={() => router.back()}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}
