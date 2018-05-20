const nock = require('nock');
const { ROLES, DATASET_METADATA_ONE, DATASET_METADATA_TWO, DATASET_METADATA_ONE_RESPONSE_MOCK, DATASET_METADATA_TWO_RESPONSE_MOCK } = require('./test.constants');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiDatetime = require('chai-datetime');
const should = chai.should();
const request = require('superagent');
const Ajv = require('ajv');
const metaSchema = require('ajv/lib/refs/json-schema-draft-04.json');
const { validateDataJSONMetadata } = require('./helpers');

let requester;

chai.use(chaiHttp);
chai.use(chaiDatetime);

// Ajv changes to support draft-4
const ajv = new Ajv({
    meta: false, // optional, to prevent adding draft-06 meta-schema
    extendRefs: true, // optional, current default is to 'fail', spec behaviour is to 'ignore'
    unknownFormats: 'ignore',  // optional, current default is true (fail)
    // ...
});
ajv.addMetaSchema(metaSchema);
ajv._opts.defaultMeta = metaSchema.id;
ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';
ajv.removeKeyword('propertyNames');
ajv.removeKeyword('contains');
ajv.removeKeyword('const');

describe('Access metadata (data.json format)', () => {

    before(async () => {

        // simulating gateway communications
        nock(`${process.env.CT_URL}`)
            .persist()
            .post(`/api/v1/microservice`)
            .reply(200);

        // simulating gateway communications
        nock(`${process.env.CT_URL}/v1`)
            .persist()
            .get(`/dataset/${DATASET_METADATA_ONE.dataset}`)
            .reply(200, DATASET_METADATA_ONE_RESPONSE_MOCK);
        nock(`${process.env.CT_URL}/v1`)
            .persist()
            .get(`/dataset/${DATASET_METADATA_TWO.dataset}`)
            .reply(200, DATASET_METADATA_TWO_RESPONSE_MOCK);

        // fire up the test server
        const server = require('../../src/app');
        requester = chai.request(server).keepOpen();

        // delete previous data if it exists
        await requester
            .delete(`/api/v1/dataset/${DATASET_METADATA_ONE.dataset}/metadata`)
            .query({ language: 'en', loggedUser: JSON.stringify(ROLES.ADMIN) })
            .send();
        await requester
            .delete(`/api/v1/dataset/${DATASET_METADATA_TWO.dataset}/metadata`)
            .query({ language: 'en', loggedUser: JSON.stringify(ROLES.ADMIN) })
            .send();


        // add test data to the database
        await requester
            .post(`/api/v1/dataset/${DATASET_METADATA_ONE.dataset}/metadata`)
            .send(DATASET_METADATA_ONE);


        await requester
            .post(`/api/v1/dataset/${DATASET_METADATA_TWO.dataset}/metadata`)
            .send(DATASET_METADATA_TWO);
    });

    it('Get metadata for a single dataset (data.json format)', async () => {

        const response = await requester
            .get(`/api/v1/dataset/${DATASET_METADATA_ONE.dataset}/metadata?format=datajson`)
            .send(DATASET_METADATA_ONE);
        const loadedDataset = response.body;

        response.status.should.equal(200);

        const schemaJSON = await request('GET', `https://project-open-data.cio.gov/schema/1_0_final/single_entry.json`);

        const result = ajv.addSchema(schemaJSON.body, 'singleEntry')
            .validate('singleEntry', response.body);
        if (!result) {
            throw Error(ajv.errorsText());
        }

        response.body.should.be.a('object');
        validateDataJSONMetadata(loadedDataset, DATASET_METADATA_ONE, 'datajson');
    });

    it('Get metadata for multiple datasets (data.json format)', async () => {
        const response = await requester
            .get(`/api/v1/metadata?format=datajson`);


        response.status.should.equal(200);
        response.body.should.be.a('array');

        const loadedDatasetOne = response.body[0];
        const loadedDatasetTwo = response.body[1];

        const schemaJSON = await request('GET', `https://project-open-data.cio.gov/schema/1_0_final/catalog.json`);
        const result = ajv.addSchema(schemaJSON.body, 'catalog')
            .validate('catalog', response.body);
        if (!result) {
            throw Error(ajv.errorsText());
        }

        validateDataJSONMetadata(loadedDatasetOne, DATASET_METADATA_ONE);
        validateDataJSONMetadata(loadedDatasetTwo, DATASET_METADATA_TWO);
    });

    after(async () => {
        // delete previous data if it exists
        await requester
            .delete(`/api/v1/dataset/${DATASET_METADATA_ONE.dataset}/metadata`)
            .query({ language: 'en', loggedUser: JSON.stringify(ROLES.ADMIN) })
            .send();
        await requester
            .delete(`/api/v1/dataset/${DATASET_METADATA_TWO.dataset}/metadata`)
            .query({ language: 'en', loggedUser: JSON.stringify(ROLES.ADMIN) })
            .send();
    });
});
