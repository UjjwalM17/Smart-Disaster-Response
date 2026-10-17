-- ============================================================
-- PostgreSQL Setup for Smart Disaster Response Microservices
-- ============================================================

-- 1. Create or Update user ujjwalmanocha
CREATE USER ujjwalmanocha WITH PASSWORD '12345678' SUPERUSER;
ALTER USER ujjwalmanocha WITH PASSWORD '12345678' SUPERUSER;

-- 2. Create the 5 microservice databases
CREATE DATABASE incident_db OWNER ujjwalmanocha;
CREATE DATABASE rescueteam_db OWNER ujjwalmanocha;
CREATE DATABASE resource_db OWNER ujjwalmanocha;
CREATE DATABASE mission_db OWNER ujjwalmanocha;
CREATE DATABASE alert_db OWNER ujjwalmanocha;
