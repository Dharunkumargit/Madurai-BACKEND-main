import EscalationService from '../Service/Escalation_service.js';
import * as BinService from '../bins/Bin.service.js';

export const updateBinFillLevel = async (req, res) => {
  try {
    const { binId, fillLevel } = req.body;
    
    // Update bin fill level
    const bin = await BinService.updateFillLevel(binId, fillLevel);
    
    // Check escalation if >= 75%
    if (fillLevel >= 75) {
      const roles = await EscalationService.processBinEscalation(binId);
      return res.json({
        success: true,
        bin,
        escalatedTo: roles,
        message: `${roles.length} roles notified`
      });
    }
    
    res.json({ success: true, bin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEscalationDashboard = async (req, res) => {
  try {
    const criticalBins = await BinService.getCriticalBins(); // >=75%
    const escalatedBins = await BinService.getEscalatedBins(); // L1-L4
    res.json({
      success: true,
      criticalBins,
      escalatedBins,
      totalAlerts: criticalBins.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const acknowledgeEscalation = async (req, res) => {
  try {
    const { binId, role } = req.body;
    const bin = await Bin.findByIdAndUpdate(
      binId,
      { 
        $pull: { 'escalation.notifiedRoles': role },
        acknowledgedBy: role,
        acknowledgedAt: new Date()
      },
      { new: true }
    );
    res.json({ success: true, bin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
