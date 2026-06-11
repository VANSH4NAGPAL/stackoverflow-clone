import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";

export default function Products() {
  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Products</h1>
          <p className="text-xl text-gray-600">Discover the tools we've built to help developers succeed.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-orange-500 mb-3">Stack Overflow for Public</h2>
            <p className="text-gray-600 mb-6">Join the world's largest developer community to ask questions, share knowledge, and learn together.</p>
            <Button className="w-full bg-orange-500 hover:bg-orange-600">Join Community</Button>
          </div>
          
          <div className="border rounded-lg p-6 shadow-sm border-blue-200 bg-blue-50">
            <h2 className="text-2xl font-bold text-blue-600 mb-3">Stack Overflow for Teams</h2>
            <p className="text-gray-600 mb-6">A private, secure home for your team's questions and answers. Share knowledge efficiently.</p>
            <Button className="w-full bg-blue-600 hover:bg-blue-700">Explore Teams</Button>
          </div>

          <div className="border rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-purple-600 mb-3">Talent & Hiring</h2>
            <p className="text-gray-600 mb-6">Build your employer brand and reach millions of developers looking for their next great role.</p>
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">Find Talent</Button>
          </div>
        </div>
      </div>
    </Mainlayout>
  );
}
