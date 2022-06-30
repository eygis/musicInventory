let Family = require('../models/family');
let Instrument = require('../models/instrument');
let Instance = require('../models/instrumentinstance');
let Maker = require('../models/maker');

let async = require('async');
const { body, validationResult } = require('express-validator');

//display index

exports.index = (req, res) => {

    async.parallel({
        family_count: (callback) => {
            Family.countDocuments({}, callback);
        },
        instrument_count: (callback) => {
            Instrument.aggregate([{'$group': {'_id': '$type', 'count': {'$sum': 1}}}], callback)
        },
        instance_count: (callback) => {
            Instance.countDocuments({}, callback);
        },
        maker_count: (callback) => {
            Maker.countDocuments({}, callback);
        }
    }, (err, results) => {
        res.render('index', {title: 'Oka Instruments', error: err, data: results});
    })
}

//display instruments

exports.instrument_list = (req, res, next) => {
    
    Instrument.find()
        .sort([['type', 'ascending']])
        .populate('maker')
        .exec((err, list_instrument) => {
            if (err) {return next(err)}
            // success
            res.render('instrument_list', {title: 'Instruments', instrument_list: list_instrument})
        })
}

// instrument detail

exports.instrument_detail = (req, res, next) => {
    
    async.parallel({
        instrument: (callback) => {
            Instrument.findById(req.params.id)
                .populate('maker')
                .exec(callback)
        },
        instrument_instances: (callback) => {
            Instance.find({'instrument': req.params.id})
                .exec(callback)
        },  
    }, (err, results) => {
        if (err) {return next(err)}
        if (results.instrument == null) {
            let err = new Error('Instrument not found.')
            err.status = 404;
            return next(err)
        }
        res.render('instrument_detail', {title: 'Instrument Detail', instrument: results.instrument, instrument_instances: results.instrument_instances})
    })

}

// instrument create get

exports.instrument_create_get = (req, res, next) => {
    
    async.parallel({
        families: (callback) => {
            Family.find(callback)
        },
        makers: (callback) => {
            Maker.find(callback)
        },
    }, (err, results) => {
        if (err) {return next(err)}
        res.render('instrument_form', {title: 'Create New Instrument', errors: null, instrument: null, families: results.families, makers: results.makers})
    })

}

// instrument create post

exports.instrument_create_post = [
    body('instrument_type', 'Instrument type required.').trim().isLength({min: 1}).escape(),
    body('instrument_family', 'Instrument type required.').trim().isLength({min: 1}).escape(),
    body('instrument_maker', 'Instrument type required.').trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        const errors = validationResult(req);
        let instrument = new Instrument({
            type: req.body.instrument_type, 
            family: req.body.instrument_family,
            maker: req.body.instrument_maker
        });
        if (!errors.isEmpty()) {

            async.parallel({
                families: (callback) => {
                    Family.find(callback)
                },
                makers: (callback) => {
                    Maker.find(callback)
                }
            }, (err, results) => {
                if (err) {return next(err)}
                res.render('instrument_form', {title: 'Create New Instrument', instrument: instrument, errors: errors.array(), families: results.families, makers: results.makers})
                return;
            })

        }
        else {
            Instrument.findOne({type: req.body.instrument_type, maker: req.body.instrument_maker})
                .exec((err, found_instrument) => {
                    if (err) {return next(err)}
                    if (found_instrument) {
                        res.redirect(found_instrument.url)
                    }
                    else {
                        instrument.save((err) => {
                            if (err) {return next(err)}
                            res.redirect(instrument.url)
                        })
                    }
                })
        }
    }
]

// instrument delete get

exports.instrument_delete_get = (req, res, next) => {
    
    async.parallel({
        instrument: (callback) => {
            Instrument.findById(req.params.id)
                .exec(callback)
        },
        instrument_instances: (callback) => {
            Instance.find({'instrument': req.params.id})
                .populate('instrument')
                .exec(callback)
        }
    }, (err, results) => {
        if (err) {return next(err)}
        if (results.instrument == null) {
            res.redirect('/catalog/instruments')
        }
        res.render('instrument_delete', {title: 'Delete Instrument', instrument: results.instrument, instrument_instances: results.instrument_instances})
    })
}

// instrument delete post

exports.instrument_delete_post = (req, res, next) => {
    async.parallel({
        instrument: (callback) => {
            Instrument.findById(req.params.id)
                .exec(callback)
        },
        instrument_instances: (callback) => {
            Instance.find({'instrument': req.params.id})
                .populate('instrument')
                .exec(callback)
        }
    }, (err, results) => {
        if (err) {return next(err)}
        if (results.instrument_instances.length) {
            res.render('instrument_delete', {title: 'Delete Instrument', instrument: results.instrument, instrument_instances: results.instrument_instances})
        }
        else {
            Instrument.findByIdAndRemove(req.body.instrument_id, (err) => {
                if (err) {return next(err)}
                res.redirect('/catalog/instruments')
            })
        }
    })
}

// instrument update get

exports.instrument_update_get = (req, res, next) => {
    
    async.parallel({
        instrument: (callback) => {
            Instrument.findById(req.params.id)
                .populate('maker')
                .populate('family')
                .exec(callback)
        },
        makers: (callback) => {
            Maker.find(callback)
        },
        families: (callback) => {
            Family.find(callback)
        }
    }, (err, results) => {
        if (err) {return next(err)}
        if (results.instrument == null) {
            let err = new Error('Instrument not found')
            err.status = 404
            return next(err);
        }
        res.render('instrument_form', {title: 'Update Instrument', errors: null, instrument: results.instrument, makers: results.makers, families: results.families})
    })
}

// instrument update post

exports.instrument_update_post =  [
    body('instrument_type', 'Instrument type required.').trim().isLength({min: 1}).escape(),
    body('instrument_family', 'Instrument type required.').trim().isLength({min: 1}).escape(),
    body('instrument_maker', 'Instrument type required.').trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        let instrument = new Instrument({
            type: req.body.instrument_type, 
            family: req.body.instrument_family,
            maker: req.body.instrument_maker,
            _id: req.params.id
        })
        if (!errors.isEmpty) {
            async.parallel({
                families: (callback) => {
                    Family.find(callback)
                },
                maker: (callback) => {
                    Maker.find(callback)
                }
            }, (err, results) => {
                if (err) {return next(err)}
                res.render('instrument_form', {title: 'Update Form', instrument: instrument, errors: errors.array(), families: results.families, maker: results.makers})
            })
        }
        else {
            Instrument.findByIdAndUpdate(req.params.id, instrument, {}, (err, updatedInstrument) => {
                if (err) {return next(err)}
                res.redirect(updatedInstrument.url)
            })
        }
    }
]