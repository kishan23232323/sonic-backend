import connectDB from "./config/dB.js";
import dotenv from "dotenv";
import app from "./app.js";
import http from "http";
dotenv.config({
  path: "./.env",
})

connectDB()
.then(()=>{
    const port = process.env.PORT || 6000
    const server = http.createServer(app); // Create HTTP server & attach Express app
    server.listen(port,()=>{
      console.log("server is started and running at port",port)
    })
})
.catch((err)=>{
  console.log("MongoDB Connection failed!!!",err)
})