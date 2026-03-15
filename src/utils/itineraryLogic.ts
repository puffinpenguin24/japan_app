// src/utils/itineraryLogic.ts

export interface TravelConstraints {
    duration: 5 | 10;
    travelerType: 'family_young_kids' | 'family_teenagers' | 'friends_couples';
    season: 'summer' | 'winter';
  }
  
  /**
   * Logic Gates for Japan-Go!
   * Ensures geographic and persona-based feasibility.
   */
  export const validateItineraryLogic = (constraints: TravelConstraints, selectedPOIs: any[]) => {
    const issues: string[] = [];
  
    // 1. Geographic Gate: The "Bullet Train" Rule
    // If trip is 5 days and "Slow Travel" (families with kids), restrict to 1 major region.
    const regions = new Set(selectedPOIs.map(poi => poi.region));
    if (constraints.duration === 5 && constraints.travelerType === 'family_young_kids') {
      if (regions.size > 1) {
        issues.push("Geographic Alert: For 5-day family trips, we recommend staying within one region (e.g., just Kanto) to avoid travel fatigue.");
      }
    }
  
    // 2. Accessibility Gate: The "Elevator" Rule
    if (constraints.travelerType === 'family_young_kids') {
      const inaccessibleSpots = selectedPOIs.filter(poi => poi.accessibility === 'low');
      if (inaccessibleSpots.length > 0) {
        issues.push(`Accessibility Alert: ${inaccessibleSpots.length} locations involve heavy stairs (temples/shrines) which may be difficult with strollers.`);
      }
    }
  
    // 3. Seasonal Gate: The "Heat/Cold" Rule
    if (constraints.season === 'summer') {
      const outdoorHeavy = selectedPOIs.filter(poi => poi.type === 'hiking');
      if (outdoorHeavy.length > 2) {
        issues.push("Weather Alert: High volume of outdoor activities. Japan's summer heat requires more indoor breaks.");
      }
    }
  
    return {
      isValid: issues.length === 0,
      warnings: issues
    };
  };