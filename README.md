# 🟢 GreenPulse NMS - Hardware Monitoring System

> O soluție Full-Stack dezvoltată pentru monitorizarea centralizată și în timp real a performanței hardware într-o rețea locală. 

Acest proiect a fost prezentat la *Sesiunea de Comunicări Științifice Studențești (Mai 2026)* în cadrul Facultății de Electronică, Telecomunicații și Tehnologia Informației (ETTI), UPB.

---

## 📸 Interfață și Funcționalități

### 1. Dashboard Principal
Vedere de ansamblu asupra rețelei: stare globală CPU, RAM, procese active și detalii hardware.
<img width="800" alt="image" src="https://github.com/user-attachments/assets/41c126f5-436a-48d7-818e-854e201b31f2" />

### 2. Grafice în Timp Real & Stocare
Urmărirea evoluției sarcinii procesorului prin grafice dinamice și monitorizarea partițiilor.
<img width="800" alt="image" src="https://github.com/user-attachments/assets/dc020361-9387-4332-bd39-84ce631075fd" />
<img width="800" alt="image" src="https://github.com/user-attachments/assets/111c05d6-219d-4311-9a0b-24c5333c536f" />
<img width="800" alt="image" src="https://github.com/user-attachments/assets/25e3c828-afee-4ed2-845a-b9b1c92c0274" />

### 3. Sistem de Alerte (Toast Notifications)
Notificări subtile, non-blocante, care apar instantaneu când un parametru (ex: RAM > 95%) depășește pragurile normale.
<img width="600" alt="image" src="https://github.com/user-attachments/assets/fface281-1444-4d10-a52f-d1b2a52338b9" />
<img width="600" alt="image" src="https://github.com/user-attachments/assets/da4c9364-857f-44e5-ab34-a1fdc7f8f40d" />
<img width="800" alt="image" src="https://github.com/user-attachments/assets/66c4d236-8426-4959-abfe-316a70f282af" />

---

## ⚙️ Arhitectura Sistemului (3-Tier)

Sistemul este construit pe un flux de date clar: **Achiziție ➔ Transmisie ➔ Procesare ➔ Stocare ➔ Vizualizare**, structurat pe 3 niveluri principale:
<br>
<img width="800" alt="image" src="https://github.com/user-attachments/assets/b0417c8d-6bfb-4016-b3c9-d90b1d7239a3" />

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
```
### 2. Backend (Serverul Java)
Navighează în folderul `backend` și pornește serverul (se va conecta automat la PostgreSQL pe portul 5432):
```bash
cd backend
./mvnw spring-boot:run
```
