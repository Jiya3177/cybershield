import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import HealthPanel from "../components/HealthPanel";
import AttackChart from "../components/AttackChart";
import AttackLogs from "../components/AttackLogs";
import BlockedIPs from "../components/BlockedIPs";
import ActionPanel from "../components/ActionPanel";
import MetricsGrid from "../components/MetricsGrid";
import LiveEventFeed from "../components/LiveEventFeed";
import GlobalAttackMap from "../components/GlobalAttackMap";
import AttackTimelineChart from "../components/AttackTimelineChart";
import ThreatIntelPanel from "../components/ThreatIntelPanel";
import AIDefensePanel from "../components/AIDefensePanel";
import AlertsOverlay from "../components/AlertsOverlay";
import { getState, performAction, resetEnvironment } from "../api/api";
import {
  buildEventFeed,
  formatLastUpdated,
  getAlerts,
  getAttackCounts,
  getAttackMapMarkers,
  getAttackTimeline,
  getMetrics,
  getThreatLevel,
  getTopAttackTypes,
  getTopIps,
  normalizeLogs,
  timelineEntry
} from "../utils";

const INITIAL_STATE = {
  step: 0,
  logs: [],
  system_health: 100,
  blocked_ips: [],
  threat_score: 0,
  recent_actions: [],
  last_decision_reason: "",
  ai_interval_seconds: 3
};

function Dashboard() {
  const [state, setState] = useState(INITIAL_STATE);
  const [healthHistory, setHealthHistory] = useState([timelineEntry(100)]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyAction, setBusyAction] = useState(null);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("Awaiting sync");

  const syncState = async () => {
    setIsRefreshing(true);
    try {
      const nextState = await getState();
      console.log("CyberShield state:", nextState);
      const normalized = {
        ...nextState,
        logs: normalizeLogs(nextState.logs || [])
      };

      setState(normalized);
      setHealthHistory((current) => [...current.slice(-19), timelineEntry(normalized.system_health)]);
      setLastUpdated(formatLastUpdated(new Date()));
      setError("");
    } catch (syncError) {
      setError("Unable to reach CyberShield backend. Confirm FastAPI is running on 127.0.0.1:8000.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    syncState();

    const interval = window.setInterval(() => {
      syncState();
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  const runAction = async (action) => {
    setBusyAction(action);
    try {
      await performAction(action);
      await syncState();
    } catch (actionError) {
      setError(`Action failed: ${action}`);
    } finally {
      setBusyAction(null);
    }
  };

  const handleReset = async () => {
    setBusyAction("reset");
    try {
      const response = await resetEnvironment();
      const nextState = response.state || INITIAL_STATE;
      const normalized = {
        ...nextState,
        logs: normalizeLogs(nextState.logs || [])
      };

      setState(normalized);
      setHealthHistory([timelineEntry(normalized.system_health)]);
      setLastUpdated(formatLastUpdated(new Date()));
      setError("");
    } catch (resetError) {
      setError("Environment reset failed.");
    } finally {
      setBusyAction(null);
    }
  };

  const threatLevel = useMemo(() => getThreatLevel(state.logs), [state.logs]);
  const metrics = useMemo(() => getMetrics(state), [state]);
  const attackChartData = useMemo(() => getAttackCounts(state.logs), [state.logs]);
  const attackTimelineData = useMemo(() => getAttackTimeline(state.logs), [state.logs]);
  const eventFeed = useMemo(() => buildEventFeed(state), [state]);
  const topIps = useMemo(() => getTopIps(state.logs), [state.logs]);
  const topAttackTypes = useMemo(() => getTopAttackTypes(state.logs), [state.logs]);
  const attackMapMarkers = useMemo(() => getAttackMapMarkers(state.logs), [state.logs]);
  const alerts = useMemo(() => getAlerts(state, threatLevel), [state, threatLevel]);

  return (
    <div className="min-h-screen bg-cyber-bg text-white">
      <AlertsOverlay alerts={alerts} />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.07),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.09),transparent_28%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px)] [background-size:36px_36px]" />

      <main className="relative mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <Header
          lastUpdated={lastUpdated}
          isRefreshing={isRefreshing}
          threatLevel={threatLevel}
          threatScore={state.threat_score}
          step={state.step}
          emergencyMode={state.emergency_mode}
        />

        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-2xl border border-cyber-danger/30 bg-cyber-danger/10 px-4 py-3 text-sm text-rose-200"
          >
            {error}
          </motion.div>
        ) : null}

        <MetricsGrid metrics={metrics} />

        <section className="mt-6 grid gap-6 2xl:grid-cols-12">
          <div className="2xl:col-span-3">
            <HealthPanel systemHealth={state.system_health} history={healthHistory} threatLevel={threatLevel} />
          </div>
          <div className="2xl:col-span-5">
            <AttackTimelineChart data={attackTimelineData} />
          </div>
          <div className="2xl:col-span-4">
            <AIDefensePanel state={state} />
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <GlobalAttackMap markers={attackMapMarkers} />
          </div>
          <div className="xl:col-span-5">
            <LiveEventFeed events={eventFeed} />
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-7">
            <AttackLogs logs={state.logs} />
          </div>
          <div className="xl:col-span-5">
            <ThreatIntelPanel topIps={topIps} topAttackTypes={topAttackTypes} />
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-12">
          <div className="xl:col-span-4">
            <BlockedIPs blockedIps={state.blocked_ips || []} logs={state.logs} />
          </div>
          <div className="xl:col-span-5">
            <AttackChart data={attackChartData} />
          </div>
          <div className="xl:col-span-3">
            <ActionPanel onAction={runAction} onReset={handleReset} busyAction={busyAction} />
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
