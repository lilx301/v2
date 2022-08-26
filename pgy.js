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
const qmsgapi = Config.QMSGAPI;
once = null;
ckstatus = 1; 
signstatus = 0;
// time = new Date();
// tmpHours = time.getHours();time.setHours(tmpHours + 8);

let beijin = new Date((new Date).getTime() + 480 * 60 * 1000);
notice = beijin.toISOString().replace("T"," ").replace("Z","");
const header = {
    timeout:15000,
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

    let z = await axios.post(Config.login, Config.logindata,{timeout:6000});

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


const g_index = {};
var g_c = [1,2,3];
/// 5,4,3,2,1
function getMaxOfVersion(strV){
    if(g_index[strV]  && g_index[strV] > 0){
        return g_index[strV];
    }
    if (g_c.length) {
        var c = g_c.pop();
        g_index[strV] = c ;
        return c ;
    }else{
        return 1;
    }
    
}

async  function scanall(){
    await login();
    await tool.wait(1);
    var page = 1;
    var deletData = [];
    var mapVer = {};
    let maxPageCount = 15;

    var logger =[];
    do{
        console.log("page",page);
       
         let url0 = Config.listurl.split("?")[0]
         let data = Config.listurl.split("?")[1]
         let m =  await axios.post(url0 ,data+ page,Config.agKey,header);
         var list = []
         let lenOfList = 0;
         if(m && m.data && m.data.data && m.data.data.list){
            m.data.data.list.map(e=>{
                list.push({a_key:e.buildKey,a_version:e.buildVersion});
            })

            lenOfList = m.data.data.list.length
         }else{
            break;
         }
 

        //   第一个保留
         for (let index = 0 ; index < list.length; index++) {
             const element = list[index];
             let appVersion = element.a_version;;
             let  VERSION_MAX = getMaxOfVersion(appVersion);
             
             if(mapVer[appVersion] >= VERSION_MAX  ){                 /// delete

                console.log(appVersion,VERSION_MAX,'------X');
                 deletData.push(element.a_key)
                 logger.push(element);
                 continue;
             }

             
             if(!mapVer[appVersion]){
                mapVer[appVersion]  = 1
                console.log(appVersion,VERSION_MAX);
             }else{
                mapVer[appVersion]  += 1

                console.log(appVersion);
             }

             
             
             
         }
                 
         page ++ ;
         if(lenOfList < 20){
            break;
         }
         await tool.wait(3);


    }while(maxPageCount -- );


    console.log(logger);
    console.log(mapVer)
    if(deletData.length ){
        var rawdata = `setDisplay=2&${Config.agKey}`
       deletData.forEach(value=>{
           rawdata += `&a_key%5B%5D=${value}`;
       })
       try {
        let d = await axios.post(Config.multiDelete,rawdata,header);
        console.log(d.data);
       } catch (error) {
        let d = await axios.post(Config.multiDelete,rawdata,header);
        console.log(d.data);
       }
       
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

    let day = tool.beijingTime().substring(8,10);
    if(!(day == '30' ||  process.argv[2] == '2' || Math.random() < 0.4)){
        console.log('skip' ,tool.beijingTime() );
        return
    }
    if(1 || Math.random() < 0.55){
        console.log('BizO scan all' );
        await scanall()
    }else{
        console.log('Kmu scan first page');
        await scanmainpage();
    }

    console.log('finish')
    process.exit(0)
 }();


