const ctRegisterMicroservice = require('ct-register-microservice-node');

class DataJsonSerializer {

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

    static async serializeElement(el) {
        const tableName = await DataJsonSerializer.getDatasetTableName(el.dataset);

        const result = {
            title: el.name,
            description: el.description || '',
            keyword: [],
            modified: el.updatedAt,
            publisher: el.sourceOrganization || '',
            contactPoint: el.sourceOrganization || '',
            identifier: el._id,
            accessLevel: 'public',
            mbox: 'info@Data4SDGS.org',
            accessLevelComment: '',
            distribution: [
                {
                    accessURL: `/v1/download/${el.dataset}?sql=select * from ${tableName}&format=csv`,
                    format: 'csv'
                },
                {
                    accessURL: `/v1/download/${el.dataset}?sql=select * from ${tableName}&format=json`,
                    format: 'application/json'
                }
            ],
            webService: el.dataSourceEndpoint,
            license: el.license,
            spatial: el.countries
        };

        if (el.dataSourceEndpoint) {
            result.distribution.push({
                accessURL: el.dataSourceEndpoint,
                format: 'source'
            });
        }

        return result;
    }

    static async serialize(data) {
        return await DataJsonSerializer.serializeElement(data);
    }

    static async serializeAll(data) {
        if (!data || Array.isArray(data) || data.length === 0) {
            return {};
        }

        return await Promise.all(data.docs.map(async (el) => await DataJsonSerializer.serializeElement(el)));
    }

}

module.exports = DataJsonSerializer;
