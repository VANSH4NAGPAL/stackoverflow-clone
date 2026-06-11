import { useAuth } from "@/lib/AuthContext";
import { useLanguage } from "@/lib/LanguageContext";
import { Menu, Search, Globe } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Navbar = ({ handleslidein }: any) => {
  const { user, Logout } = useAuth();
  const { language, t, requestLanguageSwitch, verifyLanguageSwitch, isModalOpen, setIsModalOpen, pendingLanguage } = useLanguage();
  const [hasMounted, setHasMounted] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handlelogout = () => {
    Logout();
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    requestLanguageSwitch(e.target.value);
  };

  const handleVerifyOTP = async () => {
    if (!pendingLanguage || !otpInput) return;
    setIsVerifying(true);
    try {
      await verifyLanguageSwitch(otpInput, pendingLanguage);
      setOtpInput("");
    } catch (e) {
      // Error handled in context
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <>
      <div className=" top-0 z-50 w-full min-h-[53px] bg-white border-t-[3px] border-[#ef8236] shadow-[0_1px_5px_#00000033] flex items-center justify-center">
        <div className="w-[90%] max-w-[1440px] flex items-center justify-between mx-auto py-1">
          <button
            aria-label="Toggle sidebar"
            className="sm:block md:hidden p-2 rounded hover:bg-gray-100 transition"
            onClick={handleslidein}
          >
            <Menu className="w-5 h-5 text-gray-800" />
          </button>
          <div className="flex items-center gap-2 flex-grow">
            <Link href="/" className="px-3 py-1">
              <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
            </Link>

            <div className="hidden sm:flex gap-1 items-center">
              <Link href="/social" className="text-sm text-[#454545] font-medium px-4 py-2 rounded hover:bg-gray-200 transition">
                {t("social")}
              </Link>
              <Link href="/subscription" className="text-sm text-[#454545] font-medium px-4 py-2 rounded hover:bg-gray-200 transition">
                {t("subscription")}
              </Link>
              
              <div className="flex items-center text-sm text-[#454545] font-medium px-2 py-2 rounded hover:bg-gray-200 transition cursor-pointer relative ml-2">
                <Globe className="w-4 h-4 mr-1" />
                <select 
                  value={language} 
                  onChange={handleLanguageChange} 
                  className="bg-transparent outline-none cursor-pointer appearance-none"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="hi">हिन्दी</option>
                  <option value="pt">Português</option>
                  <option value="zh">中文</option>
                  <option value="fr">Français</option>
                </select>
              </div>
            </div>
            
            <form onSubmit={handleSearch} className="hidden lg:block flex-grow relative px-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("search")}
                className="w-full max-w-[600px] pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <Search className="absolute left-4 top-2.5 h-4 w-4 text-gray-600" />
            </form>
          </div>
          <div className="flex items-center gap-2">
            {!hasMounted ? null : !user ? (
              <Link
                href="/auth"
                className="text-sm font-medium text-[#454545] bg-[#e7f8fe] hover:bg-[#d3e4eb] border border-blue-500 px-4 py-1.5 rounded transition"
              >
                {t("login")}
              </Link>
            ) : (
              <>
                <Link
                  href={`/users/${user._id}`}
                  className="flex items-center justify-center bg-orange-600 text-white text-sm font-semibold w-9 h-9 rounded-full relative"
                >
                  {user.name?.charAt(0).toUpperCase()}
                </Link>

                <button
                  onClick={handlelogout}
                  className="text-sm font-medium text-[#454545] bg-[#e7f8fe] hover:bg-[#d3e4eb] border border-blue-500 px-4 py-1.5 rounded transition"
                >
                  {t("logout")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Language Switch</DialogTitle>
            <DialogDescription>
              Please enter the OTP sent to your registered email address to confirm switching your language to {pendingLanguage?.toUpperCase()}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input 
              placeholder="6-digit OTP" 
              value={otpInput} 
              onChange={(e) => setOtpInput(e.target.value)} 
              maxLength={6}
            />
            <Button onClick={handleVerifyOTP} disabled={!otpInput || isVerifying} className="w-full bg-blue-600 hover:bg-blue-700">
              {isVerifying ? "Verifying..." : "Verify OTP"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;
