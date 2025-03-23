/**
 * 模拟 web 服务器 返回压缩文件
 */
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

// 自定义中间件，用于处理 .br 文件
const serveCompressedFiles = (req, res, next) => {
  const filePath = path.join(__dirname, 'dist', req.path);
  const brFilePath = filePath + '.br';

  // 检查 .br 文件是否存在
  if (fs.existsSync(brFilePath)) {
    res.set('Content-Encoding', 'br');
    // 根据文件扩展名设置 Content-Type
    const ext = path.extname(filePath).substring(1);
    const contentType = {
      js: 'application/javascript',
      css: 'text/css',
      html: 'text/html'
    }[ext] || 'application/octet-stream';
    res.set('Content-Type', contentType);
    fs.createReadStream(brFilePath).pipe(res);
  } else {
    next();
  }
};

// 使用自定义中间件
app.use(serveCompressedFiles);

// 静态资源服务
app.use(express.static(path.join(__dirname, 'dist')));

app.listen(3000, () => console.log(`http://localhost:3000`));    