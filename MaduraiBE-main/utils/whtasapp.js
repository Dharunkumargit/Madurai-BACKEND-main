import axios from "axios";
import { KWIC_API_KEY, KWIC_URL } from "../config/constants.js";

export const sendWhatsAppAlert = async ({
  imageUrl,
  mobile,
  location,
  ward,
  zone,
  fill,
}) => {
  try {
    if (!mobile) {
      console.log("❌ No mobile number provided");
      return false;
    }

    const cleanMobile = mobile.toString().replace(/\D/g, "");

    if (!/^91\d{10}$/.test(cleanMobile)) {
      console.log("❌ Invalid Indian mobile format:", cleanMobile);
      return false;
    }

    console.log("📡 Sending WhatsApp to:", cleanMobile);

    const response = await axios.post(
      `${KWIC_URL}?api_key=${KWIC_API_KEY}`,
      {
        mobile_number: cleanMobile,
        template_id: "bin_alert",
        // header_image_url: imageUrl,
        variable: {
          location_name: location || "Unknown",
          ward_number: ward || "N/A",
          zone_number: zone || "N/A",
          fill_percentage: fill || "100",
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 15000,
      }
    );

    console.log("📨 KWIC RESPONSE:", response.data);

    if (response.data?.status === "success") {
      console.log("✅ WhatsApp Sent Successfully");
      return true;
    } else {
      console.log("⚠️ WhatsApp Failed:", response.data);
      return false;
    }
  } catch (error) {
    console.error("❌ WhatsApp API ERROR");
    console.error("Status:", error.response?.status);
    console.error("Data:", error.response?.data);
    console.error("Message:", error.message);
    return false;
  }
};