const axios = require("axios");
const tool = require("./tool.js");
const fs = require("fs");
const Config =  tool.getConfig() 

function getListFromHtml(html) {
  var idx = html.indexOf("var goodsdata = ");
  if (idx > 0) {
    var idx2 = html.indexOf("\n", idx);
    var str = html.substring(idx, idx2);

    var js = `(function zz(){
      ${str};
      return goodsdata;
    })()`;

    var z = eval(js);
    // console.log(z)
 
    var result = [];
    for (let i = 0; i < z.length; i++) {
      const element = z[i];

      result.push({
        goods_id: element.goods_id,
        goods_name: element.goods_name,
        kxb: element.kxb,
        sales: element.sales,
        stock:element.stock
      });
    }

    return result;
  }
}

async function getHtml() {
  const Config = tool.getConfig() || process.env;
  var result = await axios.get(Config.shoplist);
 
  return result.data
 
}
 

(async () =>{
  let html =  await getHtml();
  var arr = getListFromHtml(html);
  var exArr = Config.exclude;
  var map = {}
  if(exArr){
    exArr.forEach(e  => {
      map[e] = '1'
    });
  }
  var result = arr.filter(e=>{
    return e.stock > '0' && map[e.goods_name] != '1'&& !/T恤|卫衣|指南|月卡|CTF|白帽子|安全演义|货拉拉|鼠标垫/.test(e.goods_name)
  })
  
  if(result.length){
    // console.log(result)
    var str = '新货品：\n'
    result.forEach(e=>{
      str += `${e.goods_name}:\t  ${e.kxb}\n`
    })

    if((new Date()).getDate() == 25){
      await tool.qmsg(str)
    }
    


  }
  
 

})()

 
