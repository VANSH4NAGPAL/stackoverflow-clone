import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, Settings, Tag as TagIcon, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const RightSideBar = () => {
  const { user, setUser } = useAuth();
  const [watchedTags, setWatchedTags] = useState<string[]>([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  
  // Custom Filter State
  const router = useRouter();
  const [filterTags, setFilterTags] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterSort, setFilterSort] = useState("newest");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const applyCustomFilter = () => {
    let queryParams = [];
    if (filterTags.trim()) queryParams.push(`tags=${encodeURIComponent(filterTags.trim())}`);
    if (filterStatus !== "all") queryParams.push(`filter=${filterStatus}`);
    if (filterSort !== "newest") queryParams.push(`sort=${filterSort}`);

    const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
    router.push(`/${queryString}`);
    setIsFilterModalOpen(false);
  };

  useEffect(() => {
    if (user && user.tags) {
      setWatchedTags(user.tags);
    }
  }, [user]);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please login to watch tags.");
      return;
    }
    const tag = newTag.trim().toLowerCase();
    if (tag && !watchedTags.includes(tag)) {
      try {
        const res = await axiosInstance.post("/user/watch-tag", { tag }, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setWatchedTags(res.data.data);
        const updatedUser = { ...user, tags: res.data.data };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setNewTag("");
        setIsAddingTag(false);
        toast.success("Tag added to watch list!");
      } catch (error: any) {
        toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to add tag");
        console.error("Add Tag Error:", error.response?.data || error.message);
      }
    }
  };

  const removeTag = async (tagToRemove: string) => {
    if (!user) return;
    try {
      const res = await axiosInstance.post("/user/unwatch-tag", { tag: tagToRemove }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setWatchedTags(res.data.data);
      const updatedUser = { ...user, tags: res.data.data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.response?.data?.error || "Failed to remove tag");
      console.error("Remove Tag Error:", error.response?.data || error.message);
    }
  };

  return (
    <aside className="w-72 lg:w-80 p-4 lg:p-6 bg-gray-50 min-h-screen">
      <div className="space-y-4 lg:space-y-6">

        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base flex items-center justify-between">
            Custom Filters
            <Settings className="w-4 h-4 text-orange-500 cursor-pointer hover:text-orange-800" onClick={() => setIsFilterModalOpen(true)} />
          </h3>
          
          <Dialog open={isFilterModalOpen} onOpenChange={setIsFilterModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-orange-500 border-orange-500 hover:bg-orange-50 bg-transparent text-xs lg:text-sm"
              >
                Create a custom filter
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white text-gray-900">
              <DialogHeader>
                <DialogTitle>Create Custom Filter</DialogTitle>
                <DialogDescription>
                  Narrow down questions to find exactly what you're looking for.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="flex flex-col gap-2">
                  <label htmlFor="tags" className="text-sm font-medium">Included Tags</label>
                  <div className="flex items-center rounded-md border border-input px-3 bg-white focus-within:ring-1 focus-within:ring-orange-500 transition-shadow">
                    <TagIcon className="mr-2 h-4 w-4 text-gray-400" />
                    <Input
                      id="tags"
                      placeholder="e.g. react, nodejs (comma separated)"
                      value={filterTags}
                      onChange={(e) => setFilterTags(e.target.value)}
                      className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0 bg-transparent h-10"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Question Status</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className={`flex-1 transition-all ${filterStatus === "all" ? "bg-orange-50 border-orange-500 text-orange-700 font-medium" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"}`}
                      onClick={() => setFilterStatus("all")}
                    >
                      All Questions
                    </Button>
                    <Button
                      variant="outline"
                      className={`flex-1 transition-all ${filterStatus === "unanswered" ? "bg-orange-50 border-orange-500 text-orange-700 font-medium" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"}`}
                      onClick={() => setFilterStatus("unanswered")}
                    >
                      Unanswered Only
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Sort By</label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className={`flex-1 transition-all ${filterSort === "newest" ? "bg-orange-50 border-orange-500 text-orange-700 font-medium" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"}`}
                      onClick={() => setFilterSort("newest")}
                    >
                      Newest
                    </Button>
                    <Button
                      variant="outline"
                      className={`flex-1 transition-all ${filterSort === "top" ? "bg-orange-50 border-orange-500 text-orange-700 font-medium" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900"}`}
                      onClick={() => setFilterSort("top")}
                    >
                      Top Rated
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" className="bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900" onClick={() => setIsFilterModalOpen(false)}>Cancel</Button>
                <Button onClick={applyCustomFilter} className="bg-orange-500 hover:bg-orange-600 text-white border-0">Apply Filter</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div>
          <h3 className="font-semibold text-gray-800 mb-3 text-sm lg:text-base flex justify-between items-center">
            Watched Tags
          </h3>
          
          {watchedTags.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {watchedTags.map(tag => (
                <span key={tag} className="flex items-center text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  <TagIcon className="w-3 h-3 mr-1" />
                  {tag}
                  <X 
                    className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" 
                    onClick={() => removeTag(tag)} 
                  />
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <Eye className="w-10 h-10 lg:w-12 lg:h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-xs lg:text-sm text-gray-500 mb-3">
                Watch tags to curate your list of questions.
              </p>
            </div>
          )}

          {isAddingTag ? (
            <form onSubmit={handleAddTag} className="flex gap-2">
              <Input 
                value={newTag} 
                onChange={e => setNewTag(e.target.value)} 
                placeholder="e.g. node.js" 
                className="h-8 text-sm"
                autoFocus
              />
              <Button type="submit" size="sm" className="h-8 bg-orange-500">Add</Button>
            </form>
          ) : (
            <Button
              onClick={() => setIsAddingTag(true)}
              variant="outline"
              size="sm"
              className="w-full text-orange-500 border-orange-500 hover:bg-orange-50 bg-transparent text-xs lg:text-sm"
            >
              👁️ Watch a tag
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default RightSideBar;
