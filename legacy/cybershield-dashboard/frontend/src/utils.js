const ATTACK_TYPES = ["ddos", "malware", "phishing", "data_exfiltration", "port_scan", "ransomware"];

const severityWeights = {
  low: 1,
  medium: 3,
  high: 6
};

const attackWeights = {
  ddos: 5,
  malware: 4,
  phishing: 3,
  data_exfiltration: 6,
  port_scan: 2,
  ransomware: 7,
  normal: 0
};

export function formatTimestamp(timestamp) {
  if (!timestamp) {
    return "Unknown";
  }

  return new Date(timestamp * 1000).toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

export function formatTimeOnly(timestamp) {
  return new Date(timestamp * 1000).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

export function formatLastUpdated(date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

export function normalizeLogs(logs) {
  return [...logs].sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0));
}

export function timelineEntry(value) {
  return {
    time: Date.now(),
    value: Math.max(0, Math.min(100, value))
  };
}

export function severityColorClass(severity) {
  switch (severity) {
    case "high":
      return "bg-cyber-danger/15 text-cyber-danger";
    case "medium":
      return "bg-cyber-warning/15 text-cyber-warning";
    default:
      return "bg-cyber-primary/15 text-cyber-primary";
  }
}

export function getAttackCounts(logs) {
  const counts = ATTACK_TYPES.reduce((accumulator, type) => {
    accumulator[type] = 0;
    return accumulator;
  }, {});

  logs.forEach((log) => {
    if (counts[log.attack_type] !== undefined) {
      counts[log.attack_type] += 1;
    }
  });

  return ATTACK_TYPES.map((type) => ({
    key: type,
    name: type.replaceAll("_", " ").toUpperCase(),
    count: counts[type]
  }));
}

export function getThreatLevel(logs) {
  const score = logs.reduce((total, log) => {
    return total + (severityWeights[log.severity] || 1) + (attackWeights[log.attack_type] || 0);
  }, 0);

  if (score >= 45) {
    return "CRITICAL";
  }

  if (score >= 25) {
    return "HIGH";
  }

  if (score >= 12) {
    return "MODERATE";
  }

  return "LOW";
}

export function getThreatBadgeTone(level) {
  switch (level) {
    case "CRITICAL":
      return "border-cyber-danger/40 bg-cyber-danger/10 text-cyber-danger";
    case "HIGH":
      return "border-cyber-warning/40 bg-cyber-warning/10 text-cyber-warning";
    case "MODERATE":
      return "border-cyan-400/40 bg-cyan-400/10 text-cyan-300";
    default:
      return "border-cyber-primary/40 bg-cyber-primary/10 text-cyber-primary";
  }
}

export function getMetrics(state) {
  const logs = state.logs || [];
  const hostileLogs = logs.filter((log) => log.attack_type !== "normal");
  const uniqueIps = new Set(hostileLogs.map((log) => log.source_ip));
  const activeThreats = hostileLogs.filter((log) => log.severity === "high" || log.attack_type === "ransomware");

  return [
    {
      key: "attacks",
      label: "Total Attacks",
      value: hostileLogs.length,
      caption: "Observed hostile events",
      tone: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
    },
    {
      key: "blocked",
      label: "Blocked Attacks",
      value: (state.blocked_ips || []).length,
      caption: "Contained sources",
      tone: "border-cyber-danger/30 bg-cyber-danger/10 text-cyber-danger"
    },
    {
      key: "threats",
      label: "Active Threats",
      value: activeThreats.length,
      caption: "High-severity investigations",
      tone: "border-cyber-warning/30 bg-cyber-warning/10 text-cyber-warning"
    },
    {
      key: "ips",
      label: "Unique IPs",
      value: uniqueIps.size,
      caption: "Distinct hostile origins",
      tone: "border-sky-400/30 bg-sky-400/10 text-sky-300"
    },
    {
      key: "health",
      label: "System Health",
      value: `${state.system_health ?? 100}%`,
      caption: "Defense platform readiness",
      tone: "border-cyber-primary/30 bg-cyber-primary/10 text-cyber-primary"
    }
  ];
}

export function getAttackTimeline(logs) {
  const buckets = new Map();

  logs.forEach((log) => {
    const minute = new Date(log.timestamp * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });

    buckets.set(minute, (buckets.get(minute) || 0) + 1);
  });

  return Array.from(buckets.entries())
    .map(([minute, attacks]) => ({ minute, attacks }))
    .slice(-8);
}

