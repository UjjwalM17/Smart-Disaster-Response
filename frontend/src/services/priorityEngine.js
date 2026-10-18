/**
 * ResQ Explainable Multi-Factor Prioritisation Engine
 * 
 * Computes deterministic, auditable priority scores based on:
 * 1. Severity Level (35% weight)
 * 2. Population Impact / People Affected (25% weight)
 * 3. Accessibility & Terrain Difficulty (20% weight)
 * 4. Urgency, Escalation & Time Decay (20% weight)
 * 5. Corroboration from independent devices (+3 to +8 bonus, preventing double-counting)
 * 6. Proximity to critical facilities (hospitals, transit arteries)
 */

export const PRIORITY_THRESHOLDS = {
  CRITICAL: 80,
  HIGH: 60,
  MEDIUM: 40,
  LOW: 0,
};

export const priorityEngine = {
  /**
   * Computes explainable priority score (0-100) and classification
   */
  calculatePriority({
    disasterType = 'Flood',
    severity = 'HIGH',
    peopleAffected = 20,
    description = '',
    notes = '',
    corroboratingReportsCount = 0,
    hasNearHospital = false,
    aiConfidence = 80,
    reportedTime = null,
  }) {
    const text = `${description} ${notes}`.toLowerCase();
    const people = Math.max(1, parseInt(peopleAffected, 10) || 20);

    // 1. Severity Weight (Max 35 points)
    const normSeverity = String(severity).toUpperCase();
    let severityScore = 20;
    let severityReason = 'Standard hazard severity';
    if (normSeverity === 'CRITICAL') {
      severityScore = 35;
      severityReason = 'Critical immediate life danger identified';
    } else if (normSeverity === 'HIGH') {
      severityScore = 28;
      severityReason = 'High severity structural or flood inundation';
    } else if (normSeverity === 'MEDIUM') {
      severityScore = 18;
      severityReason = 'Moderate localized disruption';
    } else {
      severityScore = 10;
      severityReason = 'Low impact advisory level';
    }

    // 2. Population Impact Weight (Max 25 points)
    let populationScore = 12;
    if (people > 100) populationScore = 25;
    else if (people > 50) populationScore = 22;
    else if (people > 20) populationScore = 18;
    else if (people > 5) populationScore = 14;
    else populationScore = 10;
    const populationReason = `${people} estimated civilians in affected boundary`;

    // 3. Accessibility Difficulty Weight (Max 20 points)
    let accessibilityScore = 12;
    let accessibilityReason = 'Accessible via standard roadway';
    if (text.includes('cut off') || text.includes('island') || text.includes('bridge down')) {
      accessibilityScore = 20;
      accessibilityReason = 'Transit corridor severed; aerial or boat ingress required';
    } else if (text.includes('blocked') || text.includes('rubble') || text.includes('narrow') || text.includes('waterlogging')) {
      accessibilityScore = 17;
      accessibilityReason = 'Access routes obstructed by debris or high water';
    } else if (text.includes('mountain') || text.includes('remote') || text.includes('forest')) {
      accessibilityScore = 16;
      accessibilityReason = 'Remote forest/mountain terrain';
    }

    // 4. Urgency & Escalation Weight (Max 20 points)
    let urgencyScore = 12;
    let urgencyReason = 'Stable perimeter';
    if (text.includes('trapped') || text.includes('gas cylinder') || text.includes('chemical') || text.includes('spreading')) {
      urgencyScore = 20;
      urgencyReason = 'Active escalation (trapped civilians or flammable hazards)';
    } else if (text.includes('rising') || text.includes('smoke') || text.includes('cracks')) {
      urgencyScore = 16;
      urgencyReason = 'Dynamic hazard escalating with time';
    }

    // Base Multi-Factor Sum (Max 100)
    let rawScore = severityScore + populationScore + accessibilityScore + urgencyScore;

    // 5. Corroboration Boost (independent reports without double-counting severity)
    let corroborationBonus = 0;
    if (corroboratingReportsCount >= 3) {
      corroborationBonus = 8;
    } else if (corroboratingReportsCount >= 1) {
      corroborationBonus = 4;
    }

    // 6. Critical Infrastructure Proximity
    let facilityBonus = 0;
    if (hasNearHospital || text.includes('hospital') || text.includes('clinic') || text.includes('school')) {
      facilityBonus = 5;
    }

    // Discount if AI confidence is low
    let confidenceDeduction = 0;
    if (aiConfidence < 65) {
      confidenceDeduction = 8;
    }

    const finalScore = Math.max(
      10,
      Math.min(99, Math.round(rawScore + corroborationBonus + facilityBonus - confidenceDeduction))
    );

    let priorityLevel = 'LOW';
    if (finalScore >= PRIORITY_THRESHOLDS.CRITICAL) priorityLevel = 'CRITICAL';
    else if (finalScore >= PRIORITY_THRESHOLDS.HIGH) priorityLevel = 'HIGH';
    else if (finalScore >= PRIORITY_THRESHOLDS.MEDIUM) priorityLevel = 'MEDIUM';

    const reasons = [
      `Severity: ${severityReason} (${severityScore}/35)`,
      `Population: ${populationReason} (${populationScore}/25)`,
      `Accessibility: ${accessibilityReason} (${accessibilityScore}/20)`,
      `Urgency: ${urgencyReason} (${urgencyScore}/20)`,
    ];

    if (corroborationBonus > 0) {
      reasons.push(`Corroborated by ${corroboratingReportsCount} independent reports (+${corroborationBonus})`);
    }
    if (facilityBonus > 0) {
      reasons.push(`Close proximity to vulnerable medical/education facility (+${facilityBonus})`);
    }
    if (confidenceDeduction > 0) {
      reasons.push(`Uncertain AI verification penalty (-${confidenceDeduction})`);
    }

    return {
      priorityScore: finalScore,
      priorityLevel,
      reasons,
      breakdown: {
        severity: severityScore,
        populationImpact: populationScore,
        accessibility: accessibilityScore,
        urgency: urgencyScore,
        corroboration: corroborationBonus,
        facility: facilityBonus,
      },
    };
  },
};
