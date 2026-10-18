<div align="center">

# 🚨 Smart Disaster Response Coordination System

### *A Spring Boot Microservices Platform for Disaster Management & Emergency Coordination*

<p>

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Spring Cloud Gateway](https://img.shields.io/badge/API_Gateway-Spring_Cloud-success?style=for-the-badge)
![REST API](https://img.shields.io/badge/REST_API-Available-blue?style=for-the-badge)
![Architecture](https://img.shields.io/badge/Architecture-Microservices-purple?style=for-the-badge)

</p>

<p>

A scalable disaster response platform that coordinates incidents, rescue teams, emergency resources,
missions, and automated broadcast alerts using a Spring Boot microservices architecture and React command dashboard.

</p>

</div>

---
# ✨ Key Highlights

- 🚨 **6 Independent Spring Boot Microservices**
- 🌐 **Spring Cloud API Gateway with Global CORS**
- 💻 **Modern React + Vite + Tailwind CSS Command Center**
- 🔄 **RestTemplate Inter-Service Communication**
- 📦 **Layered Architecture with DTO Pattern**
- 🛡️ **Centralized Jakarta Validation & Global Exception Handling**
- 📝 **Spring AOP Logging**
- 🗄️ **PostgreSQL Multi-Database Architecture**
- 🎯 **Automatic Mission Orchestration & Cascading Updates**
- 📡 **RESTful APIs**

# 📑 Table of Contents

- [📖 Overview](#-overview)
- [✨ Features](#-features)
- [📊 Project Statistics](#-project-statistics)
- [🏗️ System Architecture](#️-system-architecture)
- [🗄️ Database Schema](#️-database-schema)
- [⚡ Mission Workflow](#-mission-workflow)
- [🛠️ Technology Stack](#️-technology-stack)
- [📂 Project Structure](#-project-structure)
- [🌐 REST API Reference](#-rest-api-reference)
- [📸 API Demonstration](#-api-demonstration)
- [🚀 Getting Started](#-getting-started)
- [🔮 Future Enhancements](#-future-enhancements)
- [👨‍💻 About the Team](#-about-the-team)

# 📖 Overview

The **Smart Disaster Response Coordination System** is a backend application built using **Spring Boot Microservices** to simulate real-world disaster response operations.

The platform enables authorities to report disaster incidents, assign rescue teams, allocate emergency resources, create rescue missions, and generate alerts through seamless inter-service communication.

Each module operates as an independent microservice while collaborating through REST APIs and **RestTemplate**, demonstrating a scalable and loosely coupled architecture.

# ✨ Features

| Feature | Description |
|----------|-------------|
| 🚨 Incident Management | Create, update and track disaster incidents |
| 👨‍🚒 Rescue Team Management | Register and manage rescue teams |
| 🚒 Resource Management | Allocate and monitor emergency resources |
| 🎯 Mission Management | Automatically create and coordinate rescue missions |
| 📢 Alert Service | Generate alerts during mission execution |
| 🌐 API Gateway | Centralized routing for all microservices |
| 🔄 Service Communication | RestTemplate based inter-service communication |
| 📝 Logging | Spring AOP based logging |
| ✅ Validation | Jakarta Bean Validation |
| ⚠️ Exception Handling | Global Exception Handling |

# 📊 Project Statistics

| Category | Details |
|----------|----------|
| **Project Type** | Spring Boot Microservices |
| **Language** | Java 21 |
| **Framework** | Spring Boot 3.x |
| **Architecture** | Microservices |
| **Database** | MySQL |
| **API Communication** | RestTemplate |
| **API Gateway** | Spring Cloud Gateway |
| **Microservices** | 6 |
| **Design Pattern** | DTO Pattern |
| **Validation** | Jakarta Bean Validation |
| **Logging** | Spring AOP |
| **Exception Handling** | Global Exception Handler |

# 🏗️ System Architecture

<div align="center">

<table>
<tr>

<td align="center">

## 🌐 API Gateway

Routes incoming client requests

</td>

</tr>
</table>

<br>

<table>

<tr>

<td align="center" width="180">

### 🚨 Incident Service

Manage disaster incidents

</td>

<td align="center" width="180">

### 👨‍🚒 Rescue Team Service

Manage rescue teams

</td>

<td align="center" width="180">

### 🚒 Resource Service

Manage emergency resources

</td>

</tr>

<tr>

<td align="center">

⬇️

</td>

<td align="center">

⬇️

</td>

<td align="center">

⬇️

</td>

</tr>

<tr>

<td colspan="3" align="center">

### 🎯 Mission Service

Coordinates all rescue operations

</td>

</tr>

<tr>

<td colspan="3" align="center">

⬇️

</td>

</tr>

<tr>

<td colspan="3" align="center">

### 📢 Alert Service

Generates emergency notifications

</td>

</tr>

</table>

</div>

# 🗄️ Database Schema

<div align="center">

<table>

<tr>

<td valign="top">

### 🚨 INCIDENT

| Field | Type |
|------|------|
| 🔑 incidentId | Long |
| title | String |
| location | String |
| severity | String |
| status | String |

</td>

<td width="70" align="center">

➡️

</td>

<td valign="top">

### 🎯 MISSION

| Field | Type |
|------|------|
| 🔑 missionId | Long |
| incidentId (FK) | Long |
| rescueTeamId (FK) | Long |
| resourceId (FK) | Long |
| missionStatus | String |

</td>

</tr>

</table>

<br>

<table>

<tr>

<td valign="top">

### 👨‍🚒 RESCUE TEAM

| Field | Type |
|------|------|
| 🔑 teamId | Long |
| teamName | String |
| members | Integer |
| status | String |

</td>

<td width="70" align="center">

⬇️

</td>

<td valign="top">

### 🚒 RESOURCE

| Field | Type |
|------|------|
| 🔑 resourceId | Long |
| resourceName | String |
| quantity | Integer |
| status | String |

</td>

</tr>

</table>

<br>

<table>

<tr>

<td align="center">

### 📢 ALERT

| Field | Type |
|------|------|
| 🔑 alertId | Long |
| missionId | Long |
| message | String |
| alertTime | Timestamp |

</td>

</tr>

</table>

</div>

# ⚡ Mission Workflow

```text
1️⃣ Incident Created
        │
        ▼
2️⃣ Mission Service Receives Request
        │
        ▼
3️⃣ Validate Incident
        │
        ▼
4️⃣ Validate Rescue Team
        │
        ▼
5️⃣ Validate Resource
        │
        ▼
6️⃣ Create Mission
        │
        ▼
7️⃣ Update Rescue Team Status
        │
        ▼
8️⃣ Update Resource Status
        │
        ▼
9️⃣ Generate Alert
        │
        ▼
✅ Mission Successfully Assigned
```

> **Note:** Mission Service acts as the orchestration layer, coordinating communication with Incident, Rescue Team, Resource, and Alert services using RestTemplate.

# 🛠️ Technology Stack

| Category | Technologies |
|-----------|--------------|
| **Language** | Java 21 |
| **Framework** | Spring Boot 3.x |
| **Architecture** | Microservices |
| **API Gateway** | Spring Cloud Gateway |
| **Database** | MySQL |
| **ORM** | Spring Data JPA (Hibernate) |
| **Communication** | REST APIs, RestTemplate |
| **Frontend** | React 18, Vite, Tailwind CSS, Leaflet Maps |
| **AI Integration** | Hugging Face Image Classification API |
| **Validation** | Jakarta Bean Validation |
| **Logging** | Spring AOP |
| **Build Tool** | Maven, npm |
| **Testing** | Postman |
| **Version Control** | Git & GitHub |
| **IDE** | IntelliJ IDEA / VS Code |

# 📂 Project Structure

```text
Smart-Disaster-Response-Coordination-System
│
├── api-gateway
│
├── incident-service
│   ├── Controller
│   ├── Service
│   ├── Repository
│   ├── Entity
│   ├── DTO
│   └── Exception
│
├── rescue-team-service
│
├── resource-service
│
├── mission-service
│
├── alert-service
│
└── README.md
```

### 🚨 Incident Service

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/incidents` | Create a new incident |
| GET | `/incidents` | Retrieve all incidents |
| GET | `/incidents/{id}` | Retrieve incident by ID |
| PUT | `/incidents/{id}` | Update incident |
| DELETE | `/incidents/{id}` | Delete incident |

### 👨‍🚒 Rescue Team Service

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/teams` | Register rescue team |
| GET | `/teams` | Retrieve all teams |
| GET | `/teams/{id}` | Get team details |
| PUT | `/teams/{id}` | Update team |
| DELETE | `/teams/{id}` | Delete team |

### 🚒 Resource Service

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/resources` | Add emergency resource |
| GET | `/resources` | Retrieve resources |
| GET | `/resources/{id}` | Get resource details |
| PUT | `/resources/{id}` | Update resource |
| DELETE | `/resources/{id}` | Delete resource |

### 🎯 Mission Service

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/missions` | Create a rescue mission |
| GET | `/missions` | Retrieve all missions |
| GET | `/missions/{id}` | Retrieve mission by ID |
| PUT | `/missions/{id}` | Update mission |
| DELETE | `/missions/{id}` | Delete mission |

### 📢 Alert Service

| Method | Endpoint | Description |
|---------|----------|-------------|
| POST | `/alerts` | Generate emergency alert |
| GET | `/alerts` | View all alerts |
| GET | `/alerts/{id}` | View alert by ID |
| DELETE | `/alerts/{id}` | Delete alert |

# 📸 API Demonstration

| API | Preview |
|------|---------|
| Incident Service | <img width="1917" height="1078" alt="Screenshot 2026-07-23 163646" src="https://github.com/user-attachments/assets/cb5b3d48-c088-4c29-92ab-72e30da9986f" /> |
| Rescue Team Service |<img width="1918" height="1078" alt="Screenshot 2026-07-23 164136" src="https://github.com/user-attachments/assets/d272a089-e571-4c4f-8c9f-9c2a61fe4854" /> |
| Resource Service | <img width="1918" height="1078" alt="Screenshot 2026-07-23 164459" src="https://github.com/user-attachments/assets/8eb144c7-8786-49c9-9434-3a24ede1b7be" /> |
| Mission Service | <img width="1918" height="1078" alt="Screenshot 2026-07-23 164907" src="https://github.com/user-attachments/assets/d71c7104-9d69-486a-9379-7f1436158743" />|
| Alert Service | <img width="1917" height="1078" alt="Screenshot 2026-07-23 165426" src="https://github.com/user-attachments/assets/e81268eb-e410-42d4-b7fa-5499e76fda45" /> |

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/UjjwalM17/Smart-Disaster-Response.git
```

---

## Database Setup (PostgreSQL)

Run the automated database setup script to initialize PostgreSQL users and microservice databases:

```bash
./setup-db.sh
```

Databases created:
- `incident_db`
- `rescueteam_db`
- `resource_db`
- `mission_db`
- `alert_db`

---

## Build

```bash
mvn clean install
```

---

## Run Services

Start the backend microservices:

1. `gateway-service` (Port 8086)
2. `incident-service` (Port 8080)
3. `rescue-team-service` (Port 8081)
4. `resource-service` (Port 8082)
5. `alert-service` (Port 8085)
6. `mission-service` (Port 8083)

---

## Run Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
```

Open **`http://localhost:3000`** in your browser to access the Emergency Coordination Command Center.

---

## Automated Workflow Verification

To run the complete automated end-to-end integration test:

```bash
./test-workflow.sh
```

# 🔮 Future Enhancements

- ✅ Eureka Service Discovery
- ✅ OpenFeign Client
- ✅ Docker & Docker Compose
- ✅ Kubernetes Deployment
- ✅ Authentication using JWT
- ✅ Role-Based Authorization
- ✅ Circuit Breaker (Resilience4j)
- ✅ Distributed Tracing
- ✅ Prometheus & Grafana Monitoring
- ✅ CI/CD using GitHub Actions

# 👨‍💻 About the Team

<div align="center">

### Built with ❤️ by

<table>

<tr>

<td align="center" width="280">

### Ujjwal Manocha

Backend & Architecture Lead

<a href="https://github.com/UjjwalM17">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github">
</a>

</td>

<td align="center" width="280">

### Krish

Backend & Services Developer

<a href="https://github.com/kr-javas">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github">
</a>

</td>

<td align="center" width="280">

### Prabhat

Frontend & AI Integration

<a href="https://github.com/shrivarshan-07">
<img src="https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github">
</a>

</td>

</tr>

</table>

<br>

⭐ If you found this project useful, consider giving it a star!

</div>

---

<div align="center">

### 🚨 Smart Disaster Response Coordination System

**Microservices Architecture with AI-Powered React Command Dashboard**

</div>

