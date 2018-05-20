const nock = require('nock');
const { ROLES, DATASET_METADATA_ONE, DATASET_METADATA_TWO, DATASET_METADATA_ONE_RESPONSE_MOCK, DATASET_METADATA_TWO_RESPONSE_MOCK } = require('./test.constants');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiDatetime = require('chai-datetime');
const should = chai.should();
const { validateStandardJSONMetadata, deserializeStandardJSONDataset } = require('./helpers');

let requester;

chai.use(chaiHttp);
chai.use(chaiDatetime);

describe('Access metadata (standard json format)', () => {
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

    it('Get metadata for a single dataset (standard format)', async () => {
        const response = await requester
            .get(`/api/v1/dataset/${DATASET_METADATA_ONE.dataset}/metadata`)
            .send(DATASET_METADATA_ONE);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.a('array');

        const loadedDataset = deserializeStandardJSONDataset(response)[0];

        validateStandardJSONMetadata(loadedDataset, DATASET_METADATA_ONE);
    });

    it('Get metadata for multiple datasets (standard format)', async () => {

        const response = await requester
            .get(`/api/v1/metadata`);
        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.a('array');

        const loadedDatasetOne = deserializeStandardJSONDataset(response)[0];
        const loadedDatasetTwo = deserializeStandardJSONDataset(response)[1];

        validateStandardJSONMetadata(loadedDatasetOne, DATASET_METADATA_ONE);
        validateStandardJSONMetadata(loadedDatasetTwo, DATASET_METADATA_TWO);
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
