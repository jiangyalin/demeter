const path = require('path')
const express = require('express')
const app = express()
const pkg = require('./package')
const routes = require('./routes/')
const config = require('./config')
const { createServer } = require('http')
// const { Server } = require('socket.io')
const bodyParser = require('body-parser')
const expressWs = require('express-ws')
const pty = require('node-pty')
// const userhome = require('user-home')
const server = createServer(app)
// const io = new Server(server, { cors: true })
// const formidable = require('express-formidable')
// const http = require('http')
const os = require('os')
// const fs = require('fs')
// const busboy = require('busboy')
// const inspect = require('util').inspect
// const history = require('connect-history-api-fallback')

// 处理表单及文件上传的中间件
// app.use(require('express-formidable')({
//     uploadDir: path.join(__dirname, 'static/public/img'), // 上传文件目录
//     keepExtensions: true, // 保留后缀
//     multiples: true
// }));
// app.use(formidable({
//     encoding: 'utf-8',
//     uploadDir: path.join(__dirname, 'static/public/img'),
//     keepExtensions: true, // 保留后缀
//     multiples: true
// }));

// 路由重定向不能与接口同时使用
// app.use(history());

expressWs(app)

// 跨域
app.all('*', function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild, languageCode, x-auth-token, token')
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS, PATCH')

  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
  } else {
    next()
  }
})

app.use(express.static(path.join(__dirname, 'static')))

app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}

app.use(bodyParser.json({ limit: '50mb' })) // 设置最大提交值
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
// app.use(formidable({ multiples: true }))

const getIpAddress = () => {
  const interfaces = os.networkInterfaces()
  for (const dev in interfaces) {
    const iface = interfaces[dev]
    for (let i = 0; i < iface.length; i++) {
      const { family, address, internal } = iface[i]
      if (family === 'IPv4' && address !== '127.0.0.1' && !internal) {
        return address
      }
    }
  }
}

routes(app)

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'
const termMap = new Map() // 存储 pty 实例，通过 pid 映射
function nodeEnvBind () {
  //绑定当前系统 node 环境
  const term = pty.spawn(shell, ['--login'], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: process.env
  })
  termMap.set(term.pid, term)
  return term
}

//服务端初始化
app.post('/terminal', (req, res) => {
  const term = nodeEnvBind(req)
  res.send({
    code: 200,
    data: term.pid.toString(),
    msg: ''
  })
  res.end()
})

app.ws('/socket/:pid', (ws, req) => {
  const pid = parseInt(req.params.pid)
  const term = termMap.get(pid)
  term.on('data', function (data) {
    ws.send(data)
  })
  ws.on('message', (data) => {
    term.write(data)
  })
  ws.on('close', function () {
    term.kill()
    termMap.delete(pid)
  })
})

// io.use('terminal').on('connection', socket => {
//   console.log('ddd')
//   let ptyProcess = pty.spawn(shell, ['--login'], {
//     name: 'xterm-color',
//     cols: 80,
//     rows: 24,
//     cwd: userhome, // 首次进入系统根目录
//     env: process.env
//   })
//
//   // 绑定data事件，通过socket的output事件，把shell日志传到前端
//   ptyProcess.on('data', data => socket.emit('output', data))
//
//   // socket绑定input事件，用于接收前端发送的命令，并传到ptyProcess中
//   socket.on('input', data => {
//     console.log('111')
//     return ptyProcess.write(data)
//   })
//
//   socket.on('resize', size => {
//     console.log('222')
//     ptyProcess.resize(size[0], size[1])
//   })
//
//   socket.on('exit', size => {
//     console.log('333')
//     ptyProcess.destroy()
//   })
//
//   console.log('ptyProcess.pid', ptyProcess.pid)
//   socket.emit('pid', ptyProcess.pid)
// })

// io.on('connection', () => {
//   console.log('ws已联通')
// })
// server.listen(3000)

app.listen(config.port, function () {
  console.log('服务启动' + config.port)
  console.log('http://' + getIpAddress() + ':' + config.port)
})
