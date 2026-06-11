import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trophy, CheckCircle, Flame, Plus, X } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "react-toastify";

const Challenges = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChallenge, setNewChallenge] = useState({ title: "", description: "", difficulty: "Easy", points: 10 });

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await axiosInstance.get("/challenges/all");
        setChallenges(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const handleComplete = async (challengeId: string) => {
    if (!user) {
      toast.info("Please login to complete challenges.");
      return;
    }
    try {
      const res = await axiosInstance.post("/challenges/complete", { challengeId });
      toast.success(res.data.message);
      // Update local state to show it's completed
      setChallenges(challenges.map(c => 
        c._id === challengeId ? { ...c, completedBy: [...c.completedBy, user._id] } : c
      ));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to complete challenge");
    }
  };

  const handleAddChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please login to create a challenge");
      return;
    }
    try {
      const res = await axiosInstance.post("/challenges/add", newChallenge, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setChallenges([res.data.data, ...challenges]);
      setShowAddForm(false);
      setNewChallenge({ title: "", description: "", difficulty: "Easy", points: 10 });
      toast.success("Challenge created!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create challenge");
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "text-green-600 bg-green-100";
      case "Medium": return "text-yellow-600 bg-yellow-100";
      case "Hard": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

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
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2 mb-2 text-gray-900">
              <Trophy className="w-8 h-8 text-yellow-500" />
              Developer Challenges
            </h1>
            <p className="text-gray-600 text-lg">
              Complete tasks, build your reputation, and earn points by contributing to the community.
            </p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-blue-600 hover:bg-blue-700">
            {showAddForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showAddForm ? "Cancel" : "Create Challenge"}
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-8 border-blue-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Create a new Challenge</h3>
              <form onSubmit={handleAddChallenge} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Challenge Title" required value={newChallenge.title} onChange={e => setNewChallenge({...newChallenge, title: e.target.value})} />
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={newChallenge.difficulty} 
                  onChange={e => setNewChallenge({...newChallenge, difficulty: e.target.value})}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <div className="md:col-span-2">
                  <Input placeholder="Description" required value={newChallenge.description} onChange={e => setNewChallenge({...newChallenge, description: e.target.value})} />
                </div>
                <Input type="number" placeholder="Points" required value={newChallenge.points} onChange={e => setNewChallenge({...newChallenge, points: parseInt(e.target.value)})} />
                <div className="flex justify-end items-end">
                  <Button type="submit" className="bg-blue-600">Submit Challenge</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge) => {
            const isCompleted = user ? challenge.completedBy.includes(user._id) : false;

            return (
              <Card key={challenge._id} className={`overflow-hidden ${isCompleted ? 'border-green-200 bg-green-50/50' : ''}`}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-1">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                      <span className="flex items-center text-orange-600 font-bold text-sm bg-orange-100 px-2 py-1 rounded">
                        <Flame className="w-4 h-4 mr-1" />
                        +{challenge.points} pts
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {isCompleted ? (
                    <Button disabled className="w-full bg-green-100 text-green-700 hover:bg-green-100 opacity-100 border border-green-200">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Completed
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleComplete(challenge._id)} 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Mark as Completed
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Mainlayout>
  );
};

export default Challenges;
