import cron from "node-cron";
// import { syncOutsourceBins } from "../bins/Bin.service.js";

// cron.schedule("*/5 * * * *", async () => {
//   console.log("Syncing outsource bin data...");
//   await syncOutsourceBins();
// });

// import { saveEndOfDayData } from "../bins/Bin.service.js";

// cron.schedule("59 23 * * *", () => {
//   saveEndOfDayData();
//    console.log("Syncing daily bin data...");
// });


import EscalationService from '../Service/Escalation_service.js';
import Bin from '../bins/Bin.schema.js';




// 🔥 START CRON - Every 1 minute
cron.schedule('* * * * *', async () => {
  console.log('🔍 [CRON] Checking escalation...');
  
  const criticalBins = await Bin.find({ 
    filled: { $gte: 75 } 
  });
  
  console.log(`📊 ${criticalBins.length} bins >= 75%`);
  
  for (const bin of criticalBins) {
    const roles = await EscalationService.processBinEscalation(bin._id);
    if (roles.length > 0) {
      console.log(`🚨 ${bin.binid}: ${roles.join(', ')}`);
    }
  }
});

console.log('✅ Escalation Cron Started!');

// Every 30 seconds for testing