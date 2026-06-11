import React, { useState, useEffect, useRef } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share2, UserPlus, UserCheck, Image as ImageIcon, Video, Link as LinkIcon } from "lucide-react";
import { useRouter } from "next/router";

const SocialPage = () => {
  const { user, setUser } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create post state
  const [caption, setCaption] = useState("");
  const [mediaType, setMediaType] = useState("text"); // text, image, video, youtube
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Comment state
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get("/social/getall");
      setPosts(res.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Please login to post");
    if (!caption && !file && !youtubeUrl) return toast.error("Post cannot be empty");

    const formData = new FormData();
    formData.append("caption", caption);
    formData.append("mediaType", mediaType);
    if (file) formData.append("media", file);
    if (youtubeUrl) formData.append("youtubeUrl", youtubeUrl);

    try {
      await axiosInstance.post("/social/create", formData, {
        headers: { 
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      toast.success("Post created successfully!");
      setCaption("");
      setFile(null);
      setYoutubeUrl("");
      setMediaType("text");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create post");
    }
  };

  const handleLike = async (postId: string) => {
    if (!user) return toast.error("Please login to like");
    try {
      await axiosInstance.patch(`/social/like/${postId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      fetchPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleComment = async (postId: string) => {
    if (!user) return toast.error("Please login to comment");
    const text = commentText[postId];
    if (!text) return;
    try {
      await axiosInstance.post(`/social/comment/${postId}`, { text }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCommentText(prev => ({ ...prev, [postId]: "" }));
      fetchPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleShare = async (postId: string) => {
    try {
      await axiosInstance.patch(`/social/share/${postId}`);
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`${window.location.origin}/social?post=${postId}`);
      }
      toast.success("Post link copied to clipboard!");
      fetchPosts();
    } catch (error) {
      console.log(error);
    }
  };

  const handleFollow = async (targetId: string) => {
    if (!user) return toast.error("Please login to follow");
    try {
      const res = await axiosInstance.patch(`/social/follow/${targetId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success(res.data.message);
      
      if (setUser) {
        let newFollowing = [...(user.following || [])];
        if (res.data.following) {
          if (!newFollowing.includes(targetId)) newFollowing.push(targetId);
        } else {
          newFollowing = newFollowing.filter(id => id !== targetId);
        }
        const updatedUser = { ...user, following: newFollowing };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
      
      fetchPosts(); // Refresh to potentially show follow status if we track it in UI later
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to follow");
    }
  };

  const getYoutubeVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (loading) return <Mainlayout><div className="text-center mt-10">Loading...</div></Mainlayout>;

  return (
    <Mainlayout>
      <div className="max-w-2xl mx-auto py-6 space-y-6">
        <h1 className="text-2xl font-bold mb-4">{t("social")} Feed</h1>
        
        {/* Create Post Section */}
        {user && (
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <form onSubmit={handleCreatePost} className="space-y-4">
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                  placeholder="What's on your mind?..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                
                {mediaType === 'youtube' && (
                  <Input 
                    placeholder="Paste YouTube URL here..." 
                    value={youtubeUrl} 
                    onChange={(e) => setYoutubeUrl(e.target.value)} 
                    className="mb-2"
                  />
                )}
                
                {(mediaType === 'image' || mediaType === 'video') && (
                  <input 
                    type="file" 
                    accept={mediaType === 'image' ? "image/*" : "video/*"} 
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    ref={fileInputRef}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 mb-2"
                  />
                )}

                <div className="flex items-center justify-between border-t pt-3">
                  <div className="flex space-x-2">
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setMediaType('image'); setYoutubeUrl(""); }} className={mediaType === 'image' ? "bg-gray-100" : ""}>
                      <ImageIcon className="w-4 h-4 mr-2 text-blue-500" /> Photo
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setMediaType('video'); setYoutubeUrl(""); }} className={mediaType === 'video' ? "bg-gray-100" : ""}>
                      <Video className="w-4 h-4 mr-2 text-red-500" /> Video
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => { setMediaType('youtube'); setFile(null); }} className={mediaType === 'youtube' ? "bg-gray-100" : ""}>
                      <LinkIcon className="w-4 h-4 mr-2 text-red-600" /> YouTube
                    </Button>
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Post</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((p: any) => {
            const isLiked = user && p.likes.includes(user._id);
            const isOwnPost = user && p.userId === user._id;

            return (
              <Card key={p._id} className="shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push(`/users/${p.userId}`)}>
                      <Avatar>
                        <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
                          {p.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm">{p.userName}</div>
                        <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    {user && !isOwnPost && (
                      <Button size="sm" onClick={() => handleFollow(p.userId)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 flex items-center">
                        <UserPlus className="w-3 h-3 mr-1" /> {user.following?.includes(p.userId) ? "Unfollow" : "Follow"}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="p-4 pt-2">
                  {p.caption && <p className="mb-3 whitespace-pre-wrap text-sm text-gray-800">{p.caption}</p>}
                  
                  {p.mediaType === 'image' && p.mediaUrl && (
                    <img src={`${process.env.NEXT_PUBLIC_API_URL}${p.mediaUrl}`} alt="Post media" className="w-full rounded-md max-h-96 object-cover" />
                  )}
                  
                  {p.mediaType === 'video' && p.mediaUrl && (
                    <video src={`${process.env.NEXT_PUBLIC_API_URL}${p.mediaUrl}`} controls className="w-full rounded-md max-h-96 bg-black" />
                  )}

                  {p.mediaType === 'youtube' && p.youtubeUrl && (
                    <div className="relative pt-[56.25%] w-full rounded-md overflow-hidden bg-black">
                      <iframe 
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${getYoutubeVideoId(p.youtubeUrl)}`}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  )}
                </CardContent>

                <CardFooter className="p-4 border-t flex flex-col items-stretch space-y-4">
                  <div className="flex justify-between text-gray-500 text-sm px-2">
                    <span>{p.likes.length} Likes</span>
                    <div className="space-x-4">
                      <span>{p.comments.length} Comments</span>
                      <span>{p.shares} Shares</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between border-t border-b py-1">
                    <Button variant="ghost" className={`flex-1 ${isLiked ? 'text-red-500' : 'text-gray-600'}`} onClick={() => handleLike(p._id)}>
                      <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} /> Like
                    </Button>
                    <Button variant="ghost" className="flex-1 text-gray-600" onClick={() => setShowComments(prev => ({ ...prev, [p._id]: !prev[p._id] }))}>
                      <MessageCircle className="w-5 h-5 mr-2" /> Comment
                    </Button>
                    <Button variant="ghost" className="flex-1 text-gray-600" onClick={() => handleShare(p._id)}>
                      <Share2 className="w-5 h-5 mr-2" /> Share
                    </Button>
                  </div>

                  {/* Comments Section */}
                  {showComments[p._id] && (
                    <div className="space-y-4 pt-2">
                      {user && (
                        <div className="flex space-x-2">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="text-xs bg-gray-200">{user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex space-x-2">
                            <Input 
                              placeholder="Write a comment..." 
                              value={commentText[p._id] || ""} 
                              onChange={(e) => setCommentText(prev => ({ ...prev, [p._id]: e.target.value }))}
                              className="flex-1 h-8 text-sm"
                              onKeyDown={(e) => e.key === 'Enter' && handleComment(p._id)}
                            />
                            <Button size="sm" onClick={() => handleComment(p._id)} className="h-8">Post</Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-3 pl-2">
                        {p.comments.map((c: any, i: number) => (
                          <div key={i} className="flex space-x-2">
                            <Avatar className="w-6 h-6 mt-1">
                              <AvatarFallback className="text-[10px] bg-gray-100">{c.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="bg-gray-100 p-2 rounded-lg flex-1">
                              <span className="font-semibold text-xs mr-2">{c.userName}</span>
                              <span className="text-sm text-gray-800">{c.text}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
          
          {posts.length === 0 && (
            <div className="text-center text-gray-500 py-10">No posts yet. Be the first to post!</div>
          )}
        </div>
      </div>
    </Mainlayout>
  );
};

export default SocialPage;
