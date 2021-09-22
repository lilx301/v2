const axios = require("axios");
const path = require('path')
const tool  = require("./tool.js");
const fs = require("fs");


if (require.main === module) {
    function genEncFile(fileName){
        var rsapath = path.join(process.cwd(), 'secretFiles/'+fileName);
        const KEY = 'mJXa' + (process.env.ENCKEY || tool.getConfig().ENCKEY);
        if(fs.existsSync(rsapath)){
            var base64_id_rsa = fs.readFileSync(rsapath).toString();
            var id_rsa_enc = tool.encrypt(base64_id_rsa,KEY)
            var rsa_encpath = path.join(process.cwd(), `/encfiles/${fileName}_enc`);
            fs.writeFileSync(rsa_encpath,id_rsa_enc)
        }
    }

    genEncFile('id_rsa');
    genEncFile('id_rsa.pub');

    function extract(fileName){
        var rsapath = path.join(process.cwd(), 'encfiles/'+fileName + '_enc');
        const KEY = 'mJXa' + (process.env.ENCKEY || tool.getConfig().ENCKEY);
        if(fs.existsSync(rsapath)){
            var ciphter = fs.readFileSync(rsapath).toString();
            var decrypt = tool.decrypt(ciphter,KEY);
            try {
                fs.mkdirSync(path.join(process.cwd(), 'tmp/'))
            } catch (error) {   
            }
            fs.writeFileSync(path.join(process.cwd(), 'tmp/'+fileName),decrypt)
        }
    }
    extract('id_rsa')
    // extract('id_rsa.pub')

    fs.writeFileSync(path.join(process.cwd(), 'tmp/gitlabrepo'),tool.getConfig().gitlab);
}

 




