import Mainlayout from "@/layout/Mainlayout";

export default function About() {
  return (
    <Mainlayout>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-6">About Stack Overflow Clone</h1>
        <p className="text-lg text-gray-700 mb-4">
          This is a full-stack clone of Stack Overflow built with the MERN stack (MongoDB, Express, React/Next.js, Node.js).
        </p>
        <p className="text-lg text-gray-700 mb-4">
          It features comprehensive Q&A capabilities, a social feed, real-time chat, AI assistance powered by Gemini, a gamified points system, and premium subscription tiers via Stripe.
        </p>
        <div className="bg-gray-100 p-6 rounded-lg mt-8">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700">
            To empower developers to learn, share their knowledge, and build their careers in a collaborative and supportive environment.
          </p>
        </div>
      </div>
    </Mainlayout>
  );
}
