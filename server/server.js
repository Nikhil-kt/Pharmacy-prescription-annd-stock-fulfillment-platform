const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Required routes (declared only once)
const adminRoutes = require("./routes/adminRoutes.js");
const customerRoutes = require("./routes/customerRoutes.js");
const deliveryRoutes = require("./routes/deliveryRoutes.js");
const prescriptionRoutes = require("./routes/prescriptionRoutes.js");

// Route middleware mapping
app.use("/api/admin", adminRoutes);
app.use("/api/customer", customerRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/prescriptions", prescriptionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});