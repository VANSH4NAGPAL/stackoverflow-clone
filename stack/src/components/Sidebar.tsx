import { cn } from "@/lib/utils";
import {
  Bookmark,
  Bot,
  Building,
  CreditCard,
  FileText,
  Globe,
  Home,
  KeyRound,
  MessageSquare,
  MessageSquareIcon,
  Share2,
  Tag,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { Badge } from "./ui/badge";
import { useLanguage } from "@/lib/LanguageContext";

const Sidebar = ({ isopen, setSidebarOpen }: any) => {
  const { language, requestLanguageSwitch } = useLanguage();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    requestLanguageSwitch(e.target.value);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isopen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen && setSidebarOpen(false)}
        />
      )}
      <aside
        className={cn(
          "fixed md:sticky top-[53px] z-40 w-64 min-h-[calc(100vh-53px)] h-[calc(100vh-53px)] bg-white shadow-sm border-r transition-transform duration-200 ease-in-out md:translate-x-0 overflow-y-auto",
          isopen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="p-2 lg:p-4 flex flex-col h-full">
          <ul className="space-y-1 flex-1">
            <li>
              <Link
                href="/"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <Home className="w-4 h-4 mr-2 lg:mr-3" />
                Home
              </Link>
            </li>
            <li>
              <Link
                href="/questions"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <MessageSquareIcon className="w-4 h-4 mr-2 lg:mr-3" />
                Questions
              </Link>
            </li>
            <li>
              <Link
                href="/ai-assist"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <Bot className="w-4 h-4 mr-2 lg:mr-3" />
                AI Assist
                <Badge variant="secondary" className="ml-auto text-xs">
                  Labs
                </Badge>
              </Link>
            </li>
            <li>
              <Link
                href="/tags"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <Tag className="w-4 h-4 mr-2 lg:mr-3" />
                Tags
              </Link>
            </li>
            <li>
              <Link
                href="/users"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <Users className="w-4 h-4 mr-2 lg:mr-3" />
                Users
              </Link>
            </li>
            <li>
              <Link
                href="/saves"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <Bookmark className="w-4 h-4 mr-2 lg:mr-3" />
                Saves
              </Link>
            </li>
            <li>
              <Link
                href="/challenges"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <Trophy className="w-4 h-4 mr-2 lg:mr-3" />
                Challenges
                <Badge
                  variant="secondary"
                  className="ml-auto text-xs bg-orange-100 text-orange-800"
                >
                  NEW
                </Badge>
              </Link>
            </li>
            <li>
              <Link
                href="/chat"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <MessageSquare className="w-4 h-4 mr-2 lg:mr-3" />
                Chat
              </Link>
            </li>
            <li>
              <Link
                href="/articles"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <FileText className="w-4 h-4 mr-2 lg:mr-3" />
                Articles
              </Link>
            </li>
            <li>
              <Link
                href="/companies"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <Building className="w-4 h-4 mr-2 lg:mr-3" />
                Companies
              </Link>
            </li>

            {/* Divider — mobile-only features */}
            <li className="md:hidden">
              <div className="border-t border-gray-100 my-2" />
            </li>

            {/* Social — visible on mobile (hidden in navbar on small screens) */}
            <li className="md:hidden">
              <Link
                href="/social"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <Share2 className="w-4 h-4 mr-2 lg:mr-3 text-blue-500" />
                Social Feed
                <Badge
                  variant="secondary"
                  className="ml-auto text-xs bg-blue-100 text-blue-800"
                >
                  NEW
                </Badge>
              </Link>
            </li>

            {/* Subscription — visible on mobile */}
            <li className="md:hidden">
              <Link
                href="/subscription"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <CreditCard className="w-4 h-4 mr-2 lg:mr-3 text-orange-500" />
                Subscription
              </Link>
            </li>

            {/* Forgot Password — visible on mobile */}
            <li className="md:hidden">
              <Link
                href="/forgot-password"
                className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                onClick={() => setSidebarOpen && setSidebarOpen(false)}
              >
                <KeyRound className="w-4 h-4 mr-2 lg:mr-3 text-gray-500" />
                Reset Password
              </Link>
            </li>

            {/* Language Switcher — visible on mobile */}
            <li className="md:hidden">
              <div className="flex items-center px-2 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm cursor-pointer">
                <Globe className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                <span className="mr-2 text-sm">Language:</span>
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="bg-transparent outline-none cursor-pointer text-sm flex-1 appearance-none"
                  aria-label="Select language"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="hi">हिन्दी</option>
                  <option value="pt">Português</option>
                  <option value="zh">中文</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
