import type { TravelPlan } from './types';

const TRAVEL_PLANS_KEY = 'roamReadyTravelPlans';

export function getSavedTravelPlans(): TravelPlan[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const savedPlans = localStorage.getItem(TRAVEL_PLANS_KEY);
  return savedPlans ? JSON.parse(savedPlans) : [];
}

export function saveTravelPlan(plan: TravelPlan): TravelPlan[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const plans = getSavedTravelPlans();
  const existingPlanIndex = plans.findIndex(p => p.id === plan.id);
  if (existingPlanIndex > -1) {
    plans[existingPlanIndex] = plan;
  } else {
    plans.push(plan);
  }
  localStorage.setItem(TRAVEL_PLANS_KEY, JSON.stringify(plans));
  return plans;
}

export function getTravelPlanById(id: string): TravelPlan | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const plans = getSavedTravelPlans();
  return plans.find(p => p.id === id);
}

export function deleteTravelPlan(id: string): TravelPlan[] {
  if (typeof window === 'undefined') {
    return [];
  }
  let plans = getSavedTravelPlans();
  plans = plans.filter(p => p.id !== id);
  localStorage.setItem(TRAVEL_PLANS_KEY, JSON.stringify(plans));
  return plans;
}
