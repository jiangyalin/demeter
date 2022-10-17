const fs = require('fs')
const path = require('path')

// 读取文件列表
const readFileList = (dir, filesList = []) => {
  const files = fs.readdirSync(dir)
  files.forEach(item => {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      readFileList(path.join(dir, item), filesList) // 递归读取
    } else {
      filesList.push({
        fullPath,
        name: item
      })
    }
  })
  return filesList
}

module.exports = readFileList
