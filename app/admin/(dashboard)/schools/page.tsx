import { createClient } from "@/lib/supabase-server";
import SchoolDomainsManager from "@/components/SchoolDomainsManager";

export const revalidate = 0;

export default async function AdminSchoolsPage() {
  const supabase = createClient();
  const { data: domains } = await supabase
    .from("school_domains")
    .select("*")
    .order("school_name", { ascending: true });

  return (
    <div>
      <h1 className="font-display text-2xl">Student discount — schools</h1>
      <p className="mt-2 text-muted">
        Add each school whose students should get access to the student
        catalog. Turn a school off any time (e.g. school holidays) without
        losing the list — you'll likely want everything off outside term
        time.
      </p>
      <SchoolDomainsManager initialDomains={domains ?? []} />
    </div>
  );
}
