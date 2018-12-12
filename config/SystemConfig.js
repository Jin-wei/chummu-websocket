var loggerConfig = {
    level : 'DEBUG',
    config : {
        appenders: [
            { type: 'console' },
            {
                "type": "file",
                "filename": "../ws-websocket.log",
                "maxLogSize": 2048000,
            "backups": 10
            }
        ]
    }
};

module.exports = {
    loggerConfig : loggerConfig
}