import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axiosInstance from "@/lib/axiosinstance";
import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
import Mainlayout from "@/layout/Mainlayout";
import { useRouter } from "next/router";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const requestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email is required");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/forgot-password/request-otp", { email });
      toast.success(res.data.message);
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error("OTP is required");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post("/forgot-password/reset", { email, otpCode });
      toast.success(res.data.message);
      setStep(3);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Mainlayout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                {step === 1 && "Enter your email to receive an OTP."}
                {step === 2 && "Enter the 6-digit OTP sent to your email."}
                {step === 3 && "Password Reset Successful!"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step === 1 ? (
                <form onSubmit={requestOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? "Sending..." : "Request OTP"}
                  </Button>
                </form>
              ) : step === 2 ? (
                <form onSubmit={verifyAndReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">One-Time Password</Label>
                    <Input id="otp" type="text" placeholder="123456" maxLength={6} value={otpCode} onChange={(e) => setOtpCode(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                    {loading ? "Verifying..." : "Verify & Reset Password"}
                  </Button>
                </form>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-900">Secure Password Generated!</h3>
                  <p className="text-gray-600 text-sm">
                    As per the platform's security policy, we have generated a brand new secure password containing only letters. 
                  </p>
                  <p className="text-gray-800 font-semibold text-sm">
                    Please check your email inbox to retrieve your new password.
                  </p>
                  <Button onClick={() => router.push("/auth")} className="w-full bg-blue-600 hover:bg-blue-700 mt-4">
                    Return to Login
                  </Button>
                </div>
              )}
              <div className="text-center mt-4 text-sm">
                <Link href="/auth" className="text-blue-600 hover:underline">
                  Back to Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Mainlayout>
  );
};

export default ForgotPassword;
