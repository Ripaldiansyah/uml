import { buildActivities } from './activities.mjs';
import { rulesAndUsers } from './activity-admin.mjs';
export function allActivities() { return [...buildActivities(), ...rulesAndUsers()]; }
