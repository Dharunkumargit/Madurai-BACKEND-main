import * as ProfileService from "../profiles/Profile.service.js";

/* ================= UPDATE PROFILE ================= */
export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await ProfileService.updateUserProfile(id, req.body);

    return res.status(200).json({
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Profile update failed",
    });
  }
};