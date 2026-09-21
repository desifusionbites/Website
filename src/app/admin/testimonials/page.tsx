import React from 'react';
import { getTestimonials } from '@/lib/db';
import { TestimonialManager } from '@/components/admin/TestimonialManager';

export const revalidate = 0;

export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials(true);

  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          Customer Testimonials Management
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Publish real reviews and feedback received from patrons across India.
        </p>
      </div>

      <TestimonialManager initialTestimonials={testimonials} />
    </div>
  );
}
