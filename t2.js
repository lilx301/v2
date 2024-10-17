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
    var endDate = CFG.endDate;
    if (endDate) {
        let dateNow = tool.beijingTime().substr(0,10);
        if(dateNow > endDate){
            console.log(`skip endDate:${endDate}  | now: ${dateNow}`)
            return;
        }
    }


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
        if((new Date()).getDate() == 23){
            await tool.qmsg(str)
        } 
    }
    return result;

}
 
!async function(){

    
}();


