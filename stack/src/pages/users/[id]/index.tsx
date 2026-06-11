import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Mainlayout from "@/layout/Mainlayout";
import { useAuth } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";
import { Calendar, Edit, Plus, X, Award, Shield, Search, UserPlus } from "lucide-react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const ProfilePage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = router.query;
  const [users, setusers] = useState<any>(null);
  const [loading, setloading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", about: "", tags: [] as string[] });
  const [newTag, setNewTag] = useState("");

  // New features state
  const [loginHistory, setLoginHistory] = useState([]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [transferTarget, setTransferTarget] = useState<any>(null);
  const [transferAmount, setTransferAmount] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchuser = async () => {
      try {
        const res = await axiosInstance.get("/user/getalluser");
        const matcheduser = res.data.data.find((u: any) => u._id === id);
        setusers(matcheduser);
        setEditForm({
          name: matcheduser?.name || "",
          about: matcheduser?.about || "",
          tags: matcheduser?.tags || [],
        });

        // If it's my own profile, fetch login history
        if (user && user._id === id) {
          const historyRes = await axiosInstance.get("/login-history", {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          setLoginHistory(historyRes.data.data);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setloading(false);
      }
    };
    fetchuser();
  }, [id, user]);

  const handleSaveProfile = async () => {
    try {
      const res = await axiosInstance.patch(`/user/update/${user?._id}`, { editForm });
      if (res.data.data) {
        setusers({ ...users, name: editForm.name, about: editForm.about, tags: editForm.tags });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !editForm.tags.includes(trimmedTag)) {
      setEditForm({ ...editForm, tags: [...editForm.tags, trimmedTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditForm({ ...editForm, tags: editForm.tags.filter((tag: any) => tag !== tagToRemove) });
  };

  const handleSearchUsers = async () => {
    if (!searchQuery) return;
    try {
      const res = await axiosInstance.get(`/points/search?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      setSearchResults(res.data.data);
    } catch (error) {
      toast.error("Failed to search users");
    }
  };

  const handleTransferPoints = async () => {
    if (!transferTarget || !transferAmount) return;
    setIsTransferring(true);
    try {
      const res = await axiosInstance.post("/points/transfer", {
        toUserId: transferTarget._id,
        points: transferAmount
      }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success(res.data.message);
      setusers({ ...users, points: res.data.yourNewPoints });
      setIsTransferModalOpen(false);
      setTransferTarget(null);
      setTransferAmount("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Transfer failed");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleFollow = async () => {
    if (!user) return toast.error("Please login to follow");
    try {
      const res = await axiosInstance.patch(`/social/follow/${id}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.success(res.data.message);
      
      if (res.data.following) {
        setusers({ ...users, followers: [...(users.followers || []), user._id] });
      } else {
        setusers({ ...users, followers: (users.followers || []).filter((uid: string) => uid !== user._id) });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to follow");
    }
  };

  if (loading) return <Mainlayout><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto mt-10"></div></Mainlayout>;
  if (!users) return <Mainlayout><div className="text-center text-gray-500 mt-4">No user found.</div></Mainlayout>;

  const currentUserId = user?._id;
  const isOwnProfile = id === currentUserId;

  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* User Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <Avatar className="w-24 h-24 lg:w-32 lg:h-32">
            <AvatarFallback className="text-2xl lg:text-3xl bg-orange-100 text-orange-600 font-bold">
              {users.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-1">{users.name}</h1>
                {users.subscription?.plan && users.subscription.plan !== 'free' && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 uppercase">
                    {users.subscription.plan} Member
                  </Badge>
                )}
              </div>

              {isOwnProfile && (
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Edit className="w-4 h-4" /> Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label>Display Name</Label>
                        <Input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                      </div>
                      <div>
                        <Label>About Me</Label>
                        <Textarea value={editForm.about} onChange={(e) => setEditForm({...editForm, about: e.target.value})} className="min-h-[100px]" />
                      </div>
                      <div>
                        <Label>Tags</Label>
                        <div className="flex gap-2 mb-2">
                          <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddTag()} />
                          <Button onClick={handleAddTag}><Plus className="w-4 h-4"/></Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {editForm.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-orange-100 text-orange-800">
                              {tag} <button onClick={() => handleRemoveTag(tag)} className="ml-1"><X className="w-3 h-3"/></button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">Save</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              {!isOwnProfile && user && (
                <Button onClick={handleFollow} className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> 
                  {users.followers?.includes(user._id) ? "Unfollow" : "Follow"}
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" /> Member since {new Date(users.joinDate).toISOString().split("T")[0]}
              </div>
              <div className="flex items-center font-semibold text-orange-600">
                <Award className="w-5 h-5 mr-1" /> {users.points || 0} Points
              </div>
              <div className="flex items-center text-blue-600 font-medium">
                <Shield className="w-4 h-4 mr-1" /> {users.followers?.length || 0} Followers
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><CardTitle>About</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line">{users.about || "No description provided."}</p>
              </CardContent>
            </Card>

            {/* Login History for Own Profile */}
            {isOwnProfile && (
              <Card>
                <CardHeader><CardTitle>Login History</CardTitle></CardHeader>
                <CardContent>
                  {loginHistory.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th className="px-4 py-3">Date</th>
                            <th className="px-4 py-3">Browser</th>
                            <th className="px-4 py-3">Device/OS</th>
                            <th className="px-4 py-3">IP Address</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {loginHistory.map((log: any) => (
                            <tr key={log._id} className="border-b">
                              <td className="px-4 py-3">{new Date(log.loginAt).toLocaleString()}</td>
                              <td className="px-4 py-3">{log.browser}</td>
                              <td className="px-4 py-3 capitalize">{log.deviceType} / {log.os}</td>
                              <td className="px-4 py-3">{log.ipAddress}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs ${log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500">No login history available.</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Points & Rewards</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="text-4xl font-bold text-orange-600 mb-2">{users.points || 0}</div>
                  <div className="text-sm text-orange-800 font-medium">Total Points Earned</div>
                </div>
                
                {isOwnProfile && (
                  <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">Transfer Points</Button>
                    </DialogTrigger>
                    <DialogContent className="bg-white">
                      <DialogHeader><DialogTitle>Transfer Points to User</DialogTitle></DialogHeader>
                      <div className="space-y-4 py-4">
                        {!transferTarget ? (
                          <>
                            <div className="flex space-x-2">
                              <Input placeholder="Search user by name..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchUsers()}/>
                              <Button onClick={handleSearchUsers} variant="outline"><Search className="w-4 h-4"/></Button>
                            </div>
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {searchResults.map((su: any) => (
                                <div key={su._id} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded border cursor-pointer" onClick={() => setTransferTarget(su)}>
                                  <span className="font-medium">{su.name}</span>
                                  <span className="text-xs text-gray-500">{su.points} pts</span>
                                </div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded flex justify-between items-center">
                              <span className="font-semibold text-blue-800">To: {transferTarget.name}</span>
                              <Button variant="ghost" size="sm" onClick={() => setTransferTarget(null)} className="h-6">Change</Button>
                            </div>
                            <div className="space-y-2">
                              <Label>Amount to transfer</Label>
                              <Input type="number" placeholder="Enter points" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
                              <p className="text-xs text-gray-500">You have {users.points} points. Minimum 10 points required to transfer.</p>
                            </div>
                            <Button onClick={handleTransferPoints} disabled={isTransferring || !transferAmount} className="w-full bg-blue-600 hover:bg-blue-700">
                              {isTransferring ? "Transferring..." : "Confirm Transfer"}
                            </Button>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Top Tags</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {users.tags?.length > 0 ? users.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800">
                      {tag}
                    </Badge>
                  )) : <span className="text-gray-500 text-sm">No tags added yet.</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Mainlayout>
  );
};

export default ProfilePage;
