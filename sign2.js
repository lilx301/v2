const _axios = require("axios");
const tool  = require("./tool.js");
const CryptoJS = require("crypto-js")


const axios = _axios.default.create({
    timeout:35000 
    // proxy:{host:"127.0.0.1",port:8088}
})
const SIGN2Config = tool.getConfig().sign2;
 
async function doTask(Config){
    console.log(Config['_'])
    let bodyStr = Buffer.from(Config.body,'base64').toString()
    try {
        let z = await axios.post(Config.url ,bodyStr,{headers:{
            ...Config.header
        }});
      
        console.log('succ')
        
    } catch (error) {    
        console.log('err')
    }
    console.log('done')
}
 
!async function(){
    if (!SIGN2Config) {
        console.log('sign2 config not found skip')
        return;
    }
   

    if (1) {
        arr = SIGN2Config.tasks;
        for (let i = 0; i < arr.length; i++) {
            const Cfg = arr[i];
            var wait = tool.wait(10);
            await tool.race([doTask(Cfg),wait])
            await tool.wait(0.5);
        }
    }else{

        console.log('\033[1;37;41m %s\033[0m','No Token, Skip ');
    }

   
    process.exit(0);
    
}();


