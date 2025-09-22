"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we're on the client side and Firebase is available
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    try {
      const firebaseAuth = auth();
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        setUser(user);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.warn("Firebase not configured:", error);
      setLoading(false);
      return;
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const firebaseAuth = auth();
      await signInWithEmailAndPassword(firebaseAuth, email, password);
      toast.success("Welcome back!");
    } catch (error: unknown) {
      const errorMessage =
        (error as { code?: string })?.code === "auth/invalid-credential"
          ? "Invalid email or password"
          : "Failed to sign in";
      toast.error(errorMessage);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string
  ) => {
    try {
      const firebaseAuth = auth();
      const { user } = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );
      await updateProfile(user, { displayName });
      toast.success("Account created successfully!");
    } catch (error: unknown) {
      const errorMessage =
        (error as { code?: string })?.code === "auth/email-already-in-use"
          ? "Email is already registered"
          : "Failed to create account";
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const firebaseAuth = auth();
      await signOut(firebaseAuth);
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const firebaseAuth = auth();
      await sendPasswordResetEmail(firebaseAuth, email);
      toast.success("Password reset email sent!");
    } catch (error: unknown) {
      const errorMessage =
        (error as { code?: string })?.code === "auth/user-not-found"
          ? "No account found with this email"
          : "Failed to send reset email";
      toast.error(errorMessage);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
