import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { GoogleLogin } from '@react-oauth/google';

const Index = () => {
  const router = useRouter();
  const { Login, verifyLoginOTP, OAuthLogin, loading } = useAuth();
  const [form, setform] = useState({ email: "", password: "" });
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const handleChange = (e: any) => {
    setform({ ...form, [e.target.id]: e.target.value });
  };

  const handlesubmit = async (e: any) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("ALL Fields are required");
      return;
    }
    try {
      const res = await Login(form);
      if (res?.requiresOTP) {
        setRequiresOTP(true);
      } else {
        router.push("/");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleVerifyOTP = async (e: any) => {
    e.preventDefault();
    if (!otpCode) {
      toast.error("Please enter the OTP");
      return;
    }
    try {
      await verifyLoginOTP({ email: form.email, otpCode });
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 lg:mb-8">
          <Link href="/" className="flex items-center justify-center mb-4">
            <div className="w-6 h-6 lg:w-8 lg:h-8 bg-orange-500 rounded mr-2 flex items-center justify-center">
              <div className="w-4 h-4 lg:w-6 lg:h-6 bg-white rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 lg:w-4 lg:h-4 bg-orange-500 rounded-sm"></div>
              </div>
            </div>
            <span className="text-lg lg:text-xl font-bold text-gray-800">
              stack<span className="font-normal">overflow</span>
            </span>
          </Link>
        </div>
        
        {!requiresOTP ? (
          <form onSubmit={handlesubmit}>
            <Card>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-xl lg:text-2xl">
                  Log in to your account
                </CardTitle>
                <CardDescription>
                  Enter your email and password to access Stack Overflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <GoogleLogin
                  onSuccess={async (credentialResponse) => {
                    try {
                      await OAuthLogin(credentialResponse.credential);
                      router.push("/");
                    } catch (e) {}
                  }}
                  onError={() => {
                    toast.error("Google Login Failed");
                  }}
                  useOneTap
                />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" onChange={handleChange} value={form.email} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Input id="password" type="password" onChange={handleChange} value={form.password} />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                  {loading ? "loading..." : "Log in"}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/forgot-password" className="text-blue-600 hover:underline">
                    Forgot your password?
                  </Link>
                </div>
                <div className="text-center text-sm">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-blue-600 hover:underline">
                    Sign up
                  </Link>
                </div>
              </CardContent>
            </Card>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <Card>
              <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-xl lg:text-2xl">Verify your login</CardTitle>
                <CardDescription>
                  You are logging in from Chrome. Please enter the OTP sent to your email.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm">One-Time Password</Label>
                  <Input id="otp" type="text" placeholder="123456" onChange={(e) => setOtpCode(e.target.value)} value={otpCode} />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
                <div className="text-center text-sm">
                  <button type="button" onClick={() => setRequiresOTP(false)} className="text-blue-600 hover:underline">
                    Back to Login
                  </button>
                </div>
              </CardContent>
            </Card>
          </form>
        )}
      </div>
    </div>
  );
};

export default Index;
