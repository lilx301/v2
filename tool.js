const CryptoJS = require("crypto-js")
const UUID = require("uuid")
const path = require('path')
const fs = require('fs')
const keysalt = 'ec2a69afa5c57776b0dd9ed5f4f0438a'
const ivSalt = 'lPc1lE3M'
const zlib = require('zlib')
const { lib } = require("crypto-js")

function decrypt(messageB64,key){
    var message = messageB64; 
    key = CryptoJS.HmacSHA256(key ,keysalt);
    var k = key;
    var iv = CryptoJS.HmacSHA256(key,ivSalt )
    iv = CryptoJS.enc.Hex.parse(iv.toString(CryptoJS.enc.Hex).substr(0,32));

    let r = CryptoJS.AES.decrypt(message,k,{mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,iv:iv});
    if(r.sigBytes > 32){
        let  tmpResultString =  r.toString(CryptoJS.enc.Base64);
        var buffResult = Buffer.from(tmpResultString,'base64');
        var sha2Buffer = buffResult.slice(0,32);
        var zipBuffer = buffResult.slice(32);  
        if (zipBuffer.length > 0) {
            
            var zipWordArr =  CryptoJS.enc.Base64.parse(zipBuffer.toString("base64"));
            var sha256Caculate  =  CryptoJS.SHA256(zipWordArr).toString(CryptoJS.enc.Hex).toLowerCase();
            var sha22 =  sha2Buffer.toString('hex').toLowerCase() 
            if (sha22 == sha256Caculate) {
                buffResult = zlib.gunzipSync(zipBuffer);
                return buffResult.toString('utf-8'); 
            }else{
                console.log('sha256 not fit');
            }
        }
    }
    return null;
}

function encrypt(message,key){
    key = CryptoJS.HmacSHA256(key,keysalt);
    var msgBuffer = Buffer.from(message,'utf-8');
    var msgZipBuffer = zlib.gzipSync(msgBuffer)

    var worderArrayOfZip =  CryptoJS.enc.Hex.parse(msgZipBuffer.toString('hex'));
    var sha2 = CryptoJS.SHA256(worderArrayOfZip);
    var m =  sha2.concat(worderArrayOfZip);
    var iv = CryptoJS.HmacSHA256(key,ivSalt)
    iv = CryptoJS.enc.Hex.parse(iv.toString(CryptoJS.enc.Hex).substr(0,32));
    var k = key;
    let r =  CryptoJS.AES.encrypt(m ,k,{mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7,iv:iv});
    return r.toString();
}

var g_config = null;
function getConfig(){
    try {
        if(g_config){
            return g_config
        }
        let encpath = path.join(process.cwd(), "encfiles/config.json.enc");
        let enc2 = fs.readFileSync(encpath).toString();
        var key = process.env.ENCKEY
        if (!key && fs.existsSync(path.join(process.cwd(), "secretFiles/config-dont-push.json"))) {
            let filepath = path.join(process.cwd(), "secretFiles/config-dont-push.json");
            let plain = fs.readFileSync(filepath).toString();
            key = JSON.parse(plain).ENCKEY ;
            console.error(`
            /*********************************************
                No  process.env.ENCKEY
                Read key from config-dont-push.json
            ********************************************/
            `);
        }


        if (!key) {
            console.error(`
            /*********************************************
                No  process.env.ENCKEY
            ********************************************/
            `);
            process.exit(1);
        }
        let p = decrypt(enc2,key)
        g_config = JSON.parse(p);
        return g_config;
    } catch (error) {
       
    }
   
}
function saveConfig(){
    var config = g_config;
    const key = process.env.ENCKEY || g_config.ENCKEY ;
    if (!key) {
        console.log()
        return;
    }
    if(!config.ENCKEY){
        config.ENCKEY = key;
        plain = JSON.stringify(config,null,5);
        fs.writeFileSync(filepath,plain);
    }else{
    }
    var plain = JSON.stringify(g_config);
     
    let enc = encrypt(plain,key);
    console.log(`
    Encryption len:${enc.length}:  ${enc.substr(0,10)} ... ${enc.substr(enc.length - 10,10)}
    `);
    let encpath = path.join(process.cwd(), "encfiles/config.json.enc");
    fs.writeFileSync(encpath ,enc );
    var plainpath = path.join(process.cwd(), "secretFiles/config-dont-push.json");
    if(fs.existsSync(plainpath)){
        let plain = JSON.stringify(config,null,'\t');
        fs.writeFileSync(plainpath ,plain );
    }else{

    }
}

if (require.main === module) {
    let filepath = path.join(process.cwd(), "secretFiles/config-dont-push.json");
    let plain = fs.readFileSync(filepath).toString();
    let config = JSON.parse(plain);
    const key = config.ENCKEY ||  UUID.v4().replace(/-/g,'');


    /// 从enc 更新
    if (process.argv[2] =='1') {
        process.env.ENCKEY = key;
        console.log('enc file  to plain text');
        getConfig();
        console.log(getConfig());
        saveConfig();
            
    }
    else{
        g_config = config;
        if(!config.ENCKEY){
            config.ENCKEY = key;
            plain = JSON.stringify(config,null,5);
            fs.writeFileSync(filepath,plain);

            console.log(`
            生成随机加密密码,请保存:' +${key}
            `)
        }else{
            console.log(`
            配置加密密码:${key}
            `)
        }
        saveConfig();
        console.log(getConfig())
    }

    
    
    
} else {
}

function md5(msgstr){
    return CryptoJS.MD5('' + msgstr).toString(CryptoJS.enc.Hex);
}

function  wait(sec){
    return new Promise(r=>{
        setTimeout(() => {
            r(1);
        }, sec * 1000);
    })
}
async function race(arr){
    try {
        return await Promise.race(arr);
    } catch (error) {
    }
}

async function qmsg(msg) {
    const Config = getConfig() || process.env;

    const cookie = Config.V2EXCK;
    const fs = require("fs");
    const qmsgapi = Config.QMSGAPI;
    var arrTask = [];
    if (qmsgapi) {
      var t1 = new Promise(async (resolve) => {
        try {
          let url = `${qmsgapi}&msg=${encodeURI(msg)}`;
          let res = await axios.get(url, { httpsAgent: header.httpsAgent });
          if (res.data.code == 0) {
            console.log("Qmsg酱：发送成功");
          } else {
            console.log("Qmsg酱：发送失败!" + res.data.reason);
          }
        } catch (err) {
          console.log("Err 114");
        }
        resolve();
      });
  
      arrTask.push(t1);
    }
  
    var tgbot = Config.TGBOT;
    if (tgbot) {
      var t2 = new Promise(async (resolve, reject) => {
        try {
          let url = `${tgbot}&text=${encodeURI("MfsrG:" + msg)}`;
          console.log(url);
          let res = await axios.get(url, { timeout: 1000 });
          if (res.ok == true) {
            console.log("TgBot：发送成功");
          } else {
            console.log("TgBot：发送失败!");
            reject("1");
          }
        } catch (err) {
          console.log("ERR 134");
        }
        resolve(1);
      });
  
      arrTask.push(race([t2, wait(2)]));
    } else {
      console.log("没有 tgbot");
    }
  
    await Promise.all(arrTask);
  
    return;
  }
module.exports = {getConfig,saveConfig,encrypt,decrypt,wait,md5,race,qmsg}