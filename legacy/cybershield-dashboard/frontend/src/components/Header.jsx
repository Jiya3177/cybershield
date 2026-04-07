import { motion } from "framer-motion";
import { ShieldCheckIcon, SignalIcon, SparklesIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { getThreatBadgeTone } from "../utils";

function Header({ lastUpdated, isRefreshing, threatLevel, threatScore, step, emergencyMode }) {
  const threatTone = getThreatBadgeTone(threatLevel);

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-cyber-border bg-gradient-to-r from-[#0c1428] via-[#13213d] to-[#0f172a] p-6 shadow-glow"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.15),transparent_38%),radial-gradient(circle_at_top_right,rgba(56,189,248,0.12),transparent_30%)]" />
      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-primary/70 to-transparent" />
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyber-primary/30 bg-cyber-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyber-primary">
            <ShieldCheckIcon className="h-4 w-4" />
            CyberShield AI Defense System
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Real-Time Cyber Attack Monitoring
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
              Analyst-grade situational awareness for the CyberShield autonomous defense environment.
            </p>
          </div>
          <div className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold uppercase tracking-[0.24em] shadow-glow ${threatTone}`}>
            <SparklesIcon className="h-5 w-5" />
            Threat Level {threatLevel}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-cyber-primary/20 bg-white/5 px-4 py-3 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.2em] text-cyber-muted">Status</div>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
              <span className="h-2.5 w-2.5 rounded-full bg-cyber-primary shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulseSoft" />
              ONLINE
            </div>
          </div>

          <div className={`rounded-2xl border bg-white/5 px-4 py-3 backdrop-blur ${threatTone}`}>
            <div className="text-xs uppercase tracking-[0.2em] text-cyber-muted">Threat Score</div>
            <div className="mt-2 text-sm font-semibold text-white">{threatScore ?? 0}</div>
          </div>

          <div className="rounded-2xl border border-cyber-border bg-white/5 px-4 py-3 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.2em] text-cyber-muted">Sync</div>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
              <SignalIcon className={`h-4 w-4 ${isRefreshing ? "animate-spin text-cyber-primary" : "text-cyan-300"}`} />
              {lastUpdated}
            </div>
          </div>

          <div className={`rounded-2xl border bg-white/5 px-4 py-3 backdrop-blur ${emergencyMode ? "border-cyber-danger/40 text-cyber-danger" : "border-cyber-border"}`}>
            <div className="text-xs uppercase tracking-[0.2em] text-cyber-muted">AI Status</div>
            <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
              <ExclamationTriangleIcon className={`h-4 w-4 ${emergencyMode ? "text-cyber-danger" : "text-cyan-300"}`} />
              {emergencyMode ? "Emergency Mode" : `Step ${step}`}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