export function getTopIps(logs) {
  const scores = {};

  logs.forEach((log) => {
    if (log.attack_type === "normal") {
      return;
    }

    const current = scores[log.source_ip] || { ip: log.source_ip, score: 0, events: 0 };
    current.events += 1;
    current.score += (severityWeights[log.severity] || 1) + (attackWeights[log.attack_type] || 0);
    scores[log.source_ip] = current;
  });

  return Object.values(scores)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      risk: item.score >= 16 ? "HIGH" : item.score >= 8 ? "MEDIUM" : "LOW",
      tone:
        item.score >= 16
          ? "bg-cyber-danger/15 text-cyber-danger"
          : item.score >= 8
            ? "bg-cyber-warning/15 text-cyber-warning"
            : "bg-cyber-primary/15 text-cyber-primary"
    }));
}

export function getTopAttackTypes(logs) {
  const counts = ATTACK_TYPES.reduce((accumulator, type) => ({ ...accumulator, [type]: 0 }), {});

  logs.forEach((log) => {
    if (counts[log.attack_type] !== undefined) {
      counts[log.attack_type] += 1;
    }
  });

  const total = Math.max(
    1,
    Object.values(counts).reduce((sum, value) => sum + value, 0)
  );

  return Object.entries(counts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([type, count]) => ({
      type,
      count,
      label: type.replaceAll("_", " "),
      percent: (count / total) * 100
    }));
}

export function buildEventFeed(state) {
  const logEvents = (state.logs || []).slice(0, 8).map((log) => ({
    timestamp: log.timestamp,
    timeLabel: formatTimeOnly(log.timestamp),
    message: `${String(log.attack_type).replaceAll("_", " ").toUpperCase()} attack from ${log.source_ip}`,
    level: log.severity,
    tone: severityColorClass(log.severity)
  }));

  const aiEvents = (state.recent_actions || []).slice(-4).map((entry) => ({
    timestamp: entry.timestamp,
    timeLabel: formatTimeOnly(entry.timestamp),
    message: entry.action === "block_ip" && entry.target ? `IP automatically blocked: ${entry.target}` : `AI executed ${entry.action}`,
    level: "AI",
    tone: "bg-cyan-400/15 text-cyan-300"
  }));

  return [...logEvents, ...aiEvents]
    .sort((left, right) => right.timestamp - left.timestamp)
    .slice(0, 10);
}

export function getAttackMapMarkers(logs) {
  const hostile = logs.filter((log) => log.attack_type !== "normal").slice(0, 10);

  return hostile.map((log) => {
    const segments = String(log.source_ip).split(".").map((value) => Number(value) || 0);
    const longitude = 68 + ((segments[0] + segments[1]) % 26);
    const latitude = 8 + ((segments[2] + segments[3]) % 27);
    const region = longitude > 86 ? "East Asia Corridor" : longitude > 78 ? "India Core Region" : "West India Gateway";

    return {
      ip: log.source_ip,
      coordinates: [longitude, latitude],
      region,
      weight: log.severity === "high" ? 2 : log.severity === "medium" ? 1.4 : 1,
      color: log.severity === "high" ? "#ef4444" : log.severity === "medium" ? "#f59e0b" : "#22c55e"
    };
  });
}

export function getAlerts(state, threatLevel) {
  const alerts = [];

  if (threatLevel === "CRITICAL") {
    alerts.push({
      id: "critical-threat",
      label: "Critical Threat",
      message: "Threat telemetry has reached critical levels. Analyst attention required.",
      tone: "border-cyber-danger/40 bg-[#2a1015]/90 text-cyber-danger"
    });
  }

  if ((state.logs || []).some((log) => log.attack_type === "ransomware")) {
    alerts.push({
      id: "ransomware",
      label: "Ransomware",
      message: "Ransomware activity detected in the live event stream.",
      tone: "border-cyber-warning/40 bg-[#2a2010]/90 text-cyber-warning"
    });
  }

  if ((state.system_health || 100) < 30) {
    alerts.push({
      id: "health-low",
      label: "System Health",
      message: "System health has dropped below 30%. Emergency defense mode is active.",
      tone: "border-cyber-danger/40 bg-[#2a1015]/90 text-cyber-danger"
    });
  }

  return alerts;
}
