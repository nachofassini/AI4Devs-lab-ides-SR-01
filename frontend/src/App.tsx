import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import SearchSection from "./components/SearchSection";
import CandidatesList from "./components/CandidatesList";
import CandidateForm from "./components/CandidateForm";
import { useState } from "react";

const queryClient = new QueryClient();

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Header onAddCandidate={() => setIsFormOpen(true)} />
        <main className="container mx-auto px-4 py-8">
          <SearchSection />
          <CandidatesList onSelectCandidate={setSelectedCandidate} />
        </main>
        <CandidateForm
          isOpen={isFormOpen || !!selectedCandidate}
          onClose={() => {
            setIsFormOpen(false);
            setSelectedCandidate(null);
          }}
          candidateId={selectedCandidate}
        />
        <Toaster position="top-right" />
      </div>
    </QueryClientProvider>
  );
}

export default App;
