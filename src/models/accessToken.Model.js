const mongoose = require('mongoose');

const AccessTokenSchema = new moogoose.Schema(
    {
        user_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
        token: { type: String, unique: true }
    },
    {
        timestamps: true
    }
);

module.exports = AccessTokenSchema = mongoose.model(
    'access_tokens',
    AccessTokenSchema
);
