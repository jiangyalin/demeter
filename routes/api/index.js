const express = require('express')
const router = express.Router()

router.use('/file-tree', require('./file-tree'))

module.exports = router
