import React, { useEffect, useState } from "react";
import Mainlayout from "@/layout/Mainlayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building, MapPin, Briefcase, Plus, X } from "lucide-react";
import axiosInstance from "@/lib/axiosinstance";
import { toast } from "react-toastify";
import { useAuth } from "@/lib/AuthContext";

const Companies = () => {
  const { user } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCompany, setNewCompany] = useState({ name: "", industry: "", location: "", description: "", openRoles: 0 });

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await axiosInstance.get("/companies/all");
        setCompanies(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
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

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.info("Please login to add a company");
      return;
    }
    try {
      const res = await axiosInstance.post("/companies/add", newCompany, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setCompanies([res.data.data, ...companies]);
      setShowAddForm(false);
      setNewCompany({ name: "", industry: "", location: "", description: "", openRoles: 0 });
      toast.success("Company added!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add company");
    }
  };

  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        <div className="mb-8 border-b pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Building className="w-8 h-8 text-indigo-600" />
              Companies
            </h1>
            <p className="text-gray-600 mt-1">Discover great companies, learn about their engineering cultures, and find your next role.</p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-indigo-600 hover:bg-indigo-700">
            {showAddForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showAddForm ? "Cancel" : "Add Company"}
          </Button>
        </div>

        {showAddForm && (
          <Card className="mb-8 border-indigo-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Register a new Company</h3>
              <form onSubmit={handleAddCompany} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Company Name" required value={newCompany.name} onChange={e => setNewCompany({...newCompany, name: e.target.value})} />
                <Input placeholder="Industry (e.g. Fintech)" required value={newCompany.industry} onChange={e => setNewCompany({...newCompany, industry: e.target.value})} />
                <Input placeholder="Location" required value={newCompany.location} onChange={e => setNewCompany({...newCompany, location: e.target.value})} />
                <Input type="number" placeholder="Open Roles" required value={newCompany.openRoles} onChange={e => setNewCompany({...newCompany, openRoles: parseInt(e.target.value)})} />
                <div className="md:col-span-2">
                  <Input placeholder="Short Description" required value={newCompany.description} onChange={e => setNewCompany({...newCompany, description: e.target.value})} />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" className="bg-indigo-600">Submit Company</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {companies.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No companies found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companies.map((company) => (
              <Card key={company._id} className="hover:shadow-md transition-shadow cursor-pointer border-t-4 border-t-indigo-600">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{company.name}</h2>
                      <p className="text-indigo-600 text-sm font-medium">{company.industry}</p>
                    </div>
                    <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded text-xs font-semibold">
                      {company.openRoles} open roles
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{company.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 gap-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {company.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      Hiring Now
                    </div>
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

export default Companies;
