import SuggestionInbox from "@/components/SuggestionInbox";

export const revalidate = 0;

export default function AdminSuggestionsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl">Suggestions</h1>
      <div className="mt-6">
        <SuggestionInbox />
      </div>
    </div>
  );
}
