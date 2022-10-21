const express = require('express')
const path = require('path')
const readFileList = require('./../../../tool/read-file-list')
const router = express.Router()
const fs = require('fs')

// 获取完整文件树结构
router.get('/all', (req, res) => {
  const filePath = path.join(__dirname, './../../../data/test')
  const list = readFileList(filePath)
  const treeMap = {}
  let id = 1

  const arrToTree = (arr, tree, path) => {
    if (!arr.length) {
      return tree
    } else {
      if (!tree.find(item => item.name === arr[0])) {
        tree.push({
          id: id++,
          name: arr[0],
          type: arr[0].includes('.') ? 'file' : 'folder',
          path: path,
          node: []
        })
      }

      return arrToTree(arr.splice(1), tree.find(item => item.name === arr[0]).node, path)
    }
  }

  const tree = []
  list.forEach(item => {
    const _path = item.fullPath.substring(filePath.length + 1)
    const pathArr = _path.split('/')
    pathArr.forEach(node => {
      if (treeMap[node]) {

      } else {
        treeMap[node] = {}
      }
    })
    if (!pathArr.includes('.DS_Store')) arrToTree(pathArr, tree, _path)
  })

  const data = {
    code: 200,
    data: tree,
    message: 'ok'
  }
  res.jsonp(data)
})

// 获取文件内容
router.get('/info', (req, res) => {
  const _path = req.query.path
  const prefixPath = '../../../data/test/'

  const fileData = fs.readFileSync(path.join(__dirname, prefixPath + _path), 'utf-8')
  const data = {
    code: 200,
    data: {
      fileData
    },
    message: 'ok'
  }
  res.jsonp(data)
})

module.exports = router

