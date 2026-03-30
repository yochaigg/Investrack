import { createClient } from "@/lib/supabase/server";
import { fetchUserData } from "@/lib/google-sheets";
import { transformData } from "@/lib/data-transform";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/login");

  let data;
  let error: string | null = null;

  try {
    const rows = await fetchUserData(user.email);
    data = transformData(rows);
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load data";
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-loss/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-loss"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white/90 mb-2">
            Unable to Load Data
          </h2>
          <p className="text-sm text-white/40">{error}</p>
        </div>
      </div>
    );
  }

  if (!data || data.channels.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="glass rounded-2xl p-8 max-w-md text-center">
          <div className="w-12 h-12 rounded-full bg-neon-cyan/10 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-neon-cyan"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-white/90 mb-2">
            No Investment Data
          </h2>
          <p className="text-sm text-white/40">
            No data found for your account. Contact your administrator to add
            your investment records.
          </p>
        </div>
      </div>
    );
  }

  return <DashboardClient data={data} />;
}
