import React, { useState } from 'react';
import { 
  UploadCloud, 
  Send, 
  X, 
  AlertTriangle, 
  ShieldAlert, 
  Users, 
  Ambulance, 
  HeartHandshake, 
  Package, 
  Droplet, 
  Flame, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Key, 
  Cpu, 
  ExternalLink, 
  Check 
} from 'lucide-react';
import { huggingfaceService, SUPPORTED_MODELS, DEFAULT_MODEL } from '../../services/huggingfaceService';
import { getDisasterImage } from '../../utils/disasterAssets';
import IncidentImage from '../common/IncidentImage';

// Default demo flood image (high quality real disaster response illustration)
const DEFAULT_FLOOD_IMAGE = getDisasterImage('Flood');

export default function AIWorkflowGrid({ onDispatchMission, onIncidentReported }) {
  // Form State
  const [imagePreview, setImagePreview] = useState(DEFAULT_FLOOD_IMAGE);
  const [rawImageFile, setRawImageFile] = useState(null);
  const [description, setDescription] = useState(
    'Houses submerged due to heavy rain. Many people are stranded.'
  );
  const [affectedPeople, setAffectedPeople] = useState('50');
  const [notes, setNotes] = useState('Roads are blocked.');
  const [analyzing, setAnalyzing] = useState(false);

  // Hugging Face API Configuration Bar State
  const [showConfig, setShowConfig] = useState(false);
  const [hfToken, setHfToken] = useState(huggingfaceService.getApiKey());
  const [selectedModel, setSelectedModel] = useState(huggingfaceService.getModel());
  const [tokenSaved, setTokenSaved] = useState(false);
  const [tokenStatusMessage, setTokenStatusMessage] = useState('');

  // AI Assessment State (Default initial values match screenshot)
  const [assessment, setAssessment] = useState({
    category: 'Flood',
    damageLevel: 'Severe',
    hazards: 'Water logging, damaged buildings, blocked roads',
    confidenceScore: 92,
    priorityScore: 87,
    priorityLevel: 'CRITICAL',
    alertMessage: 'Immediate response required. High population impact and severe damage detected.',
    modelUsed: DEFAULT_MODEL,
    isLiveCloud: Boolean(huggingfaceService.getApiKey()),
    topPredictions: [
      { label: 'Flood', score: 0.92 },
      { label: 'Landslide', score: 0.05 },
    ],
    breakdown: {
      severity: 30,
      populationImpact: 25,
      accessibility: 20,
      urgency: 15,
      otherFactors: 10,
    },
    recommendations: {
      rescueTeams: 2,
      ambulances: 3,
      medicalKits: 50,
      foodSupplies: 200,
      waterSupplies: 500,
    },
  });

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setRawImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveToken = async () => {
    huggingfaceService.setApiKey(hfToken);
    huggingfaceService.setModel(selectedModel);
    setTokenSaved(true);
    setTokenStatusMessage('Validating token...');

    const res = await huggingfaceService.testConnection(hfToken);
    if (res.success) {
      setTokenStatusMessage(`✅ ${res.message}`);
    } else {
      setTokenStatusMessage(`⚠️ ${res.message}`);
    }

    setTimeout(() => setTokenSaved(false), 4000);
  };

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    setAnalyzing(true);

    try {
      const payload = rawImageFile || imagePreview;
      const result = await huggingfaceService.classifyImage(
        payload,
        description,
        affectedPeople,
        notes
      );
      setAssessment(result);

      if (onIncidentReported) {
        onIncidentReported({
          description,
          category: result.category,
          priority: result.priorityLevel,
          priorityScore: result.priorityScore,
          image: imagePreview,
        });
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const hasHfToken = Boolean(huggingfaceService.getApiKey());

  return (
    <div className="space-y-4">
      {/* Top 3 Columns: Step 1, Step 2, Step 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ================= STEP 1 ================= */}
        <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                  1
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">1. Submit Image & Report</h3>
                  <p className="text-[11px] text-slate-400">
                    Upload an image and provide details about the incident.
                  </p>
                </div>
              </div>

              {/* Hugging Face AI Model Pill Toggle */}
              <button
                onClick={() => setShowConfig(!showConfig)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 border transition-all ${
                  hasHfToken
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="Configure Hugging Face Model & API Token"
              >
                <Cpu className="w-3 h-3 text-amber-400" />
                <span>{hasHfToken ? 'HF Cloud Active' : 'HF Model Config'}</span>
              </button>
            </div>

            {/* Hugging Face Inline Configuration Box */}
            {showConfig && (
              <div className="p-3 bg-[#0d1629] border border-blue-900/60 rounded-xl space-y-2 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-400" />
                    Hugging Face Inference API
                  </span>
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 font-medium"
                  >
                    Get Free Token <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>

                <div className="space-y-1">
                  <input
                    type="password"
                    placeholder="Enter Hugging Face User Access Token (hf_...)"
                    value={hfToken}
                    onChange={(e) => setHfToken(e.target.value)}
                    className="w-full bg-[#131d33] text-white text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400">Target Disaster Model:</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-[#131d33] text-white text-[11px] px-2 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    {SUPPORTED_MODELS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    {tokenStatusMessage || (hasHfToken ? 'Token saved in browser.' : 'Leave blank for local demo mode.')}
                  </span>
                  <button
                    onClick={handleSaveToken}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm"
                  >
                    <Check className="w-3 h-3" /> Save & Test
                  </button>
                </div>
              </div>
            )}

            {/* Image Upload Area & Preview Box */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Drag & Drop Area */}
              <label className="border-2 border-dashed border-slate-700/80 hover:border-blue-500 rounded-xl p-3 flex flex-col items-center justify-center text-center cursor-pointer bg-[#0e1627]/50 hover:bg-[#131d33] transition-all group min-h-[105px]">
                <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-blue-400 transition-colors" />
                <span className="text-[10px] text-slate-300 font-semibold mt-1">
                  Drag & drop an image here
                </span>
                <span className="text-[9px] text-slate-500">or click to browse</span>
                <span className="text-[8px] text-slate-600 mt-0.5">Supports JPG, PNG (Max 10MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {/* Preview Thumbnail */}
              <div className="relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 min-h-[105px] group">
                <IncidentImage
                  src={imagePreview}
                  disasterType="Flood"
                  alt="Incident thumbnail"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview(DEFAULT_FLOOD_IMAGE);
                    setRawImageFile(null);
                  }}
                  className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-slate-900/80 hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                  title="Reset image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-medium">Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe visible disaster impact..."
                className="w-full bg-[#0e1627] text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Optional Fields */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-medium">
                  Estimated people affected (optional)
                </label>
                <input
                  type="number"
                  value={affectedPeople}
                  onChange={(e) => setAffectedPeople(e.target.value)}
                  className="w-full bg-[#0e1627] text-xs text-white p-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-medium">
                  Additional notes (optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0e1627] text-xs text-white p-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3 mt-1">
            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40 transition-all disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-300" />
                  Running AI Inference via Hugging Face...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  Submit for AI Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* ================= STEP 2 ================= */}
        <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">2. AI Damage Assessment</h3>
                  <p className="text-[11px] text-slate-400">
                    AI model analyzes the image and identifies disaster details.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-1">
              {/* Analyzed Image Preview */}
              <div className="w-32 h-28 rounded-xl overflow-hidden border border-slate-700/80 shrink-0 bg-slate-950">
                <IncidentImage
                  src={imagePreview}
                  disasterType="Flood"
                  alt="AI Analyzed disaster"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Assessment Results */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    Assessment Results
                  </p>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                      assessment.isLiveCloud
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {assessment.isLiveCloud ? 'Hugging Face Live' : 'Local AI Model'}
                  </span>
                </div>

                {/* Category */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Disaster Category
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-950 text-blue-300 border border-blue-800/80">
                    {assessment.category}
                  </span>
                </div>

                {/* Damage Level */}
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    Damage Level
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-red-950 text-red-300 border border-red-800/80">
                    {assessment.damageLevel}
                  </span>
                </div>

                {/* Visible Hazards */}
                <div>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                    Visible Hazards
                  </span>
                  <p className="text-slate-200 text-[11px] mt-0.5 font-medium leading-relaxed">
                    {assessment.hazards}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Confidence Score Bar */}
          <div className="pt-3 border-t border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Confidence Score
              </span>
              <span className="font-extrabold text-white text-xs">
                {assessment.confidenceScore}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${assessment.confidenceScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* ================= STEP 3 ================= */}
        <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700/80 transition-all">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              <div>
                <h3 className="text-sm font-bold text-white">3. Priority Scoring</h3>
                <p className="text-[11px] text-slate-400">
                  System calculates priority based on multiple factors.
                </p>
              </div>
            </div>

            {/* Gauge & Breakdown */}
            <div className="flex items-center gap-4 pt-1">
              {/* Circular Priority Gauge */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#1e293b"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#ef4444"
                    strokeWidth="8"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * assessment.priorityScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white tracking-tight">
                    {assessment.priorityScore}
                  </span>
                  <span className="text-[9px] text-slate-400 uppercase font-semibold">
                    Priority Score
                  </span>
                </div>
              </div>

              {/* Score Breakdown Bars */}
              <div className="flex-1 space-y-1.5 text-[11px]">
                <p className="font-bold text-slate-300 text-[11px]">Score Breakdown</p>

                {/* Severity */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5 text-red-400" /> Severity
                    </span>
                    <span className="font-semibold text-slate-200">
                      {assessment.breakdown.severity}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${(assessment.breakdown.severity / 35) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Population Impact */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-2.5 h-2.5 text-amber-400" /> Population Impact
                    </span>
                    <span className="font-semibold text-slate-200">
                      {assessment.breakdown.populationImpact}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full"
                      style={{ width: `${(assessment.breakdown.populationImpact / 30) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Accessibility */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Accessibility</span>
                    <span className="font-semibold text-slate-200">
                      {assessment.breakdown.accessibility}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-500 rounded-full"
                      style={{ width: `${(assessment.breakdown.accessibility / 25) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Urgency */}
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Urgency</span>
                    <span className="font-semibold text-slate-200">
                      {assessment.breakdown.urgency}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${(assessment.breakdown.urgency / 20) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Priority Alert Banner */}
          <div className="mt-3 p-2.5 rounded-xl bg-red-950/70 border border-red-800/80 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="text-[11px] font-extrabold text-red-300 uppercase tracking-wider">
                Priority Level: {assessment.priorityLevel}
              </p>
              <p className="text-[10px] text-red-200/90 leading-tight">
                {assessment.alertMessage}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STEP 4: Resource Recommendations ================= */}
      <div className="bg-[#121b2f] border border-slate-800/80 rounded-2xl p-5 hover:border-slate-700/80 transition-all space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
              4
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">4. Resource Recommendations</h3>
              <p className="text-[11px] text-slate-400">
                Recommended resources based on incident analysis.
              </p>
            </div>
          </div>

          {onDispatchMission && (
            <button
              onClick={() => onDispatchMission(assessment)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch Recommended Mission
            </button>
          )}
        </div>

        {/* 5 Recommendation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {/* Rescue Teams */}
          <div className="bg-[#0e1627] p-3 rounded-xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-extrabold text-white leading-tight">
                {assessment.recommendations.rescueTeams}
              </p>
              <p className="text-[10px] font-bold text-slate-300">Rescue Teams</p>
              <p className="text-[9px] text-slate-500">Search & Rescue Units</p>
            </div>
          </div>

          {/* Ambulances */}
          <div className="bg-[#0e1627] p-3 rounded-xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 shrink-0">
              <Ambulance className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-extrabold text-white leading-tight">
                {assessment.recommendations.ambulances}
              </p>
              <p className="text-[10px] font-bold text-slate-300">Ambulances</p>
              <p className="text-[9px] text-slate-500">Medical Support</p>
            </div>
          </div>

          {/* Medical Kits */}
          <div className="bg-[#0e1627] p-3 rounded-xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-extrabold text-white leading-tight">
                {assessment.recommendations.medicalKits}
              </p>
              <p className="text-[10px] font-bold text-slate-300">Medical Kits</p>
              <p className="text-[9px] text-slate-500">First Aid Kits</p>
            </div>
          </div>

          {/* Food Supplies */}
          <div className="bg-[#0e1627] p-3 rounded-xl border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 shrink-0">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-extrabold text-white leading-tight">
                {assessment.recommendations.foodSupplies}
              </p>
              <p className="text-[10px] font-bold text-slate-300">Food Supplies</p>
              <p className="text-[9px] text-slate-500">Food Packets</p>
            </div>
          </div>

          {/* Water Supplies */}
          <div className="bg-[#0e1627] p-3 rounded-xl border border-slate-800/80 flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 shrink-0">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-base font-extrabold text-white leading-tight">
                {assessment.recommendations.waterSupplies}
              </p>
              <p className="text-[10px] font-bold text-slate-300">Water Supplies</p>
              <p className="text-[9px] text-slate-500">Water Bottles</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
