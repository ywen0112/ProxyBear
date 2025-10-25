const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const creditRoutes = require('./routes/creditRoutes');
const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const resellRoutes = require('./routes/resellRoutes');
const pricingRoutes = require('./routes/pricingRoute');
const transactionRoutes = require('./routes/transactionRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions)); 
app.use(
  express.json({
    limit: "50mb",
  })
);
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/credits', creditRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/purchase', resellRoutes);
app.use("/api/pricing", pricingRoutes);
app.use('/api/transactions', transactionRoutes);


const PORT = process.env.PORT || 8210;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));