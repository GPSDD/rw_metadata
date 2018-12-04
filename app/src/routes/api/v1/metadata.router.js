
const Router = require('koa-router');
const logger = require('logger');
const MetadataService = require('services/metadata.service');
const MetadataSerializer = require('serializers/metadata.serializer');
const DataJsonSerializer = require('serializers/data.json.serializer');
const MetadataValidator = require('validators/metadata.validator');
const MetadataNotFound = require('errors/metadataNotFound.error');
const MetadataDuplicated = require('errors/metadataDuplicated.error');
const MetadataNotValid = require('errors/metadataNotValid.error');
const CloneNotValid = require('errors/cloneNotValid.error');
const USER_ROLES = require('app.constants').USER_ROLES;

const router = new Router();

class MetadataRouter {

    static async get(ctx) {
        const dataset = ctx.params.dataset;
        logger.info(`Getting metadata of dataset: ${dataset}`);
        const filter = {};
        let format = 'json';
        if (ctx.query.language) { filter.language = ctx.query.language; }
        if (ctx.query.limit) { filter.limit = ctx.query.limit; }
        if (ctx.query.format) { format = ctx.query.format; }
        const result = await MetadataService.get(dataset, filter);
        if (format === 'json') {
            ctx.body = await MetadataSerializer.serialize(result);
        } else if (format === 'datajson') {
            ctx.body = await DataJsonSerializer.serialize(result[0]);
        } else {
            ctx.throw(400, 'Invalid "format" value');
        }
    }

    static async create(ctx) {
        const dataset = ctx.params.dataset;
        logger.info(`Creating metadata of dataset: ${dataset}`);
        try {
            const user = ctx.request.body.loggedUser;
            if (user.id === 'microservice' && ctx.request.body.userId) {
                user.id = ctx.request.body.userId;
            }
            const result = await MetadataService.create(user, dataset, ctx.request.body);
            ctx.body = await MetadataSerializer.serialize(result);
        } catch (err) {
            if (err instanceof MetadataDuplicated) {
                ctx.throw(400, err.message);
                return;
            }
            throw err;
        }
    }

    static async update(ctx) {
        const dataset = ctx.params.dataset;
        logger.info(`Updating metadata of dataset: ${dataset}`);
        try {
            const result = await MetadataService.update(ctx.params.dataset, ctx.request.body);
            ctx.body = await MetadataSerializer.serialize(result);
        } catch (err) {
            if (err instanceof MetadataNotFound) {
                ctx.throw(404, err.message);
                return;
            }
            throw err;
        }
    }

    static async delete(ctx) {
        const dataset = ctx.params.dataset;
        logger.info(`Deleting metadata of dataset: ${dataset}`);
        const filter = {};
        if (ctx.query.language) { filter.language = ctx.query.language; }
        try {
            const result = await MetadataService.delete(dataset, filter);
            ctx.body = await MetadataSerializer.serialize(result);
        } catch (err) {
            if (err instanceof MetadataNotFound) {
                ctx.throw(404, err.message);
                return;
            }
            throw err;
        }
    }

    static async getAll(ctx) {
        logger.info('Getting all metadata');
        const filter = {};
        let format = 'json';
        if (ctx.query.language) { filter.language = ctx.query.language; }
        if (ctx.query.limit) { filter.limit = ctx.query.limit; }
        if (ctx.query.format) { format = ctx.query.format; }
        const page = ctx.query['page[number]'] ? parseInt(ctx.query['page[number]'], 10) : 1;
        const limit = ctx.query['page[size]'] ? parseInt(ctx.query['page[size]'], 10) : 10;
        const apiVersion = ctx.mountPath.split('/')[ctx.mountPath.split('/').length - 1];
        const link = `${ctx.request.protocol}://${ctx.request.host}/${apiVersion}${ctx.request.path}`;
        const result = await MetadataService.getAll(filter, page, limit);
        if (format === 'json') {
            ctx.body = await MetadataSerializer.serialize(result, link);
        } else if (format === 'datajson') {
            ctx.body = {
                dataset: await DataJsonSerializer.serializeAll(result),
            };
        } else {
            ctx.throw(400, 'Invalid "format" value');
        }
    }

