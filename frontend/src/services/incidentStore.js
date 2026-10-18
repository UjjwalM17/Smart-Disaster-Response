/**
 * Incident State & Persistence Service
 * Bridges backend microservices (/api/incidents) with rich disaster metadata,
 * coordinate mapping, verification workflows, and timeline tracking.
 */

import { api } from './api';
import { getDisasterImage } from '../utils/disasterAssets';

const LOCAL_STORAGE_KEY = 'resq_rich_incidents_v6';

const INITIAL_INCIDENTS = [
  {
    incidentId: 1,
    id: 1,
    reporterName: "Public Reporter",
    mobile: '9810000001',
    location: "Yamuna Bazar, Delhi",
    latitude: 28.67,
    longitude: 77.24,
    disasterType: "Flood",
    aiLabel: "Flood",
    aiConfidence: 84,
    severity: 'HIGH',
    priorityScore: 70,
    peopleAffected: 96,
    description: "Water entered ground floor shops, families on first floors",
    notes: "submerged vehicles; submerged roads",
    imageUrl: getDisasterImage("Flood"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Public",
    reportedTime: '2026-10-11 02:52',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 2,
    id: 2,
    reporterName: "Responder Reporter",
    mobile: '9810000002',
    location: "Sonia Vihar, Delhi",
    latitude: 28.716,
    longitude: 77.263,
    disasterType: "Flood",
    aiLabel: "Flood",
    aiConfidence: 88,
    severity: 'HIGH',
    priorityScore: 88,
    peopleAffected: 108,
    description: "Colony submerged, roads waist deep",
    notes: "rising water; submerged roads",
    imageUrl: getDisasterImage("Flood"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Responder",
    reportedTime: '2026-10-12 16:13',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 3,
    id: 3,
    reporterName: "Public Reporter",
    mobile: '9810000003',
    location: "Kanwar Road, Ghaziabad",
    latitude: 28.6692,
    longitude: 77.4538,
    disasterType: "Flood",
    aiLabel: "Flood",
    aiConfidence: 79,
    severity: 'LOW',
    priorityScore: 38,
    peopleAffected: 60,
    description: "Drain overflow, street under knee-deep water",
    notes: "submerged vehicles; rising water",
    imageUrl: getDisasterImage("Flood"),
    status: 'REPORTED',
    verified: false,
    verificationStatus: 'PENDING',
    reportedBy: "Public",
    reportedTime: '2026-10-13 02:15',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Pending", done: false },
      { stage: 'Response dispatched', time: "Pending", done: false },
    ],
  },
  {
    incidentId: 4,
    id: 4,
    reporterName: "Public Reporter",
    mobile: '9810000004',
    location: "Hindon Vihar, Ghaziabad",
    latitude: 28.685,
    longitude: 77.412,
    disasterType: "Flood",
    aiLabel: "Flood",
    aiConfidence: 80,
    severity: 'HIGH',
    priorityScore: 75,
    peopleAffected: 84,
    description: "River level rising, nearby huts at risk",
    notes: "submerged roads; rising water",
    imageUrl: getDisasterImage("Flood"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Public",
    reportedTime: '2026-10-14 07:40',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 5,
    id: 5,
    reporterName: "Responder Reporter",
    mobile: '9810000005',
    location: "Civil Lines, Prayagraj",
    latitude: 25.455,
    longitude: 81.833,
    disasterType: "Flood",
    aiLabel: "Flood",
    aiConfidence: 90,
    severity: 'HIGH',
    priorityScore: 78,
    peopleAffected: 96,
    description: "Ganga water entering homes, boats needed",
    notes: "rising water; submerged vehicles",
    imageUrl: getDisasterImage("Flood"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Responder",
    reportedTime: '2026-10-15 01:14',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 6,
    id: 6,
    reporterName: "Responder Reporter",
    mobile: '9810000006',
    location: "Majuli Island, Assam",
    latitude: 26.95,
    longitude: 94.17,
    disasterType: "Flood",
    aiLabel: "Flood",
    aiConfidence: 79,
    severity: 'HIGH',
    priorityScore: 85,
    peopleAffected: 72,
    description: "Village cut off, elderly residents stranded",
    notes: "water above 1m; submerged vehicles",
    imageUrl: getDisasterImage("Flood"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Responder",
    reportedTime: '2026-10-16 04:34',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 7,
    id: 7,
    reporterName: "Public Reporter",
    mobile: '9810000007',
    location: "Patna Ghat Road, Bihar",
    latitude: 25.61,
    longitude: 85.14,
    disasterType: "Flood",
    aiLabel: "Flood",
    aiConfidence: 80,
    severity: 'LOW',
    priorityScore: 38,
    peopleAffected: 72,
    description: "Waterlogging after heavy rain, traffic stopped",
    notes: "rising water; stranded people",
    imageUrl: getDisasterImage("Flood"),
    status: 'COMPLETED',
    verified: false,
    verificationStatus: 'PENDING',
    reportedBy: "Public",
    reportedTime: '2026-10-10 03:37',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Pending", done: false },
      { stage: 'Response dispatched', time: "Pending", done: false },
    ],
  },
  {
    incidentId: 8,
    id: 8,
    reporterName: "Public Reporter",
    mobile: '9810000008',
    location: "Kuttanad, Kerala",
    latitude: 9.4,
    longitude: 76.4,
    disasterType: "Flood",
    aiLabel: "Flood",
    aiConfidence: 89,
    severity: 'MEDIUM',
    priorityScore: 58,
    peopleAffected: 72,
    description: "Paddy fields and homes flooded",
    notes: "water above 1m; submerged roads",
    imageUrl: getDisasterImage("Flood"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Public",
    reportedTime: '2026-10-11 17:45',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 9,
    id: 9,
    reporterName: "Responder Reporter",
    mobile: '9810000009',
    location: "Silchar, Assam",
    latitude: 24.833,
    longitude: 92.779,
    disasterType: "Flood",
    aiLabel: "Flood",
    aiConfidence: 79,
    severity: 'HIGH',
    priorityScore: 95,
    peopleAffected: 108,
    description: "Whole neighbourhood flooded, children on rooftops",
    notes: "rising water; stranded people",
    imageUrl: getDisasterImage("Flood"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Responder",
    reportedTime: '2026-10-12 15:43',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 10,
    id: 10,
    reporterName: "Public Reporter",
    mobile: '9810000010',
    location: "Mithi River Bank, Mumbai",
    latitude: 19.07,
    longitude: 72.88,
    disasterType: "Flood",
    aiLabel: "Flood",
    aiConfidence: 88,
    severity: 'HIGH',
    priorityScore: 87,
    peopleAffected: 120,
    description: "Slum area flooded at night, water still rising",
    notes: "submerged vehicles; rising water",
    imageUrl: getDisasterImage("Flood"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Public",
    reportedTime: '2026-10-13 11:19',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 11,
    id: 11,
    reporterName: "Public Reporter",
    mobile: '9810000011',
    location: "Anand Vihar, Delhi",
    latitude: 28.647,
    longitude: 77.316,
    disasterType: "Fire",
    aiLabel: "Fire",
    aiConfidence: 83,
    severity: 'HIGH',
    priorityScore: 74,
    peopleAffected: 84,
    description: "Warehouse fire, heavy black smoke",
    notes: "dense smoke; flames",
    imageUrl: getDisasterImage("Fire"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Public",
    reportedTime: '2026-10-14 18:19',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 12,
    id: 12,
    reporterName: "Responder Reporter",
    mobile: '9810000012',
    location: "Mundka Industrial Area, Delhi",
    latitude: 28.683,
    longitude: 77.027,
    disasterType: "Fire",
    aiLabel: "Fire",
    aiConfidence: 88,
    severity: 'HIGH',
    priorityScore: 90,
    peopleAffected: 96,
    description: "Factory fire with chemical drums inside",
    notes: "gas cylinders nearby; fire spreading to buildings",
    imageUrl: getDisasterImage("Fire"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Responder",
    reportedTime: '2026-10-15 19:04',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 13,
    id: 13,
    reporterName: "Public Reporter",
    mobile: '9810000013',
    location: "Sahibabad, Ghaziabad",
    latitude: 28.673,
    longitude: 77.35,
    disasterType: "Fire",
    aiLabel: "Fire",
    aiConfidence: 56,
    severity: 'MEDIUM',
    priorityScore: 41,
    peopleAffected: 48,
    description: "Small shop fire, shutters closed",
    notes: "fire spreading to buildings; dense smoke",
    imageUrl: getDisasterImage("Fire"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Public",
    reportedTime: '2026-10-16 15:26',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 14,
    id: 14,
    reporterName: "Public Reporter",
    mobile: '9810000014',
    location: "Vasundhara, Ghaziabad",
    latitude: 28.66,
    longitude: 77.37,
    disasterType: "Fire",
    aiLabel: "Fire",
    aiConfidence: 79,
    severity: 'MEDIUM',
    priorityScore: 49,
    peopleAffected: 84,
    description: "Garbage dump burning, smoke over apartments",
    notes: "flames; fire spreading to buildings",
    imageUrl: getDisasterImage("Fire"),
    status: 'REPORTED',
    verified: false,
    verificationStatus: 'PENDING',
    reportedBy: "Public",
    reportedTime: '2026-10-10 10:44',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Pending", done: false },
      { stage: 'Response dispatched', time: "Pending", done: false },
    ],
  },
  {
    incidentId: 15,
    id: 15,
    reporterName: "Public Reporter",
    mobile: '9810000015',
    location: "Bandra East, Mumbai",
    latitude: 19.06,
    longitude: 72.85,
    disasterType: "Fire",
    aiLabel: "Fire",
    aiConfidence: 85,
    severity: 'HIGH',
    priorityScore: 83,
    peopleAffected: 96,
    description: "Fire on 4th floor of residential building",
    notes: "blocked exit; gas cylinders nearby",
    imageUrl: getDisasterImage("Fire"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Public",
    reportedTime: '2026-10-11 02:53',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 16,
    id: 16,
    reporterName: "Responder Reporter",
    mobile: '9810000016',
    location: "Sector 18, Noida",
    latitude: 28.57,
    longitude: 77.32,
    disasterType: "Fire",
    aiLabel: "Fire",
    aiConfidence: 80,
    severity: 'MEDIUM',
    priorityScore: 55,
    peopleAffected: 72,
    description: "Electrical short circuit in mall food court",
    notes: "gas cylinders nearby; flames",
    imageUrl: getDisasterImage("Fire"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Responder",
    reportedTime: '2026-10-12 01:46',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 17,
    id: 17,
    reporterName: "Responder Reporter",
    mobile: '9810000017',
    location: "Jim Corbett Buffer Zone, Uttarakhand",
    latitude: 29.53,
    longitude: 78.77,
    disasterType: "Fire",
    aiLabel: "Fire",
    aiConfidence: 91,
    severity: 'HIGH',
    priorityScore: 71,
    peopleAffected: 60,
    description: "Forest fire spreading toward village",
    notes: "blocked exit; gas cylinders nearby",
    imageUrl: getDisasterImage("Fire"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Responder",
    reportedTime: '2026-10-13 09:45',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 18,
    id: 18,
    reporterName: "Public Reporter",
    mobile: '9810000018',
    location: "Surat Textile Market, Gujarat",
    latitude: 21.17,
    longitude: 72.83,
    disasterType: "Fire",
    aiLabel: "Fire",
    aiConfidence: 85,
    severity: 'HIGH',
    priorityScore: 84,
    peopleAffected: 96,
    description: "Fire in textile market, narrow lanes",
    notes: "fire spreading to buildings; flames",
    imageUrl: getDisasterImage("Fire"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Public",
    reportedTime: '2026-10-14 14:22',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 19,
    id: 19,
    reporterName: "Public Reporter",
    mobile: '9810000019',
    location: "Park Street, Kolkata",
    latitude: 22.55,
    longitude: 88.36,
    disasterType: "Fire",
    aiLabel: "Fire",
    aiConfidence: 81,
    severity: 'LOW',
    priorityScore: 25,
    peopleAffected: 36,
    description: "Smoke from restaurant kitchen, controlled",
    notes: "gas cylinders nearby; flames",
    imageUrl: getDisasterImage("Fire"),
    status: 'COMPLETED',
    verified: false,
    verificationStatus: 'PENDING',
    reportedBy: "Public",
    reportedTime: '2026-10-15 06:49',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Pending", done: false },
      { stage: 'Response dispatched', time: "Pending", done: false },
    ],
  },
  {
    incidentId: 20,
    id: 20,
    reporterName: "Public Reporter",
    mobile: '9810000020',
    location: "Whitefield, Bengaluru",
    latitude: 12.97,
    longitude: 77.75,
    disasterType: "Fire",
    aiLabel: "Fire",
    aiConfidence: 83,
    severity: 'MEDIUM',
    priorityScore: 40,
    peopleAffected: 36,
    description: "Warehouse stock burning, no one inside",
    notes: "dense smoke; gas cylinders nearby",
    imageUrl: getDisasterImage("Fire"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Public",
    reportedTime: '2026-10-16 12:58',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 21,
    id: 21,
    reporterName: "Responder Reporter",
    mobile: '9810000021',
    location: "Mustafabad, Delhi",
    latitude: 28.7,
    longitude: 77.28,
    disasterType: "Building Collapse",
    aiLabel: "Building Collapse",
    aiConfidence: 95,
    severity: 'HIGH',
    priorityScore: 95,
    peopleAffected: 108,
    description: "Four-storey building collapsed, residents trapped",
    notes: "damaged structure; exposed wiring",
    imageUrl: getDisasterImage("Building Collapse"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Responder",
    reportedTime: '2026-10-10 12:35',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 22,
    id: 22,
    reporterName: "Public Reporter",
    mobile: '9810000022',
    location: "Loni, Ghaziabad",
    latitude: 28.75,
    longitude: 77.29,
    disasterType: "Building Collapse",
    aiLabel: "Building Collapse",
    aiConfidence: 83,
    severity: 'MEDIUM',
    priorityScore: 69,
    peopleAffected: 72,
    description: "Old house wall collapsed, injuries reported",
    notes: "exposed wiring; possible trapped people",
    imageUrl: getDisasterImage("Building Collapse"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Public",
    reportedTime: '2026-10-11 22:26',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 23,
    id: 23,
    reporterName: "Public Reporter",
    mobile: '9810000023',
    location: "Raj Nagar, Ghaziabad",
    latitude: 28.678,
    longitude: 77.44,
    disasterType: "Building Collapse",
    aiLabel: "Building Collapse",
    aiConfidence: 97,
    severity: 'LOW',
    priorityScore: 32,
    peopleAffected: 60,
    description: "Cracks in building after nearby construction",
    notes: "exposed wiring; damaged structure",
    imageUrl: getDisasterImage("Building Collapse"),
    status: 'REPORTED',
    verified: false,
    verificationStatus: 'PENDING',
    reportedBy: "Public",
    reportedTime: '2026-10-12 04:05',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Pending", done: false },
      { stage: 'Response dispatched', time: "Pending", done: false },
    ],
  },
  {
    incidentId: 24,
    id: 24,
    reporterName: "Responder Reporter",
    mobile: '9810000024',
    location: "Bhiwandi, Maharashtra",
    latitude: 19.29,
    longitude: 73.06,
    disasterType: "Building Collapse",
    aiLabel: "Building Collapse",
    aiConfidence: 62,
    severity: 'HIGH',
    priorityScore: 97,
    peopleAffected: 120,
    description: "Residential building collapse at night",
    notes: "rubble; exposed wiring",
    imageUrl: getDisasterImage("Building Collapse"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Responder",
    reportedTime: '2026-10-13 18:11',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 25,
    id: 25,
    reporterName: "Public Reporter",
    mobile: '9810000025',
    location: "Lucknow Hazratganj",
    latitude: 26.85,
    longitude: 80.94,
    disasterType: "Building Collapse",
    aiLabel: "Building Collapse",
    aiConfidence: 83,
    severity: 'MEDIUM',
    priorityScore: 46,
    peopleAffected: 48,
    description: "Partial balcony collapse, area cordoned off",
    notes: "damaged structure; exposed wiring",
    imageUrl: getDisasterImage("Building Collapse"),
    status: 'COMPLETED',
    verified: false,
    verificationStatus: 'PENDING',
    reportedBy: "Public",
    reportedTime: '2026-10-14 17:23',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Pending", done: false },
      { stage: 'Response dispatched', time: "Pending", done: false },
    ],
  },
  {
    incidentId: 26,
    id: 26,
    reporterName: "Public Reporter",
    mobile: '9810000026',
    location: "Jaipur Walled City",
    latitude: 26.925,
    longitude: 75.825,
    disasterType: "Building Collapse",
    aiLabel: "Building Collapse",
    aiConfidence: 90,
    severity: 'HIGH',
    priorityScore: 77,
    peopleAffected: 72,
    description: "Old haveli roof collapsed, narrow lane blocked",
    notes: "damaged structure; rubble",
    imageUrl: getDisasterImage("Building Collapse"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Public",
    reportedTime: '2026-10-15 14:57',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 27,
    id: 27,
    reporterName: "Responder Reporter",
    mobile: '9810000027',
    location: "Dharavi, Mumbai",
    latitude: 19.04,
    longitude: 72.85,
    disasterType: "Building Collapse",
    aiLabel: "Building Collapse",
    aiConfidence: 95,
    severity: 'HIGH',
    priorityScore: 88,
    peopleAffected: 96,
    description: "Under-construction structure collapsed",
    notes: "blocked access road; exposed wiring",
    imageUrl: getDisasterImage("Building Collapse"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Responder",
    reportedTime: '2026-10-16 12:25',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 28,
    id: 28,
    reporterName: "Public Reporter",
    mobile: '9810000028',
    location: "Howrah, West Bengal",
    latitude: 22.59,
    longitude: 88.31,
    disasterType: "Building Collapse",
    aiLabel: "Building Collapse",
    aiConfidence: 85,
    severity: 'HIGH',
    priorityScore: 70,
    peopleAffected: 48,
    description: "Wall collapse after rain, one person trapped",
    notes: "exposed wiring; rubble",
    imageUrl: getDisasterImage("Building Collapse"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Public",
    reportedTime: '2026-10-10 06:04',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 29,
    id: 29,
    reporterName: "Responder Reporter",
    mobile: '9810000029',
    location: "Sector 62, Noida",
    latitude: 28.62,
    longitude: 77.37,
    disasterType: "Building Collapse",
    aiLabel: "Building Collapse",
    aiConfidence: 97,
    severity: 'MEDIUM',
    priorityScore: 57,
    peopleAffected: 60,
    description: "Scaffold and slab collapse at construction site",
    notes: "damaged structure; rubble",
    imageUrl: getDisasterImage("Building Collapse"),
    status: 'IN_PROGRESS',
    verified: true,
    verificationStatus: 'VERIFIED',
    reportedBy: "Responder",
    reportedTime: '2026-10-11 10:38',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Verified", done: true },
      { stage: 'Response dispatched', time: "Dispatched", done: true },
    ],
  },
  {
    incidentId: 30,
    id: 30,
    reporterName: "Public Reporter",
    mobile: '9810000030',
    location: "Hyderabad Old City",
    latitude: 17.36,
    longitude: 78.47,
    disasterType: "Building Collapse",
    aiLabel: "Building Collapse",
    aiConfidence: 79,
    severity: 'MEDIUM',
    priorityScore: 45,
    peopleAffected: 72,
    description: "Dilapidated building leaning, evacuated",
    notes: "rubble; damaged structure",
    imageUrl: getDisasterImage("Building Collapse"),
    status: 'REPORTED',
    verified: false,
    verificationStatus: 'PENDING',
    reportedBy: "Public",
    reportedTime: '2026-10-12 17:06',
    timeline: [
      { stage: 'Received', time: 'Received', done: true },
      { stage: 'Under verification', time: 'In progress', done: true },
      { stage: 'Verified', time: "Pending", done: false },
      { stage: 'Response dispatched', time: "Pending", done: false },
    ],
  },
];

function getStoredIncidents() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    let list;
    if (!raw) {
      list = INITIAL_INCIDENTS;
    } else {
      list = JSON.parse(raw);
    }

    // Auto-migrate stale URLs: Unsplash (broken CORS) or old SVG data URIs → local photo paths
    let modified = false;
    const cleanList = list.map((inc) => {
      const needsMigration = !inc.imageUrl ||
        (typeof inc.imageUrl === 'string' && inc.imageUrl.includes('unsplash.com')) ||
        (typeof inc.imageUrl === 'string' && inc.imageUrl.startsWith('data:image/svg'));
      if (needsMigration) {
        modified = true;
        return {
          ...inc,
          imageUrl: getDisasterImage(inc.disasterType || inc.aiLabel || 'Flood'),
        };
      }
      return inc;
    });

    if (modified || !raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanList));
    }
    return cleanList;
  } catch {
    return INITIAL_INCIDENTS;
  }
}

function saveStoredIncidents(incidents) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(incidents));
  } catch (err) {
    console.error('Failed to persist incidents to localStorage', err);
  }
}

export const incidentStore = {
  /**
   * Get all incidents, blending backend records with local rich metadata
   */
  async getAllIncidents() {
    let localList = getStoredIncidents();

    try {
      const backendList = await api.getIncidents();
      if (Array.isArray(backendList) && backendList.length > 0) {
        // Merge: only update status for incidents that already exist locally.
        // We do NOT create new phantom entries from raw backend records that
        // lack rich metadata (images, coordinates, AI labels). Incidents
        // created through the citizen form are added to local store at
        // creation time via createIncident(), so they already exist here.
        const localMap = new Map(localList.map((inc) => [String(inc.incidentId || inc.id), inc]));

        backendList.forEach((bInc) => {
          const key = String(bInc.incidentId);
          if (localMap.has(key)) {
            // Update status if changed on backend
            localMap.get(key).status = bInc.status || localMap.get(key).status;
          }
          // Skip unknown backend-only records — they would appear as
          // identical filler rows ("FLOOD / 90% / CRITICAL 78") without
          // real photos or coordinates.
        });

        localList = Array.from(localMap.values());
        saveStoredIncidents(localList);
      }
    } catch (err) {
      console.warn('Backend /api/incidents unavailable, using local store:', err.message);
    }

    return localList;
  },

  /**
   * Find incident by numeric or string ID
   */
  async getIncidentById(id) {
    const list = await this.getAllIncidents();
    const strId = String(id).replace('#', '').trim();
    return list.find((inc) => String(inc.incidentId) === strId || String(inc.id) === strId);
  },

  /**
   * Create an incident from Citizen Report or Admin caller form
   */
  async createIncident(formData) {
    let backendId = null;

    // Map severity to Spring Boot enum: LOW, MEDIUM, HIGH (backend does not have CRITICAL in Severity enum)
    let severityEnum = 'HIGH';
    const prio = formData.priorityScore || 80;
    if (prio >= 60) severityEnum = 'HIGH';
    else if (prio >= 30) severityEnum = 'MEDIUM';
    else severityEnum = 'LOW';

    // 1. Submit to Backend /api/incidents
    try {
      const backendPayload = {
        reporterName: formData.reporterName || 'Citizen Reporter',
        mobile: formData.contactPhone && /^[6-9]\d{9}$/.test(formData.contactPhone)
          ? formData.contactPhone
          : '9876543210',
        location: formData.location || 'New Delhi NCR',
        disasterType: formData.aiLabel || formData.disasterType || 'Flood',
        severity: severityEnum,
        description: formData.description || 'Emergency disaster reported.',
      };

      const backendResp = await api.createIncident(backendPayload);
      if (backendResp && (backendResp.incidentId || backendResp.id)) {
        backendId = backendResp.incidentId || backendResp.id;
      }
    } catch (err) {
      console.warn('Backend incident creation error, saving locally:', err.message);
    }

    // 2. Generate local ID if backend didn't return one
    const localList = getStoredIncidents();
    const nextId = backendId || Math.max(105, ...localList.map((i) => Number(i.incidentId || i.id) || 0)) + 1;

    const newIncident = {
      incidentId: nextId,
      id: nextId,
      reporterName: formData.reporterName || 'Citizen Reporter',
      mobile: formData.contactPhone || '9876543210',
      location: formData.location || 'New Delhi NCR',
      latitude: formData.latitude || 28.6139,
      longitude: formData.longitude || 77.2090,
      disasterType: formData.aiLabel || 'Flood',
      aiLabel: formData.aiLabel || 'Flood',
      aiConfidence: formData.aiConfidence || 92,
      severity: severityEnum,
      priorityScore: formData.priorityScore || 85,
      peopleAffected: formData.peopleAffected ? Number(formData.peopleAffected) : 25,
      description: formData.description || '',
      notes: formData.notes || '',
      imageUrl: formData.imageUrl || getDisasterImage(formData.aiLabel || 'Flood'),
      status: 'REPORTED',
      verified: false,
      verificationStatus: 'PENDING',
      reportedBy: formData.reportedBy || 'Citizen Web',
      reportedTime: new Date().toISOString(),
      timeline: [
        { stage: 'Received', time: 'Just now', done: true },
        { stage: 'Under verification', time: 'In progress', done: true },
        { stage: 'Verified', time: 'Pending', done: false },
        { stage: 'Response dispatched', time: 'Pending', done: false },
      ],
    };

    localList.unshift(newIncident);
    saveStoredIncidents(localList);

    return newIncident;
  },

  /**
   * Verify an incident in the Verification Queue
   * Calls PATCH /api/incidents/{id}/verify or fallback status update
   */
  async verifyIncident(id) {
    const strId = String(id);
    const localList = getStoredIncidents();
    const incident = localList.find((inc) => String(inc.incidentId) === strId || String(inc.id) === strId);

    if (incident) {
      incident.verified = true;
      incident.verificationStatus = 'VERIFIED';
      incident.status = 'IN_PROGRESS';
      if (incident.timeline && incident.timeline[2]) {
        incident.timeline[2].done = true;
        incident.timeline[2].time = 'Just now';
      }
      saveStoredIncidents(localList);

      // Attempt backend PATCH/PUT
      try {
        await fetch(`/api/incidents/${incident.incidentId}/verify`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (e) {
        // Backend optional route
      }
    }
    return incident;
  },

  /**
   * Reject an incident in the Verification Queue
   */
  async rejectIncident(id, reason = 'Duplicate or unverified submission') {
    const strId = String(id);
    const localList = getStoredIncidents();
    const incident = localList.find((inc) => String(inc.incidentId) === strId || String(inc.id) === strId);

    if (incident) {
      incident.verified = false;
      incident.verificationStatus = 'REJECTED';
      incident.status = 'COMPLETED';
      incident.rejectReason = reason;
      saveStoredIncidents(localList);
    }
    return incident;
  },

  /**
   * Mark mission dispatched for incident
   */
  async markDispatched(id, missionId = null) {
    const strId = String(id);
    const localList = getStoredIncidents();
    const incident = localList.find((inc) => String(inc.incidentId) === strId || String(inc.id) === strId);

    if (incident) {
      incident.status = 'IN_PROGRESS';
      if (incident.timeline && incident.timeline[3]) {
        incident.timeline[3].done = true;
        incident.timeline[3].time = 'Dispatched';
      }
      saveStoredIncidents(localList);
    }
    return incident;
  },
};
