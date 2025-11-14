// kv_client.js
// Node 18+ (内置 fetch)；若更低版本请安装 node-fetch 或 axios 替换 fetch 调用

const crypto = require('crypto');

const tool = require("./tool.js");
 


const API_URL = tool.getConfig().KVAPI; // 根据你的服务实际地址修改

// 统计前导零位数
function countLeadingZeroBits(buf) {
  let count = 0;
  for (const b of buf) {
    for (let i = 7; i >= 0; i--) {
      if ((b & (1 << i)) === 0) count++;
      else return count;
    }
  }
  return count;
}

// 计算签名：双 SHA256(timeStr + input + sign) 前导零位 >= preBits
// 其中 input = kvtype + key + value（与服务端一致）
function computeSign({ kvtype, key, value, timeStr, preBits = 16, maxIters = 5_000_000 }) {
  const input = kvtype + key + (value ?? '');
  for (let nonce = 0; nonce < maxIters; nonce++) {
    const sign = crypto.randomBytes(21).toString('base64');
    const d1 = crypto.createHash('sha256').update(timeStr).update(input).update(sign).digest();
    const d2 = crypto.createHash('sha256').update(d1).digest();
    if (countLeadingZeroBits(d2) >= preBits) {
        return sign}
  }
  throw new Error('pow not found within maxIters; increase maxIters or wait and retry');
}

async function kvRequest({ kvtype, key, value }) {
  const timeStr = Math.floor(Date.now() / 1000).toString(); // 有效期 ±60s
  if(!value) value = ''
  if(typeof value != 'string'){
    value = '' + value
  }
  const sign = computeSign({ kvtype, key, value, timeStr, preBits: 12 });
  key = '' + key
  const body = { kvtype, key, value: value ?? '', time: timeStr, sign };
  
  // 创建 AbortController 用于超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
  
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal, // 添加超时信号
    });
    console.log('res',res)
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (error) {
    // 处理超时错误
    if (error.name === 'AbortError') {
      throw new Error('请求超时（30秒）');
    }
    throw error;
  } finally {
    // 清理定时器
    clearTimeout(timeoutId);
  }
}

async function setValue(key,value){
  try {
    let kvtype = 'set'
    return await kvRequest({kvtype,key,value })
  } catch (error) {
  }
  return null
}

async function getValue(key){
  try {
    let kvtype = 'get'
    let res = await kvRequest({kvtype,key })
    console.log('res',res)
    if(res && res.code == 0 ){
      return res.data
    }
   
    return null
  } catch (error) {
     console.log('error',error)
  }
  return null
  
}

module.exports = {setValue,getValue}