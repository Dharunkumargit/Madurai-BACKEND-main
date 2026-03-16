import Profile from "../profiles/Profile.schema.js";

export const updateUserProfile = async (userId, data) => {
    const updatedUser = await Profile.findByIdAndUpdate(
      userId,
      {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        
      },
      {
        new: true,          // updated data return
        runValidators: true // schema validation
      }
    ).select("-password"); // password send panna vendam
  
    if (!updatedUser) {
      throw new Error("User not found");
    }
  
    return updatedUser;
  };