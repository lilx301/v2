const _axios = require("axios");
const tool  = require("./tool.js");
const CryptoJS = require("crypto-js")
const qs = require("qs")

const axios = _axios.default.create({
    timeout:35000 
    // proxy:{host:"127.0.0.1",port:8088}
})
const SIGN2Config = tool.getConfig().sign2;

function hashcode(body,Config){

    var setHashKey = '';
    for (const key in body) {
        if (Object.hasOwnProperty.call(body, key)) {
            const element = body[key];
            if (element ==  '_SecHash_') {
                var keys = Config.secKeys;
                var arrValues = [];
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    arrValues.push(body[key]);
                }
                setHashKey = key;
                break;
            }
        }
    }
    var valueStr = arrValues.join('');
    var js =  SIGN2Config.secJs;
    js = js.replace('___S___',valueStr);
    var SecHash = eval(js);
    body[setHashKey] = SecHash
}

async function getToken(){
    try {
        var params = SIGN2Config.auth.body;
        params.systemtime = '' + Date.now();
        hashcode(params,SIGN2Config.auth);
        let z = await axios.get(SIGN2Config.auth.url + qs.stringify(params));
        return z.data.res.bd;
    } catch (error) {
        
    }
    return null;
}

async function doTask(token,Config){
    console.log(Config['_'])
    var params = Config.body;
    params.systemtime =  Date.now();
    hashcode(params,Config);
    var Authorization ='Basic '+ Buffer.from(token).toString('base64');
    let z = await axios.get(Config.url + qs.stringify(params),{headers:{
        Authorization:Authorization
    }});
    try {
        console.log(z.data.res.hd.desc)
        if(z.data.res.bd.data.everyDayWord){
            console.log(z.data.res.bd.data.everyDayWord);
        }else{
            
        }
        
    } catch (error) {    
    }
    console.log('done')
}
 
!async function(){
    if (!SIGN2Config) {
        console.log('sign2 config not found skip')
        return;
    }
    var uinfo = await getToken();
    if (!uinfo) {
        console.log('no token try again');
        uinfo = await getToken();
    } 

    if (uinfo && uinfo.authcode) {
        arr = SIGN2Config.tasks;
        for (let i = 0; i < arr.length; i++) {
            const Cfg = arr[i];
            var wait = tool.wait(40);
            await tool.race([doTask(uinfo.authcode,Cfg),wait])
            await tool.wait(0.5);
        }
    }else{

        console.log('\033[1;37;41m %s\033[0m','No Token, Skip ');
    }

   
    process.exit(0);
    
}();


