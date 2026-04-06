import { motion } from "framer-motion";
import {
  BoltIcon,
  NoSymbolIcon,
  ShieldExclamationIcon,
  ServerStackIcon,
  GlobeAltIcon
} from "@heroicons/react/24/outline";

const iconMap = {
  attacks: BoltIcon,
  blocked: NoSymbolIcon,
  threats: ShieldExclamationIcon,
  ips: GlobeAltIcon,
  health: ServerStackIcon
};

function MetricsGrid({ metrics }) {
  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map((metric, index) => {
        const Icon = iconMap[metric.key] || BoltIcon;

        return (
          <motion.article
            key={metric.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.04 * index }}
            className="group relative overflow-hidden rounded-3xl border border-cyber-border bg-[#111827] p-5 shadow-glow"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_36%)] opacity-0 transition group-hover:opacity-100" />
            <div className="relative flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-cyber-muted">{metric.label}</div>
                <div className="mt-3 text-3xl font-extrabold text-white">{metric.value}</div>
                <div className="mt-2 text-sm text-slate-400">{metric.caption}</div>
              </div>
              <div className={`rounded-2xl border p-3 ${metric.tone}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}

export default MetricsGrid;
