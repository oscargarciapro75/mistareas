const http = require('http');
const fs = require('fs');
const path = require('path');

let tasks = [];
let nextId = 1;
const allowedStatuses = ['pendiente', 'en_ejecucion', 'finalizado'];

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(data));
}

function serveStatic(req, res) {
  const filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
    } else {
      const ext = path.extname(filePath).toLowerCase();
      const typeMap = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css'
      };
      res.writeHead(200, {'Content-Type': typeMap[ext] || 'text/plain'});
      res.end(content);
    }
  });
}

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/tasks')) {
    if (req.method === 'GET' && req.url === '/api/tasks') {
      sendJSON(res, 200, tasks);
    } else if (req.method === 'POST' && req.url === '/api/tasks') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const data = JSON.parse(body || '{}');
        const status = allowedStatuses.includes(data.estado) ? data.estado : 'pendiente';
        const task = {
          id: nextId++,
          titulo: data.titulo || '',
          descripcion: data.descripcion || '',
          estado: status,
          creada: data.creada === true
        };
        tasks.push(task);
        sendJSON(res, 201, task);
      });
    } else if (req.method === 'PUT') {
      const id = parseInt(req.url.split('/')[3], 10);
      const task = tasks.find(t => t.id === id);
      if (!task) {
        res.writeHead(404);
        return res.end();
      }
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        const data = JSON.parse(body || '{}');
        if (data.titulo !== undefined) task.titulo = data.titulo;
        if (data.descripcion !== undefined) task.descripcion = data.descripcion;
        if (data.estado && allowedStatuses.includes(data.estado)) {
          task.estado = data.estado;
        }
        if (data.creada !== undefined) task.creada = data.creada === true;
        sendJSON(res, 200, task);
      });
    } else {
      res.writeHead(405);
      res.end();
    }
  } else {
    serveStatic(req, res);
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
