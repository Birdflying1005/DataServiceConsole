var Client = require('mysql').Client,
    client = new Client(),
    cfg = initVar.serverConfig ? initVar.serverConfig : getServerConf(),
    Log = require(CORE + "log.js");
function init(){
    client.host = cfg['host'];
    client.port = cfg['port'];
    client.user = cfg['user'];
    client.password = cfg['password'];
    client.query('USE db_chating', function(error, results) {
        if(error) {
            console.log('ClientConnectionReady Error: ' + error.message);
            client.end();
            return false;
        }
    });
}

function BaseModel(table){
    init();
    this._table = table;
    var tableMsg = getTableConfigFromJson(this._table);
    this._key        = tableMsg['key'];
    this._tableConfig = tableMsg['value'];
    this.add = function(values,callBack){
        tableMsg = getTableConfigFromJson(this._table);
        var addMsg = changeJsonToString(values);
        client.query('INSERT INTO ' + this._table + "(" + addMsg["key"] +") values(" + addMsg["value"] +")",
            function(error, results) {
                if(error) {
                    client.end();
                    callBack(0);
                    return false;
                }
                callBack(results.insertId);
            });
    }

    this.update = function(key,values,callBack){
        var jsonString = changeJsonToUpdateData(values);
        console.log('update ' + this._table +" set " + jsonString +" where " + this._key + " = " +key);
        client.query('update ' + this._table +" set " + jsonString +" where " + this._key + " = " +key,
            function(error, results) {
                if(error) {
                    console.log("ClientReady Error: " + error.message);
                    client.end();
                    callBack(false);
                }
                console.log('Inserted: ' + results.affectedRows + ' row.');
                console.log('Id inserted: ' + results.insertId);
                callBack(true);
            });
    }

    this.deleteItem = function(key,callBack){
        client.query('delete from' + this._table +" where " + this._key + " = " +key,
            function(error, results) {
                if(error) {
                    console.log("ClientReady Error: " + error.message);
                    client.end();
                    callBack(false);
                }
                console.log('Inserted: ' + results.affectedRows + ' row.');
                callBack(true);
            });
    }

    this.select = function(callBack){
        client.query('SELECT * FROM ' + this._table,
            function selectCb(error, results) {
                if (error) {
                    console.log('GetData Error: ' + error.message);
                    client.end();
                    callBack(false);
                }
                callBack(results);
            });
    }

    this.query = function(where, selectFields, callBack){
        selectFields = selectFields ? selectFields:"*";
        client.query('SELECT ' + selectFields + ' FROM ' + this._table + ' where ' + where,
            function selectCb(error, results) {
                if (error) {
                    console.log('GetData Error: ' + error.message);
                    client.end();
                    callBack(false);
                }
                callBack(results);
            });
    }
}
function getServerConf(){
    var serverMsg = {};
    try{
        var str = Module.fs.readFileSync(global.CONF + 'config.json');
        serverMsg = JSON.parse(str);
    }catch(e){
        Module.sys.debug("JSON parse configs/hot_deployer.json fails")
    }
    initVar.serverConfig = serverMsg;
    return serverMsg;
}


function getTableConfigFromJson(tableName){
    var tableMsg = {};
    try{
        var str = Module.fs.readFileSync(global.CONF + 'table.json','utf8');
        tableMsg = JSON.parse(str);
    }catch(e){
        Module.sys.debug("JSON parse configs/hot_deployer.json fails")
    }
    return tableMsg[tableName];
}

//covert JSON to string
function changeJsonToString(json){
    var jsonKey = [],
        jsonValue = [];
    for(var item in json){
        jsonKey.push(item);
        jsonValue.push("'"+json[item]+"'");
    }
    jsonKey.join(",");
    jsonValue.join(",");
    return {"key":jsonKey,"value":jsonValue};
}

function changeJsonToUpdateData(json){
    var myJson = [];
    for(var item in json){
        myJson.push(item+"='" + json[item] +"'");
    }
    return   myJson.join(",");
}
global.BaseModel = BaseModel;