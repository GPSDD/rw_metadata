const ctRegisterMicroservice = require('ct-register-microservice-node');
const MetadataNotFound = require('errors/metadataNotFound.error');
const logger = require('logger');
const config = require('config');

class MetadataSerializer {

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
            const dataset = await MetadataSerializer.getDatasetAttributes(el.dataset);
            const tableName = dataset.tableName;

            let dataDownloadUrl;

            switch (dataset.provider) {

                case 'resourcewatch':
                    dataDownloadUrl = {
                        csv: encodeURI(`${el.dataSourceEndpoint}&format=csv`),
                        json: encodeURI(`${el.dataSourceEndpoint}&format=json`)
                    };
                    break;
                case 'worldbank':
                    dataDownloadUrl = {
                        xml: encodeURI(el.dataSourceEndpoint.replace('format=json', 'format=xml')),
                        json: encodeURI(el.dataSourceEndpoint)
                    };
                    break;
                case 'genericindex':
                    dataDownloadUrl = {};
                    break;
                case 'hdx':
                    if (el.dataSourceEndpoint.endsWith('.json')) {
                        dataDownloadUrl = {
                            json: encodeURI(el.dataSourceEndpoint)
                        };
                    } else if (el.dataSourceEndpoint.endsWith('.csv')) {
                        dataDownloadUrl = {
                            csv: encodeURI(el.dataSourceEndpoint)
                        };
                    }
                    break;
                case 'un':
                    dataDownloadUrl = {
                        json: encodeURI(el.dataSourceEndpoint)
                    };
                    break;
                default:
                    dataDownloadUrl = {
                        csv: `${encodeURI(config.appSettings.dataJsonBasePath)}/v1/download/${el.dataset}?sql=select * from ${tableName}&format=csv`,
                        json: `${encodeURI(config.appSettings.dataJsonBasePath)}/v1/download/${el.dataset}?sql=select * from ${tableName}&format=json`
                    };
                    break;

            }

            return {
                id: el._id,
                type: 'metadata',
                attributes: {
                    dataset: el.dataset,
                    language: el.language,
                    name: el.name,
                    description: el.description,
                    sourceOrganization: el.sourceOrganization,
                    dataSourceUrl: el.dataSourceUrl,
                    dataSourceEndpoint: el.dataSourceEndpoint,
                    dataDownloadUrl,
                    info: el.info,
                    citation: el.citation,
                    license: el.license,
                    units: el.units,
                    columns: el.columns,
                    countries: el.countries,
                    userId: el.userId,
                    createdAt: el.createdAt,
                    updatedAt: el.updatedAt,
                    status: el.status
                }
            };
        } catch (err) {
            logger.error('Dataset does not exist');
            return null;
        }
    }

    static async serialize(data, link = null) {
        const result = {};
        if (data) {
            if (data.docs) {
                result.data = await Promise.all(data.docs.map(async (el) => {
                    return await MetadataSerializer.serializeElement(el);
                }));
                result.data = result.data.filter(el => el !== null);
            } else {
                if (Array.isArray(data)) {
                    result.data = await Promise.all(data.map(async (el) => {
                        return await MetadataSerializer.serializeElement(el);
                    }));
                    result.data = result.data.filter(el => el !== null);
                } else {
                    result.data = await MetadataSerializer.serializeElement(data);
                    if (!result.data) {
                        throw new MetadataNotFound('Metadata not found');
                    }
                }
            }
        }
        if (link) {
            result.links = {
                self: `${link}?page[number]=${data.page}&page[size]=${data.limit}`,
                first: `${link}?page[number]=1&page[size]=${data.limit}`,
                last: `${link}?page[number]=${data.pages}&page[size]=${data.limit}`,
                prev: `${link}?page[number]=${data.page - 1 > 0 ? data.page - 1 : data.page}&page[size]=${data.limit}`,
                next: `${link}?page[number]=${data.page + 1 < data.pages ? data.page + 1 : data.pages}&page[size]=${data.limit}`,
            };
            result.meta = {
                'total-pages': data.pages,
                'total-items': data.total,
                size: data.limit
            };
        }
        return result;
    }

}

module.exports = MetadataSerializer;
