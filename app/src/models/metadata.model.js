
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Metadata = new Schema({
    dataset: { type: String, required: true, trim: true },
    application: { type: String, required: true, trim: true, default: 'data4sdgs' },
    userId: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true },
    name: { type: String, required: false, trim: true },
    info: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Metadata', Metadata);
