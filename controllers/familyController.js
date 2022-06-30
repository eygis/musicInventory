let Family = require('../models/family');
let Instrument = require('../models/instrument');
let async = require('async');
const { body, validationResult } = require('express-validator');

//display families

exports.family_list = (req, res, next) => {
    
    Family.find()
        .sort([['family_name', 'ascending']])
        .exec((err, list_families) => {
            if (err) {return next(err)}
            // success
            res.render('family_list', {title: 'Families', family_list: list_families})
        })
}

// family detail

exports.family_detail = (req, res, next) => {
    
    async.parallel({
        family: (callback) => {
            Family.findById(req.params.id)
                .exec(callback);
        },
        family_instruments: (callback) => {
            Instrument.find({'family': req.params.id})
                .populate('maker')
                .exec(callback)
        },
    }, (err, results) => {
        if (err) {return next(err)}
        if (results.family == null) {
            let err = new Error('Family not found');
            err.status = 404;
            return next(err);
        }
        res.render('family_detail', {title: 'Family Detail', family: results.family, family_instruments: results.family_instruments})
    })

}

// family create get

exports.family_create_get = (req, res) => {
    res.render('family_form', {title: 'Create New Family', errors: null, family: null})
}

// family create post

exports.family_create_post = [
    body('family_name', 'Family name required.').trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        
        const errors = validationResult(req);
        let family = new Family({
            family_name: req.body.family_name
        })

        if (!errors.isEmpty()) {
            res.render('family_form', {title: 'Create New Family', errors: errors.array(), family: family})
            return;
        }
        else {
            Family.findOne({'family_name': req.body.family_name})
                .exec((err, found_family) => {
                    if (err) {return next(err)}
                    if (found_family) {
                        res.redirect(found_family.url)
                    }
                    else {
                        family.save((err) => {
                            if (err) {return next(err)}
                            res.redirect(family.url);
                        })
                    }
                })
        }
    }
]

// family delete get

exports.family_delete_get = (req, res, next) => {
    
    async.parallel({
        family: (callback) => {
            Family.findById(req.params.id)
                .exec(callback)
        },
        family_instruments: (callback) => {
            Instrument.find({'family': req.params.id})
                .populate('maker')
                .exec(callback)
        }
    }, (err, results) => {
        if (err) {return next(err)}
        if (results.family == null) {
            res.redirect('/catalog/famillies')
        }
        res.render('family_delete', {title: 'Delete Family', family: results.family, family_instruments: results.family_instruments})
    })
}

// family delete post

exports.family_delete_post = (req, res, next) => {
    
    async.parallel({
        family: (callback) => {
            Family.findById(req.params.id)
                .exec(callback)
        },
        family_instruments: (callback) => {
            Instrument.find({'family': req.params.id})
                .exec(callback)
        }
    }, (err, results) => {
        if (err) {return next(err)}
        if (results.family_instruments.length) {
            res.render('family_delete', {title: 'Delete Family', family: results.family, family_instruments: results.family_instruments})
        }
        else {
            Family.findByIdAndRemove(req.body.family_id, (err) => {
                if (err) {return next(err)}
                res.redirect('/catalog/families')
            })
        }
    })
}

// family update get

exports.family_update_get = (req, res, next) => {
    Family.findById(req.params.id)
        .exec((err, family) => {
            if (err) {return next(err)}
            if (family.family_name == null) {
                let err = new Error('Family Not Found')
                err.status = 404
                return next(err)
            }
            res.render('family_form', {title: 'Update Family', errors: null, family: family})
        })
}

// family update post

exports.family_update_post = [
    body('family_name', 'Family name required.').trim().isLength({min: 1}).escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        let family = new Family({
            family_name: req.body.family_name,
            _id: req.params.id
        })
        if (!errors.isEmpty) {
            res.render('family_form', {title: 'Update Family', errors: errors.array(), family: family})
        }
        else {
            Family.findByIdAndUpdate(req.params.id, family, {}, (err, updatedFamily) => {
                if (err) {return next(err)}
                res.redirect(updatedFamily.url)
            })
        }
    }
]