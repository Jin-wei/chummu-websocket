var serverLogger = require('../util/ServerLogger.js');
var logger = serverLogger.createLogger('Sockets.js');
var listOfValue = require('../util/ListOfValue.js');
//store all connections
var socketsOrder={};
var socketsTable={};

function addSocketOrder(ws,req){
    var oldws;
    var params = getParams(req);
    var bizId = params.bizId;
    var uid=params.userId;
    if (bizId !=null && uid !=null){
        logger.info("get connection from bizId:"+bizId+" from user id:"+uid);
        if (socketsOrder[bizId] !=null){
            oldws=socketsOrder[bizId][uid];
            if (oldws!=null && oldws.isAlive === true) {
                oldws.terminate();
            }
        }else{
            socketsOrder[bizId]={};
        }
        socketsOrder[bizId][uid]=ws;
        console.log(socketsOrder)

    }else{
        logger.error("get invalid connection from bizId:"+bizId +" and user Id:" + uid);
    }
}
function onNewOrder(req, res, next){
    var params=req.params;
    var bizId=params.bizId,bizUsers,ws;
    if (bizId !=null){
        logger.debug("on new order: "+bizId);
        bizUsers=socketsOrder[bizId];
        if (bizUsers !=null){
            for(var id in bizUsers) {
                if (bizUsers.hasOwnProperty(id)){
                    ws= bizUsers[id];
                    if (ws!=null){
                        if (ws.isAlive === false) {
                            ws.terminate();
                            delete socketsOrder[bizId][id];
                        }else{
                            logger.debug("notify new order to user: "+id);
                            ws.send(JSON.stringify({status:listOfValue.NEW_ORDER}));
                        }
                    }
                }
            }
        }
    }
    res.send(200);
    return next();
}
function callOut(req, res, next){
    var params=req.params;
    var bizId=params.bizId;
    var bizUsers,ws;

    if (bizId !=null){
        logger.debug("on new order: "+bizId);
        bizUsers=socketsOrder[bizId];
        if (bizUsers !=null){
            for(var id in bizUsers) {
                if (bizUsers.hasOwnProperty(id)){
                    ws= bizUsers[id];
                    if (ws!=null){
                        if (ws.isAlive === false) {
                            ws.terminate();
                            delete socketsOrder[bizId][id];
                        }else{
                            logger.debug("notify new order to user: "+id);

                            var audio = JSON.parse(params.audio);
                            var sendParams = {
                                status:listOfValue.CALL_OUT,
                                "audioStream": 'data:audio/wav;base64,' + new Buffer(audio.data).toString('base64')
                            };
                            ws.send(JSON.stringify(sendParams));
                        }
                    }
                }
            }
        }
    }
    res.send(200);
    return next();
}
function removeSocketOrder(ws,req){
    var params = getParams(req);
    var bizId = params.bizId;
    var uid=params.userId;
    if (bizId !=null){
        logger.info("close connection from bizId:"+bizId+" from user id:"+uid);
        if (socketsOrder[bizId] !=null){
            delete socketsOrder[bizId][uid];
        }
    }else{
        logger.error("get invalid closing from bizId:"+bizId+" from user id:"+uid);
    }
}

