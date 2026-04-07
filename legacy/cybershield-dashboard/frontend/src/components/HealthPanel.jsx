import { motion } from "framer-motion";
import { CpuChipIcon } from "@heroicons/react/24/outline";

function HealthPanel({ systemHealth, history, threatLevel }) {
  const fillClass =
    systemHealth > 80 ? "bg-cyber-primary" : systemHealth >= 50 ? "bg-cyber-warning" : "bg-cyber-danger";
  const badgeClass =
    systemHealth > 80
      ? "bg-cyber-primary/15 text-cyber-primary"
      : systemHealth >= 50
        ? "bg-cyber-warning/15 text-cyber-warning"
        : "bg-cyber-danger/15 text-cyber-danger";

  const sparkPoints = history.length
    ? history
        .map((entry, index) => `${(index / Math.max(history.length - 1, 1)) * 100},${100 - entry.value}`)
        .join(" ")
    : "";

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-cyber-border bg-cyber-panel p-5 shadow-glow"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-cyber-muted">
            <CpuChipIcon className="h-5 w-5 text-cyber-primary" />
            System Health
          </div>
          <div className="mt-4 text-4xl font-extrabold text-white">{systemHealth}%</div>
        </div>
        <div className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${badgeClass}`}>
          {systemHealth > 80 ? "Stable" : systemHealth >= 50 ? "Watch" : "Critical"}
        </div>
      </div>

      <div className="mt-6">
        <div className="h-3 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className={`h-full rounded-full transition-all duration-700 ${fillClass}`}
            style={{ width: `${Math.max(0, Math.min(systemHealth, 100))}%` }}
            animate={{ width: `${Math.max(0, Math.min(systemHealth, 100))}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="mt-2 flex justify-between text-xs uppercase tracking-[0.18em] text-cyber-muted">
          <span>Degraded</span>
          <span>Optimal</span>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-cyber-border bg-[#0d162a] p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-cyber-muted">Operational Posture</div>
        <div className="mt-2 text-sm font-semibold text-white">{threatLevel} threat environment</div>
        <div className="mt-1 text-sm text-slate-400">
          {systemHealth < 30
            ? "Emergency containment active."
            : systemHealth < 50
              ? "Defensive safeguards prioritized."
              : "Autonomous defense operating normally."}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-cyber-border bg-cyber-panelAlt/70 p-4">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyber-muted">
          System Timeline
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-20 w-full">
          <defs>
            <linearGradient id="healthStroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
          {sparkPoints ? (
            <polyline
              fill="none"
              stroke="url(#healthStroke)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={sparkPoints}
            />
          ) : null}
        </svg>
      </div>
    </motion.section>
  );
}

export default HealthPanel;
