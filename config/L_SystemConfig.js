var loggerConfig = {
    level : '@@logLevel',
    config : {
        appenders: [
            { type: 'console' },
            {
                "type": "file",
                "filename": "@@logFileFullName",
                "maxLogSize": @@logMaxSize,
            "backups": @@logBackups
            }
        ]
    }
};

module.exports = {
    loggerConfig : loggerConfig
}