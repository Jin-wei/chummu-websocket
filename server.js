var restify = require('restify');
var serverLogger = require('./util/ServerLogger.js');
var sockets=require('./socket/Sockets.js');

///--- API

/**
 * Returns a server with all routes defined on it
 */
function createServer() {
    // Create a server with our logger and custom formatter
    // Note that 'version' means all routes will default to
    // 1.0.0
    var server = restify.createServer({
        name: 'bwwebsocket',
        version: '1.0.0'
    });

    // Ensure we don't drop data on uploads
    //server.pre(restify.pre.pause());

    // Clean up sloppy paths like //todo//////1//
    server.pre(restify.pre.sanitizePath());

    // Handles annoying user agents (curl)
    server.pre(restify.pre.userAgentConnection());


    // Allow 50 requests/second by IP, and burst to 100
    server.use(restify.throttle({
        burst: 100,
        rate: 50,
        ip: true
    }));


    restify.CORS.ALLOW_HEADERS.push('auth-token');
    restify.CORS.ALLOW_HEADERS.push('client-id');
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Origin");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Credentials");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "GET");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "POST");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "PUT");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Methods", "DELETE");
    restify.CORS.ALLOW_HEADERS.push("Access-Control-Allow-Headers", "accept,api-version, content-length, content-md5,x-requested-with,content-type, date, request-id, response-time");
    server.use(restify.CORS());
    server.use(restify.acceptParser(server.acceptable));
    server.use(restify.dateParser());
    server.use(restify.authorizationParser());
    server.use(restify.queryParser());
    server.use(restify.gzipResponse());
    server.use(restify.fullResponse());

    server.get('/newOrder/biz/:bizId',sockets.onNewOrder);
    server.get('/callOut/biz/:bizId/audio/:audio',sockets.callOut);
    server.get('/completeOrder/biz/:bizId/qr/:qr/openIdParty/:openIdParty',sockets.completeOrder);
    server.get('/changeDish/biz/:bizId/qr/:qr',sockets.changeDish);
    //server.on('after', apiUtil.save);
    return (server);
}

///--- Exports

module.exports = {
    createServer: createServer
};