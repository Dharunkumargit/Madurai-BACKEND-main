// services/escalationService.js
import Bin from "../bins/Bin.schema.js";
import Employee from "../models/Employee_Schema.js";
import { sendWhatsAppAlert } from "../utils/whtasapp.js";
import { ROLE_CONTACTS } from "../config/constants.js";
import { ESCALATION_RULES } from "../constants/config/escalationConfig.js";  // 🔥 NEW: Import config

class EscalationService {
   static async processBinEscalation(binId) {
  const bin = await Bin.findById(binId);
  if (!bin) return [];
  
  // 🔥 NEW: Skip inactive bins
  if (bin.status === "Inactive") {
    return [];
  }

  const rolesTriggered = [];

  // 🔥 NEW: Use ESCALATION_RULES config for time-based escalation
  const levels = ESCALATION_RULES.TIME_ESCALATION.map(rule => ({
    level: rule.level,
    after: rule.minutes,
    role: rule.role,
    secondaryRole: rule.secondaryRole
  }));

  const minutesAt100 = bin.lastFullAt
    ? (new Date() - new Date(bin.lastFullAt)) / (1000 * 60)
    : 0;

  for (const rule of levels) {
    if (minutesAt100 >= rule.after) {
      if (!bin.escalations?.some(e => e.level === rule.level)) {

        // Save escalation
        bin.escalations = bin.escalations || [];
        bin.escalations.push({
          level: rule.level,
          time: new Date(),
        });

        // Send WhatsApp to both primary and secondary roles
        const roles = [rule.role];
        if (rule.secondaryRole) roles.push(rule.secondaryRole);

        for (const roleName of roles) {
          const contacts = ROLE_CONTACTS[roleName] || [];

          for (const number of contacts) {
            await sendWhatsAppAlert({
              mobile: number,
              location: bin.location,
              ward: bin.ward,
              zone: bin.zone,
              fill: bin.filled,
            });
          }

          rolesTriggered.push(roleName);
        }
      }
    }
  }

  await bin.save();
  return rolesTriggered;
}

  // ===============================
  // TIME ESCALATION HANDLER
  // ===============================
  static async handleTimeEscalation(
    bin,
    minutes,
    level,
    threshold,
    role
  ) {
    if (
      minutes >= threshold &&
      !bin.escalation.timeEscalations.some((e) => e.level === level)
    ) {
      await this.notify(role, ROLE_CONTACTS[role], bin);

      bin.escalation.timeEscalations.push({
        level,
        role,
        minutes,
        time: new Date(),
      });

      bin.escalation.status = level;
      console.log(`🚨 ${bin.binid} escalated to ${role}`);
    }
  }

  // ===============================
  // NOTIFY METHOD
  // ===============================
  static async notify(role, phones, bin) {
  if (!phones) {
    console.log(`❌ No phone for ${role}`);
    return;
  }

  // Always convert to array
  const phoneList = Array.isArray(phones) ? phones : [phones];

  for (const phone of phoneList) {
    try {
      const cleanPhone = phone.toString().replace(/\D/g, "");

      console.log(`📤 Sending alert to ${role}: ${cleanPhone}`);

      const result = await sendWhatsAppAlert({
        mobile: cleanPhone,
        location: bin.location || "Unknown",
        ward: bin.ward?.toString() || "0",
        zone: bin.zone?.toString() || "0",
        fill: bin.filled?.toString(),
      });

      console.log(`✅ WhatsApp Success → ${cleanPhone}`, result);
    } catch (err) {
      console.error(`❌ Failed for ${phone}`, err.message);
    }
  }
}

static async getRoleEscalations(role) {
  const now = new Date();

  // 🔥 FIX: Skip INACTIVE bins - they should not be escalated
  const bins = await Bin.find({ 
    filled: { $gte: 100 },
    status: { $ne: "Inactive" }  // 🔥 NEW: Exclude inactive bins
  })
    .select("binid filled zone ward status escalation lastFullAt location mobile updatedAt history")
    .sort({ lastFullAt: -1 });

  const levelsOrder = ["L4", "L3", "L2", "L1"];

  const validBins = bins.filter(bin => {
    const timeEsc = bin.escalation?.timeEscalations || [];
    return timeEsc.length > 0;
  });

  const transformed = [];

  for (const bin of validBins) {
    const timeEsc = bin.escalation?.timeEscalations || [];

    let highestLevel = "Wait for escalation";
    for (const lvl of levelsOrder) {
      if (timeEsc.some((e) => e.level === lvl)) {
        highestLevel = lvl;
        break;
      }
    }

    const minutesAt100 = bin.lastFullAt
      ? Math.floor((now - new Date(bin.lastFullAt)) / (1000 * 60))
      : 0;

    // 🔥 FIX: Get last 5 images from history (newest first)
    // Filter out null, undefined, and empty strings
    const historyImages = (bin.history || [])
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map(h => h.image_url)
      .filter(img => img && typeof img === 'string' && img.trim() !== '');

    transformed.push({
      binid: bin.binid,
      location: bin.location || `${bin.zone} / ${bin.ward}`,
      zone: bin.zone,
      ward: bin.ward,
      filled: bin.filled,
      currentLevel: highestLevel,
      minutesAt100,
      lastUpdated: bin.updatedAt || bin.lastFullAt,  // 🔥 Last updated time
      lastPhoto: bin.history?.[0]?.image_url,        // 🔥 Latest photo
      historyImages: historyImages,                   // 🔥 FIX: All images from history
      escalations: timeEsc,
    });
  }

  return {
    role,
    total: transformed.length,
    bins: transformed,
    timestamp: now,
  };
}

}

export default EscalationService;