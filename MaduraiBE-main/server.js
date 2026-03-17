import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser from "cookie-parser";
import connectDB from "./config/mongodb.js";
import userRoutes from "./routes/User_routes.js"
import employeeRoutes from "./routes/Employee_routes.js"

import binroutes from "./bins/Bin.routes.js"
import bindailyroutes from "./bindailydata/binfullevent.route.js"
import roleRoutes from "./roles/Role.routes.js";
import EscalationRoutes from "./routes/Escalation_routes.js"
import zoneroutes from "./zone/Zone.routes.js"
import wardroutes from "./ward/Ward.routes.js"
import predictionRoutes from "./prediction/Prediction.routes.js"
import profileRoutes from "./profiles/Profile.routes.js"
import dashboardRoutes from "./dashboard/Dashboard.routes.js"
import "./jobs/bin.health.job.js";
import { startLiveMonitor } from "./bins/Bin.service.js";






const app = express();
const port = process.env.port || 5000;

connectDB();


app.use(cors(
  
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

startLiveMonitor();
app.use("/bins",binroutes)
app.use("/binfullevents",bindailyroutes)
app.use("/user", userRoutes)
app.use("/roles", roleRoutes);
app.use("/zone",zoneroutes)
app.use("/ward",wardroutes)
app.use("/employee", employeeRoutes);
app.use("/escalation",EscalationRoutes)
app.use("/predictionss",predictionRoutes)
app.use("/profile",profileRoutes)
app.use("/dashboard",dashboardRoutes)






 app.get('/', (req, res) => {
   res.send("Api is running");
 })



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});