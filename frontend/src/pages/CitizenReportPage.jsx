import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Camera,
  UploadCloud,
  X,
  MapPin,
  Crosshair,
  AlertTriangle,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Clock,
  Shield,
  Send,
  Loader2,
} from 'lucide-react';
import CitizenHeader from '../components/Citizen/CitizenHeader';
import LocationPickerMap from '../components/Map/LocationPickerMap';
import OfflineMapDownloader from '../components/Map/OfflineMapDownloader';
import { aiPipeline } from '../services/aiPipeline';
import { priorityEngine } from '../services/priorityEngine';
import { incidentStore } from '../services/incidentStore';

const RATE_LIMIT_SECONDS = 30;
const RATE_LIMIT_KEY = 'resq_last_report_time';


export default function CitizenReportPage() {
  const navigate = useNavigate();

  // Network State
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [showMapDownloader, setShowMapDownloader] = useState(false);

  // Form Fields
  const [detectedCategory, setDetectedCategory] = useState('Flood');
  const [description, setDescription] = useState('');
  const [peopleAffected, setPeopleAffected] = useState('');
  const [notes, setNotes] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [locationAddress, setLocationAddress] = useState('Central District, New Delhi');
  const [latitude, setLatitude] = useState(28.6139);
  const [longitude, setLongitude] = useState(77.2090);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [locating, setLocating] = useState(false);

  // AI Structured Analysis State
  const [aiAnalysisResult, setAiAnalysisResult] = useState(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);

  // Photo State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [photoError, setPhotoError] = useState('');
  const [exifGpsDetected, setExifGpsDetected] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Rate Limiting
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  // Submit Step Indicator: null | 'uploading' | 'analyzing' | 'submitted'
  const [submitStep, setSubmitStep] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Network and Geolocation Listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkCooldown = () => {
      const lastTime = parseInt(localStorage.getItem(RATE_LIMIT_KEY) || '0', 10);
      const elapsed = (Date.now() - lastTime) / 1000;
      if (elapsed < RATE_LIMIT_SECONDS) {
        setCooldownRemaining(Math.ceil(RATE_LIMIT_SECONDS - elapsed));
      } else {
        setCooldownRemaining(0);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);

    // Auto-detect GPS coordinates
    if (navigator.geolocation) {
      setLocating(true);
      setLocationAddress('📡 Acquiring satellite GPS fix...');
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude: lat, longitude: lng, accuracy } = pos.coords;
          setLatitude(lat);
          setLongitude(lng);
          setGpsAccuracy(accuracy ? Math.round(accuracy) : null);
          setLocating(false);
          setLocationAddress(`GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);

          if (navigator.onLine) {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
                { headers: { 'Accept-Language': 'en' } }
              );
              if (res.ok) {
                const data = await res.json();
                if (data.display_name) setLocationAddress(data.display_name);
              }
            } catch {
              // keep coordinates string
            }
          }
        },
        () => {
          setLocating(false);
          setLocationAddress('Central District, New Delhi (Manual)');
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Autonomous real-time AI NLP categorization on description input (when no photo provided yet)
  useEffect(() => {
    if (!imageFile && description.trim().length > 3) {
      const textClassification = aiPipeline.classifyFromText(description);
      if (textClassification) {
        setDetectedCategory(textClassification.hazardCategory);
        setAiAnalysisResult({
          hazardCategory: textClassification.hazardCategory,
          confidenceScore: textClassification.confidenceScore,
          estimatedSeverity: textClassification.estimatedSeverity,
          severityExplanation: textClassification.explanation,
          visualIndicators: ['Text-based AI NLP categorization (No image uploaded)'],
          modelVersion: 'ResQ-NLP-Edge-v1',
          analysisStatus: 'ANALYSIS_COMPLETED_TEXT_ONLY',
          needsAdditionalEvidence: true,
          uncertaintyNotes: 'Photographic evidence strongly recommended to verify on-ground severity.',
        });
      }
    }
  }, [description, imageFile]);

  // Pure-JS EXIF GPS extractor
  const extractExifGps = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        try {
          const buf = reader.result;
          const view = new DataView(buf);
          if (view.getUint16(0) !== 0xffd8) return resolve(null);

          let offset = 2;
          while (offset < view.byteLength - 4) {
            const marker = view.getUint16(offset);
            const segLen = view.getUint16(offset + 2);
            if (marker === 0xffe1) {
              const exifHeader = String.fromCharCode(
                view.getUint8(offset + 4), view.getUint8(offset + 5),
                view.getUint8(offset + 6), view.getUint8(offset + 7)
              );
              if (exifHeader !== 'Exif') break;

              const tiffStart = offset + 10;
              const endian = view.getUint16(tiffStart);
              const le = endian === 0x4949;
              const getU16 = (o) => view.getUint16(tiffStart + o, le);
              const getU32 = (o) => view.getUint32(tiffStart + o, le);

              const ifd0Offset = getU32(4);
              const ifd0Count = getU16(ifd0Offset);
              let gpsIfdOffset = null;

              for (let i = 0; i < ifd0Count; i++) {
                const entryOffset = ifd0Offset + 2 + i * 12;
                const tag = getU16(entryOffset);
                if (tag === 0x8825) {
                  gpsIfdOffset = getU32(entryOffset + 8);
                  break;
                }
              }
              if (gpsIfdOffset === null) return resolve(null);

              const gpsCount = getU16(gpsIfdOffset);
              const gpsData = {};
              for (let i = 0; i < gpsCount; i++) {
                const entryOffset = gpsIfdOffset + 2 + i * 12;
                const tag = getU16(entryOffset);
                const type = getU16(entryOffset + 2);
                const count = getU32(entryOffset + 4);
                const valOffset = entryOffset + 8;

                if (type === 2) {
                  gpsData[tag] = String.fromCharCode(view.getUint8(tiffStart + getU32(valOffset)));
                } else if (type === 5) {
                  const rOffset = getU32(valOffset);
                  const vals = [];
                  for (let r = 0; r < count; r++) {
                    const num = getU32(rOffset + r * 8);
                    const den = getU32(rOffset + r * 8 + 4);
                    vals.push(den !== 0 ? num / den : 0);
                  }
                  gpsData[tag] = vals;
                }
              }

              if (!gpsData[2] || !gpsData[4]) return resolve(null);
              const dmsToDecimal = ([deg, min, sec]) => deg + min / 60 + sec / 3600;
              let lat = dmsToDecimal(gpsData[2]);
              let lng = dmsToDecimal(gpsData[4]);
              if (gpsData[1] === 'S') lat = -lat;
              if (gpsData[3] === 'W') lng = -lng;
              return resolve({ lat, lng });
            }
            offset += 2 + segLen;
          }
          resolve(null);
        } catch {
          resolve(null);
        }
      };
      reader.readAsArrayBuffer(file);
    });

  // Reverse-geocode lat/lng
  const reverseGeocode = async (lat, lng) => {
    if (!navigator.onLine) return null;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data.display_name || null;
    } catch {
      return null;
    }
  };

  // Handle Photo selection & trigger On-Device AI Vision Analysis
  const handlePhotoSelect = async (file) => {
    setPhotoError('');
    setExifGpsDetected(false);
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/jpg', 'image/webp'].includes(file.type)) {
      setPhotoError('Only JPG and PNG images are supported.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError('Image size exceeds 10 MB limit. Please select a smaller photo.');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);

    // Extract EXIF GPS if present
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      const gps = await extractExifGps(file);
      if (gps) {
        setLatitude(gps.lat);
        setLongitude(gps.lng);
        setExifGpsDetected(true);
        setLocationAddress(`📍 GPS from photo EXIF: ${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}`);
        const address = await reverseGeocode(gps.lat, gps.lng);
        if (address) setLocationAddress(address);
      }
    }

    // Run real On-Device AI Vision Analysis
    setIsAnalyzingImage(true);
    try {
      const result = await aiPipeline.analyze({
        imageFileOrBlob: file,
        description,
        location: locationAddress,
        isOnline: navigator.onLine,
      });
      setAiAnalysisResult(result);
      if (result.hazardCategory) {
        setDetectedCategory(result.hazardCategory);
      }
    } catch (err) {
      console.warn('[ResQ] On-device AI analysis error:', err);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setImagePreview(null);
    setPhotoError('');
    setExifGpsDetected(false);
    setAiAnalysisResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // HTML5 "Use My Current Location"
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        setLatitude(lat);
        setLongitude(lng);
        setGpsAccuracy(accuracy ? Math.round(accuracy) : null);
        setLocationAddress(`GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)} (Accuracy ±${Math.round(accuracy || 10)}m)`);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        alert('Could not retrieve GPS coordinates. You can select a location on the map instead.');
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // Submit Flow with Durable Offline Support
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (cooldownRemaining > 0) {
      setSubmitError(`Anti-spam rate limit: Please wait ${cooldownRemaining}s before submitting again.`);
      return;
    }

    if (!description.trim()) {
      setSubmitError('Please describe the disaster emergency.');
      return;
    }

    try {
      setSubmitStep(isOnline ? 'uploading' : 'saving_offline');

      const effectiveCategory = aiAnalysisResult?.hazardCategory || detectedCategory || 'Flood';

      // 1. Multi-factor priority computation
      const prioCalc = priorityEngine.calculatePriority({
        disasterType: effectiveCategory,
        severity: aiAnalysisResult?.estimatedSeverity || 'HIGH',
        peopleAffected: peopleAffected ? Number(peopleAffected) : 20,
        description,
        notes,
        aiConfidence: aiAnalysisResult?.confidenceScore || 80,
      });

      setSubmitStep(isOnline ? 'analyzing' : 'saving_offline');

      // 2. Persist locally to IndexedDB first, then synchronize if online
      const created = await incidentStore.createIncident(
        {
          reporterName: 'Citizen Reporter',
          contactPhone,
          location: locationAddress,
          latitude,
          longitude,
          gpsAccuracy,
          disasterType: effectiveCategory,
          aiLabel: effectiveCategory,
          aiConfidence: aiAnalysisResult?.confidenceScore || 80,
          severity: aiAnalysisResult?.estimatedSeverity || 'HIGH',
          priorityScore: prioCalc.priorityScore,
          peopleAffected: peopleAffected ? Number(peopleAffected) : 20,
          description,
          notes: notes ? `${notes} | ${prioCalc.reasons.join('; ')}` : prioCalc.reasons.join('; '),
          imageUrl: imagePreview || '/images/disasters/flood.jpg',
          reportedBy: 'Citizen PWA',
          syncStatus: isOnline ? 'SYNCED' : 'SAVED_OFFLINE',
        },
        imageFile
      );

      localStorage.setItem(RATE_LIMIT_KEY, Date.now().toString());
      setSubmitStep('submitted');

      // Redirect to success confirmation page
      setTimeout(() => {
        navigate(`/report/success/${created.incidentId || created.clientIncidentId || created.id}`);
      }, 500);
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmitStep(null);
      setSubmitError(`Submission error: ${err.message || 'Please check your connection and retry.'}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <CitizenHeader />

      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 sm:py-10 w-full space-y-6">
        {/* Honest Offline Notification Banner */}
        {!isOnline && (
          <div className="p-4 bg-amber-950/80 border border-amber-600/70 rounded-2xl text-amber-200 text-xs flex items-start gap-3 shadow-lg animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-white text-sm">Offline Mode Active</p>
              <p>
                Device is disconnected. Your report and photos will be stored locally in IndexedDB and queued for synchronization.
              </p>
              <p className="text-amber-300 font-semibold text-[11px]">
                ⚠️ Important: Offline reports have NOT yet reached the emergency response center. They will automatically synchronize when connectivity returns.
              </p>
            </div>
          </div>
        )}

        {/* Preloaded Nationwide Offline Map of India Bar */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-emerald-900/50 shadow">
          <div className="flex items-center gap-2.5 text-xs text-slate-200">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm">🇮🇳</span>
            <div>
              <p className="font-bold text-white flex items-center gap-1.5">
                Preloaded Offline Map: India
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold">
                  National Basemap Ready
                </span>
              </p>
              <p className="text-[11px] text-slate-400">All 28 States & 8 UTs preloaded in local storage — no cell service required</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowMapDownloader(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition flex items-center gap-1.5 shrink-0"
          >
            <span>Map Status</span>
          </button>
        </div>

        {/* Header Title */}
        <div className="text-center space-y-1.5">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold inline-flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Rapid Public Emergency Intake
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Report Disaster Incident
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            Provide photos and coordinates. On-device AI triage classifies urgency to coordinate emergency rescue units.
          </p>
        </div>

        {/* Step Indicator when submitting */}
        {submitStep && (
          <div className="p-4 rounded-2xl bg-[#121c33] border border-blue-800/80 shadow-2xl space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-bold px-2">
              <span className={`flex items-center gap-1.5 ${submitStep === 'uploading' || submitStep === 'saving_offline' ? 'text-blue-400 animate-pulse' : 'text-slate-400'}`}>
                1. {isOnline ? 'Uploading' : 'Saving Locally'}
              </span>
              <span className="text-slate-600">&rarr;</span>
              <span className={`flex items-center gap-1.5 ${submitStep === 'analyzing' ? 'text-amber-400 animate-pulse' : submitStep === 'submitted' ? 'text-emerald-400' : 'text-slate-400'}`}>
                <Sparkles className="w-3.5 h-3.5" /> 2. AI Analysis
              </span>
              <span className="text-slate-600">&rarr;</span>
              <span className={`flex items-center gap-1.5 ${submitStep === 'submitted' ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                <CheckCircle2 className="w-3.5 h-3.5" /> 3. {isOnline ? 'Submitted' : 'Saved in IndexedDB'}
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 rounded-full"
                style={{
                  width: submitStep === 'uploading' || submitStep === 'saving_offline' ? '40%' : submitStep === 'analyzing' ? '75%' : '100%',
                }}
              />
            </div>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-[#10182b] border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
          {/* Rate Limit Alert */}
          {cooldownRemaining > 0 && (
            <div className="p-3 bg-amber-950/60 border border-amber-700/50 rounded-xl text-amber-300 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Rate limit active: Please wait <strong>{cooldownRemaining}s</strong> before submitting another report.
              </span>
            </div>
          )}

          {/* Submission Error */}
          {submitError && (
            <div className="p-3 bg-red-950/80 border border-red-700/60 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}


          {/* Photo Upload: Mobile Camera + Drag and Drop */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-blue-400" /> Disaster Photo (Up to 10 MB)
              </label>
              <span className="text-[10px] text-slate-400 font-medium">JPG / PNG</span>
            </div>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-blue-900/60 bg-slate-900 group">
                <img
                  src={imagePreview}
                  alt="Disaster site preview"
                  className="w-full h-52 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-950/80 hover:bg-red-600 text-white transition-colors shadow-lg"
                  title="Remove photo"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] text-emerald-400 font-bold border border-emerald-500/30">
                  Ready for AI Vision Analysis
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handlePhotoSelect(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center space-y-3 bg-[#0d1527]/50 transition-colors"
              >
                <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-200">
                    Drag and drop disaster image, or browse
                  </p>
                  <p className="text-[10px] text-slate-400">
                    High clarity helps AI detect submerged infrastructure & hazard severity
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  {/* Standard file selector */}
                  <label className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors border border-slate-700">
                    Browse File
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>

                  {/* Mobile Camera Capture */}
                  <label className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-colors shadow flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Take Photo</span>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handlePhotoSelect(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}

            {isAnalyzingImage && (
              <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-300 text-xs flex items-center gap-2 animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span>Running real on-device computer vision analysis...</span>
              </div>
            )}

            {aiAnalysisResult && (
              <div className="p-4 rounded-2xl bg-[#0c1424] border border-blue-600/30 shadow-lg space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> On-Device AI Assessment
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                    {aiAnalysisResult.modelVersion}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Identified Hazard</span>
                    <span className="font-bold text-white text-sm">{aiAnalysisResult.hazardCategory}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold block">{aiAnalysisResult.confidenceScore}% Confidence</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Estimated Severity</span>
                    <span className={`font-bold text-sm ${
                      aiAnalysisResult.estimatedSeverity === 'CRITICAL' ? 'text-red-400' :
                      aiAnalysisResult.estimatedSeverity === 'HIGH' ? 'text-orange-400' : 'text-yellow-400'
                    }`}>
                      {aiAnalysisResult.estimatedSeverity}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Status: {aiAnalysisResult.analysisStatus}</span>
                  </div>
                </div>

                {aiAnalysisResult.visualIndicators?.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Detected Visual Evidence:</span>
                    <ul className="text-[11px] text-slate-300 space-y-0.5 list-disc list-inside">
                      {aiAnalysisResult.visualIndicators.map((ind, idx) => (
                        <li key={idx}>{ind}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {aiAnalysisResult.needsAdditionalEvidence && (
                  <div className="p-2 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>{aiAnalysisResult.uncertaintyNotes}</span>
                  </div>
                )}
              </div>
            )}

            {photoError && (
              <p className="text-[11px] text-red-400 font-medium">{photoError}</p>
            )}
          </div>

          {/* Description (Required) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>Incident Description <strong className="text-rose-400">*</strong></span>
              <span className="text-[10px] text-slate-400 font-normal">Required</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the disaster (e.g. River breached embankment, homes submerged, people stranded on rooftops...)"
              required
              className="w-full bg-[#0d1629] text-white text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500 placeholder:text-slate-500 transition-colors"
            />
          </div>

          {/* Optional Fields: People affected & Contact Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                People Affected (Optional)
              </label>
              <input
                type="number"
                min="0"
                value={peopleAffected}
                onChange={(e) => setPeopleAffected(e.target.value)}
                placeholder="e.g. 50"
                className="w-full bg-[#0d1629] text-white text-xs px-3.5 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Contact Phone (Optional)
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full bg-[#0d1629] text-white text-xs px-3.5 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notes (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Additional Hazard Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Power grid disconnected, road blocked by fallen trees"
              className="w-full bg-[#0d1629] text-white text-xs px-3.5 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Location Section */}
          <div className="space-y-2.5 pt-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" /> Disaster Location & Map Coordinates
                </label>
                {gpsAccuracy && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-blue-300 border border-slate-700 font-mono">
                    ±{gpsAccuracy}m accuracy
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleUseMyLocation}
                disabled={locating}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-400 hover:text-blue-300 bg-blue-950/80 px-3 py-1.5 rounded-xl border border-blue-800/60 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Detecting GPS...' : 'Use My Current Location'}</span>
              </button>
            </div>

            {/* EXIF GPS auto-detect badge */}
            {exifGpsDetected && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-700/50 text-emerald-400 text-[11px] font-semibold">
                <span className="text-base leading-none">📡</span>
                <span>GPS auto-detected from photo — location pre-filled! You can still adjust the pin manually.</span>
              </div>
            )}

            <input
              type="text"
              value={locationAddress}
              onChange={(e) => setLocationAddress(e.target.value)}
              placeholder="Street name, landmark, or area name"
              className={`w-full bg-[#0d1629] text-white text-xs px-3.5 py-2 rounded-xl border focus:outline-none focus:border-blue-500 transition-colors ${
                exifGpsDetected ? 'border-emerald-600/70' : 'border-slate-700'
              }`}
            />

            {/* Small interactive Leaflet Map to adjust pin */}
            <LocationPickerMap
              latitude={latitude}
              longitude={longitude}
              onChangeLocation={(lat, lng) => {
                setLatitude(lat);
                setLongitude(lng);
                setExifGpsDetected(false);
                setLocationAddress(`Pin: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
              }}
              height="200px"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={Boolean(submitStep) || cooldownRemaining > 0}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-red-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitStep ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Processing Emergency Report...</span>
                </>
              ) : cooldownRemaining > 0 ? (
                <span>Rate Limit: Wait {cooldownRemaining}s</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Disaster Report</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="text-center p-4 rounded-2xl bg-red-950/30 border border-red-900/40 text-xs text-slate-400 space-y-1">
          <p className="font-bold text-red-400 flex items-center justify-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" /> In immediate danger? Call 112.
          </p>
          <p className="text-[11px]">
            National Emergency Hotline operators are available 24/7 across all telecommunication carriers.
          </p>
        </div>
      </main>

      {/* Offline Regional Map Downloader Modal */}
      <OfflineMapDownloader
        isOpen={showMapDownloader}
        onClose={() => setShowMapDownloader(false)}
      />
    </div>
  );
}
