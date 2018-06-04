const nock = require('nock');
const { ROLES, DATASET_METADATA_ONE, DATASET_METADATA_TWO, DATASET_METADATA_ONE_RESPONSE_MOCK, DATASET_METADATA_TWO_RESPONSE_MOCK } = require('./test.constants');
const chai = require('chai');
const chaiHttp = require('chai-http');
const chaiDatetime = require('chai-datetime');
const should = chai.should();
const request = require('superagent');
const { validateStandardJSONMetadata, deserializeStandardJSONDataset } = require('./helpers');

let requester;

chai.use(chaiHttp);
chai.use(chaiDatetime);

describe('Edit metadata', () => {

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
    });

    /* Create a Carto Dataset */
    it('Create metadata for a dataset', async () => {
        const responseOne = await requester
            .post(`/api/v1/dataset/${DATASET_METADATA_ONE.dataset}/metadata`)
            .send(DATASET_METADATA_ONE);
        const createdDatasetOne = deserializeStandardJSONDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').and.be.a('object');

        validateStandardJSONMetadata(createdDatasetOne, DATASET_METADATA_ONE);

        const responseTwo = await requester
            .post(`/api/v1/dataset/${DATASET_METADATA_TWO.dataset}/metadata`)
            .send(DATASET_METADATA_TWO);
        const createdDatasetTwo = deserializeStandardJSONDataset(responseTwo);

        responseTwo.status.should.equal(200);
        responseTwo.body.should.have.property('data').and.be.a('object');

        validateStandardJSONMetadata(createdDatasetTwo, DATASET_METADATA_TWO);
    });

    it('Update metadata for a dataset', async () => {
        const response = await requester
            .patch(`/api/v1/dataset/${DATASET_METADATA_ONE.dataset}/metadata`)
            .send(DATASET_METADATA_TWO);
        const createdDataset = deserializeStandardJSONDataset(response);

        response.status.should.equal(200);
        response.body.should.have.property('data').and.be.a('object');

        const updatedDatasetOne = Object.assign({}, DATASET_METADATA_TWO, { dataset: DATASET_METADATA_ONE.dataset });
        validateStandardJSONMetadata(createdDataset, updatedDatasetOne);
    });

    it('Delete metadata for a dataset', async () => {
        const responseOne = await requester
            .delete(`/api/v1/dataset/${DATASET_METADATA_ONE.dataset}/metadata`)
            .query({ language: 'en', loggedUser: JSON.stringify(ROLES.ADMIN) })
            .send();

        const loadedDatasetOne = deserializeStandardJSONDataset(responseOne);

        responseOne.status.should.equal(200);
        responseOne.body.should.have.property('data').and.be.a('object');


        const responseTwo = await requester
            .delete(`/api/v1/dataset/${DATASET_METADATA_TWO.dataset}/metadata`)
            .query({ language: 'en', loggedUser: JSON.stringify(ROLES.ADMIN) })
            .send();

        const loadedDatasetTwo = deserializeStandardJSONDataset(responseTwo);

        responseTwo.status.should.equal(200);
        responseTwo.body.should.have.property('data').and.be.a('object');

        const updatedDatasetOne = Object.assign({}, DATASET_METADATA_TWO, { dataset: DATASET_METADATA_ONE.dataset });

        validateStandardJSONMetadata(loadedDatasetOne, updatedDatasetOne);
        validateStandardJSONMetadata(loadedDatasetTwo, DATASET_METADATA_TWO);
    });

    after(() => {
    });
});
