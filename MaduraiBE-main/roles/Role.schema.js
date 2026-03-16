import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    role_id: {
      type: String,
      
    },

    role_name: {
      type: String,
      required: true,
      
    },

    accessLevels: [
      {
        feature: {
          type: String,
          required: true,
        },
        permissions: {
          type: [String],
          required: true,
        },
      },
    ],

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },

    created_by_user: {
      type: String,
    
    },
  },
  { timestamps: true }
);

const RoleModel = mongoose.model("Role", roleSchema);
export default RoleModel;