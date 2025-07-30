const axios = require("axios");
const tool = require("./tool.js");

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
  console.log("proxy:", proxyOptions);
}

const Config = tool.getConfig() || process.env;

function base64(s){
  return Buffer.from(s,'utf-8').toString('base64')
}

function getCookie(){
  const cookieB64 = Config.NodeSeekCookie;
  return Buffer.from(cookieB64,'base64').toString('utf-8')
}
const cookie = getCookie()
const fs = require("fs");

once = null;
ckstatus = 1;
signstatus = 0;
// time = new Date();
// tmpHours = time.getHours();time.setHours(tmpHours + 8);

let beijin = new Date(new Date().getTime() + 480 * 60 * 1000);
notice = '' 

 

 
//每日签到
async function daily() {
  try {
    const url = 'https://www.nodeseek.com/api/attendance?random=true';
    
    
    const response = await axios.post(url, {}, {
      timeout: 6000, // 修正超时配置
      httpsAgent: httpsAgent,
      validateStatus: function (status) {
        // 所有状态码都当作成功处理
        return true;
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:141.0) Gecko/20100101 Firefox/141.0',
        'Accept-Language': 'zh-CN,zh;q=0.8,zh-TW;q=0.7,zh-HK;q=0.5,en-US;q=0.3,en;q=0.2',
        'Accept-Encoding': 'gzip, deflate, zstd',
        'Referer': 'https://www.nodeseek.com/board',
        'Origin': 'https://www.nodeseek.com',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Connection': 'keep-alive',
        'Cookie': cookie
      }
    });

    // console.log('NodeSeek 签到响应:', response.status, response.data);
    const contentType = response.headers['content-type'] || '';

    if (response.status === 200) {
      if (response.data && response.data.success) {
        notice += "NodeSeek 签到成功\n";
        signstatus = 1;
      } else {
        notice += "NodeSeek 签到失败\n";
      }
    } else {
      notice += `N状态码: ${response.status} --${contentType}-- ${JSON.stringify(response.headers,null, 4)} }  ${response.data}\n`;
    }
    
    // 成功或失败都跳出重试循环
    
  } catch (err) {
    console.log(`NodeSeek 签到错误`);
  }
}

//推送结果
async function qmsg(msg) {
  await tool.qmsg(msg);
}

//主要签到函数
async function sign() {
  try {
    if (!cookie) {
      console.log("你的 NodeSeek cookie 呢！！！");
      await qmsg("你的 NodeSeek cookie 呢！！！");
      return;
    }
    
    await daily();
    
    console.log(notice);
   
    
  } catch (err) {
    console.log("NodeSeek 签到主函数错误");
  }
}
 

!(async function () {
  var timecount = tool.wait(60 * 6);
  await Promise.race([sign(), timecount]);
  console.log("finish");
  process.exit(0);
})();
