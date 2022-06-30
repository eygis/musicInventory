let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let InstrumentSchema = new Schema(
    {
        type: {type: String, required: true, maxLength: 100},
        family: {type: Schema.Types.ObjectId, ref: 'Family', required: true},
        maker: {type: Schema.Types.ObjectId, ref: 'Maker', required: true}
    }
)

InstrumentSchema
    .virtual('url')
    .get(function () {
        return '/catalog/instrument/' + this._id;
    })

module.exports = mongoose.model('Instrument', InstrumentSchema);