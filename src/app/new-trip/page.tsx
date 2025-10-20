import NewTripForm from '@/components/NewTripForm';
import { redirect } from 'next/navigation';

export default function NewTripPage() {
  redirect('/');
  return null;

  return (
    <div className="container mx-auto py-8">
      <NewTripForm />
    </div>
  );
}
