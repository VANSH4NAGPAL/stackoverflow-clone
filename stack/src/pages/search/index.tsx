import Mainlayout from "@/layout/Mainlayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function SearchResults() {
  const router = useRouter();
  const { q } = router.query;
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!q) return;
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(`/search?q=${encodeURIComponent(q as string)}`);
        setResults(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [q]);

  if (!q) {
    return (
      <Mainlayout>
        <div className="p-8 text-center text-gray-500">Please enter a search query.</div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Search Results for "{q}"</h1>
        
        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-gray-500 text-center my-12 text-lg">We couldn't find anything for "{q}".</div>
        ) : (
          <div className="space-y-4">
            {results.map((question: any) => (
              <div key={question._id} className="border-b border-gray-200 pb-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex sm:flex-col items-center sm:items-center text-sm text-gray-600 sm:w-16 lg:w-20 gap-4 sm:gap-2">
                    <div className="text-center">
                      <div className="font-medium">
                        {(question.upvote?.length || 0) - (question.downvote?.length || 0)}
                      </div>
                      <div className="text-xs">votes</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`font-medium ${
                          (question.answer?.length || 0) > 0
                            ? "text-green-600 bg-green-100 px-2 py-1 rounded"
                            : ""
                        }`}
                      >
                        {question.answer?.length || 0}
                      </div>
                      <div className="text-xs">
                        {(question.answer?.length || 0) === 1 ? "answer" : "answers"}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/questions/${question._id}`}
                      className="text-blue-600 hover:text-blue-800 text-base lg:text-lg font-medium mb-2 block"
                    >
                      {question.questiontitle}
                    </Link>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                      {question.questionbody}
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-1">
                        {question.questiontags?.map((tag: any) => (
                          <div key={tag}>
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer">
                              {tag}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center text-xs text-gray-600 flex-shrink-0">
                        <Link href={`/users/${question.userid}`} className="flex items-center">
                          <Avatar className="w-4 h-4 mr-1">
                            <AvatarFallback className="text-xs">
                              {question.userposted?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-blue-600 hover:text-blue-800 mr-1">
                            {question.userposted}
                          </span>
                        </Link>
                        <span>asked {new Date(question.askedon).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}
