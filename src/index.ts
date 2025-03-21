import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser"; 
// import { connectDB } from "./config/db";
// import authRoutes from "./routes/authRoute";
// import todoRoutes from "./routes/todoRoute";

dotenv.config();
// connectDB();

const app = express();
app.use(express.json());
app.use(helmet());
app.use(cookieParser()); 

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
}));


// app.use("/api/auth", authRoutes);
// app.use("/api/todos", todoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));