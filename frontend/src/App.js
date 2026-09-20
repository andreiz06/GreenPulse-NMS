import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Activity, Cpu, HardDrive, LayoutDashboard, Server, Thermometer, Zap, Bell, AlertTriangle, Fan, Monitor, Trash2, X } from "lucide-react";

const getSystemStatus = (lastTimestamp) => {
  if (!lastTimestamp) return { text: "Necunoscut", color: "#64748b" };
  const diffInSeconds = Math.floor((new Date().getTime() - new Date(lastTimestamp).getTime()) / 1000);
  return Math.abs(diffInSeconds) > 120 ? { text: "Offline", color: "#ef4444" } : { text: "Online", color: "#10b981" };
};

export default function App() {
  const [allData, setAllData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedHost, setSelectedHost] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  
  const [toast, setToast] = useState(null);
  const alertCount = useRef(0);

  useEffect(() => {
    const fetchData = () => {
      axios.get("http://localhost:8080/api/metrics").then((res) => {
        const sortedMetrics = res.data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setAllData(sortedMetrics);
        
        if (!selectedHost && sortedMetrics.length > 0) {
            setSelectedHost(sortedMetrics[sortedMetrics.length - 1].hostname);
        }
      }).catch(console.error);

      axios.get("http://localhost:8080/api/alerts").then((res) => {
        const sortedAlerts = res.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        if (alertCount.current > 0 && sortedAlerts.length > alertCount.current) {
          setToast(sortedAlerts[0]);
          setTimeout(() => setToast(null), 6000);
        }
        alertCount.current = sortedAlerts.length;
        setAlerts(sortedAlerts);
      }).catch(console.error);
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, [selectedHost]);

  const deleteAlert = (id) => {
    axios.delete(`http://localhost:8080/api/alerts/${id}`).then(() => {
      setAlerts(alerts.filter(a => a.id !== id));
      alertCount.current -= 1;
    }).catch(err => alert("Eroare la ștergerea alertei."));
  };

  const hostData = allData.filter((d) => d.hostname === selectedHost).slice(-30);
  const hostAlerts = alerts.filter((a) => a.hostname === selectedHost);
  const latest = hostData[hostData.length - 1];
  const uniqueHosts = [...new Set(allData.map((d) => d.hostname))];

  const theme = { bg: "#f8fafc", cardBg: "#ffffff", textMain: "#0f172a", textMuted: "#64748b", border: "#e2e8f0", primary: "#10b981", danger: "#ef4444", warning: "#f59e0b", gpuColor: "#8b5cf6", chartLine: "#e2e8f0" };

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: theme.bg, color: theme.textMain, fontFamily: '"Inter", system-ui, sans-serif' }}>
      
      <div style={{ width: "280px", backgroundColor: theme.cardBg, borderRight: `1px solid ${theme.border}`, padding: "24px", display: "flex", flexDirection: "column", zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <div style={{ backgroundColor: theme.primary, color: "white", padding: "8px", borderRadius: "8px", display: "flex" }}><Activity size={24} /></div>
          <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600", letterSpacing: "-0.5px" }}>GreenPulse NMS</h2>
        </div>

        <label style={{ fontSize: "12px", fontWeight: "600", color: theme.textMuted, textTransform: "uppercase", marginBottom: "12px" }}>Sistem Monitorizat</label>
        <select value={selectedHost} onChange={(e) => setSelectedHost(e.target.value)} style={{ backgroundColor: theme.bg, color: theme.textMain, border: `1px solid ${theme.border}`, padding: "12px", borderRadius: "8px", marginBottom: "40px", outline: "none", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
          {uniqueHosts.length > 0 ? uniqueHosts.map((h) => <option key={h} value={h}>{h}</option>) : <option>Fara date...</option>}
        </select>

        <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <TabButton active={activeTab === "overview"} onClick={() => setActiveTab("overview")} label="Prezentare Generala" icon={<LayoutDashboard size={20} />} theme={theme} />
          <TabButton active={activeTab === "performance"} onClick={() => setActiveTab("performance")} label="Performanta Hardware" icon={<Cpu size={20} />} theme={theme} />
          <TabButton active={activeTab === "storage"} onClick={() => setActiveTab("storage")} label="Stocare & Memorie" icon={<HardDrive size={20} />} theme={theme} />
          <TabButton active={activeTab === "alerts"} onClick={() => setActiveTab("alerts")} label={`Alerte (${hostAlerts.length})`} icon={<Bell size={20} />} theme={{ ...theme, primary: hostAlerts.length > 0 ? theme.danger : theme.textMuted }} />
        </nav>
      </div>

      <div style={{ flex: 1, padding: "40px", overflowY: "auto", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "700", letterSpacing: "-1px" }}>{selectedHost || "Se așteaptă conexiunea..."}</h1>
            <p style={{ margin: "4px 0 0 0", color: theme.textMuted, fontSize: "14px" }}>
              {latest ? (
                <>Stare: <span style={{ color: getSystemStatus(latest.timestamp).color, fontWeight: "bold" }}>{getSystemStatus(latest.timestamp).text}</span> • Ultima actualizare: {new Date(latest.timestamp).toLocaleTimeString()}</>
              ) : ("Sistem Offline sau în curs de inițializare")}
            </p>
          </div>
        </div>

        {!latest ? (
          <div style={{ color: theme.textMuted, textAlign: "center", marginTop: "100px" }}>Porniți agentul Node.js pentru a vizualiza datele.</div>
        ) : (
          <>
            {activeTab === "overview" && (
              <div style={{ display: "grid", gap: "24px" }}>
                <h3 style={{ margin: "0", fontSize: "18px", color: theme.textMain }}>Informații Sistem</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                  <DetailBox title="Model Procesor (CPU)" value={latest.cpuName} icon={<Cpu size={20}/>} theme={theme} />
                  <DetailBox title="Model Plăci Video (GPU)" value={latest.gpuName} icon={<Monitor size={20}/>} theme={theme} />
                </div>
                
                <h3 style={{ margin: "16px 0 0 0", fontSize: "18px", color: theme.textMain }}>Stare Globală Curentă</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
                  <MetricBox title="Sarcină Globală CPU" value={`${latest.cpuUsage}%`} icon={<Activity size={24} />} theme={theme} isAlert={latest.cpuUsage > 90} />
                  <MetricBox title="Memorie RAM Ocupată" value={`${latest.ramUsage}%`} icon={<Activity size={24} />} theme={theme} isAlert={latest.ramUsage > 95} />
                </div>
              </div>
            )}

            {activeTab === "performance" && (
              <div style={{ display: "grid", gap: "32px" }}>
                
                <div>
                  <h3 style={{ margin: "0 0 24px 0", fontSize: "18px", color: theme.textMain, display: "flex", alignItems:"center", gap:"8px" }}><Cpu size={20} color={theme.primary}/> Procesor Central (CPU)</h3>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", alignItems: "start" }}>
                    <div style={{ backgroundColor: theme.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}` }}>
                      <h4 style={{ margin: "0 0 24px 0", fontSize: "14px", fontWeight: "600", color: theme.textMuted }}>Evoluție Sarcină (%)</h4>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={hostData}>
                          <defs>
                            <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={theme.primary} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={theme.primary} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.chartLine} />
                          <XAxis dataKey="timestamp" tickFormatter={(t) => new Date(t).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})} stroke={theme.textMuted} fontSize={12} tickLine={false} axisLine={false} dy={10} />
                          <YAxis domain={[0, 100]} stroke={theme.textMuted} fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                          <Tooltip contentStyle={{ borderRadius: "8px" }} labelFormatter={(l) => new Date(l).toLocaleTimeString()} />
                          <Area type="monotone" dataKey="cpuUsage" stroke={theme.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorGreen)" isAnimationActive={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    <div style={{ display: "grid", gap: "24px" }}>
                      <MetricBox title="Frecvență CPU" value={`${latest.cpuFrequency || 0} GHz`} icon={<Zap size={24} />} theme={theme} />
                      <MetricBox title="Temperatură CPU" value={latest.cpuTemp > 0 ? `${latest.cpuTemp} °C` : "N/A"} icon={<Thermometer size={24} />} theme={theme} isAlert={latest.cpuTemp > 85} />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 style={{ margin: "0 0 24px 0", fontSize: "18px", color: theme.textMain, display: "flex", alignItems:"center", gap:"8px" }}><Monitor size={20} color={theme.gpuColor}/> Procesor Grafic (GPU)</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
                    <MetricBox title="Sarcină GPU" value={latest.gpuUsage > 0 ? `${latest.gpuUsage}%` : "0%"} icon={<Activity size={24} />} theme={{...theme, primary: theme.gpuColor}} />
                    <MetricBox title="Frecvență GPU" value={latest.gpuFreq > 0 ? `${latest.gpuFreq} MHz` : "Power Saving"} icon={<Zap size={24} />} theme={{...theme, primary: theme.gpuColor}} />
                    <MetricBox title="Temperatură GPU" value={latest.gpuTemp > 0 ? `${latest.gpuTemp} °C` : "Idle"} icon={<Thermometer size={24} />} theme={{...theme, primary: theme.gpuColor}} isAlert={latest.gpuTemp > 85} />
                  </div>
                </div>

                <div>
                  <h3 style={{ margin: "0 0 24px 0", fontSize: "18px", color: theme.textMain, display: "flex", alignItems:"center", gap:"8px" }}><Fan size={20} color="#3b82f6"/> Sistem de Răcire (Ventilatoare)</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" }}>
                    <MetricBox title="Ventilator Procesor (CPU)" value={latest.cpuFan > 0 ? `${latest.cpuFan} RPM` : "N/A"} icon={<Fan size={24} />} theme={{...theme, primary: "#3b82f6"}} />
                    <MetricBox title="Ventilator Grafic (GPU)" value={latest.gpuFan > 0 ? `${latest.gpuFan} RPM` : "N/A"} icon={<Fan size={24} />} theme={{...theme, primary: theme.gpuColor}} />
                  </div>
                </div>

              </div>
            )}

            {activeTab === "storage" && (
              <div style={{ display: "grid", gap: "32px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <PieCard title="Memorie RAM Utilizată" value={latest.ramUsage} theme={theme} />
                  </div>
                  {latest.disks && latest.disks.map((disk, index) => (
                    <PieCard key={index} title={`Partiție Stocare (${disk.mount})`} value={disk.usedPercent} theme={{...theme, primary: "#3b82f6"}} />
                  ))}
                </div>
                
                <div>
                  <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", color: theme.textMain }}>Sistem de Operare</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
                    <MetricBox title="Procese Active" value={latest.processCount} icon={<Server size={24} />} theme={theme} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "alerts" && (
              <div style={{ backgroundColor: theme.cardBg, borderRadius: "16px", border: `1px solid ${theme.border}`, overflow: "hidden" }}>
                <div style={{ padding: "24px", borderBottom: `1px solid ${theme.border}` }}>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: theme.textMain }}>Jurnal Evenimente Critice</h3>
                </div>
                {hostAlerts.length === 0 ? (
                  <div style={{ padding: "40px", textAlign: "center", color: theme.textMuted }}>Nu au fost înregistrate alerte pentru acest sistem.</div>
                ) : (
                  <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                    {hostAlerts.map((alert, idx) => (
                      <div key={alert.id || idx} style={{ padding: "16px 24px", borderBottom: `1px solid ${theme.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: alert.severity === "CRITIC" ? "#fef2f2" : "#fffbeb" }}>
                        <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                          <div style={{ color: alert.severity === "CRITIC" ? theme.danger : theme.warning, marginTop: "2px" }}><AlertTriangle size={20} /></div>
                          <div>
                            <div style={{ fontWeight: "600", fontSize: "14px", color: theme.textMain }}>{alert.message}</div>
                            <div style={{ fontSize: "12px", color: theme.textMuted, marginTop: "4px" }}>
                              <span style={{ fontWeight: "600", color: alert.severity === "CRITIC" ? theme.danger : theme.warning }}>{alert.severity}</span> • {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <button onClick={() => deleteAlert(alert.id)} style={{ background: "transparent", border: "none", cursor: "pointer", color: theme.textMuted, padding: "8px", borderRadius: "8px" }} title="Șterge alerta">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {toast && (
          <div style={{ position: 'fixed', bottom: "40px", right: "40px", backgroundColor: theme.cardBg, borderLeft: `5px solid ${toast.severity === 'CRITIC' ? theme.danger : theme.warning}`, padding: '16px 24px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', gap: '16px', alignItems: 'center', zIndex: 9999, minWidth: '320px' }}>
            <Bell color={toast.severity === 'CRITIC' ? theme.danger : theme.warning} size={28} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '700', fontSize: '14px', color: theme.textMain }}>Alertă nouă: {toast.hostname}</div>
              <div style={{ fontSize: '13px', color: theme.textMuted, marginTop: '4px' }}>{toast.message}</div>
            </div>
            <button onClick={() => setToast(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: theme.textMuted, display: 'flex' }}>
              <X size={20} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const TabButton = ({ active, onClick, label, icon, theme }) => (
  <div onClick={onClick} style={{ padding: "12px 16px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px", backgroundColor: active ? theme.bg : "transparent", color: active ? theme.primary : theme.textMuted, fontWeight: active ? "600" : "500", transition: "all 0.2s" }}>
    <div style={{ display: "flex", alignItems: "center", color: active ? theme.primary : theme.textMuted }}>{icon}</div> {label}
  </div>
);

const MetricBox = ({ title, value, icon, theme, isAlert = false }) => (
  <div style={{ backgroundColor: theme.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${isAlert ? theme.danger : theme.border}`, display: "flex", flexDirection: "column", boxShadow: isAlert ? "0 0 0 1px #ef4444" : "0 1px 3px rgba(0,0,0,0.05)" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
      <div style={{ fontSize: "13px", fontWeight: "600", color: theme.textMuted }}>{title}</div>
      <div style={{ color: isAlert ? theme.danger : theme.primary, backgroundColor: isAlert ? "#fef2f2" : `${theme.primary}15`, padding: "8px", borderRadius: "8px", display: "flex" }}>{icon}</div>
    </div>
    <div style={{ fontSize: "30px", fontWeight: "700", color: isAlert ? theme.danger : theme.textMain, letterSpacing: "-1px" }}>{value}</div>
  </div>
);

const DetailBox = ({ title, value, icon, theme }) => (
  <div style={{ backgroundColor: theme.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}`, display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontWeight: "600", color: theme.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>
      {icon} {title}
    </div>
    <div style={{ fontSize: "16px", fontWeight: "600", color: theme.textMain, lineHeight: "1.5", wordWrap: "break-word" }}>{value || "Nu s-a detectat"}</div>
  </div>
);

const PieCard = ({ title, value, theme }) => (
  <div style={{ backgroundColor: theme.cardBg, padding: "24px", borderRadius: "16px", border: `1px solid ${theme.border}`, textAlign: "center" }}>
    <h4 style={{ margin: "0 0 20px 0", fontSize: "15px", fontWeight: "600", color: theme.textMuted }}>{title}</h4>
    <ResponsiveContainer width="100%" height={160}>
      <PieChart>
        <Pie data={[{ value: value }, { value: 100 - value }]} innerRadius={55} outerRadius={70} dataKey="value" stroke="none" startAngle={90} endAngle={-270}>
          <Cell fill={value > 90 ? theme.danger : theme.primary} />
          <Cell fill={theme.bg} />
        </Pie>
      </PieChart>
    </ResponsiveContainer>
    <div style={{ fontSize: "28px", fontWeight: "700", color: theme.textMain, marginTop: "-5px", letterSpacing: "-1px" }}>{value}%</div>
  </div>
);