
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
                        info: el.info,
                        createdAt: el.createdAt,
                        updatedAt: el.updatedAt,
                    }
                });
            });
        }
        return result;
    }

}

module.exports = MetadataSerializer;