    static async getByIds(ctx) {
        let datasets = ctx.request.body.ids;
        if (!datasets) {
            ctx.throw(400, 'Bad request');
            return;
        }
        logger.info(`Getting metadata by ids: ${datasets}`);
        if (typeof datasets === 'string') {
            datasets = datasets.split(',').map((elem) => elem.trim());
        }
        const filter = {};
        if (ctx.query.language) { filter.language = ctx.query.language; }
        const result = await MetadataService.getByIds(datasets, filter);
        ctx.body = await MetadataSerializer.serialize(result);
    }

    static async clone(ctx) {
        const dataset = ctx.params.dataset;
        const newDataset = ctx.request.body.newDataset;
        logger.info(`Cloning metadata of dataset: ${dataset} in ${newDataset}`);
        try {
            const user = ctx.request.body.loggedUser;
            const result = await MetadataService.clone(user, dataset, ctx.request.body);
            ctx.body = await MetadataSerializer.serialize(result);
        } catch (err) {
            if (err instanceof MetadataDuplicated) {
                ctx.throw(400, err.message);
                return;
            }
            throw err;
        }
    }

}

// Negative checking
const authorizationMiddleware = async (ctx, next) => {
    // Check delete
    // Get user from query (delete) or body (post-patch)
    const user = Object.assign({}, ctx.request.query.loggedUser ? JSON.parse(ctx.request.query.loggedUser) : {}, ctx.request.body.loggedUser);
    if (user.id === 'microservice') {
        await next();
        return;
    }
    if (!user || USER_ROLES.indexOf(user.role) === -1) {
        ctx.throw(401, 'Unauthorized'); // if not logged or invalid ROLE-> out
        return;
    }
    // if (user.role === 'USER') {
    //     ctx.throw(403, 'Forbidden'); // if USER -> out
    //     return;
    // }
    if (user.role === 'MANAGER' || user.role === 'ADMIN' || user.role === 'USER') {
        if ((user.role === 'MANAGER' || user.role === 'USER') && ctx.request.method !== 'POST') { // extra check if a MANAGER wants to update or delete
            const dataset = ctx.params.dataset;
            const permission = await MetadataService.hasPermission(user, dataset, ctx.request.body);
            if (!permission) {
                ctx.throw(403, 'Forbidden');
                return;
            }
        }
    }
    await next(); // SUPERADMIN is included here
};

// Validator Wrapper
const validationMiddleware = async (ctx, next) => {
    try {
        MetadataValidator.validate(ctx);
    } catch (err) {
        if (err instanceof MetadataNotValid) {
            ctx.throw(400, err.getMessages());
            return;
        }
        throw err;
    }
    await next();
};

// Validator Wrapper
const cloneValidationMiddleware = async (ctx, next) => {
    try {
        MetadataValidator.validateClone(ctx);
    } catch (err) {
        if (err instanceof CloneNotValid) {
            ctx.throw(400, err.getMessages());
            return;
        }
        throw err;
    }
    await next();
};

// dataset
router.get('/dataset/:dataset/metadata', MetadataRouter.get);
router.post('/dataset/:dataset/metadata', validationMiddleware, authorizationMiddleware, MetadataRouter.create);
router.post('/dataset/:dataset/metadata/clone', cloneValidationMiddleware, authorizationMiddleware, MetadataRouter.clone);
router.patch('/dataset/:dataset/metadata', validationMiddleware, authorizationMiddleware, MetadataRouter.update);
router.delete('/dataset/:dataset/metadata', authorizationMiddleware, MetadataRouter.delete);
// generic
router.get('/metadata', MetadataRouter.getAll);
// get by id
router.post('/dataset/metadata/get-by-ids', MetadataRouter.getByIds);

module.exports = router;
