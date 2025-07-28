# V2ex 每日任务,签到,赚取铜币。
 利用gitlab CI 功能，每日执行。
 之前有个github action仓库的，被封禁了，所以采用gitlab
 > 此处代码是 ci 自动备份push 过来的。

## 支持的功能
- V2EX 每日签到
- NodeSeek 每日签到
- 其他自定义签到任务

# 操作步骤
## Step 1 Clone 此仓库,别用 Fork
```
  npm i
  git clone  git@github.com:vitock/v2ex.git
  git remote remove origin
  git remote add origin `your new repo url`
  git push --set-upstream origin master
```


clone 此仓库, 别fork. 然后自己创建一个新的仓库,push 文件到你自己创建的仓库。

## Step 2  生成加密配置.
创建一个文件夹 secretFiles 用了放本地的明文文件，此文件不会push到远端

创建一个config-dont-push.json 放到secretFiles目录下

config-dont-push.json 文件内容

```
{
  "_": "配置文件,ENCKEY,作为加密的密钥,这个文件不要push到git",
  "ENCKEY": "你的加密key",
  "gitlab": "你的repo地址,方便回写",
  "github": "你的repo地址",回写更新的cookie,同时备份到github
  "TGBOT": "你的tgbot提醒 没有就去掉此字段， https://api.telegram.org/bot:xxxxx/sendMessage?chat_id=xxxx",
  "V2EXCK": "你的 v2ex cookie",
  "NodeSeekCookie": "你的 nodeseek cookie (base64编码)"
}
```


由于cookie 会自动更新 需要ssh 密钥来push 更新内容。
运行  ssh-keygen  生成一个密钥对,(也可以直接使用你现在的密钥对,但是这里建议你使用单独的)

把密钥对放入 secretFiles 文件夹,目录结构如下
```
secretFiles/
|-  config-dont-push.json
|-  id_rsa
|-  id_rsa.pub
```


运行 下面命令 生成自己的加密的配置.
> node tool.js   

运行后，有加密配置目录结构
```
encfiles/
| - config.json.enc
| - encrypted_files_here
| - id_rsa_enc
| - id_rsa.pub_enc

```


### 添加ssh
将生成的 公钥*.pub 文本复制,添加到你仓库的deploy key, 添加写权限 （或者直接添加到用户的ssh）
同样也把公钥添加到gitlab 账号ssh里面。  
这一步的目的是cookie 过期更新，需要回写到仓库。  


# Step 4 准备ci环境
在 gitlab ci 中设置一个环境变量 ENCKEY:你的加密key
设置定时任务,北京时间每天8点左右执行.（v站好像是用的时区是0，对应北京时区是8）

# 屏蔽无关任务
把 tash.sh 中的  下面几行删除,
```
.
.
.
node pgy.js
node sign2.js
node t2.js
.
.

```
这是的其他的任务,其他人应该用不到

## 其它说明
 - 配置全部加密处理,push到远端,ci只需要在一个环境变量中设置一个key
 - 本代码在gitlab ci中运行，此仓库作为代码备份
 - 若你不怕被封，可以稍微改动下在 github action 下运行，但是请别fork，自己创建新的仓库，直接把本代码push上去即可。
 - 代码push到gitlab后会自动同步到github 仓库,如果你按前面配置了ssh github配置里面设置了的话.
 - ...

