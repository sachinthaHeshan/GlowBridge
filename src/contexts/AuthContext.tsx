"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { fetchUserByFirebaseUID, createUser } from "@/lib/userApi";
import { UserCookies, UserCookieData } from "@/lib/cookies";

interface AuthContextType {
  user: User | null;
  userData: UserCookieData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    phone: string,
    password: string
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
  const [userData, setUserData] = useState<UserCookieData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if we're on the client side and Firebase is available
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    // Load user data from cookies on initialization
    const savedUserData = UserCookies.getUserData();
    if (savedUserData) {
      setUserData(savedUserData);
    }

    try {
      const firebaseAuth = auth();
      const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
        setUser(user);

        // If user is signed out but we have cookie data, clear it
        if (!user && savedUserData) {
          UserCookies.clearAllUserCookies();
          setUserData(null);
        }

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
      const { user: firebaseUser } = await signInWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );

      // Fetch user details from database
      try {
        // Use the Firebase user's UID to find the user in the database
        const dbUser = await fetchUserByFirebaseUID(firebaseUser.uid);

        // Convert to cookie data format
        const userCookieData: UserCookieData = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone,
          role: dbUser.role.toLowerCase(),
          status: dbUser.status,
          joinDate: dbUser.joinDate,
          salonId: dbUser.salonId,
        };

        // Store user data in cookies
        UserCookies.setUserData(userCookieData);
        setUserData(userCookieData);

        toast.success("Welcome back!");
      } catch (dbError) {
        // If we can't fetch user details from DB, still allow Firebase login
        console.warn("Failed to fetch user details from database:", dbError);

        // Create minimal user data from Firebase user
        const fallbackUserData: UserCookieData = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || email,
          phone: "",
          role: "customer", // Default role
          status: "active",
          joinDate: new Date().toISOString().split("T")[0],
          salonId: "1",
        };

        UserCookies.setUserData(fallbackUserData);
        setUserData(fallbackUserData);

        toast.success("Welcome back! (Using basic profile)");
      }
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
    name: string,
    email: string,
    phone: string,
    password: string
  ) => {
    try {
      const firebaseAuth = auth();

      // Create Firebase user
      const { user: firebaseUser } = await createUserWithEmailAndPassword(
        firebaseAuth,
        email,
        password
      );

      // Create user in backend database
      try {
        const dbUser = await createUser({
          name,
          email,
          phone,
          role: "customer", // Default role for marketplace users
          status: "active",
        });

        // Convert to cookie data format
        const userCookieData: UserCookieData = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          phone: dbUser.phone,
          role: dbUser.role.toLowerCase(),
          status: dbUser.status,
          joinDate: dbUser.joinDate,
          salonId: dbUser.salonId,
        };

        // Store user data in cookies
        UserCookies.setUserData(userCookieData);
        setUserData(userCookieData);

        toast.success("Account created successfully! Welcome to GlowBridge!");
      } catch (dbError) {
        console.error("Failed to create user in database:", dbError);

        // If backend fails, still use Firebase user but with basic data
        const fallbackUserData: UserCookieData = {
          id: firebaseUser.uid,
          name: name,
          email: firebaseUser.email || email,
          phone: phone,
          role: "customer",
          status: "active",
          joinDate: new Date().toISOString().split("T")[0],
          salonId: "1",
        };

        UserCookies.setUserData(fallbackUserData);
        setUserData(fallbackUserData);

        toast.success("Account created! (Using basic profile)");
      }
    } catch (error: unknown) {
      let errorMessage = "Failed to create account";

      const errorCode = (error as { code?: string })?.code;
      switch (errorCode) {
        case "auth/email-already-in-use":
          errorMessage = "An account with this email already exists";
          break;
        case "auth/weak-password":
          errorMessage =
            "Password is too weak. Please use at least 6 characters";
          break;
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address";
          break;
      }

      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const firebaseAuth = auth();
      await signOut(firebaseAuth);

      // Clear all user-related cookies
      UserCookies.clearAllUserCookies();
      setUserData(null);

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
    userData,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
