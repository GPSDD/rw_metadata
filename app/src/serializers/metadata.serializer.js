const ctRegisterMicroservice = require('ct-register-microservice-node');
const logger = require('logger');

class MetadataSerializer {

    static async getDatasetTableName(dataset) {
        try {
            const result = await ctRegisterMicroservice.requestToMicroservice({
                uri: `/dataset/${dataset}`,
                method: 'GET',
                json: true
            });
            return result.data.attributes.tableName;
        } catch (e) {
            throw new Error(e);
        }
    }

    static async serialize(data) {
        const result = {
            data: []
        };
        if (data) {
            let serializeData = data;
            if (!Array.isArray(data)) {
                serializeData = [data];
            }
            const metadata = await Promise.all(serializeData.map(async (el) => {
                const tableName = await MetadataSerializer.getDatasetTableName(el.dataset);
                logger.debug(tableName);
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
                        dataDownloadUrl: {
                            csv: `/v1/download/${el.dataset}?sql=select * from ${tableName}&format=csv`,
                            json: `/v1/download/${el.dataset}?sql=select * from ${tableName}&format=json`
                        },
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
            }));
            result.data = metadata;
        }
        return result;
    }

}

module.exports = MetadataSerializer;
