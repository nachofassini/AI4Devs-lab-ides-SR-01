import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  available: boolean;
  experience: Array<{
    role: string;
    company: string;
    industry: string;
    startDate: string;
    endDate: string | null;
  }>;
  education: Array<{
    institution: string;
    title: string;
    degree: string;
    years: number | null;
  }>;
  resumeUrl?: string;
}

interface CandidatesListProps {
  onSelectCandidate: (id: string) => void;
}

export default function CandidatesList({ onSelectCandidate }: CandidatesListProps) {
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery<Candidate[]>({
    queryKey: ["candidates"],
    queryFn: async ({ pageParam = 1 }) => {
      const filters = queryClient.getQueryData(["candidates", "filters"]) || {};
      const response = await axios.get(`http://localhost:3010/api/candidates`, {
        params: {
          page: pageParam,
          ...filters,
        },
      });
      return response.data;
    },
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.length < 10) return undefined;
      return pages.length + 1;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage]);

  if (status === "pending") {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (status === "error") {
    return <div className="text-center text-red-600">Error: {(error as Error).message}</div>;
  }

  // Check if there are any candidates in any page
  const hasCandidates = data.pages.some((page) => page.length > 0);

  if (!hasCandidates) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">No candidates found matching your search criteria</div>
        <p className="text-gray-400 mt-2">Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.pages.map((group, i) => (
        <div key={i} className="space-y-4">
          {group.map((candidate: Candidate) => {
            const latestExperience =
              candidate.experience && candidate.experience.length > 0 ? candidate.experience[0] : null;
            const highestEducation =
              candidate.education && candidate.education.length > 0
                ? candidate.education.reduce((prev, current) => {
                    return (prev.years || 0) > (current.years || 0) ? prev : current;
                  })
                : null;

            return (
              <div
                key={candidate.id}
                onClick={() => onSelectCandidate(candidate.id)}
                className="bg-white shadow rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {candidate.firstName} {candidate.lastName}
                    </h3>
                    <p className="text-gray-600">{candidate.email}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      candidate.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {candidate.available ? "Available" : "Not Available"}
                  </span>
                </div>

                {latestExperience && (
                  <div className="mt-4">
                    <p className="text-gray-900 font-medium">
                      {latestExperience.role} at {latestExperience.company}
                    </p>
                    <p className="text-gray-600">{latestExperience.industry}</p>
                  </div>
                )}

                {highestEducation && (
                  <div className="mt-2">
                    <p className="text-gray-600">
                      {highestEducation.degree} in {highestEducation.title}
                    </p>
                    <p className="text-gray-500 text-sm">{highestEducation.institution}</p>
                  </div>
                )}

                {candidate.resumeUrl && (
                  <div className="mt-2">
                    <a
                      href={candidate.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 underline hover:text-primary-800 text-sm"
                    >
                      View Resume
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}

      <div ref={ref} className="h-10">
        {isFetchingNextPage && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        )}
      </div>
    </div>
  );
}
