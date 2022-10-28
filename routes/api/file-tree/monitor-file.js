const chokidar = require('chokidar')

// 监听文件变化
const monitorFile = () => {
  const watcher = chokidar.watch('./data/test', {
    cwd: '.',
    persistent: true
  })

  // 新增文件
  watcher.on('add', path => {
    console.log(`File ${path} has been added`)
  })

  // 修改文件
  watcher.on('change', path => {
    console.log(`File ${path} has been change`)
  })

  // 删除文件
  watcher.on('unlink', path => {
    console.log(`File ${path} has been removed`)
  })

  // 新增文件夹
  watcher.on('addDir', path => {
    console.log(`Directory ${path} has been added`)
  })

  // 删除文件夹
  watcher.on('unlinkDir', path => {
    console.log(`Directory ${path} has been removed`)
  })

  // 删除文件
  watcher.on('error', path => {
    console.log(`Watcher error: ${error}`)
  })

  // 删除文件
  watcher.on('ready', () => {
    console.log(`Initial scan complete. Ready for changes`)
  })

  // 删除文件
  watcher.on('raw', (event, path, details) => {
    console.log('Raw event info:', event, path, details)
  })

  // chokidar.watch('./data/test').on('all', (event, path) => {
  //   console.log(event, path)
  // })
}

module.exports = monitorFile
