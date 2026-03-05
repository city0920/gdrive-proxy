// api/gdrive.js - Vercel Serverless Function
// Google Drive API 中转服务

module.exports = async (req, res) => {
  // CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const targetUrl = 'https://www.googleapis.com' + req.url;

    // 复制请求头
    const headers = { ...req.headers };
    delete headers.host;
    headers.host = 'www.googleapis.com';

    // 构建转发请求
    const fetchOptions = {
      method: req.method,
      headers: headers,
      redirect: 'follow',
    };

    // 只有非 GET/HEAD 请求才添加 body
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
    }

    // 发送请求到 Google API
    const response = await fetch(targetUrl, fetchOptions);
    
    // 获取响应内容
    const data = await response.text();
    
    // 设置响应状态和内容类型
    res.status(response.status);
    
    // 复制 Google API 的 Content-Type
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    
    res.send(data);

  } catch (error) {
    console.error('Proxy Error:', error);
    res.status(500).json({
      error: 'Proxy Error',
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};
