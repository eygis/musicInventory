let Maker = require('../models/maker');
let Instrument = require('../models/instrument');
let async = require('async');
const { body, validationResult } = require('express-validator');

//display makers

exports.maker_list = (req, res, next) => {
    
    Maker.find()
        .sort([['company_name', 'ascending']])
        .exec((err, list_makers) => {
            if (err) {return next(err)}
            // success
            res.render('maker_list', {title: 'Makers', maker_list: list_makers})
        })
}

// maker detail

exports.maker_detail = (req, res, next) => {
    
    async.parallel({
        maker: (callback) => {
            Maker.findById(req.params.id)
                .exec(callback);
        },
        maker_instruments: (callback) => {
            Instrument.find({'maker': req.params.id})
                .exec(callback);
        },
    }, (err, results) => {
        if (err) {return next(err)}
        if (results.maker == null) {
            let err = new Error('Maker not found.')
            err.status = 404
            return next(err)
        }
        res.render('maker_detail', {title: 'Maker Detail', maker: results.maker, maker_instruments: results.maker_instruments})
    })

}

// maker create get

exports.maker_create_get = (req, res) => {
    res.render('maker_form', {title: 'Create New Maker', errors: null, maker: null})
}

// maker create post

exports.maker_create_post = [
    body('company_name', 'Company name Required').trim().isLength({min: 1}).escape(),
    body('date_of_founding', 'Invalid Date').optional({checkFalsy: true}).isISO8601().toDate(),
    (req, res, next) => {
        const errors = validationResult(req);
        let maker = new Maker({
            company_name: req.body.company_name,
            date_of_founding: req.body.date_of_founding
        })
        if (!errors.isEmpty()) {
            res.render('maker_form', {title: 'Create New Maker', errors: errors.array(), maker: maker});
            return;
        }
        else {
            Maker.findOne({company_name: req.body.company_name})
                .exec((err, found_maker) => {
                    if (err) {return next(err)}
                    if (found_maker) {
                        res.redirect(found_maker.url)
                    }
                    else {
                        maker.save((err) => {
                            if (err) {return next(err)}
                            res.redirect(maker.url);
                        })
                    }
                })
        }
    }
]

// maker delete get

exports.maker_delete_get = (req, res, next) => {
    
    async.parallel({
        maker: (callback) => {
            Maker.findById(req.params.id)
                .exec(callback)
        },
        maker_instruments: (callback) => {
            Instrument.find({'maker': req.params.id})
                .exec(callback)
        }
    }, (err, results) => {
        if (err) {return next(err)}
        if (results.maker == null) {
            res.redirect('/catalog/makers')
        }
        res.render('maker_delete', {title: 'Delete Maker', maker: results.maker, maker_instruments: results.maker_instruments})
    })
}

// maker delete post

exports.maker_delete_post = (req, res, next) => {
    
    async.parallel({
        maker: (callback) => {
            Maker.findById(req.params.id)
                .exec(callback)
        },
        maker_instruments: (callback) => {
            Instrument.find({'maker': req.params.id})
                .exec(callback)
        }
    }, (err, results) => {
        if (err) {return next(err)}
        if (results.maker_instruments.length) {
            res.render('maker_delete', {title: 'Delete Maker', maker: results.maker, maker_instruments: results.maker_instruments})
        }
        else {
            Maker.findByIdAndRemove(req.body.maker_id, (err) => {
                if (err) {return next(err)}
                res.redirect('/catalog/makers')
            })
        }
    })
}

// maker update get

exports.maker_update_get = (req, res, next) => {
    Maker.findById(req.params.id)
        .exec((err, maker) => {
            if (err) {return next(err)}
            if (maker.company_name == null) {
                let err = new Error('Maker not found.')
                err.status = 404
                return next(err)
            }
            res.render('maker_form', {title: 'Update Maker', errors: null, maker: maker})
        })
}

// maker update post

exports.maker_update_post = [
    body('company_name', 'Company name Required').trim().isLength({min: 1}).escape(),
    body('date_of_founding', 'Invalid Date').optional({checkFalsy: true}).isISO8601().toDate(),
    (req, res, next) => {
        const errors = validationResult(req)
        let maker = new Maker({
            company_name: req.body.company_name,
            date_of_founding: req.body.date_of_founding,
            _id: req.params.id 
        })
        if (!errors.isEmpty) {
            res.render('maker_form', {title: 'Update Maker', errors: errors.array(), maker: maker})
        }
        else {
            Maker.findByIdAndUpdate(req.params.id, maker, {}, (err, updatedMaker) => {
                if (err) {return next(err)}
                res.redirect(updatedMaker.url)
            })
        }
    }
]