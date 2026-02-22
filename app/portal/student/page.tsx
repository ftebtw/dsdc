import { redirect } from 'next/navigation';

export default function StudentPortalIndexPage() {
  redirect('/portal/student/classes');
}
