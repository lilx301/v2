const axios = require('axios')
const zlib = require('zlib')


// 创建一个带解压功能的 axios 实例
const axiosWithDecompress = axios.create({
  responseType: "arraybuffer", // 拿到原始 Buffer
  decompress: false            // axios 默认的解压禁用（只支持 gzip/deflate，不支持 br）
});

// 响应拦截器：自动解压 gzip/deflate/br
axiosWithDecompress.interceptors.response.use((response) => {
  const encoding = (response.headers["content-encoding"] || "").toLowerCase();

  let buffer = Buffer.from(response.data);

  if (encoding === "br") {
    buffer = zlib.brotliDecompressSync(buffer);
  } else if (encoding === "gzip") {
    buffer = zlib.gunzipSync(buffer);
  } else if (encoding === "deflate") {
    buffer = zlib.inflateSync(buffer);
  }

  // 替换掉原始 data
  response.data = buffer.toString("utf-8");
  return response;
});


module.exports = {axiosWithDecompress}

