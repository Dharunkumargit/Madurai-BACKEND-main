export const ESCALATION_RULES = {
  FILL_THRESHOLDS: {
    75: ['Sanitary Inspector', 'Ward Supervisor'],  // ✅ CHANGED
    90: ['Sanitary Inspector', 'Ward Supervisor'],  // ✅ CHANGED
    100: ['Sanitary Officer']                       // ✅ CHANGED
  },
  TIME_ESCALATION: [
    { minutes: 61, role: 'ACHO', secondaryRole: 'Our Land Head', level: 'L1' },           // ✅ CHANGED: 61 mins
    { minutes: 121, role: 'CHO', secondaryRole: 'Our Land Zonal Manager', level: 'L2' }, // ✅ CHANGED: 121 mins
    { minutes: 300, role: 'Deputy Commissioner', secondaryRole: 'Chief Engineer', level: 'L3' }, // ✅ CHANGED: 300 mins
    { minutes: 900, role: 'Commissioner', level: 'L4' }  // ✅ CHANGED: 900 mins
  ]
};
