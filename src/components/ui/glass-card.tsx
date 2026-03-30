interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "cyan" | "green" | "purple" | "none";
}

export function GlassCard({
  children,
  className = "",
  glow = "none",
}: GlassCardProps) {
  const glowMap = {
    cyan: "shadow-glow",
    green: "shadow-glow-green",
    purple: "shadow-glow-purple",
    none: "",
  };

  return (
    <div
      className={`glass rounded-2xl p-4 sm:p-5 ${glowMap[glow]} ${className}`}
    >
      {children}
    </div>
  );
}
