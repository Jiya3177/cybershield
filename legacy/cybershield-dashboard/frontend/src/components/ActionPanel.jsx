import { motion } from "framer-motion";
import {
  ArrowPathIcon,
  BoltIcon,
  EyeIcon,
  ShieldExclamationIcon,
  WrenchScrewdriverIcon
} from "@heroicons/react/24/outline";

const actions = [
  {
    label: "Scan Network",
    action: "scan_network",
    icon: BoltIcon,
    tone: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
  },
  {
    label: "Block IP",
    action: "block_ip",
    icon: ShieldExclamationIcon,
    tone: "border-cyber-danger/30 bg-cyber-danger/10 text-cyber-danger"
  },
  {
    label: "Patch Vulnerability",
    action: "patch_vulnerability",
    icon: WrenchScrewdriverIcon,
    tone: "border-cyber-primary/30 bg-cyber-primary/10 text-cyber-primary"
  },
  {
    label: "Monitor Traffic",
    action: "monitor_traffic",
    icon: EyeIcon,
    tone: "border-cyber-warning/30 bg-cyber-warning/10 text-cyber-warning"
  }
];

function ActionPanel({ onAction, onReset, busyAction }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16 }}
      className="rounded-3xl border border-cyber-border bg-cyber-panel p-5 shadow-glow"
    >
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white">AI Defense Actions</h2>
        <p className="text-sm text-cyber-muted">Manually trigger CyberShield response workflows.</p>
      </div>

      <div className="grid gap-3">
        {actions.map(({ label, action, icon: Icon, tone }) => (
          <button
            key={action}
            type="button"
            onClick={() => onAction(action)}
            disabled={busyAction !== null}
            className={`group flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition hover:scale-[1.01] hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 ${tone}`}
          >
            <span className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              <span className="font-semibold">{label}</span>
            </span>
            <span className="text-xs uppercase tracking-[0.18em]">
              {busyAction === action ? "Running" : "Execute"}
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={onReset}
          disabled={busyAction !== null}
          className="mt-1 flex items-center justify-between rounded-2xl border border-slate-500/30 bg-slate-500/10 px-4 py-4 text-left text-slate-200 transition hover:scale-[1.01] hover:bg-slate-400/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex items-center gap-3">
            <ArrowPathIcon className={`h-5 w-5 ${busyAction === "reset" ? "animate-spin" : ""}`} />
            <span className="font-semibold">Reset Environment</span>
          </span>
          <span className="text-xs uppercase tracking-[0.18em]">
            {busyAction === "reset" ? "Resetting" : "Reset"}
          </span>
        </button>
      </div>
    </motion.section>
  );
}

export default ActionPanel;
