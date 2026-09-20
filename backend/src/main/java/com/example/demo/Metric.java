package com.example.demo;

import jakarta.persistence.*;
import java.util.List;

@Entity
public class Metric {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String hostname;
    private String cpuName;
    private String gpuName;

    private Double cpuUsage;
    private Double cpuTemp;
    private Double cpuFrequency;
    
    private Integer cpuFan;

    private Double gpuUsage;
    private Double gpuTemp;
    
    private Integer gpuFan;
    private Integer gpuFreq;

    private Double ramUsage;
    

    private Integer processCount;
    private Long uptime;
    private String timestamp;

    @ElementCollection
    private List<DiskInfo> disks;


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getHostname() { return hostname; }
    public void setHostname(String hostname) { this.hostname = hostname; }

    public String getCpuName() { return cpuName; }
    public void setCpuName(String cpuName) { this.cpuName = cpuName; }

    public String getGpuName() { return gpuName; }
    public void setGpuName(String gpuName) { this.gpuName = gpuName; }

    public Double getCpuUsage() { return cpuUsage; }
    public void setCpuUsage(Double cpuUsage) { this.cpuUsage = cpuUsage; }

    public Double getCpuTemp() { return cpuTemp; }
    public void setCpuTemp(Double cpuTemp) { this.cpuTemp = cpuTemp; }

    public Double getCpuFrequency() { return cpuFrequency; }
    public void setCpuFrequency(Double cpuFrequency) { this.cpuFrequency = cpuFrequency; }

    public Integer getCpuFan() { return cpuFan; }
    public void setCpuFan(Integer cpuFan) { this.cpuFan = cpuFan; }

    public Double getGpuUsage() { return gpuUsage; }
    public void setGpuUsage(Double gpuUsage) { this.gpuUsage = gpuUsage; }

    public Double getGpuTemp() { return gpuTemp; }
    public void setGpuTemp(Double gpuTemp) { this.gpuTemp = gpuTemp; }

    public Integer getGpuFan() { return gpuFan; }
    public void setGpuFan(Integer gpuFan) { this.gpuFan = gpuFan; }

    public Integer getGpuFreq() { return gpuFreq; }
    public void setGpuFreq(Integer gpuFreq) { this.gpuFreq = gpuFreq; }

    public Double getRamUsage() { return ramUsage; }
    public void setRamUsage(Double ramUsage) { this.ramUsage = ramUsage; }

    public Integer getProcessCount() { return processCount; }
    public void setProcessCount(Integer processCount) { this.processCount = processCount; }

    public Long getUptime() { return uptime; }
    public void setUptime(Long uptime) { this.uptime = uptime; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public List<DiskInfo> getDisks() { return disks; }
    public void setDisks(List<DiskInfo> disks) { this.disks = disks; }
}