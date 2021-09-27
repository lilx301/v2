const _axios = require("axios");
const tool  = require("./tool.js");
 

const axios = _axios.default.create({
    timeout:35000 
    // proxy:{host:"127.0.0.1",port:8088}
})

const SIGN3Config = tool.getConfig().sign3;
async function doTask(){
    if (!SIGN3Config) {
        console.log('sign3 config not found skip')
        return;
    }
    console.log(SIGN3Config['_'])

    let d = await axios.post(SIGN3Config.url,SIGN3Config.body,{headers:SIGN3Config.header});
    console.log(d.data);

}
 
!async function(){
    await Promise.race([doTask(),tool.wait(300)])
    process.exit(0);
}();


