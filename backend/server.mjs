import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDb } from './config/mongoDb.mjs';
import authRouter from './routes/auth-routes.mjs';
import licenseRouter from './routes/license-routes.mjs';
import verificationRouter from './routes/verification-routes.mjs';
import notificationRouter from './routes/notification-routes.mjs';
import { errorHandler } from './middleware/errorHandler.mjs';
import requestsRouter from './routes/request-routes.mjs';
import greenCardRouter from './routes/greenCard-routes.mjs';
import gcVerificationRouter from './routes/gcVerification-routes.mjs';
import gcNotificationRouter from './routes/gcNotification-routes.mjs';
import userInfoRouter from './routes/userInfo-routes.mjs';

dotenv.config();

connectDb();

const app = express();

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cors());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user-info', userInfoRouter);
app.use('/api/v1/licenses', licenseRouter);
app.use('/api/v1/verify', verificationRouter);
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/requests', requestsRouter);
app.use('/api/v1/green-card', greenCardRouter);
app.use('/api/v1/gc-verification', gcVerificationRouter);
app.use('/api/v1/gc-notifications', gcNotificationRouter);

app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, '0.0.0.0', () =>
	console.log(`Server is running on port: ${PORT}`)
);
