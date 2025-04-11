import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRouter from './routes/AuthRoutes.js';
import contactsRoutes from './routes/ContactsRoutes.js';
import setupSocket from './socket.js';
import messageRoutes from './routes/MessagesRoutes.js';
import channelRoutes from './routes/ChannelRoutes.js';


const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

app.use(
  cors({
    origin: [
      process.env.ORIGIN,
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);


app.use(cookieParser());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/contacts', contactsRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/channel', channelRoutes);

await mongoose.connect(databaseURL).then(() => {console.log('Connected to MongoDB');}).catch((err) => console.log('error occurred while connecting to mongodb ' + err ));
const server = app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});

setupSocket(server)