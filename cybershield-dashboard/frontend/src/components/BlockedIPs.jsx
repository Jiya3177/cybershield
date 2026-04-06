import { motion } from "framer-motion";
import { NoSymbolIcon } from "@heroicons/react/24/outline";

function BlockedIPs({ blockedIps, logs }) {
  const derivedIps = Array.from(
    new Set([
      ...blockedIps,
      ...logs.filter((log) => log.severity === "high").map((log) => log.source_ip)
    ])
  ).slice(0, 8);

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 }}
      className="rounded-3xl border border-cyber-border bg-cyber-panel p-5 shadow-danger"
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-2xl border border-cyber-danger/30 bg-cyber-danger/10 p-3">
          <NoSymbolIcon className="h-6 w-6 text-cyber-danger" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Blocked IPs</h2>
          <p className="text-sm text-cyber-muted">Active containment list for hostile sources.</p>
        </div>
      </div>

      <div className="space-y-3">
        {derivedIps.length ? (
          derivedIps.map((ip) => (
            <div
              key={ip}
              className="flex items-center justify-between rounded-2xl border border-cyber-danger/20 bg-[#1f1420] px-4 py-3"
            >
              <span className="font-mono text-sm text-slate-100">{ip}</span>
              <span className="rounded-full bg-cyber-danger/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyber-danger">
                Blocked
              </span>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-cyber-border bg-cyber-panelAlt/60 px-4 py-6 text-center text-sm text-cyber-muted">
            No blocked IPs registered yet.
          </div>
        )}
      </div>
    </motion.section>
  );
}

export default BlockedIPs;
