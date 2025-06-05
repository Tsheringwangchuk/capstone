const express = require('express')
const registrationdetailsController = require('./../controllers/registrationControllers')

const router = express.Router()

router
    .route('/registerDetails')
    .post(registrationdetailsController.createRegisterDetails)
    .get(registrationdetailsController.getAllRegisterDetails)

router
    .route('/:ref_uuid')
    .get(registrationdetailsController.getRegisterDetails)

router
    .route('/:id')
    .patch(registrationdetailsController.updateRegisterDetails)
    .delete(registrationdetailsController.deleteRegisterDetails)



module.exports = router