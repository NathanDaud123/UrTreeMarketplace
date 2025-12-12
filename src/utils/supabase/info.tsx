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
  return import.meta.env.VITE_SUPABASE_PROJECT_ID || "rbyeyyqkghxdixgpktuo";
};

// Get Supabase URL from environment or construct from project ID
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || `https://${getProjectId()}.supabase.co`;

// Get Anon Key from environment or use default
export const publicAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJieWV5eXFrZ2h4ZGl4Z3BrdHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxNjQ3OTMsImV4cCI6MjA4MDc0MDc5M30.x4RnOIdIVCq0rkWLRFbYIjwxBswbFaXqL_kE5zd3Gok";

// Export project ID for backward compatibility
export const projectId = getProjectId();