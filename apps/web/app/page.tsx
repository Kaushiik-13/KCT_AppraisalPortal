import { redirect } from 'next/navigation';

// Prototype entry: the Organization flow starts at sign up.
export default function HomePage() {
  redirect('/signup');
}
