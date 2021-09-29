const _axios = require("axios");
const tool  = require("./tool.js");
 

const axios = _axios.default.create({
    timeout:35000 
    // proxy:{host:"127.0.0.1",port:8088}
})


async function doTask(CFG){
    if (!CFG) {
        console.log('sign3 config not found skip')
        return;
    }
    console.log(CFG['_'])
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

}
 
!async function(){
    const SIGN3Config = tool.getConfig().sign3;
    const SIGN4Config = tool.getConfig().sign4;
    await tool.race([doTask(SIGN3Config),tool.wait(300)])
    await tool.race([doTask(SIGN4Config),tool.wait(300)])
    await tool.race([doTask(SIGN4Config.share),tool.wait(300)])
    process.exit(0);
}();


