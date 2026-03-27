import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(
  supabaseUrl,
  supabaseAnonKey
);


// ==============================
// 🔐 AUTH FUNCTIONS
// ==============================

// 👉 Get current logged-in user
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) return null;
  return user;
}


// 👉 Get user with role from public.users
export async function getCurrentUserWithRole() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('role, full_name, organization_id')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Role fetch error:', error);
    return { ...user, role: 'user' }; // fallback
  }

  return {
    ...user,
    role: data?.role || 'user',
    full_name: data?.full_name,
    organization_id: data?.organization_id,
  };
}


// 👉 Sign Up (NO manual insert — trigger will handle DB)
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // used by DB trigger
      },
    },
  });

  if (error) throw error;

  return data;
}


// 👉 Sign In
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
}


// 👉 Sign Out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}


// 👉 Reset Password Email
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  });

  if (error) throw error;
}


// 👉 Update Password
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}