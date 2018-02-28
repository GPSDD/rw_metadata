
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const STATUS = require('app.constants').STATUS;

const Metadata = new Schema({
    userId: { type: String, required: true, trim: true },
    language: { type: String, required: true, trim: true },
    dataset: { type: String, required: true, trim: true },
    application: { type: String, required: true, trim: true, default: 'data4sdgs' },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: false, trim: true },
    sourceOrganization: { type: String, required: true, trim: true },
    dataSourceUrl: { type: String, required: true, trim: true },
    dataSourceEndpoint: { type: String, required: false, trim: true },
    info: { type: Schema.Types.Mixed, default: {} },
    citation: { type: String, required: false, trim: true },
    license: { type: String, required: false, trim: true },
    units: { type: Schema.Types.Mixed, default: {} },
    columns: { type: Schema.Types.Mixed, default: {} },
    countries: { type: String, required: false, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    status: { type: String, enum: STATUS, default: 'published' }
});

module.exports = mongoose.model('Metadata', Metadata);
