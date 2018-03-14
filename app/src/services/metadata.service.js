
const logger = require('logger');
const Metadata = require('models/metadata.model');
const MetadataNotFound = require('errors/metadataNotFound.error');
const MetadataDuplicated = require('errors/metadataDuplicated.error');

class MetadataService {

    static getFilter(filter) {
        const finalFilter = {};
        if (filter && filter.language) {
            finalFilter.language = { $in: filter.language.split(',') };
        }
        return finalFilter;
    }

    static async get(dataset, filter) {
        const query = {
            dataset
        };
        const finalQuery = Object.assign(query, MetadataService.getFilter(filter));
        const limit = (isNaN(parseInt(filter.limit, 10))) ? 0 : parseInt(filter.limit, 10);
        logger.debug('Getting metadata');
        return await Metadata.find(finalQuery).limit(limit).exec();
    }

    static async create(user, dataset, body) {
        logger.debug('Checking if metadata exists');
        const currentMetadata = await Metadata.findOne({
            dataset,
            language: body.language
        }).exec();
        if (currentMetadata) {
            logger.error('Error creating metadata');
            throw new MetadataDuplicated(`Metadata of dataset ${dataset} and language: ${body.language} already exists`);
        }
        logger.debug('Creating metadata');
        const metadata = new Metadata({
            dataset,
            language: body.language,
            userId: user.id,
            name: body.name,
            description: body.description,
            sourceOrganization: body.sourceOrganization,
            dataSourceUrl: body.dataSourceUrl,
            dataSourceEndpoint: body.dataSourceEndpoint,
            info: body.info,
            citation: body.citation,
            license: body.license,
            units: body.units,
            columns: body.columns,
            countries: body.countries
        });
        return await metadata.save();
    }

    static async createSome(user, metadatas, dataset) {
        for (let i = 0; i < metadatas.length; i++) {
            await MetadataService.create(user, dataset, metadatas[i]);
        }
        return await MetadataService.get(dataset, {});
    }

    static async update(dataset, body) {
        const metadata = await Metadata.findOne({
            dataset,
            language: body.language
        }).exec();
        if (!metadata) {
            logger.error('Error updating metadata');
            throw new MetadataNotFound(`Metadata of dataset ${dataset} doesn't exist`);
        }
        logger.debug('Updating metadata');
        metadata.name = body.name ? body.name : metadata.name;
        metadata.description = body.description ? body.description : metadata.description;
        metadata.sourceOrganization = body.sourceOrganization ? body.sourceOrganization : metadata.sourceOrganization;
        metadata.dataSourceUrl = body.dataSourceUrl ? body.dataSourceUrl : metadata.dataSourceUrl;
        metadata.dataSourceEndpoint = body.dataSourceEndpoint ? body.dataSourceEndpoint : metadata.dataSourceEndpoint;
        metadata.info = body.info ? body.info : metadata.info;
        metadata.citation = body.citation ? body.citation : metadata.citation;
        metadata.license = body.license ? body.license : metadata.license;
        metadata.units = body.units ? body.units : metadata.units;
        metadata.columns = body.columns ? body.columns : metadata.columns;
        metadata.countries = body.countries ? body.countries : metadata.countries;
        metadata.updatedAt = new Date();
        return await metadata.save();
    }

    static async delete(dataset, filter) {
        const query = {
            dataset
        };
        const finalQuery = Object.assign(query, MetadataService.getFilter(filter));
        const metadata = await Metadata.findOne(query).exec();
        if (!metadata) {
            logger.error('Error deleting metadata');
            throw new MetadataNotFound(`Metadata of dataset ${dataset} doesn't exist`);
        }
        logger.debug('Deleting metadata');
        await Metadata.remove(finalQuery).exec();
        return metadata;
    }

    static async getAll(filter, page, limit) {
        const finalFilter = MetadataService.getFilter(filter);
        logger.debug('Getting metadata');
        const options = {
            page,
            limit
        };
        let pages = await Metadata.paginate(finalFilter, options);
        pages = Object.assign({}, pages);
        return pages;
    }

    static async getByIds(datasets, filter) {
        logger.debug(`Getting metadata with ids ${datasets}`);
        const query = {
            dataset: { $in: datasets }
        };
        const finalQuery = Object.assign(query, MetadataService.getFilter(filter));
        logger.debug('Getting metadata');
        return await Metadata.find(finalQuery).exec();
    }

    static async clone(user, dataset, body) {
        logger.debug('Checking if metadata exists');
        let metadatas = await MetadataService.get(dataset, {});
        metadatas = metadatas.map(metadata => metadata.toObject());
        if (metadatas.length === 0) {
            throw new MetadataNotFound(`No metadata of dataset: ${dataset}`);
        }
        try {
            return await MetadataService.createSome(user, metadatas, body.newDataset, { type: 'dataset', id: body.newDataset });
        } catch (err) {
            throw err;
        }
    }

    /*
    * @returns: hasPermission: <Boolean>
    */
    static async hasPermission(user, dataset, body) {
        let permission = true;
        const metadata = await Metadata.findOne({
            dataset,
            language: body.language
        }).exec();
        if (metadata) {
            if (metadata.userId !== user.id) {
                permission = false;
            }
        }
        return permission;
    }

}

module.exports = MetadataService;
