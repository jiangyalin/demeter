const express = require('express')
const path = require('path')
const readFileList = require('./../../../tool/read-file-list')
const router = express.Router()

router.get('/all', (req, res) => {
  const filePath = path.join(__dirname, './../../../data/test')
  const list = readFileList(filePath)
  const treeMap = {}
  let id = 1

  const arrToTree = (arr, tree) => {
    if (!arr.length) {
      return tree
    } else {
      if (!tree.find(item => item.name === arr[0])) {
        tree.push({
          id: id++,
          name: arr[0],
          type: arr[0].includes('.') ? 'file' : 'folder',
          node: []
        })
      }

      return arrToTree(arr.splice(1), tree.find(item => item.name === arr[0]).node)
    }
  }

  const tree = []
  list.forEach(item => {
    const pathArr = item.fullPath.substring(filePath.length + 1).split('/')
    pathArr.forEach(node => {
      if (treeMap[node]) {

      } else {
        treeMap[node] = {}
      }
    })
    if (!pathArr.includes('.DS_Store')) arrToTree(pathArr, tree)
  })

  const data = {
    code: 200,
    data: tree,
    message: 'ok'
  }
  res.jsonp(data)
})

module.exports = router

