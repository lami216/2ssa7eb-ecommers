import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

import authRoutes from "./routes/auth.route.js";
import productRoutes from "./routes/product.route.js";
import cartRoutes from "./routes/cart.route.js";
import couponRoutes from "./routes/coupon.route.js";
import paymentRoutes from "./routes/payment.route.js";
import analyticsRoutes from "./routes/analytics.route.js";
import categoryRoutes from "./routes/category.route.js";
import publicConfigRoutes from "./routes/publicConfig.route.js";
import orderRoutes from "./routes/order.route.js";
import serviceRoutes from "./routes/service.route.js";
import adminServiceRoutes from "./routes/admin.service.route.js";
import adminLeadRoutes from "./routes/admin.lead.route.js";
import paypalRoutes from "./routes/paypal.route.js";
import leadRoutes from "./routes/lead.route.js";

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 100,
	standardHeaders: true,
	legacyHeaders: false,
});

app.use("/api", limiter);


app.use(express.json({ limit: "10mb" })); // parse JSON body
app.use(express.urlencoded({ limit: "10mb", extended: true })); // parse URL-encoded (نماذج)
app.use(cookieParser());

/* ----------------- API Routes ----------------- */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/public-config", publicConfigRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/admin", adminServiceRoutes);
app.use("/api/admin", adminLeadRoutes);
app.use("/api/paypal", paypalRoutes);
app.use("/api/leads", leadRoutes);

/* ----------------- Production static -----------------
   كان يتم بناء المسار كـ "/var/www/shop1/backend/frontend/dist"
   والصحيح من داخل backend: "../frontend/dist"
------------------------------------------------------- */
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../frontend/dist");

  app.use(express.static(distPath));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log("Server is running on http://localhost:" + PORT);
  connectDB();
});
