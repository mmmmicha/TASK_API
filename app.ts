import express from 'express';
const app = express();

import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import cors from 'cors';

import helmet from 'helmet';

import winston from 'winston';
import indexRouter from './routes/index';
import tasksRouter from './routes/tasksRouter';
import tokensRouter from './routes/tokensRouter';
import { responseGen } from './biz/util';

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { CheckAuth } from './middleware/auth';
dotenv.config();

const server = async () => {
    app.use(morgan('dev'));

    console.log('attempting to connect to mongodb');
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log('connected to mongodb');

    app.use(cookieParser());
    app.use(helmet());

    app.use(
        cors({
            origin: '*',
            methods: 'DELETE, POST, GET, PATCH, PUT, OPTIONS',
        })
    );

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());

    app.use('/', indexRouter);
    app.use('/tasks', CheckAuth, tasksRouter);
    app.use('/tokens', tokensRouter);

    // catch 404 and forward to error handler
    app.get('*', async function (req, res) {
        return responseGen({
            res: res,
            payload: '404 bipbop not found',
            httpCode: 404,
            msg: 'Page not found',
        });
    });
    // error handler
    app.use(async function (err, req, res, next) {
        // set locals, only providing error in development
        res.locals.error = err;
        return responseGen({
            res: res,
            payload: err,
            httpCode: 500,
            msg: err.message,
        });
    });

    app.listen('7070', () => {
        console.info(`Listening to 7070. NODE_ENV: ${process.env.NODE_ENV}`);
        winston.info(`Listening to 7070. NODE_ENV: ${process.env.NODE_ENV}`);
    });

    if (process.env.NODE_ENV === 'production') {
        console.log = function () {};
        console.error = function () {};
    }

    return app;
};

server();

export default app;
