"use server";

import { createClient } from "@/supabase/server";

export const authenticate = async (email: string, password: string) => {
  const supabase = createClient();
  try {
    // Step 1: Attempt to sign in
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Step 2: Check if the logged-in user is an admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("type")
      .eq("id", signInData.user?.id)
      .single();

    if (userError) throw userError;

    // Step 3: Verify if the user has admin privileges
    if (userData?.type !== "ADMIN") {
      await supabase.auth.signOut();
      return false; // Return false if the user is not an admin
    }

    return true; // Return true if the user is an admin
  } catch (error) {
    console.log("AUTHENTICATION ERROR", error);
    throw error;
  }
};

export const getLatestUsers = async () => {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, email, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw new Error(`Error fetching latest users: ${error.message}`);

  return data.map(
    (user: { id: string; email: string; created_at: string | null }) => ({
      id: user.id,
      email: user.email,
      date: user.created_at,
    }),
  );
};
