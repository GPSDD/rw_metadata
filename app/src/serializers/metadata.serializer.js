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

	    const datasetProvider = dataset.provider;
	    logger.debug(`datasetProvider: ${datasetProvider}`);
            const tableName = dataset.tableName;

	    var dataDownloadUrl;
	    switch(datasetProvider) {
	    case "gee":
		dataDownloadUrl = {csv: null, json: null};
		break;
	    default:
		dataDownloadUrl = {
		    csv: `${encodeURI(config.appSettings.dataJsonBasePath)}/v1/download/${el.dataset}?sql=select * from ${tableName}&format=csv`,
		    json: `${encodeURI(config.appSettings.dataJsonBasePath)}/v1/download/${el.dataset}?sql=select * from ${tableName}&format=json`
                };
	    }
	    
            let data = {
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
                    dataDownloadUrl: dataDownloadUrl,
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
            if (dataset.connectorType === 'worldbank') {
                result.dataDownloadUrl =  {
                    xml: el.dataSourceEndpoint.replace('format=json', 'format=xml'),
                    json: el.dataSourceEndpoint
                };
            }
            return data;
        } catch(err) {
            logger.error('Dataset does not exist');
            return null;
        }
    }

    static async serialize(data, link = null) {
        const result = {};
        if (data) {
            if (data.docs) {
                result.data = await Promise.all(data.docs.map(async(el) => { return await MetadataSerializer.serializeElement(el); }));
                result.data = result.data.filter(el => el !== null);
            } else {
                if (Array.isArray(data)) {
                    result.data = await Promise.all(data.map(async(el) => { return await MetadataSerializer.serializeElement(el); }));
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
