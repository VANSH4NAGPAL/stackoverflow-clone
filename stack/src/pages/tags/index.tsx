import Mainlayout from "@/layout/Mainlayout";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axiosinstance";

export default function TagsPage() {
  const [tags, setTags] = useState<{name: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await axiosInstance.get("/question/tags/all");
        setTags(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, []);

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
      <div className="p-4 lg:p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Tags</h1>
        <p className="text-gray-600 mb-8 max-w-3xl">
          A tag is a keyword or label that categorizes your question with other, similar questions. Using the right tags makes it easier for others to find and answer your question.
        </p>

        {tags.length === 0 ? (
          <div className="text-gray-500 mt-10">No tags found. Ask a question to create a tag!</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tags.map((tag) => (
              <div key={tag.name} className="border rounded-md p-4 flex flex-col justify-between h-32 hover:shadow-md transition">
                <div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer">
                    {tag.name}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500 mt-4">
                  {tag.count.toLocaleString()} questions
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
}
