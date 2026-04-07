import { motion } from "framer-motion";
import { formatTimestamp, severityColorClass } from "../utils";

function AttackLogs({ logs }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-3xl border border-cyber-border bg-cyber-panel p-5 shadow-glow"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Attack Logs</h2>
          <p className="text-sm text-cyber-muted">Latest observed malicious and benign events.</p>
        </div>
        <div className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
          Live Feed
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-cyber-border">
        <div className="max-h-[26rem] overflow-auto">
          <table className="min-w-full divide-y divide-cyber-border text-left">
            <thead className="sticky top-0 bg-[#0f1a30]/95 backdrop-blur">
              <tr className="text-xs uppercase tracking-[0.22em] text-cyber-muted">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Source IP</th>
                <th className="px-4 py-3">Attack Type</th>
                <th className="px-4 py-3">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyber-border bg-cyber-panelAlt/50">
              {logs.length ? (
                logs.map((log, index) => (
                  <tr key={`${log.timestamp}-${log.source_ip}-${index}`} className="transition hover:bg-white/5">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-200">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-cyan-300">
                      {log.source_ip}
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-white">
                      {String(log.attack_type).replaceAll("_", " ")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${severityColorClass(log.severity)}`}>
                        {log.severity}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-sm text-cyber-muted">
                    No events captured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.section>
  );
}

export default AttackLogs;
