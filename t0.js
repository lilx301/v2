const axios = require("axios");
const tool = require("./tool.js");

(async function(){
    await tool.qmsg(JSON.stringify(tool.getConfig(),null,"\t"));
})()