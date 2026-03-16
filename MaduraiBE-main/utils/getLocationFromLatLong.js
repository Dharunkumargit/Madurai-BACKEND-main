import opencage from "opencage-api-client";
import dotenv from "dotenv";

dotenv.config();

export const getLocationFromLatLong = async (lat, lon) => {
  try {
    const response = await opencage.geocode({
      q: `${lat},${lon}`,
      key: process.env.OPENCAGE_API_KEY,
      language: "en",
      pretty: 1,
      no_annotations: 1,
    });

    if (!response || !response.results || response.results.length === 0) {
      return "Unknown, Unknown";
    }

    const data = response.results[0].components;

    // Extract village
    

    

    // Extract state 
    
    const state =
      data.state ||
      
      "Unknown";

    return ` ${state}`;
  } catch (error) {
    console.error("OpenCage Error:", error.message);
    return "Unknown, Unknown, Unknown";
  }
};