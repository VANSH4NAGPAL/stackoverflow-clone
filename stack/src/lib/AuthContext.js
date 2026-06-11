import { useState, createContext, useContext } from "react";
import axiosInstance from "./axiosinstance";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState(null);

  const Signup = async ({ name, email, password }) => {
    setloading(true);
    seterror(null);
    try {
      const res = await axiosInstance.post("/user/signup", { name, email, password });
      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser({ ...data, token });
      toast.success("Signup Successful");
    } catch (error) {
      const msg = error.response?.data.message || "Signup failed";
      seterror(msg);
      toast.error(msg);
      throw error;
    } finally {
      setloading(false);
    }
  };

  const Login = async ({ email, password }) => {
    setloading(true);
    seterror(null);
    try {
      const res = await axiosInstance.post("/user/login", { email, password });
      if (res.data.requiresOTP) {
        toast.info(res.data.message);
        return { requiresOTP: true, email: res.data.email };
      }
      
      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser({ ...data, token });
      toast.success("Login Successful");
      return { requiresOTP: false };
    } catch (error) {
      const msg = error.response?.data?.message || "Login failed";
      seterror(msg);
      toast.error(msg);
      throw error;
    } finally {
      setloading(false);
    }
  };

  const verifyLoginOTP = async ({ email, otpCode }) => {
    setloading(true);
    seterror(null);
    try {
      const res = await axiosInstance.post("/login-history/verify", { email, otpCode });
      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser({ ...data, token });
      toast.success("Login Successful");
    } catch (error) {
      const msg = error.response?.data?.message || "OTP verification failed";
      seterror(msg);
      toast.error(msg);
      throw error;
    } finally {
      setloading(false);
    }
  }

  const Logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("Logged out");
  };

  const OAuthLogin = async (credential) => {
    setloading(true);
    try {
      const res = await axiosInstance.post("/user/oauth", { credential });
      const { data, token } = res.data;
      localStorage.setItem("user", JSON.stringify({ ...data, token }));
      setUser({ ...data, token });
      toast.success(`Logged in successfully`);
      return data;
    } catch (error) {
      toast.error("Failed to login with Google");
      throw error;
    } finally {
      setloading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, Signup, Login, verifyLoginOTP, OAuthLogin, Logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
