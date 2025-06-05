const express = require('express')
const router = express.Router()
const viewsController = require('./../controllers/viewControllers')


router.get('/', viewsController.getindexPage)

module.exports = router