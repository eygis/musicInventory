let mongoose = require('mongoose');
const { DateTime } = require("luxon");

let Schema = mongoose.Schema;

let MakerSchema = new Schema(
    {
        company_name: {type: String, required: true, maxLength: 100},
        date_of_founding: {type: Date}
    }
);

MakerSchema
    .virtual('url')
    .get(function () {
        return '/catalog/maker/' + this._id;
    });

MakerSchema
    .virtual('date_of_founding_formatted')
    .get(function () {
        return DateTime.fromJSDate(this.date_of_founding).toLocaleString(DateTime.DATE_MED);
    })

module.exports = mongoose.model('Maker', MakerSchema)