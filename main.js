var getopt = require('posix-getopt');
var bwServer = require('./server.js');
var serverLogger = require('./util/ServerLogger.js');
var logger = serverLogger.createLogger('main.js');
var WebSocketServer = require("ws").Server;
var sockets=require('./socket/Sockets.js');

function parseOptions() {
    var option;
    var opts = {}
    var parser = new getopt.BasicParser('hvd:p:u:z:', process.argv);

    while ((option = parser.getopt()) !== undefined) {
        switch (option.option) {
            case 'd':
                opts.directory = path.normalize(option.optarg);
                break;

            case 'h':
                usage();
                break;

            case 'p':
                opts.port = parseInt(option.optarg, 10);
                break;

            case 'u':
                opts.user = option.optarg;
                break;

            case 'z':
                opts.password = option.optarg;
                break;

            default:
                usage('invalid option: ' + option.option);
                break;
        }
    }

    return (opts);
}

function usage(msg) {
    if (msg)
        console.error(msg);

    var str = 'usage: ' +
        NAME +
        ' [-v] [-d dir] [-p port] [-u user] [-z password]';
    console.error(str);
    process.exit(msg ? 1 : 0);
}

(function main() {
    var options = parseOptions();
    var server = bwServer.createServer();

    // At last, let's rock and roll
    server.listen((options.port || 3000), function onListening() {
        logger.info('listening at %s', server.url);
    });

    //web sorcket
    //todo add authentication later
    var wss = new WebSocketServer({server:  server.server});
    wss.on('connection', function connection(ws,req) {
        var qr = req.url.indexOf("/qr/");
        if(qr == -1){
            sockets.addSocketOrder(ws,req);
        }else{
            sockets.addSocketTable(ws,req);
        }

        ws.on('close', function incoming(message) {
            var qr = req.url.indexOf("/qr/");
            if(qr == -1){
                sockets.removeSocketOrder(ws,req);
            }else{
                sockets.removeSocketTable(ws,req);
            }
        });
    });
})();
