/**
 * Disaster image resolver — returns local /public paths for each disaster type.
 * Photos are bundled in frontend/public/images/disasters/ and served from the
 * same origin, so there are zero CORS issues and zero network failures.
 */

export function getDisasterImage(category = '') {
  const norm = String(category || '').trim().toLowerCase();

  if (norm.includes('flood') || norm.includes('water') || norm.includes('rain') || norm.includes('cyclone') || norm.includes('tsunami')) {
    return '/images/disasters/flood.jpg';
  }
  if (norm.includes('fire') || norm.includes('smoke') || norm.includes('wildfire') || norm.includes('burn') || norm.includes('blaze')) {
    return '/images/disasters/fire.jpg';
  }
  if (norm.includes('collapse') || norm.includes('earthquake') || norm.includes('building') || norm.includes('structural') || norm.includes('quake') || norm.includes('rubble')) {
    return '/images/disasters/collapse.jpg';
  }
  if (norm.includes('landslide') || norm.includes('mudslide') || norm.includes('hill') || norm.includes('avalanche') || norm.includes('debris')) {
    return '/images/disasters/landslide.jpg';
  }

  // Default fallback for all other emergency types
  return '/images/disasters/emergency.jpg';
}

export const DISASTER_IMAGES = {
  FLOOD: '/images/disasters/flood.jpg',
  FIRE: '/images/disasters/fire.jpg',
  BUILDING_COLLAPSE: '/images/disasters/collapse.jpg',
  LANDSLIDE: '/images/disasters/landslide.jpg',
  EMERGENCY: '/images/disasters/emergency.jpg',
  UNKNOWN: '/images/disasters/emergency.jpg',
};
