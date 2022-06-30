let Instance = require('../models/instrumentinstance');
let Instrument = require('../models/instrument');

let async = require('async');
const { body, validationResult } = require('express-validator');

//display instances

exports.instance_list = (req, res, next) => {
    
    Instance.find()
        .populate({
            path: 'instrument',
            populate: {path: 'maker', model: 'Maker'}
        })
        .sort([['instrument', 'ascending']])
        .exec((err, list_instance) => {
            if (err) {return next(err)}
            // success
            res.render('instrument_instance_list', {title: 'Instances', instance_list: list_instance})
        })
}

// instance detail

exports.instance_detail = (req, res, next) => {
    
    Instance.findById(req.params.id)
                .populate({
                    path: 'instrument',
                    populate: {path: 'maker', model: 'Maker'}
                })
                .exec((err, instance) => {
                    if (err) {return next(err)}
                    if (instance == null) {
                        let err = new Error('Instance not found.')
                        err.status = 404;
                        return next(err)
                    }
                    res.render('instrument_instance_detail', {title: 'Instrument Instance Detail', instance: instance})
                });
}

// instance create get

exports.instance_create_get = (req, res, next) => {
    
    Instrument.find()
        .populate('maker')
        .exec((err, instruments) => {
            if (err) {return next(err)}
            res.render('instrument_instance_form', {title: 'Create New Instrument Instance', errors: null, instance: null, instruments: instruments})
        })

}

// instance create post

exports.instance_create_post = [
    body('instance_instrument', 'Instrument type required.').trim().isLength({min: 1}).escape(),
    body('instance_status', 'Status required.').trim().isLength({min: 1}).escape(),
    body('instance_notes').trim().optional({checkFalsy: true}).escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        let instance = new Instance({
            instrument: req.body.instance_instrument, 
            status: req.body.instance_status,
            notes: req.body.instance_notes
        })
        if (!errors.isEmpty()) {
            Instrument.find()
                .exec((err, instruments) => {
                    if (err) {return next(err)}
                    res.render('instrument_instance_form', {title: 'Create New Instrument Instance', errors: errors.array(), instance: instance, instruments: instruments})
                    return;
                }) 
        }
        else {
            instance.save((err) => {
                if (err) {return next(err)}
                res.redirect(instance.url)
            })
        }
    }
]

// instance delete get

exports.instance_delete_get = (req, res, next) => {
    Instance.findById(req.params.id)
        .exec((err, instance) => {
            if (err) {return next(err)}
            if (instance == null) {
                res.redirect('/catalog/instances')
            }
            res.render('instrument_instance_delete', {title: 'Delete Instrument Instance', instance: instance})
        })
}

// instance delete post

exports.instance_delete_post = (req, res, next) => {
    Instance.findByIdAndRemove(req.body.instance_id, (err) => {
        if (err) {return next(err)}
        res.redirect('/catalog/instances')
    })
}

// instance update get

exports.instance_update_get = (req, res, next) => {
    async.parallel({
        instance: (callback) => {
            Instance.findById(req.params.id)
                .populate('instrument')
                .exec(callback)
        },
        instruments: (callback) => {
            Instrument.find()
                .populate('maker')
                .exec(callback)
        }
    }, (err, results) => {
        if (err) {return next(err)}
        if (results.instance == null) {
            let err = new Error('Instance not found.')
            err.status = 404
            return (next(err))
        }
        res.render('instrument_instance_form', {title: 'Update Instance', errors: null, instance: results.instance, instruments: results.instruments})
    })
}

// instance update post

exports.instance_update_post = [
    body('instance_instrument', 'Instrument type required.').trim().isLength({min: 1}).escape(),
    body('instance_status', 'Status required.').trim().isLength({min: 1}).escape(),
    body('instance_notes').trim().optional({checkFalsy: true}).escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        let instance = new Instance({
            instrument: req.body.instance_instrument,
            status: req.body.instance_status,
            notes: req.body.instance_notes,
            _id: req.params.id
        })
        if (!errors.isEmpty) {
            async.parallel({
                instance: (callback) => {
                    Instance.findById(req.params.id)
                        .populate('instrument')
                        .exec(callback)
                },
                instruments: (callback) => {
                    Instrument.find()
                        .populate('maker')
                        .exec(callback)
                }
            }, (err, results) => {
                if (err) {return next(err)}
                res.render('instrument_instance_form', {title: 'Update Instrument Instance', errors: errors.array(), instance: instance, instruments: results.instruments})
            })
        }
        else {
            Instance.findByIdAndUpdate(req.params.id, instance, {}, (err, updatedInstance) => {
                if (err) {return next(err)}
                res.redirect(updatedInstance.url)
            })
        }
    }
]