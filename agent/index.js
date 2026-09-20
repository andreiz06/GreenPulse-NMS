const os = require("os");
const axios = require("axios");
const util = require("util");
const { exec } = require("child_process");

const execAsync = util.promisify(exec);
const SERVER_URL = "http://localhost:8080/api/metrics";
const INTERVAL_MS = 3000;

const hostname = os.hostname();
const cpuName = os.cpus()[0].model;

let previousCpu = os.cpus();
function getCpuUsage() {
  let currentCpu = os.cpus();
  let idleDifference = 0, totalDifference = 0;
  for (let i = 0; i < currentCpu.length; i++) {
    let prev = previousCpu[i].times, curr = currentCpu[i].times;
    let prevTotal = Object.values(prev).reduce((a, b) => a + b);
    let currTotal = Object.values(curr).reduce((a, b) => a + b);
    totalDifference += currTotal - prevTotal;
    idleDifference += curr.idle - prev.idle;
  }
  previousCpu = currentCpu;
  return 100 - Math.round((100 * idleDifference) / totalDifference);
}

async function collectAndSendData() {
  try {
    const cpus = os.cpus();
    const cpuFreqRaw = Math.round(
      cpus.reduce((acc, cpu) => acc + cpu.speed, 0) / cpus.length,
    );
    const cpuUsage = getCpuUsage();

    
    const psScript =
      "$procs = @(Get-Process).Count; $disks = @(); Get-CimInstance Win32_LogicalDisk -Filter 'DriveType=3' -ErrorAction SilentlyContinue | ForEach-Object { $disks += @{ mount = $_.DeviceID; usedPercent = [math]::Round((($_.Size - $_.FreeSpace) / $_.Size) * 100, 2) } }; $ramSpeed = (Get-CimInstance Win32_PhysicalMemory -ErrorAction SilentlyContinue | Measure-Object -Property Speed -Average).Average; $fan = Get-CimInstance -ClassName Win32_Fan -ErrorAction SilentlyContinue | Select-Object -First 1; $fanSpeed = if ($fan -and $fan.CurrentSpeed) { $fan.CurrentSpeed } else { 0 }; $tz = Get-CimInstance -Namespace root\\wmi -ClassName MSAcpi_ThermalZoneTemperature -ErrorAction SilentlyContinue; $cpuTemp = 0; if ($tz) { $maxTemp = ($tz | Measure-Object -Property CurrentTemperature -Maximum).Maximum; if ($maxTemp) { $cpuTemp = [math]::Round(($maxTemp - 2732) / 10) } }; $gpuNames = ((Get-CimInstance Win32_VideoController -ErrorAction SilentlyContinue).Name) -join ' / '; @{ cpuTemp = $cpuTemp; gpuNames = $gpuNames; procs = $procs; disks = $disks; ramFreq = $ramSpeed; cpuFan = $fanSpeed } | ConvertTo-Json -Compress";

    const { stdout: psOut } = await execAsync(
      `powershell -NoProfile -Command "${psScript}"`,
    );

    const jsonStart = psOut.indexOf("{");
    const jsonEnd = psOut.lastIndexOf("}");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("PowerShell nu a returnat un JSON valid.");
    }

    const cleanJson = psOut.substring(jsonStart, jsonEnd + 1);
    const psData = JSON.parse(cleanJson);

    let gpuUsage = 0,
        gpuTemp = 0,
        gpuFan = 0,
        gpuFreq = 0;
    try {
      const { stdout: nvidiaOut } = await execAsync(
        "nvidia-smi --query-gpu=utilization.gpu,temperature.gpu,fan.speed,clocks.current.graphics --format=csv,noheader,nounits",
      );
      const parts = nvidiaOut.trim().split(",");
      gpuUsage = parseInt(parts[0]) || 0;
      gpuTemp = parseInt(parts[1]) || 0;
      gpuFan = isNaN(parseInt(parts[2])) ? 0 : parseInt(parts[2]);
      gpuFreq = parseInt(parts[3]) || 0;
    } catch (e) {}

    const payload = {
      hostname,
      cpuName,
      gpuName: psData.gpuNames || "Detectare...",
      cpuUsage,
      cpuTemp: psData.cpuTemp || 0,
      cpuFrequency: parseFloat((cpuFreqRaw / 1000).toFixed(2)),
      ramUsage: parseFloat(
        (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(2),
      ),
      ramFrequency: psData.ramFreq || 3200,
      processCount: psData.procs || 0,
      gpuUsage,
      gpuTemp,
      gpuFan,
      gpuFreq,
      cpuFan: psData.cpuFan || 0,
      disks: psData.disks || [],
      timestamp: new Date().toISOString(),
    };

    await axios.post(SERVER_URL, payload);
    console.log(
      `[${new Date().toLocaleTimeString()}] Date trimise: CPU ${cpuFreqRaw}MHz | RAM Clock ${payload.ramFrequency}MHz`,
    );
  } catch (err) {
    console.error("Eroare Colectare:", err.message);
  }
}

console.log(` Agent Admin Monitorizare Activat `);

setInterval(collectAndSendData, INTERVAL_MS);
