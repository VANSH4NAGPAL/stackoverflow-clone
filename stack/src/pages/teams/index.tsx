import Mainlayout from "@/layout/Mainlayout";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export default function Teams() {
  return (
    <Mainlayout>
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 mb-16">
          <div className="lg:w-1/2">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 text-gray-900">
              Where developers and technologists share private knowledge with coworkers
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              A private, secure home for your team's questions and answers. No more lost knowledge in chat logs or outdated wikis.
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-md">
              Discover Teams
            </Button>
          </div>
          <div className="lg:w-1/2 bg-gray-100 rounded-lg p-8 h-80 flex items-center justify-center">
            <div className="text-gray-400 text-center">
              <div className="text-6xl mb-4">🏢</div>
              <div className="text-xl font-semibold">Stack Overflow for Teams</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            "Capture knowledge easily",
            "Onboard engineers faster",
            "Reduce duplicate questions",
            "Integrate with Slack & MS Teams",
            "Secure and compliant",
            "Analytics and reporting"
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 w-6 h-6 flex-shrink-0" />
              <span className="text-lg text-gray-700">{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </Mainlayout>
  );
}
