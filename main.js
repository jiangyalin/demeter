const path = require('path')
const express = require('express')
const app = express()
const pkg = require('./package')
const routes = require('./routes/')
const config = require('./config')
const { createServer } = require('http')
const bodyParser = require('body-parser')
const expressWs = require('express-ws')
const pty = require('node-pty')
const server = createServer(app)
const os = require('os')

expressWs(app)

// 跨域
app.all('*', (req, res, next) => {
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
const nodeEnvBind = () => {
  //绑定当前系统 node 环境
  const term = pty.spawn(shell, ['--login'], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME + '/WebstormProjects/github-personal/demeter/data/test',
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
  term.on('data', (data) => {
    ws.send(data)
  })
  ws.on('message', (data) => {
    term.write(data)
  })
  ws.on('close', () => {
    term.kill()
    termMap.delete(pid)
  })
})

app.listen(config.port, () => {
  console.log('服务启动' + config.port)
  console.log('http://' + getIpAddress() + ':' + config.port)
})
