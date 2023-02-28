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
  const proxyOptions = `socks5://${proxyHost}:${proxyPort}`;
  httpsAgent = new SocksProxyAgent(proxyOptions);
  console.log("proxy:", proxyOptions);
}

const Config = tool.getConfig() || process.env;

const cookie = Config.V2EXCK;
const fs = require("fs");

once = null;
ckstatus = 1;
signstatus = 0;
// time = new Date();
// tmpHours = time.getHours();time.setHours(tmpHours + 8);

let beijin = new Date(new Date().getTime() + 480 * 60 * 1000);
notice = ''
const header = {
  timeout: 6000,
  httpsAgent: httpsAgent,
  withCredentials: true,
  headers: {
    Referer: "https://www.v2ex.com/mission",
    // Host: "www.v2ex.com",
    "user-agent":
      "Mozilla/5.0 (Linux; Android 10; Redmi K30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.83 Mobile Safari/537.36",
    cookie: `${cookie}`,
  },
};

function updateCookie(set_cookes_arr){
    var OriCookieArr =  Config.V2EXCK.split(';')
    if(set_cookes_arr){
        var cookieChange = false;
        set_cookes_arr.map(e=>{
            var key = e.split('=')[0];
            if (/V2EX_LANG/.test(key)) {
                console.log('333');
                return;
            }
            for (let index = 0; index < OriCookieArr.length; index++) {
                const e2 = OriCookieArr[index];
                var key2 = e2.split('=')[0];
                key2 = key2.replace(/^ */,'');
                if (key2 == key) {
                    console.log('update cookie',key);
                    OriCookieArr[index] = e.split(';')[0];
                    cookieChange = true;
                    break;
                }
                
            }
         
        })

        Config.V2EXCK = OriCookieArr.join(';');
        header.headers.cookie = Config.V2EXCK;
        if(cookieChange){
            tool.saveConfig();
        }
        
    }
}

//获取once检查是否已签到
async function check() {
   
    try {
      let url = "https://www.v2ex.com/mission/daily";
      let res = await axios.get(url, header);

      updateCookie(res.headers['set-cookie']);
      reg1 = /需要先登录/;
      if (reg1.test(res.data)) {
        console.log("cookie失效1");
        ckstatus = 0;
        notice += "cookie失效2";
      } else {
        reg = /每日登录奖励已领取/;
        if (reg.test(res.data)) {
          notice += "今天已经签到过啦\n";
          signstatus = 1;
        } else {
          reg = /redeem\?once=(.*?)'/;
          once = res.data.match(reg)[1];
          console.log(`获取成功 once:${once}`);
        }
      }
    } catch (err) {
      console.log("Err 56");
    }

}
async function qmsg(msg){
  await tool.qmsg(msg);
}
//每日签到
async function daily() {
  try {
    let url = `https://www.v2ex.com/mission/daily/redeem?once=${once}`;
    let res = await axios.get(url, header);
    console.log(once);
    reg = /已成功领取每日登录奖励/;
    if (reg.test(res.data)) {
      notice += "签到成功\n";
      signstatus = 1;
    } else {
      notice += "签到失败\n";
    }
  } catch (err) {
    console.log("Errror 76", err);
  }
}

//查询余额
function balance() {
  return new Promise(async (resolve) => {
    try {
      let url = "https://www.v2ex.com/balance";
      let res = await axios.get(url, header);
      reg = /\d+?\s的每日登录奖励\s\d+\s铜币/;
      console.log(res.data.match(reg)[0]);
      notice += res.data.match(reg)[0];
    } catch (err) {
      console.log("Error 93");
    }
    resolve();
  });
}

//推送结果


async function sign() {
  try {
    if (!cookie) {
      console.log("你的cookie呢！！！");
      await qmsg("你的cookie呢！！！");
      return;
    }
    await check();
    if (ckstatus == 1) {
      if (once && signstatus == 0) {
        await daily();
        if (signstatus == 0) {
          //如果签到失败
          await check();
          await daily();
        }
      }
      await balance();
    } else {
    }
    console.log(notice);
    await qmsg(notice);
  } catch (err) {
    console.log("Err183", err);
  }
}

console.log(`




**************************************************
*
*
*   ${new Date(Date.now() + 8 * 3600000).toISOString().replace(/T|Z/g," ")}
*
*
**************************************************




`)

!(async function () {
  var timecount = tool.wait(60 * 6);
  await Promise.race([sign(), timecount]);
  console.log("finish");
  process.exit(0);
})();
