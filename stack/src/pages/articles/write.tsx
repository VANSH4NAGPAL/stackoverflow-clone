import React, { useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-toastify";
import { useRouter } from "next/router";

const WriteArticle = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({ title: "", body: "", tags: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please login to write an article");
      router.push("/auth");
      return;
    }

    if (!formData.title.trim() || !formData.body.trim()) {
      toast.error("Title and body are required");
      return;
    }

    setLoading(true);
    try {
      const tagsArray = formData.tags.split(",").map(t => t.trim()).filter(Boolean);
      await axiosInstance.post("/articles/create", {
        title: formData.title,
        body: formData.body,
        tags: tagsArray,
      });
      toast.success("Article published!");
      router.push("/articles");
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Write an Article</h1>
        
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="A descriptive title for your article"
                  className="w-full text-lg font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
                <p className="text-xs text-gray-500 mb-2">Write your content here. Markdown is not supported in this simple version.</p>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Share your knowledge..."
                  className="w-full min-h-[300px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Comma separated)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="react, javascript, tutorial"
                  className="w-full"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.push("/articles")}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {loading ? "Publishing..." : "Publish Article"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Mainlayout>
  );
};

export default WriteArticle;
