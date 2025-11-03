
const tool = require("./tool.js");
const AX = require("./axiosWithDecompress.js");
 
 
const kvtool = require('./kvtool.js')

// create the socksAgent for axios
var httpsAgent = undefined;
console.log(process.argv);
if (process.argv[2] == "1") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  const SocksProxyAgent = require("socks-proxy-agent"); // replace with your proxy's hostname and port
  const proxyHost = "127.0.0.1",
    proxyPort = "1086";
  // the full socks5 address
  const proxyOptions = `socks5h://${proxyHost}:${proxyPort}`;
  httpsAgent = new SocksProxyAgent(proxyOptions);
}

const Config = tool.getConfig() || process.env;


function findValues(obj, keyName,outArr ){
  if(!obj) return
  type = typeof obj;
  if( type == 'string' || type == 'number' || type == 'boolean'){
    return;
  }
 
  // 找到所有 key 为 fldh6bCVIu 的值，并返回
   if(Array.isArray(obj)){
    for(let item of obj){
      if(item.value){
        outArr.push(item.value);
      }
      findValues(item, keyName, outArr);
    }
  }else if(typeof obj == 'object'){
    for(let key in obj){
      if(key == keyName && obj[key].value){
        outArr.push(obj[key].value);
      }
      findValues(obj[key], keyName, outArr);
    }
  } 
  return outArr;
}
 
async function task () {
  const KVKEY = 'MassageTimeKey'
  const KVKEY2 = 'MassageValues'

  let v1 = await kvtool.getValue(KVKEY)
  let v2 = await kvtool.getValue(KVKEY2)
  console.log(v1,v2)



  if(v1 && v2){
    v1 = v1.substring(0,7)
    let now = tool.beijingTime().substring(0,7)
    console.log(v1,now)
    if(now == v1){
      console.log("SKIP")
      return
    }
  }
  

 

  let a = await fetch(Config.feishu[0], Config.feishu[1]);

  let b =  await a.json();
 
  let R = []
  findValues(b, 'fldh6bCVIu', R );

  let T = []
  findValues(b, 'fldHOY7FNZ', T  );

  let t1 = T[0];
  if(t1 && R.length){
    let t = new Date(t1)
    /// beijingTime 
    let beijingTime = new Date(t.getTime() + 8 * 3600000).toISOString().replace(/T|Z/g," ");
    await kvtool.setValue(KVKEY,beijingTime )
    await kvtool.setValue(KVKEY2,JSON.stringify(R,null,4) )

    await tool.qmsg(   `${beijingTime}\n\n\ ${JSON.stringify(R,null,4)}`)
  }

  
  
  

}

!(async function () {
  var timecount = tool.wait(60 * 6);
  await Promise.race([task(), timecount]);
  console.log("finish");
  process.exit(0);
})();
