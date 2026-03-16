import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    user_id: { type: String,  },
    emp_id: { type: String  },
    role_id: { type: String  },
    name: { type: String, required: true },
    zone: { type: String  },
    ward: { type: String },
    designation: { type: String  },
    phonenumber: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },

    password: { type: String, required: true }, 

    role: { type: String, required: true },

    status: { type: String, default: "Active" },
    createdby: { type: String, default: "Admin" },
    
    },
    { timestamps: true }
    );

const User = mongoose.model("User", userSchema);
export default User;


