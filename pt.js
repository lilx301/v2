
const tool = require("./tool.js");
const AX = require("./axiosWithDecompress.js");
const  axios = AX.axiosWithDecompress

 


 

const Config = tool.getConfig() || process.env;
async function sign() {
  let url = Config.PT.url;
  let cfg = Config.PT.cfg;
  let res = await axios.get(url, cfg);
  // console.log( res.data);
  let s = res.data

  // 这是您的第 <b>1</b> 次签到，已连续签到 <b>1</b> 天，本次签到获得 <b>100</b> 个幸运星
  let arr = /这是您.*个幸运星/.exec(s)
  let result = arr[0]
  if(result){
    result = result.replace(/<.*?>/g, '');
    console.log(result  )
  }else{
    console.log('签到失败')
  }
  

}
 
!(async function () {
  var timecount = tool.wait(60 * 6);

  await Promise.race([sign(), timecount]);
  console.log("finish");
  process.exit(0);
})();
