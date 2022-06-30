let express = require('express');
let router = express.Router();

let family_controller = require('../controllers/familyController');
let instrument_controller = require('../controllers/instrumentController');
let instance_controller = require('../controllers/instrumentinstanceController');
let maker_controller = require('../controllers/makerController');

//index

router.get('/', instrument_controller.index);

//family routes

router.get('/family/create', family_controller.family_create_get);
router.post('/family/create', family_controller.family_create_post);
router.get('/family/:id/delete', family_controller.family_delete_get);
router.post('/family/:id/delete', family_controller.family_delete_post);
router.get('/family/:id/update', family_controller.family_update_get);
router.post('/family/:id/update', family_controller.family_update_post);
router.get('/families', family_controller.family_list);
router.get('/family/:id', family_controller.family_detail);

// instrument routes

router.get('/instrument/create', instrument_controller.instrument_create_get);
router.post('/instrument/create', instrument_controller.instrument_create_post);
router.get('/instrument/:id/delete', instrument_controller.instrument_delete_get);
router.post('/instrument/:id/delete', instrument_controller.instrument_delete_post);
router.get('/instrument/:id/update', instrument_controller.instrument_update_get);
router.post('/instrument/:id/update', instrument_controller.instrument_update_post);
router.get('/instruments', instrument_controller.instrument_list);
router.get('/instrument/:id', instrument_controller.instrument_detail);

// instance routes

router.get('/instance/create', instance_controller.instance_create_get);
router.post('/instance/create', instance_controller.instance_create_post);
router.get('/instance/:id/delete', instance_controller.instance_delete_get);
router.post('/instance/:id/delete', instance_controller.instance_delete_post);
router.get('/instance/:id/update', instance_controller.instance_update_get);
router.post('/instance/:id/update', instance_controller.instance_update_post);
router.get('/instances', instance_controller.instance_list);
router.get('/instance/:id', instance_controller.instance_detail);

// maker routes

router.get('/maker/create', maker_controller.maker_create_get);
router.post('/maker/create', maker_controller.maker_create_post);
router.get('/maker/:id/delete', maker_controller.maker_delete_get);
router.post('/maker/:id/delete', maker_controller.maker_delete_post);
router.get('/maker/:id/update', maker_controller.maker_update_get);
router.post('/maker/:id/update', maker_controller.maker_update_post);
router.get('/makers', maker_controller.maker_list);
router.get('/maker/:id', maker_controller.maker_detail);

//export

module.exports = router;