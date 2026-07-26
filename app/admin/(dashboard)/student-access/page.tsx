import { createClient } from "@/lib/supabase-server";
import StudentUnlockSettings, {
  UnlockSettings,
} from "@/components/StudentUnlockSettings";
import UnlockAttemptsLog, {
  UnlockAttempt,
} from "@/components/UnlockAttemptsLog";

export const revalidate = 0;

export default async function AdminStudentAccessPage() {
  const supabase = createClient();
  const [{ data: settings }, { data: attempts }] = await Promise.all([
    supabase
      .from("student_unlock_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle(),
    supabase
      .from("unlock_attempts")
      .select("id, code_entered, success, created_at")
      .order("created_at", { ascending: false })
      .limit(25),
  ]);

  const defaultSettings: UnlockSettings = {
    code: "STUDENT",
    starts_at: null,
    expires_at: null,
    active: false,
  };

  return (
    <div>
      <h1 className="font-display text-2xl">Student discount — unlock code</h1>
      <p className="mt-2 text-muted">
        An easier way in than the school-email flow at{" "}
        <a href="/admin/schools" className="text-accent underline">
          Schools
        </a>{" "}
        — students enter a single code at /student instead of verifying an
        email. Both methods lead to the same student catalog and pricing.
      </p>

      <StudentUnlockSettings
        initialSettings={(settings as UnlockSettings) ?? defaultSettings}
      />

      <UnlockAttemptsLog attempts={(attempts as UnlockAttempt[]) ?? []} />
    </div>
  );
}
