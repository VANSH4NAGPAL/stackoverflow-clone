import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PenTool, FileText } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Articles = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axiosInstance.get("/articles/all");
        setArticles(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
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
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-8 h-8 text-blue-600" />
              Articles
            </h1>
            <p className="text-gray-600 mt-1">Read and write long-form content, tutorials, and guides.</p>
          </div>
          <Link href="/articles/write">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <PenTool className="w-4 h-4 mr-2" />
              Write an Article
            </Button>
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No articles yet.</p>
            <p>Be the first to share your knowledge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.map((article) => (
              <Card key={article._id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-blue-600 hover:text-blue-800 mb-2 line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {article.body}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Avatar className="w-6 h-6 mr-2">
                        <AvatarFallback className="text-xs">{article.author?.name?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <span>{article.author?.name || 'Unknown'}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Mainlayout>
  );
};

export default Articles;
