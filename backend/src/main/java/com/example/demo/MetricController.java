package com.example.demo;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MetricController {

    @Autowired
    private MetricRepository metricRepository;

    @Autowired
    private AlertRepository alertRepository;

    @GetMapping("/metrics")
    public List<Metric> getAllMetrics() {
        return metricRepository.findAll();
    }

    @PostMapping("/metrics")
    public Metric addMetric(@RequestBody Metric metric) {
        Metric savedMetric = metricRepository.save(metric);
        checkThresholds(metric);

        return savedMetric;
    }

    @GetMapping("/alerts")
    public List<Alert> getAllAlerts() {
        return alertRepository.findAllByOrderByTimestampDesc();
    }

    @DeleteMapping("/alerts/{id}")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        try {
            alertRepository.deleteById(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private void checkThresholds(Metric metric) {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        String currentTime = dtf.format(LocalDateTime.now());

        if (metric.getCpuUsage() != null && metric.getCpuUsage() > 90.0) {
            createAlert(metric.getHostname(), "Sarcina CPU a depășit pragul de 90% (" + metric.getCpuUsage() + "%)", "CRITIC", currentTime);
        }

        if (metric.getCpuTemp() != null && metric.getCpuTemp() > 85.0) {
            createAlert(metric.getHostname(), "Temperatura CPU este periculoasă (" + metric.getCpuTemp() + "°C)", "CRITIC", currentTime);
        }

        if (metric.getRamUsage() != null && metric.getRamUsage() > 95.0) {
            createAlert(metric.getHostname(), "Memoria RAM este aproape plină (" + metric.getRamUsage() + "%)", "AVERTISMENT", currentTime);
        }
    }

    private void createAlert(String hostname, String message, String severity, String time) {
        Alert alert = new Alert();
        alert.setHostname(hostname);
        alert.setMessage(message);
        alert.setSeverity(severity);
        alert.setTimestamp(time);
        alertRepository.save(alert);
    }
}