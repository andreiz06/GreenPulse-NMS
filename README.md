# 🟢 GreenPulse NMS - Hardware Monitoring System

> O soluție Full-Stack dezvoltată pentru monitorizarea centralizată și în timp real a performanței hardware într-o rețea locală. 

Acest proiect a fost prezentat la *Sesiunea de Comunicări Științifice Studențești (Mai 2026)* în cadrul Facultății de Electronică, Telecomunicații și Tehnologia Informației (ETTI), UPB.

---

## 📸 Interfață și Funcționalități

### 1. Dashboard Principal
Vedere de ansamblu asupra rețelei: stare globală CPU, RAM, procese active și detalii hardware.
<img width="1842" height="720" alt="image" src="https://github.com/user-attachments/assets/41c126f5-436a-48d7-818e-854e201b31f2" />


### 2. Grafice în Timp Real & Stocare
Urmărirea evoluției sarcinii procesorului prin grafice dinamice și monitorizarea partițiilor.
[ ! DRAG & DROP POZA CU GRAFICELE AICI - ex: slide 8 sau 9 din PPT ! ]

### 3. Sistem de Alerte (Toast Notifications)
Notificări subtile, non-blocante, care apar instantaneu când un parametru (ex: RAM > 95%) depășește pragurile normale.
[ ! DRAG & DROP POZA CU ALERTELE TOAST AICI - ex: slide 10 din PPT ! ]

---

## ⚙️ Arhitectura Sistemului (3-Tier)

Sistemul este construit pe un flux de date clar: **Achiziție ➔ Transmisie ➔ Procesare ➔ Stocare ➔ Vizualizare**, structurat pe 3 niveluri principale:

1. **Agentul de Colectare (Node.js & PowerShell)**
   * Instalat pe sistemele client, rulează în fundal cu impact minim.
   * Un algoritm hibrid combină module native Node.js (pentru latență redusă) cu interogări avansate PowerShell (WMI/CIM) pentru a extrage date de nivel scăzut (CPU, RAM, stocare, temperaturi).

2. **Serverul Central (Java Spring Boot)**
   * Expune un API RESTful care primește JSON-urile de la agenți.
   * Dispune de un **motor de decizie** care verifică valorile primite împotriva unor praguri critice prestabilite.
   * Utilizează JPA/Hibernate pentru a interacționa automat cu baza de date, fără interogări SQL manuale.

3. **Interfața Grafică (React.js)**
   * O aplicație *Single Page Application (SPA)*.
   * Folosește `Recharts` pentru vizualizarea datelor temporale și actualizări asincrone (la fiecare 2 secunde) pentru o experiență de monitorizare fluidă.

4. **Baza de Date (PostgreSQL via Docker)**
   * Gestionează stocarea istoricului de performanță și a jurnalului de evenimente critice, containerizată pentru implementare rapidă.

---

## 🛠️ Stack Tehnologic

* **Frontend:** React.js, Recharts, Axios, HTML/CSS.
* **Backend:** Java 17, Spring Boot, Spring Data JPA, REST API.
* **Agent:** Node.js, PowerShell (WMI).
* **Database & DevOps:** PostgreSQL 15, Docker & Docker Compose.

---

## 🚀 Instalare și Rulare Locală

Pentru a testa proiectul pe mașina locală, urmează acești pași:

### 1. Baza de Date
Navighează în directorul rădăcină și pornește containerul Docker:
```bash
docker-compose up -d
