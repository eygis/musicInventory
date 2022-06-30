let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let InstanceSchema = new Schema(
    {
        instrument: {type: Schema.Types.ObjectId, ref: 'Instrument', required: true},
        status: {type: String, required: true, enum: ['Ok-Showroom', 'Ok-Backroom', 'Maintenance', 'Irreparable'], default: 'Maintenance'},
        notes: {type: String, required: true, maxLength: 200}
    }
)

InstanceSchema
    .virtual('url')
    .get(function () {
        return '/catalog/instance/' + this._id;
    })

module.exports = mongoose.model('Instance', InstanceSchema);