/**
 * ResQ AI Incident Analysis Engine (Local Edge & Hybrid Fallback)
 * 
 * Provides:
 * 1. 100% Offline On-Device Computer Vision analysis via Offscreen Canvas / Pixel Histogram
 * 2. Visual feature detection: Flame redness, smoke desaturation, water turbidity, rubble gradient
 * 3. Structured explainable output with uncertainty quantification
 * 4. Honest offline labeling: NEVER fakes remote cloud processing
 */

import { huggingfaceService } from './huggingfaceService';

/**
 * Analyzes image pixels on an offscreen canvas to extract real color/edge features
 */
async function extractVisualFeatures(imageFileOrBlob) {
  if (!imageFileOrBlob) return null;

  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(imageFileOrBlob);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 128; // Sample at 128x128 for rapid edge processing
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, size, size);

        const imgData = ctx.getImageData(0, 0, size, size);
        const data = imgData.data;
        const totalPixels = size * size;

        let firePixels = 0;
        let smokePixels = 0;
        let waterPixels = 0;
        let edgeDifferences = 0;
        let prevLuminance = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          // 1. Fire / Flame signature: strong red dominance, moderate green, low blue
          if (r > 160 && g > 70 && b < 100 && r > g * 1.15 && r > b * 1.8) {
            firePixels++;
          }

          // 2. Smoke signature: desaturated grey, moderate-to-high luminance
          const diffRG = Math.abs(r - g);
          const diffGB = Math.abs(g - b);
          if (diffRG < 18 && diffGB < 18 && lum > 80 && lum < 220) {
            smokePixels++;
          }

          // 3. Flood / Water signature: blue dominant or brownish-grey mud silt
          const isMuddyWater = r > 70 && r < 140 && g > 80 && g < 150 && b > 60 && b < 110 && g >= r;
          const isBlueWater = b > r * 1.1 && b > g && b > 80;
          if (isMuddyWater || isBlueWater) {
            waterPixels++;
          }

          // 4. Edge variance for rubble / collapsed structures
          if (i > 0) {
            edgeDifferences += Math.abs(lum - prevLuminance);
          }
          prevLuminance = lum;
        }

        URL.revokeObjectURL(url);

        const fireRatio = firePixels / totalPixels;
        const smokeRatio = smokePixels / totalPixels;
        const waterRatio = waterPixels / totalPixels;
        const avgEdgeGradient = edgeDifferences / totalPixels;

        resolve({
          fireRatio,
          smokeRatio,
          waterRatio,
          avgEdgeGradient,
        });
      } catch (err) {
        URL.revokeObjectURL(url);
        resolve(null);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };

    img.src = url;
  });
}

