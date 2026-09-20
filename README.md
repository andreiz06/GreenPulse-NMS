# 📊 GreenPulse NMS (Network Management System)

**GreenPulse NMS** is a lightweight, distributed Full-Stack monitoring solution designed to track hardware performance (CPU, GPU, RAM, Storage, Sensors) across a local network of computers in real-time.

## 🚀 Architecture & Tech Stack

The application is built on a standard **3-Tier Architecture**:

1. **Collection Agent (Endpoint):** `Node.js`, `PowerShell (WMI/CIM)`, `nvidia-smi`
2. **Central Server (Backend):** `Java 17`, `Spring Boot`, `Spring Data JPA` (Hibernate), `REST API`
3. **Database:** `PostgreSQL`
4. **User Interface (Frontend):** `React.js`, `Recharts`

## 📁 Repository Structure

```text
GreenPulse-NMS/
├── backend/       # Java Spring Boot REST API & Business Logic
├── frontend/      # React.js UI Dashboard
└── agent/         # Node.js Lightweight Collection Script
```

## ⚙️ Quick Start

*Detailed instructions will be added here.*

---
*Created by [Zaharia Andrei-Cristian] for the Student Scientific Communications Session (2026).*