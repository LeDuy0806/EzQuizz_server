const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema(
    {
        user_id: { type: mongoose.SchemaTypes.ObjectId, ref: 'users' },
        token: { type: String, unique: true }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('refresh_tokens', RefreshTokenSchema);
