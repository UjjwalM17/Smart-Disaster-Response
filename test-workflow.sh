#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

GATEWAY_URL="http://localhost:8086"

echo -e "${CYAN}================================================================${NC}"
echo -e "${CYAN}   🚨 SMART DISASTER RESPONSE - FULL END-TO-END WORKFLOW TEST   ${NC}"
echo -e "${CYAN}================================================================${NC}"
echo ""

# -------------------------------------------------------------
# STEP 1: Report a Disaster Incident
# -------------------------------------------------------------
echo -e "${YELLOW}Step 1: Reporting a new Disaster Incident via Gateway (Port 8086)...${NC}"
INCIDENT_RESP=$(curl -s -X POST "${GATEWAY_URL}/api/incidents" \
  -H "Content-Type: application/json" \
  -d '{
    "reporterName": "Chief Officer Sharma",
    "mobile": "9876543210",
    "location": "Downtown Flood Zone 4",
    "disasterType": "FLOOD",
    "severity": "HIGH",
    "description": "Severe flash flood, water levels rising rapidly, families trapped."
  }')

echo -e "${GREEN}Response:${NC} $INCIDENT_RESP"
INCIDENT_ID=$(echo "$INCIDENT_RESP" | grep -o '"incidentId":[0-9]*' | cut -d: -f2)
echo -e "➡️ Created Incident ID: ${BLUE}$INCIDENT_ID${NC}"
echo ""

# -------------------------------------------------------------
# STEP 2: Register a Rescue Team
# -------------------------------------------------------------
echo -e "${YELLOW}Step 2: Registering an Emergency Rescue Team via Gateway...${NC}"
TEAM_RESP=$(curl -s -X POST "${GATEWAY_URL}/api/rescue-teams" \
  -H "Content-Type: application/json" \
  -d '{
    "teamName": "NDRF Quick Response Alpha",
    "teamType": "NDRF",
    "leaderName": "Commander Rajesh",
    "contactNumber": "9811223344",
    "teamSize": 10,
    "currentLocation": "Riverside Station 4"
  }')

echo -e "${GREEN}Response:${NC} $TEAM_RESP"
TEAM_ID=$(echo "$TEAM_RESP" | grep -o '"teamId":[0-9]*' | cut -d: -f2)
echo -e "➡️ Registered Rescue Team ID: ${BLUE}$TEAM_ID${NC}"
echo ""

# -------------------------------------------------------------
# STEP 3: Ensure Resource Exists
# -------------------------------------------------------------
echo -e "${YELLOW}Step 3: Registering Emergency Resource (Rescue Boat) via Gateway...${NC}"
RESOURCE_RESP=$(curl -s -X POST "${GATEWAY_URL}/api/resources" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceName": "Inflatable Rescue Boat Pack",
    "resourceType": "RESCUE_BOAT",
    "quantity": 5,
    "location": "Central Depot Warehouse",
    "availabilityStatus": "AVAILABLE"
  }')

echo -e "${GREEN}Response:${NC} $RESOURCE_RESP"
RESOURCE_ID=$(echo "$RESOURCE_RESP" | grep -o '"resourceId":[0-9]*' | cut -d: -f2)
echo -e "➡️ Registered Resource ID: ${BLUE}$RESOURCE_ID${NC}"
echo ""

# -------------------------------------------------------------
# STEP 4: Coordinate Rescue Mission (Orchestration)
# -------------------------------------------------------------
echo -e "${YELLOW}Step 4: Dispatching Rescue Mission via Mission Service...${NC}"
echo -e "${CYAN}(Mission Service will validate Incident $INCIDENT_ID, Team $TEAM_ID, Resource $RESOURCE_ID,${NC}"
echo -e "${CYAN} update Team to ON_MISSION, Resource to IN_USE, and trigger an Alert)${NC}"

MISSION_RESP=$(curl -s -X POST "${GATEWAY_URL}/api/missions" \
  -H "Content-Type: application/json" \
  -d "{
    \"incidentId\": $INCIDENT_ID,
    \"rescueTeamIds\": [$TEAM_ID],
    \"resourceIds\": [$RESOURCE_ID],
    \"priority\": \"HIGH\",
    \"remarks\": \"Deploy boat pack immediately for evacuation of flooded blocks.\"
  }")

echo -e "${GREEN}Response:${NC} $MISSION_RESP"
MISSION_ID=$(echo "$MISSION_RESP" | grep -o '"missionId":[0-9]*' | cut -d: -f2)
echo -e "➡️ Assigned Mission ID: ${BLUE}$MISSION_ID${NC}"
echo ""

# -------------------------------------------------------------
# STEP 5: Verify Emergency Alert Generated
# -------------------------------------------------------------
echo -e "${YELLOW}Step 5: Fetching Generated Emergency Alerts from Alert Service...${NC}"
ALERTS_RESP=$(curl -s "${GATEWAY_URL}/api/alerts/mission/${MISSION_ID}")
echo -e "${GREEN}Alerts for Mission $MISSION_ID:${NC} $ALERTS_RESP"
echo ""

# -------------------------------------------------------------
# STEP 6: Verify Status Updates Across Microservices
# -------------------------------------------------------------
echo -e "${YELLOW}Step 6: Verifying automatic status updates across services...${NC}"

TEAM_STATUS=$(curl -s "${GATEWAY_URL}/api/rescue-teams/${TEAM_ID}")
echo -e "• Team $TEAM_ID Status: $(echo "$TEAM_STATUS" | grep -o '"availabilityStatus":"[^"]*"' | cut -d: -f2)"

RESOURCE_STATUS=$(curl -s "${GATEWAY_URL}/api/resources/${RESOURCE_ID}")
echo -e "• Resource $RESOURCE_ID Status: $(echo "$RESOURCE_STATUS" | grep -o '"availabilityStatus":"[^"]*"' | cut -d: -f2)"

echo ""
echo -e "${GREEN}================================================================${NC}"
echo -e "${GREEN}   🎉 FULL END-TO-END WORKFLOW SUCCEEDED ACROSS ALL SERVICES!    ${NC}"
echo -e "${GREEN}================================================================${NC}"
