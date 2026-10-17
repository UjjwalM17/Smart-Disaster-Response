/**
 * AI Incident Vision & Severity Analysis
 * Priority Weighting:
 * - Severity: 35%
 * - Population Impact: 25%
 * - Accessibility: 20%
 * - Urgency: 20%
 */

import { huggingfaceService } from '../services/huggingfaceService';

/**
 * Keyword-based heuristic mock engine
 */
export function keywordMockAnalysis(description = '', notes = '', peopleAffected = 20) {
  const text = `${description} ${notes}`.toLowerCase();
  let aiLabel = 'Flood';
  let aiConfidence = 92;
  let damageLevel = 'Severe';
  let hazards = 'Deep water logging, submerged homes, blocked roads';

  if (text.includes('fire') || text.includes('smoke') || text.includes('burn') || text.includes('flame')) {
    aiLabel = 'Fire';
    aiConfidence = 95;
    damageLevel = 'Severe';
    hazards = 'Dense toxic smoke, high thermal spread, structural weakness';
  } else if (text.includes('collapse') || text.includes('earthquake') || text.includes('rubble') || text.includes('building') || text.includes('trapped')) {
    aiLabel = 'Building Collapse';
    aiConfidence = 91;
    damageLevel = 'Critical';
    hazards = 'Unstable concrete slabs, trapped civilians, severed gas lines';
  } else if (text.includes('landslide') || text.includes('mud') || text.includes('slope')) {
    aiLabel = 'Landslide';
    aiConfidence = 89;
    damageLevel = 'Severe';
    hazards = 'Mud flow, cut-off access roads, secondary slide risks';
  } else if (text.includes('cyclone') || text.includes('storm') || text.includes('wind') || text.includes('hurricane')) {
    aiLabel = 'Cyclone';
    aiConfidence = 88;
    damageLevel = 'Moderate';
    hazards = 'Gale force winds, flying debris, downed power lines';
  }

  const people = Math.max(1, parseInt(peopleAffected, 10) || 20);

  // 4 weighted bars:
  // Severity (35%)
  const severityScore = damageLevel === 'Critical' ? 35 : damageLevel === 'Severe' ? 30 : 20;
  // Population impact (25%)
  const popScore = Math.min(25, Math.max(10, Math.round((people / 100) * 25)));
  // Accessibility (20%)
  const accessScore = text.includes('blocked') || text.includes('cut off') || text.includes('trapped') ? 20 : 14;
  // Urgency (20%)
  const urgencyScore = damageLevel === 'Critical' ? 20 : 16;

  const priorityScore = Math.min(99, severityScore + popScore + accessScore + urgencyScore);

  return {
    aiLabel,
    aiConfidence,
    damageLevel,
    hazards,
    priorityScore,
    isCritical: priorityScore >= 75,
    breakdown: {
      severity: severityScore,        // 35% max
      populationImpact: popScore,     // 25% max
      accessibility: accessScore,     // 20% max
      urgency: urgencyScore,          // 20% max
    },
    recommendations: {
      rescueTeams: Math.max(1, Math.round(people / 25)) || 2,
      ambulances: Math.max(1, Math.round(people / 15)) || 3,
      medicalKits: Math.max(20, people * 2) || 50,
      foodSupplies: Math.max(50, people * 5) || 200,
      waterSupplies: Math.max(100, people * 10) || 500,
    },
    source: 'keyword-mock',
  };
}

/**
 * Main AI analysis flow:
 * 1. POST /api/incidents/analyze (multipart field "file")
 * 2. Hugging Face Inference API fallback
 * 3. Keyword Mock in src/lib/ai.js
 */
export async function analyzeIncident(file, description = '', notes = '', peopleAffected = 20) {
  // Step 1: Try backend POST /api/incidents/analyze if available
  if (file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);
      formData.append('notes', notes);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const resp = await fetch('/api/incidents/analyze', {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        if (data.aiLabel && data.aiConfidence) {
          return {
            ...keywordMockAnalysis(description, notes, peopleAffected),
            aiLabel: data.aiLabel,
            aiConfidence: Math.round(data.aiConfidence > 1 ? data.aiConfidence : data.aiConfidence * 100),
            source: 'backend-api',
          };
        }
      }
    } catch {
      // Backend analyze endpoint not present or timed out, continue to HF / Mock
    }

    // Step 2: Try Hugging Face router if token available
    try {
      const hfResult = await huggingfaceService.classifyImage(file, description, peopleAffected, notes);
      if (hfResult && hfResult.category) {
        return {
          aiLabel: hfResult.category,
          aiConfidence: hfResult.confidenceScore,
          damageLevel: hfResult.damageLevel,
          hazards: hfResult.hazards,
          priorityScore: hfResult.priorityScore,
          isCritical: hfResult.priorityScore >= 75,
          breakdown: {
            severity: 30,
            populationImpact: 22,
            accessibility: 18,
            urgency: 17,
          },
          recommendations: hfResult.recommendations,
          source: hfResult.isLiveCloud ? 'hugging-face' : 'keyword-mock',
        };
      }
    } catch {
      // HF failed, proceed to keyword mock
    }
  }

  // Step 3: Pure Keyword Mock
  return keywordMockAnalysis(description, notes, peopleAffected);
}
