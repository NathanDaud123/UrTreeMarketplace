// Supabase Configuration
// Menggunakan environment variables untuk fleksibilitas
// Jika environment variable tidak ada, akan menggunakan nilai default (untuk development)

// Extract project ID from URL if available, otherwise use default
const getProjectId = (): string => {
  const url = import.meta.env.VITE_SUPABASE_URL || '';
  if (url) {
    // Extract project ID from URL: https://xxxxx.supabase.co -> xxxxx
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match) {
      return match[1];
    }
  }
  // Fallback to default (untuk backward compatibility)
  return import.meta.env.VITE_SUPABASE_PROJECT_ID || "niewjmazqxkyhsmzedrx";
};

// Get Supabase URL from environment or construct from project ID
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${getProjectId()}.supabase.co`;

// Get Anon Key from environment or use default
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZXdqbWF6cXhreWhzbXplZHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDMxNTgsImV4cCI6MjA3NzI3OTE1OH0.dMdsvuVix0O4D1gjjDh3j5_jkQYCOmO4S1J8ff_h9VA";

// Export project ID for backward compatibility
export const projectId = getProjectId();