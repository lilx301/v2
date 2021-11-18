const _axios = require("axios");
const tool  = require("./tool.js");
 

const axios = _axios.default.create({
    timeout:35000 
    // proxy:{host:"127.0.0.1",port:8088}
})


async function doTask(CFG){
    var result = '';
    if (!CFG) {
        console.log('sign3 config not foun, skip')
        result +=  'sign3 config not foun, skip';
        return result;
    }
    console.log(CFG['_'])
    result +=  CFG['_'];

    var body = CFG.body;
    if (body) {
        body = JSON.parse(JSON.stringify(body));
        var timeSecKey = '';
        var md5Key = '';
        for (const key in body) {
            if (Object.hasOwnProperty.call(body, key)) {
                const element = body[key];
                if(element == '_TIMESEC_'){
                    timeSecKey= key;
                }else if(element == '_MD5_OF_TIMESEC_'){
                    md5Key  = key;   
                }
            }
        }
        
        if (timeSecKey) {
            // 2021-09-29T03:01:59.164
            var timeSec = new Date(Date.now()).toISOString().replace(/ |-|:|T|Z/g,'').substr(0,14);
            body[timeSecKey] = timeSec;

            if (md5Key) {
                body[md5Key] = tool.md5(timeSec);    
            }
        }
    }

    let d = await axios.post(CFG.url,body,{headers:CFG.header});
    console.log(d.data);
    result +=  JSON.stringify(d.data,null,'\t');
    // 是否通知
    if (CFG.notify) {
        tool.qmsg(result);    
    }
    return result;

}
 
!async function(){

    const SIGN3ConfigArr = tool.getConfig().sign3;
    for (let index = 0; index < SIGN3ConfigArr.length; index++) {
        const SIGN3Config = SIGN3ConfigArr[index];
        await tool.race([doTask(SIGN3Config),tool.wait(300)])
    }

    
    const SIGN4Config = tool.getConfig().sign4;
    await tool.race([doTask(SIGN4Config),tool.wait(300)])
    await tool.race([doTask(SIGN4Config.share),tool.wait(300)])
    process.exit(0);
}();


