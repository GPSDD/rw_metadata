/**
 * Tests are WIP and not functional
 * Future-us should finish them
 */

// const logger = require('logger');
// const nock = require('nock');
// const request = require('superagent').agent();
// const BASE_URL = require('./test.constants').BASE_URL;
// const ROLES = require('./test.constants').ROLES;
// require('should');
//
// let referencedDataset = null;
//
// function isArray(element) {
//     if (element instanceof Array) {
//         return true;
//     }
//     return false;
// }
//
// function isObject(property) {
//     if (property instanceof Object && property.length === undefined) {
//         return true;
//     }
//     return false;
// }
//
// function deserializeDataset(response) {
//     if (isArray(response.body.data)) {
//         return response.body.data.map(el => el.attributes);
//     } else if (isObject(response.body.data)) {
//         return response.body.data.attributes;
//     }
//     return response;
// }
//
// const datasetMetadata = {
//     dataset: '44c7fa02-391a-4ed7-8efc-5d832c567d57',
//     language: 'en',
//     name: '44c7fa02-391a-4ed7-8efc-5d832c567d57 metadata',
//     sourceOrganization: 'fake data',
//     dataSourceUrl: 'fake data',
//     dataDownloadUrl: {
//         csv: '/v1/download/44c7fa02-391a-4ed7-8efc-5d832c567d57?sql=select * from aqueduct_projections_20150309&format=csv',
//         json: '/v1/download/44c7fa02-391a-4ed7-8efc-5d832c567d57?sql=select * from aqueduct_projections_20150309&format=json'
//     },
//     info: {},
//     units: {},
//     columns: {},
//     userId: '1a10d7c6e0a37126611fd7a7',
//     createdAt: '2018-05-09T16:19:59.249Z',
//     updatedAt: '2018-05-09T16:19:59.249Z',
//     status: 'published',
//     loggedUser: ROLES.ADMIN
// };
//
// const response = {
//     data: {
//         id: '44c7fa02-391a-4ed7-8efc-5d832c567d57',
//         type: 'dataset',
//         attributes: {
//             name: 'Seasonal variability',
//             slug: 'Seasonal-variability',
//             type: null,
//             dataPath: null,
//             attributesPath: null,
//             connectorType: 'rest',
//             provider: 'cartodb',
//             userId: '1a10d7c6e0a37126611fd7a7',
//             connectorUrl: 'https://wri-01.carto.com/tables/aqueduct_projections_20150309/public',
//             tableName: 'aqueduct_projections_20150309',
//             status: 'pending',
//             published: true,
//             sandbox: false,
//             overwrite: false,
//             verified: false,
//             blockchain: {},
//             subscribable: {},
//             env: 'production',
//             geoInfo: false,
//             protected: false,
//             legend: {
//                 date: [],
//                 region: [],
//                 country: [],
//                 nested: []
//             },
//             clonedHost: {},
//             errorMessage: null,
//             taskId: null,
//             createdAt: '2018-05-14T13:51:53.396Z',
//             updatedAt: '2018-05-14T13:51:53.455Z'
//         }
//     }
// }
//
// let nockStuff;
//
// describe('E2E test', () => {
//
//     before(() => {
//
//         // simulating gateway communications
//         nockStuff = nock(`${process.env.CT_URL}/v1`, {
//             reqheaders: {
//                 authentication: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Im1pY3Jvc2VydmljZSIsImNyZWF0ZWRBdCI6IjIwMTYtMDktMTQifQ.IRCIRm1nfIQTfda_Wb6Pg-341zhV8soAgzw7dd5HxxQ'
//             }
//         })
//             .log(console.log)
//             .get(`/dataset/${datasetMetadata.dataset}`)
//             .reply(200, (uri, requestBody) => {
//                 logger.debug(uri);
//                 logger.debug(requestBody);
//                 return response;
//             });
//     });
//
//     /* Create a Carto Dataset */
//     it('Create metadata for a dataset', async () => {
//         try {
//             logger.debug('Deleting previous metadata');
//
//             const url = `${BASE_URL}/dataset/${datasetMetadata.dataset}/metadata`;
//             await request.delete(url)
//                 .query({ language: 'en', loggedUser: JSON.stringify(ROLES.ADMIN) })
//                 .send();
//             logger.debug('Previous metadata deleted');
//         } catch (e) {
//             if (e.status !== 404) {
//                 logger.error('Error deleting previous metadata');
//                 logger.error(e);
//             }
//         }
//
//         let response = null;
//         const timestamp = new Date().getTime();
//         let createdDataset = null;
//         try {
//             const url = `${BASE_URL}/dataset/${datasetMetadata.dataset}/metadata`;
//             response = await request.post(url)
//                 .set('Authorization', `Bearer ${process.env.CT_TOKEN}`)
//                 .send(datasetMetadata);
//             createdDataset = deserializeDataset(response);
//             referencedDataset = response.body.data;
//         } catch (e) {
//             logger.error(e);
//         }
//         logger.debug(nockStuff.activeMocks());
//         response.status.should.equal(200);
//         response.body.should.have.property('data').and.be.a.Object();
//         createdDataset.should.have.property('name').and.be.exactly(`Carto DB Dataset - ${timestamp}`);
//         createdDataset.application.should.be.an.instanceOf(Array).and.have.lengthOf(1);
//         createdDataset.should.have.property('connectorType').and.be.exactly('rest');
//         createdDataset.should.have.property('provider').and.be.exactly('cartodb');
//         createdDataset.should.have.property('connectorUrl').and.be.exactly('https://wri-01.carto.com/tables/wdpa_protected_areas/table');
//         createdDataset.should.have.property('tableName').and.be.exactly('wdpa_protected_areas');
//         createdDataset.should.have.property('userId').and.be.exactly(ROLES.ADMIN.id);
//         createdDataset.should.have.property('status').and.be.exactly('pending');
//         createdDataset.should.have.property('overwrite').and.be.exactly(true);
//         createdDataset.legend.should.be.an.instanceOf(Object);
//         createdDataset.clonedHost.should.be.an.instanceOf(Object);
//     });
//
//     after(() => {
//     });
// });
