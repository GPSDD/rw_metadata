const config = require('config');
const logger = require('logger');
const ctRegisterMicroservice = require('ct-register-microservice-node');

class DataJsonSerializer {

    static async getDatasetAttributes(dataset) {
        try {
            const result = await ctRegisterMicroservice.requestToMicroservice({
                uri: `/dataset/${dataset}`,
                method: 'GET',
                json: true
            });
            return result.data.attributes;
        } catch (e) {
            throw new Error(e);
        }
    }

    static async serializeElement(el) {
        try {
            const datasetAttributes = await DataJsonSerializer.getDatasetAttributes(el.dataset);

            let distribution;

            switch (datasetAttributes.provider) {

                case 'resourcewatch':
                    distribution = [
                        {
                            accessURL: encodeURI(`${el.dataSourceEndpoint}&format=csv`),
                            format: 'text/csv'
                        },
                        {
                            accessURL: encodeURI(`${el.dataSourceEndpoint}&format=json`),
                            format: 'application/json'
                        }
                    ];
                    break;
                case 'worldbank':
                    distribution = [
                        {
                            accessURL: el.dataSourceEndpoint.replace('format=json', 'format=xml'),
                            format: 'application/xml'
                        },
                        {
                            accessURL: el.dataSourceEndpoint,
                            format: 'application/json'
                        }
                    ];
                    break;
                case 'genericindex':
                    distribution = [];
                    break;
                case 'hdx':
                    distribution = [];
                    if (el.dataSourceEndpoint.endsWith('.json')) {
                        distribution = [
                            {
                                accessURL: el.dataSourceEndpoint,
                                format: 'application/json'
                            }];
                    } else if (el.dataSourceEndpoint.endsWith('.csv')) {
                        distribution = [
                            {

                                accessURL: el.dataSourceEndpoint,
                                format: 'application/csv'
                            }];
                    }
                    break;
                case 'un':
                    distribution = [
                        {
                            accessURL: el.dataSourceEndpoint,
                            format: 'application/json'
                        }
                    ];
                    break;
                default:
                    distribution = [
                        {
                            accessURL: encodeURI(`${config.appSettings.dataJsonBasePath}/query?sql=select * from ${el.dataset}&format=csv`),
                            format: 'text/csv'
                        },
                        {
                            accessURL: encodeURI(`${config.appSettings.dataJsonBasePath}/query?sql=select * from ${el.dataset}&format=json`),
                            format: 'application/json'
                        }
                    ];
                    break;

            }

            if (el.dataSourceEndpoint) {
                distribution.push({
                    accessURL: el.dataSourceEndpoint,
                    format: 'source'
                });
            }

            const result = {
                title: el.name,
                description: el.description || '',
                keyword: [el.sourceOrganization],
                modified: el.updatedAt,
                issued: el.createdAt,
                identifier: el.dataset,
                accessLevel: datasetAttributes.sandbox ? 'public' : 'restricted public',
                mbox: config.appSettings.dataJsonEmail,
                accessLevelComment: datasetAttributes.sandbox ? null : 'Accessible through free registration',
                distribution,
                webService: el.dataSourceEndpoint,
                license: el.license || null,
                spatial: el.countries
            };

            if (datasetAttributes.sandbox) {
                result.accessLevelComment = 'Requires free registration to access';
            }

            if (el.sourceOrganization) {
                result.publisher = {
                    '@type': 'org:Organization',
                    name: el.sourceOrganization
                };
            }

            return result;
        } catch (err) {
            logger.error('Dataset does not exist');
            return null;
        }
    }

    static async serialize(data) {
        return await DataJsonSerializer.serializeElement(data);
    }

    static async serializeAll(data) {
        if (!data || Array.isArray(data) || data.length === 0) {
            return {};
        }

        const metadatas = await Promise.all(data.docs.map(async (el) => await DataJsonSerializer.serializeElement(el)));
        return metadatas.filter(el => el !== null);
    }

}

module.exports = DataJsonSerializer;
