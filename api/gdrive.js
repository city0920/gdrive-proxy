// api/gdrive.js - Vercel Edge Function
// Google Drive API 中转服务

export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  };

  // 处理预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }

  try {
    const url = new URL(request.url);
    
    // 构建目标 URL (Google Drive API)
    let targetUrl = 'https://www.googleapis.com' + url.pathname.replace('/api/gdrive', '');
    if (url.search) {
      targetUrl += url.search;
    }

    // 复制请求头
    const headers = new Headers(request.headers);
    headers.delete('host');
    headers.set('host', 'www.googleapis.com');

    // 转发请求
    const init = {
      method: request.method,
      headers: headers,
      redirect: 'follow',
    };

    // 只有非 GET/HEAD 请求才添加 body
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      init.body = request.body;
    }

    // 发送请求到 Google API
    const response = await fetch(targetUrl, init);
    
    // 复制响应头并添加 CORS
    const responseHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      responseHeaders.set(key, value);
    });

    // 返回响应
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Proxy Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Proxy Error',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
}
