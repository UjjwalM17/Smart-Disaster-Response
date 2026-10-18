<div align="center">

# 🚨 ResQ — Offline-First AI Disaster Response Platform

### *Edge-Native Disaster Intelligence, Offline Mapping, Multi-Factor Prioritization & Autonomous Rescue Coordination*

<p>

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![PWA](https://img.shields.io/badge/PWA-Service_Worker-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Leaflet](https://img.shields.io/badge/Leaflet-Offline_Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![API Gateway](https://img.shields.io/badge/Spring_Cloud_Gateway-Port_8086-6DB33F?style=for-the-badge)

</p>

<p>

**ResQ** is an industrial-grade, offline-first disaster response and tactical rescue coordination platform designed for deep forests, remote mountain ranges, flood zones, and catastrophic emergency areas where cellular and internet networks are disrupted or unavailable.

</p>

</div>

---

## 🌟 Executive Summary & System Philosophy

During catastrophic events (wildfires, cloudburst floods, landslides, structural collapses), communication infrastructure fails first. Standard cloud-dependent emergency apps fail entirely.

**ResQ operates on strict offline-first, honest-state engineering principles:**
1. **Never fabricate network state**: When offline, reports are explicitly marked `SAVED_OFFLINE` with IndexedDB persistence and durable upload queues. No mock "success" modals while in a blackout zone.
2. **Real On-Device AI Vision**: Pixel-level computer vision runs directly inside the client via HTML5 Canvas image analysis (HSV flame saturation, smoke desaturation, flood turbidity, edge rubble variance) without requiring cloud servers.
3. **Pre-Downloaded Regional Maps**: Leaflet is backed by IndexedDB raster tile caching and regional boundary packages (Delhi NCR, Mumbai Coastal, Uttarakhand Foothills, Assam Valley) adhering strictly to tile usage policies.
4. **Explainable Prioritization**: Mathematical multi-factor triage ($S \times 0.35 + P \times 0.25 + A \times 0.20 + U \times 0.20$) prevents subjective ranking and awards independent corroboration without double-counting.
5. **Geospatial Duplicate Clustering**: Haversine formula clusters proximate reports (<500m, <3h) with reversible linkages and human override audit trails.
6. **Automated Dispatch Recommendation**: Matches incident hazard types against available team competencies and inventory with explicit policy safety authorization levels.
7. **Strict Idempotency**: Store-and-forward batch synchronization with UUID client tokens (`clientIncidentId`) prevents duplicate incident creation upon network reconnection.
8. **Real Multi-Database Persistence**: 5 dedicated PostgreSQL databases orchestrated across 6 Spring Boot microservices via Spring Cloud Gateway (port 8086) with zero hardcoded metrics.

---

## 🏗️ System Architecture & Service Topology

```mermaid
flowchart TD
    subgraph ClientLayer["Edge & Client Layer (Offline-Capable)"]
        CitizenPWA["📱 Citizen / Reporter PWA<br/>(Service Worker + IndexedDB)"]
        AdminDashboard["💻 Admin Operations Dashboard<br/>(React + Leaflet + Tailwind)"]
        LocalAI["🧠 On-Device Vision Engine<br/>(Canvas HSV / Edge / Turbidity)"]
        OfflineMap["🗺️ Offline Tile Cache<br/>(resq_offline_db: tiles & regions)"]
        SyncQueue["🔄 Store-and-Forward Sync Engine<br/>(Exponential Backoff + Idempotency)"]
    end

    subgraph GatewayLayer["Gateway & Routing (Port 8086)"]
        Gateway["🌐 Spring Cloud Gateway<br/>(CORS, Global Error Handling, Route Proxy)"]
    end

    subgraph MicroservicesLayer["Spring Boot 3.x Microservices (Java 21)"]
        IncidentSvc["🚨 Incident Service (Port 8080)<br/>Idempotency, Verification & Sync"]
        RescueTeamSvc["👨‍🚒 Rescue Team Service (Port 8081)<br/>Availability & Team Capabilities"]
        ResourceSvc["🚒 Resource Service (Port 8082)<br/>Inventory Allocation & Status Tracking"]
        MissionSvc["🎯 Mission Service (Port 8083)<br/>Tactical Dispatch & Life Cycle Orchestration"]
        AlertSvc["📢 Alert Service (Port 8085)<br/>Automated Multi-Channel Dispatch Broadcasts"]
    end

    subgraph DataLayer["PostgreSQL 18 Multi-Database Tier"]
        DB1[("🗄️ incident_db")]
        DB2[("🗄️ rescueteam_db")]
        DB3[("🗄️ resource_db")]
        DB4[("🗄️ mission_db")]
        DB5[("🗄️ alert_db")]
    end

    CitizenPWA <--> LocalAI
    CitizenPWA <--> OfflineMap
    CitizenPWA <--> SyncQueue
    SyncQueue -->|POST /api/incidents (Online/Sync)| Gateway
    AdminDashboard <--> Gateway

    Gateway -->|/api/incidents/**| IncidentSvc
    Gateway -->|/api/rescue-teams/**| RescueTeamSvc
    Gateway -->|/api/resources/**| ResourceSvc
    Gateway -->|/api/missions/**| MissionSvc
    Gateway -->|/api/alerts/**| AlertSvc

    MissionSvc -.->|RestTemplate| IncidentSvc
    MissionSvc -.->|RestTemplate| RescueTeamSvc
    MissionSvc -.->|RestTemplate| ResourceSvc
    MissionSvc -.->|RestTemplate| AlertSvc

    IncidentSvc --> DB1
    RescueTeamSvc --> DB2
    ResourceSvc --> DB3
    MissionSvc --> DB4
    AlertSvc --> DB5
```

---

## 🔬 Core Algorithms & Technical Innovations

### 1. Multi-Factor Prioritization Formula
Priority is scored transparently between 0 and 100 using four explainable operational dimensions plus corroboration:

$$\text{Priority Score} = S_{\text{severity}} (35\%) + P_{\text{population}} (25\%) + A_{\text{access}} (20\%) + U_{\text{urgency}} (20\%) + C_{\text{corroboration}}$$

- **Severity Weight (35%)**: Critical = 35, High = 27, Medium = 18, Low = 8.
- **Population at Risk (25%)**: Scaled logarithmically based on reported trapped/affected headcount ($\ge 100 \rightarrow 25\text{ pts}$).
- **Accessibility Factor (20%)**: Blocked roads, washed out bridges, landslides cut-off routes ($\le 5\text{ pts}$ if blocked, demanding air/water dispatch).
- **Temporal Urgency (20%)**: Rising floodwaters, advancing active flame fronts, structural cracks accelerating.
- **Independent Corroboration**: $+4\text{ pts}$ per distinct reporting device up to $+12\text{ max}$, without double-counting casualties.

### 2. Haversine Proximity Clustering & Duplicate Engine
To prevent phantom disaster surges when 50 citizens report the same collapse:
$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$
- If distance $d < 500\text{ meters}$, time difference $\Delta t < 3\text{ hours}$, and hazard categories match:
- The system groups the report under a parent **Duplicate Group ID**.
- The primary report maintains independent corroboration tags.
- Links are **strictly reversible** by authorized emergency operators with full audit logging.

### 3. Real On-Device Computer Vision Pipeline
When offline in a communications blackout, the app performs real client-side vision processing through an offscreen HTML5 canvas:
- **Wildfire & Flame**: Computes normalized RGB-to-HSV color space transforms; isolates pixels with $H \in [0^\circ, 55^\circ]$, $S > 0.45$, $V > 0.55$.
- **Smoke Plumes**: Isolates low-saturation, high-brightness grayscale clusters with high spatial variance.
- **Flood Water**: Evaluates brown/blue-gray turbidity indices and horizontal water surface reflections.
- **Structural Collapse & Rubble**: Computes Sobel edge gradient variance ($\sigma_{\text{edge}}^2 > 450$) detecting concrete fragmentation and exposed rebar.
- **Explicit Uncertainty**: Reports output genuine confidence intervals ($\pm 15\%$) and marks reports as `ADDITIONAL_EVIDENCE_NEEDED` when confidence is $<65\%$.

---

## 📊 Microservices Network & Database Inventory

| Microservice | Port | Database | Primary Entities & Key Features |
|---|---|---|---|
| **gateway-service** | `8086` | — | Spring Cloud Gateway, Global CORS, Routing, Health & Diagnostics |
| **incident-service** | `8080` | `incident_db` | `Incident`: Lat/Lng, Priority Score, AI Label/Confidence, Idempotency (`clientIncidentId`), Verification |
| **rescue-team-service** | `8081` | `rescueteam_db` | `RescueTeam`: NDRF, Fire Brigade, Medical Corps, Specialization, Availability Status |
| **resource-service** | `8082` | `resource_db` | `Resource`: Ambulances, Inflatable Boats, Heavy Earthmovers, Fire Tenders, Status |
| **mission-service** | `8083` | `mission_db` | `Mission`: Tactical Dispatch Orchestration, Multi-Team Assignment, Cascading Status Updates |
| **alert-service** | `8085` | `alert_db` | `Alert`: SMS & Siren Dispatch Broadcasts, Severity Tagging, Delivery Audit Log |

---

## 🌐 Complete REST API Reference

### 🚨 Incident Service (`/api/incidents`)
- `GET /api/incidents` — Retrieve all incidents across the territory with coordinates and AI metrics.
- `GET /api/incidents/{id}` — Fetch detailed incident dossier by ID.
- `POST /api/incidents` — Create incident with strict idempotency (returns existing entity on duplicate `clientIncidentId`).
- `POST /api/incidents/sync` — Batch store-and-forward synchronization for offline upload queues.
- `PATCH /api/incidents/{id}/verify` — Operator verification/rejection with mandatory notes and audit trail.
- `PATCH /api/incidents/{id}/status` — Update operational lifecycle status (`REPORTED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`).

### 🎯 Mission Service (`/api/missions`)
- `GET /api/missions` — Retrieve all ongoing and completed rescue missions.
- `GET /api/missions/{id}` — Get single mission details with assigned teams and allocated equipment.
- `POST /api/missions` — Dispatch tactical mission (validates incident, team, resource; cascades status; generates broadcast alert).
- `PUT /api/missions/{id}/status` — Update mission lifecycle (`ASSIGNED` $\rightarrow$ `IN_PROGRESS` $\rightarrow$ `COMPLETED`).

### 👨‍🚒 Rescue Team Service (`/api/rescue-teams`)
- `GET /api/rescue-teams` — List all response squads and active tactical readiness.
- `GET /api/rescue-teams/{id}` — Retrieve team details.
- `PUT /api/rescue-teams/{id}/status` — Update availability (`AVAILABLE`, `ON_MISSION`, `RESTING`).

### 🚒 Resource Service (`/api/resources`)
- `GET /api/resources` — List all physical assets, vehicles, and specialized gear.
- `GET /api/resources/{id}` — Retrieve resource record.
- `PUT /api/resources/{id}/status` — Update equipment allocation (`AVAILABLE`, `IN_USE`, `MAINTENANCE`).

### 📢 Alert Service (`/api/alerts`)
- `GET /api/alerts` — Fetch complete broadcast alert audit history.
- `POST /api/alerts` — Trigger emergency broadcast notification.

---

## 🧪 End-to-End Verification Test Results

All 10 mission-critical end-to-end scenarios have been verified using the automated test suite (`scratch/test_verification_scenarios.js`):

```bash
================================================================
       RESQ OFFLINE-FIRST AI PLATFORM — VERIFICATION SUITE       
================================================================

[Scenario 1] Testing Gateway Routing & Reverse Proxy Port 8086...
  ✅ PASSED: Gateway reverse proxy on port 8086 is operational and routing traffic.

[Scenario 2] Testing PostgreSQL Incident Persistence & Records Volume...
  ✅ PASSED: Confirmed 32 real persistent records in incident_db.incidents.

[Scenario 3] Testing Geospatial Coordinates & Image Metadata...
  ✅ PASSED: Incident #1 has Lat: 28.67, Lng: 77.24, Image: /images/disasters/flood.jpg

[Scenario 4] Testing Rescue Teams & Resource Services...
  ✅ PASSED: Rescue Teams (3) & Resources (17) operational.

[Scenario 5] Testing Mission Service & Alert Service...
  ✅ PASSED: Missions (18) & Alerts (122) operational.

[Scenario 6] Testing Explainable Multi-Factor Prioritisation...
  ✅ PASSED: Computed Score: 97 (Level: CRITICAL). Independent confirmation boosted score without double counting.

[Scenario 7] Testing Geospatial Proximity Duplicate Clustering...
  ✅ PASSED: Distance 1 (296m) clustered as DUPLICATE; Distance 2 (13936m) kept INDEPENDENT.

[Scenario 8] Testing Store-and-Forward Idempotency...
  ✅ PASSED: Idempotency enforced! Client ID TEST-IDEMP returned existing ID #33 without duplicate insertion.

[Scenario 9] Testing Operator Verification & Audit Workflow...
  ✅ PASSED: PATCH /api/incidents/1/verify updated record: verified=true

[Scenario 10] Testing End-to-End Mission Dispatch Lifecycle...
  ✅ PASSED: Mission created successfully. Life cycle: Recommended -> Approved -> Transmitted.

================================================================
VERIFICATION SUMMARY: 10/10 SCENARIOS PASSED
================================================================
```

---

## 🚀 Quickstart & Reproduction Guide

### Prerequisites
- **Java 21** (`openjdk 21`)
- **Node.js 20+** & **npm**
- **PostgreSQL 18** running on `localhost:5432` with user `ujjwalmanocha` (password: `12345678`)

### 1. Database Setup
```bash
# Verify PostgreSQL is running
psql -h localhost -U ujjwalmanocha -d incident_db -c "SELECT count(*) FROM incidents;"
```

### 2. Launching Backend Microservices
Run each Spring Boot microservice (or package them using Maven):
```bash
# 1. Incident Service (Port 8080)
cd incident-service && ./mvnw spring-boot:run

# 2. Rescue Team Service (Port 8081)
cd rescue-team-service && ./mvnw spring-boot:run

# 3. Resource Service (Port 8082)
cd resource-service && ./mvnw spring-boot:run

# 4. Mission Service (Port 8083)
cd mission-service && ./mvnw spring-boot:run

# 5. Alert Service (Port 8085)
cd alert-service && ./mvnw spring-boot:run

# 6. Gateway Service (Port 8086)
cd gateway-service && ./mvnw spring-boot:run
```

### 3. Launching React PWA Frontend
```bash
cd frontend
npm install
npm run dev
# The application opens at http://localhost:3000
```

---

## ⏱️ 6-Minute Mentor Walkthrough Script

| Minute | Focus | Screen / Action | Talking Points |
|---|---|---|---|
| **0:00 - 1:00** | **The Problem & Vision** | Slide / Arch Diagram | *"Disasters knock out cellular towers. Cloud-only apps fail. ResQ is an edge-native, offline-first disaster response coordination platform."* |
| **1:00 - 2:15** | **Offline Citizen Reporter PWA** | `http://localhost:3000/report` (DevTools Network: Offline) | Toggle offline mode. Capture photo $\rightarrow$ real on-device canvas CV analysis runs immediately. Pin incident on offline regional map. Save report $\rightarrow$ inspect `IndexedDB: resq_offline_db`. State displays honest `SAVED_OFFLINE`. |
| **2:15 - 3:15** | **Store-and-Forward Sync** | DevTools: Go Online | Reconnect network. Auto-sync triggers with exponential backoff and idempotency tokens. Status transitions cleanly: `SYNCING` $\rightarrow$ `SYNCED`. |
| **3:15 - 4:15** | **Command Center & Triage** | `http://localhost:3000/admin` | Interactive Leaflet map with live PostgreSQL incident pins. Show explainable priority score ($S \times 0.35 + P \times 0.25 + A \times 0.20 + U \times 0.20$). Show Haversine duplicate cluster badge (<500m). |
| **4:15 - 5:15** | **Tactical Mission Dispatch** | Admin $\rightarrow$ Dispatch Tab | Automated rules match disaster category (Flood) with NDRF Water Rescue squad & inflatable boats. Operator approves $\rightarrow$ POST to Gateway $\rightarrow$ Mission created $\rightarrow$ Team & Resource status cascades to `ON_MISSION`/`IN_USE` $\rightarrow$ Alert broadcasted. |
| **5:15 - 6:00** | **Microservices Architecture & Q&A** | Terminal & Codebase | 6 Spring Boot microservices, Spring Cloud Gateway (8086), 5 PostgreSQL DBs, 10/10 automated verification test suite pass. |

---

## 👨‍💻 Project Development Team

<div align="center">

<table border="0">

<tr>

<td align="center" width="280">

### Ujjwal Manocha

**Backend & Architecture Lead**  
*Microservices architecture, Spring Cloud Gateway, PostgreSQL schema design, and inter-service orchestration.*

<a href="https://github.com/UjjwalM17">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github">
</a>

</td>

<td align="center" width="280">

### Krish

**Backend & Services Developer**  
*Mission orchestration, team/resource allocation services, Jakarta validation, and Spring AOP logging.*

<a href="https://github.com/kr-javas">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github">
</a>

</td>

<td align="center" width="280">

### Prabhat

**Frontend & AI Integration**  
*Offline-first PWA, IndexedDB storage, on-device Canvas vision pipeline, and Leaflet offline map packages.*

<a href="https://github.com/shrivarshan-07">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github">
</a>

</td>

</tr>

</table>

<br>

⭐ *ResQ — Built with passion for disaster resilience and edge intelligence.*

</div>
