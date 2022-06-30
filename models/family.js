let mongoose = require('mongoose');

let Schema = mongoose.Schema;

let FamilySchema = new Schema(
    {
        family_name: {type: String, required: true, maxLength: 100}
    }
);

FamilySchema
    .virtual('url')
    .get(function () {
        return '/catalog/family/' + this._id;
    });

module.exports = mongoose.model('Family', FamilySchema)