
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
  /// 2天检查一次

  // if(new Date().getDate() % 2 != 1 ){
  //   console.log("SKIP3")
  //   return  
  // }


  const KVKEY = 'MassageTimeKey'
  const KVKEY2 = 'MassageValues'

  let v1 = await kvtool.getValue(KVKEY)
  let v2 = await kvtool.getValue(KVKEY2)
  console.log(v1)



  if(v1 && v2){
    let v11 = v1.substring(0,7)
    let now1 = tool.beijingTime().substring(0,7)
    console.log(v11,now1)
    if(now1 == v11){
      console.log("SKIP")
      return
    }
  }
  

  // 检查今天是否已查询过
  const PREQUERY_KEY = 'PreQueryTime'
  let preQueryTime = await kvtool.getValue(PREQUERY_KEY)
  let nowTime = tool.beijingTime()
  if(preQueryTime){
    let preQueryDate = preQueryTime.substring(0,10)
    let nowDate = nowTime.substring(0,10)
    console.log(preQueryDate,nowDate)
    if(nowDate == preQueryDate){
      console.log("SKIP4: 今日已查询")
      return
    }
  }

  let a = await fetch(Config.feishu[0], Config.feishu[1]);

  let b =  await a.json();
  
  // 更新查询时间为当前时间
  await kvtool.setValue(PREQUERY_KEY, nowTime)
 
  let R = []
  findValues(b, 'fldh6bCVIu', R );

  let T = []
  findValues(b, 'fldHOY7FNZ', T  );

  let t1 = T[0];
  if(t1 && R.length){
    
    let t = new Date(t1)
    /// beijingTime 
    let beijingTime = new Date(t.getTime() + 8 * 3600000).toISOString().replace(/T|Z/g," ");


    console.log('beijingTime',beijingTime,'v1',v1)
    if(beijingTime == v1){
      console.log("SKIP2")
      return
    }

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
