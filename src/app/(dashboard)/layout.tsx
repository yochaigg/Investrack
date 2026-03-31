import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden">
      {/* Ambient background glows — stronger for depth */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 left-1/4 w-[700px] h-[700px] bg-neon-cyan/[0.04] rounded-full blur-[150px]" />
        <div className="absolute top-1/3 -right-20 w-[500px] h-[500px] bg-neon-purple/[0.05] rounded-full blur-[130px]" />
        <div className="absolute -bottom-20 -left-20 w-[600px] h-[400px] bg-neon-blue/[0.035] rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] bg-neon-green/[0.025] rounded-full blur-[120px]" />
        {/* Subtle vignette */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-neon-cyan"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white/90 tracking-tight hidden sm:block">
              Investment Followup
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30 hidden sm:block">
              {user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
