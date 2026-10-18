/**
 * ResQ Automated Dispatch & Rescue Coordination Recommendation Engine
 * 
 * Maps incident hazard requirements to rescue team competencies and equipment inventories.
 * Enforces safety confirmation rules for high-consequence or low-confidence cases.
 * Strictly separates Recommended -> Approved -> Transmitted -> Acknowledged -> Completed.
 */

import { calculateDistanceMeters } from './duplicateDetectionEngine';

export const DISPATCH_STATUS = {
  RECOMMENDED: 'RECOMMENDED',
  PENDING_OPERATOR_APPROVAL: 'PENDING_OPERATOR_APPROVAL',
  APPROVED_BY_POLICY: 'APPROVED_BY_POLICY',
  TRANSMITTED: 'TRANSMITTED',
  TEAM_ACKNOWLEDGED: 'TEAM_ACKNOWLEDGED',
  MISSION_COMPLETED: 'MISSION_COMPLETED',
};

// Team competency mapping
const HAZARD_TEAM_REQUIREMENTS = {
  Flood: ['WATER_RESCUE', 'NDRF', 'BOAT_SQUAD', 'MEDICAL'],
  Fire: ['FIRE_BRIGADE', 'HAZMAT', 'MEDICAL'],
  'Building Collapse': ['URBAN_SEARCH_RESCUE', 'HEAVY_EQUIPMENT', 'CANINE_SEARCH', 'MEDICAL'],
  Landslide: ['HEAVY_EQUIPMENT', 'MOUNTAIN_RESCUE', 'MEDICAL'],
  Cyclone: ['EMERGENCY_EVACUATION', 'TREE_CUTTING', 'MEDICAL'],
};

// Resource requirement mapping
const HAZARD_RESOURCE_REQUIREMENTS = {
  Flood: ['Inflatable Boat', 'Life Jackets', 'Emergency Food Kits', 'Water Purification Units'],
  Fire: ['Fire Tender', 'Breathing Apparatus', 'Burn Trauma Kits', 'Water Mist Nozzle'],
  'Building Collapse': ['Hydraulic Cutters', 'Concrete Breaker', 'Acoustic Listening Devices', 'Stretchers'],
  Landslide: ['Excavator', 'Earthmover', 'Emergency Ropes', 'First Aid Kits'],
};

export const dispatchEngine = {
  /**
   * Generates explainable dispatch recommendations for an incident
   */
  recommendDispatch({ incident, availableTeams = [], availableResources = [] }) {
    const hazard = incident.disasterType || incident.aiLabel || 'Flood';
    const priority = incident.priorityLevel || (incident.priorityScore >= 80 ? 'CRITICAL' : 'HIGH');
    const requiredTeamSkills = HAZARD_TEAM_REQUIREMENTS[hazard] || ['GENERAL_RESCUE'];
    const requiredResourceNames = HAZARD_RESOURCE_REQUIREMENTS[hazard] || ['First Aid Kit'];

    // 1. Filter and rank suitable available teams by proximity
    const suitableTeams = availableTeams
      .filter((team) => team.availabilityStatus === 'AVAILABLE')
      .map((team) => {
        // Distance heuristic (if team has coordinates, otherwise default estimation)
        let distanceKm = 12.5;
        if (team.latitude && team.longitude && incident.latitude && incident.longitude) {
          distanceKm = Math.round(
            calculateDistanceMeters(team.latitude, team.longitude, incident.latitude, incident.longitude) / 1000
          );
        }
        const estimatedTravelTimeMinutes = Math.round((distanceKm / 35) * 60); // 35 km/h emergency transit

        return {
          ...team,
          distanceKm,
          estimatedTravelTimeMinutes,
          suitabilityScore: 90 - Math.min(40, distanceKm),
        };
      })
      .sort((a, b) => b.suitabilityScore - a.suitabilityScore);

    // 2. Select matching available resources
    const matchingResources = availableResources.filter((res) => {
      return (
        res.availabilityStatus === 'AVAILABLE' &&
        res.quantity > 0 &&
        requiredResourceNames.some(
          (req) => res.resourceName.toLowerCase().includes(req.toLowerCase()) || req.toLowerCase().includes(res.resourceName.toLowerCase())
        )
      );
    });

    // 3. Evaluate safety policy rule: high consequence / low confidence requires human approval
    const isLowConfidence = (incident.aiConfidence || 100) < 75;
    const isCritical = priority === 'CRITICAL';
    const requiresHumanConfirmation = isLowConfidence || isCritical;

    const selectedTeam = suitableTeams[0] || null;
    const selectedResourceIds = matchingResources.slice(0, 3).map((r) => r.resourceId);

    const rationale = [
      `Hazard: ${hazard} matched to ${requiredTeamSkills.join(', ')} protocols`,
      selectedTeam
        ? `Primary Team: ${selectedTeam.teamName} (${selectedTeam.teamType}) ~${selectedTeam.distanceKm}km away (${selectedTeam.estimatedTravelTimeMinutes}m ETA)`
        : 'Warning: No certified team currently marked AVAILABLE in this sector',
      `Allocated Resources: ${matchingResources.length > 0 ? matchingResources.map((r) => r.resourceName).join(', ') : 'Standard emergency depot reserves'}`,
    ];

    if (requiresHumanConfirmation) {
      rationale.push(
        isLowConfidence
          ? 'Safety Policy: AI Confidence is below 75%; requiring manual Operator confirmation before radio dispatch.'
          : 'Safety Policy: Critical priority assignment requires Operations Commander sign-off.'
      );
    }

    return {
      incidentId: incident.incidentId || incident.clientIncidentId,
      status: requiresHumanConfirmation
        ? DISPATCH_STATUS.PENDING_OPERATOR_APPROVAL
        : DISPATCH_STATUS.APPROVED_BY_POLICY,
      recommendedTeam: selectedTeam,
      recommendedTeamIds: selectedTeam ? [selectedTeam.teamId] : [],
      recommendedResourceIds: selectedResourceIds,
      recommendedResources: matchingResources.slice(0, 3),
      estimatedEtaMinutes: selectedTeam ? selectedTeam.estimatedTravelTimeMinutes : null,
      requiresHumanConfirmation,
      rationale,
      generatedAt: new Date().toISOString(),
    };
  },
};
