import { PlusIcon } from "@heroicons/react/24/outline";

interface HeaderProps {
  onAddCandidate: () => void;
}

export default function Header({ onAddCandidate }: HeaderProps) {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">ATS - Applicant Tracking System</h1>
        <button onClick={onAddCandidate} className="btn btn-primary flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Add Candidate
        </button>
      </div>
    </header>
  );
}
