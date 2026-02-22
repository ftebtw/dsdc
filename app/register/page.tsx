import { redirect } from "next/navigation";
import RegisterForm from "./RegisterForm";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/register/classes");
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-warm-100 via-white to-gold-50 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 pt-28 pb-14">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <RegisterForm />
      </div>
    </section>
  );
}
