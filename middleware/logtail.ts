import { Logtail } from '@logtail/node';
import winston from 'winston';
import { LogtailTransport } from '@logtail/winston';
import expressWinston from 'express-winston';

const logtail = new Logtail('3uBzPqUTMThjMxT5sqyR277E');

winston.configure({
    transports: [new LogtailTransport(logtail)],
    // meta: true, // optional: control whether you want to log the meta data about the request (default to true)
});

const dynamicLogMeta = (req, res) => {
    // req.headers['user-agent'] = req.headers['user-agent'] || req.headers['user-agent'];
    const metaData = {} as any;
    const httpRequest = {} as any;
    const httpResponse = {} as any;
    if (req) {
        metaData.httpRequest = httpRequest;
        httpRequest.requestMethod = req.method;
        httpRequest.requestUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        httpRequest.protocol = `HTTP/${req.httpVersion}`;
        // httpRequest.remoteIp = req.ip // this includes both ipv6 and ipv4 addresses separated by ':'
        httpRequest.remoteIp =
        req.ip.indexOf(':') >= 0
            ? req.ip.substring(req.ip.lastIndexOf(':') + 1)
            : req.ip; // just ipv4

        // remove privateKey from log
        httpRequest.body = req.body;
        httpRequest.query = req.query;
        httpRequest.params = req.params;
        httpRequest.requestSize = req.socket.bytesRead;
    }
    if (res) {
        metaData.httpResponse = httpResponse;
        if (res.statusCode !== 200) {
            metaData.httpResponse.error = {
                message: res.statusMessage,
                body: res.body,
            };
        }
        httpResponse.status = res.statusCode;
        httpResponse.latency = {
            seconds: Math.floor(res.responseTime / 1000),
            nanos: (res.responseTime % 1000) * 1000000,
        };
    }
    return metaData;
};

export const requestLogger = expressWinston.logger({
    transports: [new LogtailTransport(logtail)],
    format: winston.format.combine(winston.format.colorize(), winston.format.json()),
    meta: true,
    ignoredRoutes: ['/health-check'],
    msg: 'HTTP {{req.method}} {{req.url}}',
    expressFormat: true,
    colorize: false,    
    requestField: null,
    responseField: null,
    dynamicMeta: dynamicLogMeta,
})

export const errorLogger = expressWinston.errorLogger({
    transports: [new LogtailTransport(logtail)],
    format: winston.format.combine(winston.format.colorize(), winston.format.json()),
    dynamicMeta: dynamicLogMeta,
});