function addSocketTable(ws,req){
    var oldws;
    var params = getParams(req);
    var bizId = params.bizId;
    var qr = params.qr;
    var openId = params.openId;

    if (bizId != null && qr != null && openId != null){
        logger.info("get connection from bizId:" + bizId + " and qr:" + qr + ' and openId:' + openId);
        if (socketsTable[bizId] != null && socketsTable[bizId][qr] != null){
            oldws = socketsTable[bizId][qr][openId];
            if (oldws!=null && oldws.isAlive === true) {
                oldws.terminate();
            }
        }else{
            socketsTable[bizId]={};
            socketsTable[bizId][qr]={};
        }
        socketsTable[bizId][qr][openId] = ws;
        console.log(socketsTable)
    }else{
        logger.error("get invalid connection from bizId:"+bizId + ' and qr:' + qr + ' and openId:' + openId);
    }
}
function completeOrder(req,res,next){
    var params=req.params;
    var bizId = params.bizId;
    var qr = params.qr;
    var openIdParty = params.openIdParty;
    var tableOpenId,ws;

    if (bizId != null && qr != null){
        tableOpenId = socketsTable[bizId][qr];//获取当前桌台的每个人
        if (tableOpenId !=null){
            for(var openId in tableOpenId) {
                if (tableOpenId.hasOwnProperty(openId)){
                    ws = tableOpenId[openId];//获取连接
                    if (ws != null){
                        if (ws.isAlive === false) {
                            ws.terminate();
                            delete socketsTable[bizId][qr][openId];
                        }else{
                            ws.send(JSON.stringify({
                                status:listOfValue.ORDER_DISH,
                                openId: openIdParty
                            }));//发送
                        }
                    }
                }
            }
        }
    }
    res.send(200);
    return next();
}
function removeSocketTable(ws,req){
    var params = getParams(req);
    var bizId= params.bizId;
    var qr = params.qr;
    var openId = params.openId;

    if (bizId !=null){
        if (socketsTable[bizId] !=null){
            if(socketsTable[bizId][qr] !=null){
                delete socketsTable[bizId][qr][openId];
            }
        }
    }else{
        logger.error("get invalid closing from bizId:" + bizId + " and qr:" + qr);
    }
}
function changeDish(req,res,next){
    var params=req.params;
    var bizId = params.bizId;
    var qr = params.qr;
    var tableOpenId,ws;

    if (bizId != null && qr != null){
        tableOpenId = socketsTable[bizId][qr];//获取当前桌台的每个人
        if (tableOpenId !=null){
            for(var openId in tableOpenId) {
                if (tableOpenId.hasOwnProperty(openId)){
                    ws = tableOpenId[openId];//获取连接
                    if (ws != null){
                        if (ws.isAlive === false) {
                            ws.terminate();
                            delete socketsTable[bizId][qr][openId];
                        }else{
                            ws.send(JSON.stringify({status:listOfValue.CHANGE_DISH}));//发送
                        }
                    }
                }
            }
        }
    }
    res.send(200);
    return next();
}

function getParams(req) {
    var url = req.url;
    var bizId,userId,qr,openId;

    if(url.indexOf("/biz/") != -1){
        if(url.indexOf("/",url.indexOf("/biz/") + 5) != -1){
            bizId = url.substring(url.indexOf("/biz/") + 5,url.indexOf("/",url.indexOf("/biz/") + 5));
        }else {
            bizId = url.substring(url.indexOf("/biz/") + 5);
        }
    }

    if(url.indexOf("/user/") != -1){
        if(url.indexOf("/",url.indexOf("/user/") + 6) != -1){
            userId = url.substring(url.indexOf("/user/") + 6,url.indexOf("/",url.indexOf("/user/") + 6));
        }else {
            userId = url.substring(url.indexOf("/user/") + 6);
        }
    }

    if(url.indexOf("/qr/") != -1){
        if(url.indexOf("/",url.indexOf("/qr/") + 4) != -1){
            qr = url.substring(url.indexOf("/qr/") + 4,url.indexOf("/",url.indexOf("/qr/") + 4));
        }else {
            qr = url.substring(url.indexOf("/qr/") + 4);
        }
    }

    if(url.indexOf("/openId/") != -1){
        if(url.indexOf("/",url.indexOf("/openId/") + 8) != -1){
            openId = url.substring(url.indexOf("/openId/") + 8,url.indexOf("/",url.indexOf("/openId/") + 8));
        }else {
            openId = url.substring(url.indexOf("/openId/") + 8);
        }
    }

    return {
        bizId:bizId,
        userId:userId,
        qr:qr,
        openId:openId
    };
}

module.exports = {
    addSocketOrder: addSocketOrder,
    addSocketTable:addSocketTable,
    removeSocketOrder:removeSocketOrder,
    removeSocketTable:removeSocketTable,
    onNewOrder:onNewOrder,
    callOut:callOut,
    completeOrder:completeOrder,
    changeDish:changeDish
};

