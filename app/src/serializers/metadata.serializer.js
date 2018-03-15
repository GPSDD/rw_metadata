const ctRegisterMicroservice = require('ct-register-microservice-node');

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

    static async serializeElement(el) {
        const tableName = await MetadataSerializer.getDatasetTableName(el.dataset);
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
    }

    static async serialize(data, link = null) {
        const result = {};
        if (data) {
            if (data.docs) {
                result.data = await Promise.all(data.docs.map(async(el) => { return await MetadataSerializer.serializeElement(el); }));
            } else {
                if (Array.isArray(data)) {
                    result.data = await Promise.all(data.map(async(el) => { return await MetadataSerializer.serializeElement(el); }));
                } else {
                    result.data = await MetadataSerializer.serializeElement(data);
                }
            }
        }
        if (link) {
            result.links = {
                self: `?${link}page[number]=${data.page}&page[size]=${data.limit}`,
                first: `?${link}page[number]=1&page[size]=${data.limit}`,
                last: `?${link}page[number]=${data.pages}&page[size]=${data.limit}`,
                prev: `?${link}page[number]=${data.page - 1 > 0 ? data.page - 1 : data.page}&page[size]=${data.limit}`,
                next: `?${link}page[number]=${data.page + 1 < data.pages ? data.page + 1 : data.pages}&page[size]=${data.limit}`,
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
