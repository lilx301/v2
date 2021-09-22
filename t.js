const axios = require("axios");
const tool  = require("./tool.js");

// create the socksAgent for axios
var  httpsAgent =  undefined; 
console.log(process.argv) 
if(process.argv[2] == '1'){
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const SocksProxyAgent = require('socks-proxy-agent');// replace with your proxy's hostname and port
    const proxyHost = '127.0.0.1', proxyPort = '1086';
    // the full socks5 address
    const proxyOptions = `socks5://${proxyHost}:${proxyPort}`;
    httpsAgent = new SocksProxyAgent(proxyOptions);
    console.log('proxy:',proxyOptions);
}



const Config =  tool.getConfig().pgyconfig|| process.env;


const fs = require("fs");
const { waitForDebugger } = require("inspector");
const { SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION } = require("constants");
const qmsgapi = Config.QMSGAPI;
once = null;
ckstatus = 1; 
signstatus = 0;
// time = new Date();
// tmpHours = time.getHours();time.setHours(tmpHours + 8);

let beijin = new Date((new Date).getTime() + 480 * 60 * 1000);
notice = beijin.toISOString().replace("T"," ").replace("Z","");
const header = {
    timeout:6000,
    httpsAgent:httpsAgent,
    withCredentials:true,
    headers: {
        Referer: Config.pgyreferer,
        "user-agent": "Mozilla/5.0 (Linux; Android 10; Redmi K30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.83 Mobile Safari/537.36",
        cookie: Config.pgcookie || "",
    },
};

async function login(){

    let m =  await axios.post(Config.listurl1,Config.agKey,header);

    if (typeof m.data != 'string') {
        console.log('cookie is valid')
        return;
    }

    console.log('login');
    let z = await axios.post(Config.login, Config.logindata,{timeout:6000});
    console.log(z.data);

    var cookies = z.headers['set-cookie'];
    var mapidx = {};
    var newArr = [];
    for (let index = cookies.length-1; index  >= 0 ; index--) {
        const e = cookies[index];
        var key = e.split('=')[0];
        if (mapidx[key]==1) {
            continue;
        }
        mapidx[key] = 1
        newArr.push(e.split(';')[0]);   
    }

    cookies = newArr;
    cookies = cookies.filter(e=>{
        return e;
    })

    var cookiestr =  cookies.join('; ');
    header.headers.cookie = cookiestr;
    Config.pgcookie = cookiestr;
    tool.saveConfig();
}

async  function scanmainpage(){
   await login();
   await tool.wait(1);
   do{
        let m =  await axios.post(Config.listurl1,Config.agKey,header);
        console.log(typeof m.data);
        
        if (typeof m.data == 'string') {
            console.log('error login fail');
            break;
        }

        var list = m.data.list;

        // var list = m.data.list
        console.log('len', list.length);

        var isEnd  = true;
        var mapVer = {};
        for (let index = 1; index < list.length; index++) {
            const element = list[index];
            if(mapVer[element.a_version] ==  1  ){
                /// delete
                console.log( element.a_version,'---------->   Delete' )
 
                let data = `${Config.agKey}&appkey=${element.a_key}`

                await tool.wait(1.2);
                let dele = await axios.post(Config.deleterurl,data,header);
                console.log(dele.data);

                isEnd = false;
            }
            else{
                console.log(element.a_version )
            }

            mapVer[element.a_version]  = 1
        
        }

        if(isEnd){
            break;
        }
        await tool.wait(3);
    }while(0);

    
}


async  function scanall(){
    await login();
    await tool.wait(1);
    var page = 1;
    var deletData = [];
    var mapVer = {};
    do{
         let m =  await axios.post(Config.listurl + page,Config.agKey,header);
         var html = m.data;
         var start = 0;
         
         var datas = [];
         do {
             const prefix = 'akey="';
             var idx  = html.indexOf(prefix,start);
             if(idx >=0){
                 var endindx  = html.indexOf('"',idx + prefix.length + 2) ;
                 var value = html.substring(idx + prefix.length,endindx);
                 datas.push(value);
                 start = idx + prefix.length
             }
             else{
                 break;
             }            
         } while (start >= 0 && start < html.length);

         start = 0
         var verionList = [];
         do {
            const prefix = '.ipa"';
            var idx  = html.indexOf(prefix,start);
            if(idx >=0){
                var startX  = html.indexOf('_',idx -  30) ;
                var value = html.substring(startX + 1 ,idx);
                verionList.push(value);
                start = idx + prefix.length
            }
            else{
                break;
            }
            
        } while (start >= 0 && start < html.length);


       
        var list = [];
        if (datas.length == verionList.length) {
            datas.forEach((d,idx) =>{
                list.push({a_version:verionList[idx],a_key:d})
            })
        }
        else{
            throw "Eror parse html";
        }

        //  
         for (let index = (page == 1 ? 1 : 0); index < list.length; index++) {
             const element = list[index];
             let appVersion = element.a_version;;
             if(mapVer[appVersion] ==  1  ){                 /// delete
                console.log(element );
                 deletData.push(element.a_key)
             }
             mapVer[appVersion]  = 1
         }
         
         console.log(page,list.length);
         if(list.length < 20){
             break;
         }
         page ++ ;
         await tool.wait(3);
     }while(page < 4);

     console.log(mapVer);
     if(deletData.length){
        var rawdata = `setDisplay=2&${Config.agKey}`
       deletData.forEach(value=>{
           rawdata += `&a_key%5B%5D=${value}`;
       })
       let d = await axios.post(Config.multiDelete,rawdata,header);
       console.log(d.data);
    }
    else{
        console.log('finish delete');
    }
 }

 async function getAllVersions(){
    let z = await axios.post(Config.getAllVersionUrl, Config.getAllVersionData);

    var list =  z.data.data.list;
    console.log(list);
 }



 !async function(){

    if(Math.random() < 0.6){
        console.log('BizO scan all' );
        await scanall()
    }else{
        console.log('Kmu scan first page');
        await scanmainpage();
    }

    console.log('finish')
    process.exit(0)
 }();


