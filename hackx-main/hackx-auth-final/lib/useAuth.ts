"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export interface PatientUser {
  _id:        string;
  phone:      string;
  name:       string;
  age:        number;
  gender:     string;
  village:    string;
  conditions: string[];
  bloodGroup?: string;
  role:       string;
}

/** Drop-in replacement for the old custom useAuth hook, now backed by NextAuth. */
export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const loading = status === "loading";
  const isAuthenticated = status === "authenticated" && !!session?.user;

  // Map NextAuth session → legacy PatientUser shape
  const user: PatientUser | null = isAuthenticated
    ? {
        _id:        session!.user.id,
        phone:      session!.user.phone ?? "",
        name:       session!.user.name  ?? "",
        age:        Number(session!.user.age ?? 0),
        gender:     session!.user.gender ?? "",
        village:    session!.user.village ?? "",
        bloodGroup: session!.user.bloodGroup ?? "",
        conditions: session!.user.conditions
          ? session!.user.conditions.split(",").filter(Boolean)
          : [],
        role:       session!.user.role ?? "patient",
      }
    : null;

  /** Login a patient with phone + password via NextAuth CredentialsProvider */
  const login = async (phone: string, password: string) => {
    const res = await signIn("patient-credentials", {
      phone,
      password,
      redirect: false,
    });

    if (res?.ok) return { success: true };
    return { success: false, error: res?.error ?? "Login failed" };
  };

  /** Register a new patient via the existing REST endpoint, then sign in */
  const register = async (
    phone: string,
    password: string,
    name: string,
    age: string,
    gender: string,
    village: string,
    conditions: string,
    bloodGroup?: string
  ) => {
    // 1. Create the account via existing API
    const regRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone, password, name, age, gender, village, conditions, bloodGroup,
        isRegister: true,
      }),
    });

    if (!regRes.ok) {
      const data = await regRes.json();
      return { success: false, error: data.error ?? "Registration failed" };
    }

    // 2. Sign in via NextAuth so a proper session is created
    const res = await signIn("patient-credentials", {
      phone,
      password,
      redirect: false,
    });

    if (res?.ok) return { success: true };
    return { success: false, error: res?.error ?? "Sign-in after registration failed" };
  };

  const logout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    token: null as null,
  };
}
