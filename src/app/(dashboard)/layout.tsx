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
      {/* Animated perspective grid */}
      <div className="dashboard-bg" />
      {/* CRT scanlines */}
      <div className="scanlines" />

      {/* Ambient neon glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-60 left-1/4 w-[800px] h-[800px] bg-neon-cyan/[0.04] rounded-full blur-[200px]" />
        <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-neon-purple/[0.05] rounded-full blur-[160px]" />
        <div className="absolute -bottom-20 -left-20 w-[700px] h-[500px] bg-neon-blue/[0.035] rounded-full blur-[180px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-neon-green/[0.025] rounded-full blur-[160px]" />
        {/* Edge vignette */}
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 25%, rgba(0,0,0,0.65) 100%)" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-lg bg-neon-cyan/10 border border-neon-cyan/25 flex items-center justify-center">
              <svg className="w-4 h-4 text-neon-cyan" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              {/* Corner cut accent */}
              <span className="absolute top-0 right-0 w-0 h-0 border-solid border-[0_6px_6px_0] border-transparent border-r-neon-cyan/30" />
            </div>
            <div>
              <span className="text-sm font-bold text-white/95 tracking-tight hidden sm:block font-mono">
                INVESTRACK
              </span>
              <span className="text-[9px] text-neon-cyan/60 tracking-widest uppercase font-mono hidden sm:block">
                Portfolio Terminal
              </span>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex items-center gap-4">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-neon-green/5 border border-neon-green/15">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green live-dot" />
              <span className="text-[10px] font-mono text-neon-green/80 tracking-widest uppercase">Live</span>
            </div>

            <span className="text-xs text-white/25 hidden sm:block font-mono">{user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</main>
    </div>
  );
}
