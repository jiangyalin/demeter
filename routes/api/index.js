const express = require('express')
const router = express.Router()

router.use('/file-tree', require('./file-tree'))
router.use('/menu', require('./menu'))

module.exports = router
