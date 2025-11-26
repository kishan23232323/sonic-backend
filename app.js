import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/error.middleware.js";
import userRouter from "./routes/user.router.js";

const app = express();
app.use(cors({
    origin: `${process.env.CLIENT_URL}` || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json({limit : "16kb"}));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("Public"));
app.use(cookieParser());

app.use("/api/v1/users",userRouter);
// app.use(errorMiddleware);
export default app;