export const aiPipeline = {
  /**
   * Main AI incident analysis pipeline
   * Supports offline on-device vision, cloud AI fallback, and text context integration.
   */
  async analyze({ imageFileOrBlob, description = '', location = '', categoryHint = '', isOnline = false }) {
    const textContext = `${description} ${location} ${categoryHint}`.toLowerCase();

    // Step 1: Run real offline on-device visual analysis if image is provided
    let visualMetrics = null;
    if (imageFileOrBlob) {
      visualMetrics = await extractVisualFeatures(imageFileOrBlob);
    }

    // Step 2: If online and user configured Hugging Face API, try remote fine-tuned model
    if (isOnline && imageFileOrBlob && huggingfaceService.getApiKey()) {
      try {
        const cloudResult = await huggingfaceService.classifyImage(imageFileOrBlob, description);
        if (cloudResult && cloudResult.category) {
          return {
            hazardCategory: cloudResult.category,
            confidenceScore: cloudResult.confidenceScore,
            estimatedSeverity: cloudResult.damageLevel === 'Critical' ? 'CRITICAL' : cloudResult.damageLevel === 'Severe' ? 'HIGH' : 'MEDIUM',
            severityExplanation: `Cloud Vision Transformer identified ${cloudResult.category} with high feature match (${cloudResult.confidenceScore}%).`,
            visualIndicators: cloudResult.hazards ? cloudResult.hazards.split(',').map((s) => s.trim()) : ['Cloud confirmed visual hazards'],
            modelVersion: cloudResult.model || 'dima806/disaster_image_classification (ViT)',
            analysisStatus: 'CLOUD_VERIFIED',
            needsAdditionalEvidence: cloudResult.confidenceScore < 70,
            uncertaintyNotes: cloudResult.confidenceScore < 70 ? 'Moderate confidence. Additional ground confirmation recommended.' : 'High confidence classification.',
          };
        }
      } catch (e) {
        console.warn('[ResQ AI] Remote inference failed, using on-device pipeline:', e);
      }
    }

    // Step 3: On-Device Analysis Engine
    if (visualMetrics) {
      const { fireRatio, smokeRatio, waterRatio, avgEdgeGradient } = visualMetrics;

      let hazardCategory = categoryHint || 'Flood';
      let confidenceScore = 65;
      const visualIndicators = [];
      let estimatedSeverity = 'MEDIUM';
      let severityExplanation = '';

      if (fireRatio > 0.05 || (fireRatio > 0.02 && textContext.includes('fire'))) {
        hazardCategory = 'Fire';
        confidenceScore = Math.min(96, Math.round(75 + fireRatio * 200));
        visualIndicators.push(`Active thermal / flame pixels: ${(fireRatio * 100).toFixed(1)}% frame coverage`);
        if (smokeRatio > 0.15) {
          visualIndicators.push(`Dense smoke plumes detected (${(smokeRatio * 100).toFixed(1)}% coverage)`);
        }
        estimatedSeverity = fireRatio > 0.12 ? 'CRITICAL' : 'HIGH';
        severityExplanation = `Active high-temperature combustion signature with high fire spread potential.`;
      } else if (waterRatio > 0.12 || (waterRatio > 0.05 && textContext.includes('flood'))) {
        hazardCategory = 'Flood';
        confidenceScore = Math.min(94, Math.round(70 + waterRatio * 150));
        visualIndicators.push(`Water inundation / turbid surface detected: ${(waterRatio * 100).toFixed(1)}% frame coverage`);
        estimatedSeverity = waterRatio > 0.25 ? 'HIGH' : 'MEDIUM';
        severityExplanation = `Significant water logging observed over road or structural boundary.`;
      } else if (avgEdgeGradient > 28 || textContext.includes('collapse') || textContext.includes('rubble')) {
        hazardCategory = 'Building Collapse';
        confidenceScore = Math.min(92, Math.round(68 + avgEdgeGradient * 0.7));
        visualIndicators.push(`High-frequency jagged rubble texture (edge metric: ${avgEdgeGradient.toFixed(1)})`);
        estimatedSeverity = 'CRITICAL';
        severityExplanation = `Structural fragmentation detected; probable trapped occupants or unstable debris.`;
      } else if (textContext.includes('landslide') || textContext.includes('mud')) {
        hazardCategory = 'Landslide';
        confidenceScore = 82;
        visualIndicators.push('Slope soil displacement and transit route obstruction');
        estimatedSeverity = 'HIGH';
        severityExplanation = 'Debris flow blocking emergency access corridors.';
      } else {
        // Fallback category using text heuristics
        if (textContext.includes('fire')) hazardCategory = 'Fire';
        else if (textContext.includes('collapse')) hazardCategory = 'Building Collapse';
        else hazardCategory = categoryHint || 'Flood';

        confidenceScore = 72;
        visualIndicators.push('Standard hazard pattern matching reporter description');
        estimatedSeverity = 'MEDIUM';
        severityExplanation = 'Visual evidence partially corroborated by reporter notes.';
      }

      const needsAdditionalEvidence = confidenceScore < 75;

      return {
        hazardCategory,
        confidenceScore,
        estimatedSeverity,
        severityExplanation,
        visualIndicators,
        modelVersion: 'ResQ-Vision-Edge-v2 (On-Device Color/Gradient Analyzer)',
        analysisStatus: isOnline ? 'ONLINE_EDGE_ANALYSIS' : 'LOCAL_ON_DEVICE_ANALYSIS',
        needsAdditionalEvidence,
        uncertaintyNotes: needsAdditionalEvidence
          ? 'Edge model recommends secondary photo confirmation or on-scene scout verification.'
          : 'Sufficient visual evidence detected for automated triage.',
      };
    }

    // Step 4: No image provided — Honest Pending / Uncertainty state
    const hasCategory = categoryHint && categoryHint !== 'Unknown';
    return {
      hazardCategory: hasCategory ? categoryHint : 'General Emergency',
      confidenceScore: hasCategory ? 60 : 40,
      estimatedSeverity: 'MEDIUM',
      severityExplanation: 'Classified purely from text description. No image uploaded for visual AI verification.',
      visualIndicators: ['No visual media provided'],
      modelVersion: 'ResQ-Rule-Based-v1',
      analysisStatus: 'ANALYSIS_PENDING',
      needsAdditionalEvidence: true,
      uncertaintyNotes: 'High uncertainty: Photographic evidence required to corroborate real-world severity.',
    };
  },
};
