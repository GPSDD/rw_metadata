
class MetadataSerializer {

    static serialize(data) {

        const result = {
            data: []
        };
        if (data) {
            let serializeData = data;
            if (!Array.isArray(data)) {
                serializeData = [data];
            }
            serializeData.forEach((el) => {
                result.data.push({
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
                        info: el.info,
                        citation: el.citation,
                        license: el.license,
                        units: el.units,
                        columns: el.columns,
                        countries: el.countries,
                        createdAt: el.createdAt,
                        updatedAt: el.updatedAt,
                        status: el.status
                    }
                });
            });
        }
        return result;
    }

}

module.exports = MetadataSerializer;
