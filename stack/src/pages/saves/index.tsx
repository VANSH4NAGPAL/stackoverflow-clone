import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Mainlayout from "@/layout/Mainlayout";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";

export default function Saves() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }

    const fetchSaves = async () => {
      try {
        const res = await axiosInstance.get("/saves/all");
        setQuestions(res.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSaves();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <Mainlayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <main className="min-w-0 p-4 lg:p-6 ">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-xl lg:text-2xl font-semibold">Saved Questions</h1>
        </div>
        <div className="w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 text-sm gap-2 sm:gap-4">
            <span className="text-gray-600">{questions.length} saved items</span>
          </div>
          {questions.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No saved questions found.</div>
          ) : (
            <div className="space-y-4">
              {questions.map((question: any) => (
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
                          {(question.answer?.length || 0) === 1
                            ? "answer"
                            : "answers"}
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
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                              >
                                {tag}
                              </Badge>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center text-xs text-gray-600 flex-shrink-0">
                          <Link
                            href={`/users/${question.userid}`}
                            className="flex items-center"
                          >
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
      </main>
    </Mainlayout>
  );
}
