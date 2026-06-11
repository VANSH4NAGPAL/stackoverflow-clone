import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";
import axiosInstance from "./axiosinstance";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

type LanguageContextType = {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
  requestLanguageSwitch: (lang: string) => Promise<void>;
  verifyLanguageSwitch: (otp: string, lang: string) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  pendingLanguage: string | null;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguage] = useState("en");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<string | null>(null);

  useEffect(() => {
    if (user?.language) {
      setLanguage(user.language);
    } else {
      const stored = localStorage.getItem("app_language");
      if (stored) setLanguage(stored);
    }
  }, [user]);

  const t = (key: string) => {
    return translations[language]?.[key] || translations["en"][key] || key;
  };

  const requestLanguageSwitch = async (lang: string) => {
    if (!user) {
      setLanguage(lang);
      localStorage.setItem("app_language", lang);
      return;
    }
    
    try {
      const res = await axiosInstance.post("/language/request-otp", { language: lang }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      toast.info(res.data.message);
      setPendingLanguage(lang);
      setIsModalOpen(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to request OTP");
    }
  };

  const verifyLanguageSwitch = async (otp: string, lang: string) => {
    try {
      const res = await axiosInstance.post("/language/verify", { otpCode: otp, language: lang }, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      toast.success(res.data.message);
      setLanguage(lang);
      localStorage.setItem("app_language", lang);
      setIsModalOpen(false);
      setPendingLanguage(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      throw error;
    }
  };

  return (
    <LanguageContext.Provider value={{
      language, setLanguage, t, requestLanguageSwitch, verifyLanguageSwitch,
      isModalOpen, setIsModalOpen, pendingLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
