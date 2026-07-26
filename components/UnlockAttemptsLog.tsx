export type UnlockAttempt = {
  id: string;
  code_entered: string;
  success: boolean;
  created_at: string;
};

export default function UnlockAttemptsLog({
  attempts,
}: {
  attempts: UnlockAttempt[];
}) {
  return (
    <div className="card mt-6 max-w-lg rounded-lg p-5">
      <h2 className="font-display text-lg">Recent unlock attempts</h2>
      <p className="mt-1 text-xs text-muted">
        A spike of successful unlocks from codes you don't recognize
        entering usually means the code has spread — rotate it above if so.
      </p>

      {attempts.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No attempts yet.</p>
      ) : (
        <div className="mt-4 space-y-2">
          {attempts.map((a) => (
            <div
              key={a.id}
              className="flex items-center justify-between border-b border-border pb-2 text-sm"
            >
              <span className="text-muted">
                {new Date(a.created_at).toLocaleString()}
              </span>
              <span className="font-mono">{a.code_entered}</span>
              <span
                className={a.success ? "text-accent" : "text-red-400"}
              >
                {a.success ? "Unlocked" : "Invalid"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
