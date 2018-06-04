const ROLES = {
    USER: {
        id: '1a10d7c6e0a37126611fd7a7',
        role: 'USER',
        provider: 'local',
        email: 'user@control-tower.org',
        extraUserData: {
            apps: [
                'rw',
                'gfw',
                'gfw-climate',
                'prep',
                'aqueduct',
                'forest-atlas',
                'data4sdgs'
            ]
        }
    },
    MANAGER: {
        id: '1a10d7c6e0a37126611fd7a7',
        role: 'MANAGER',
        provider: 'local',
        email: 'user@control-tower.org',
        extraUserData: {
            apps: [
                'rw',
                'gfw',
                'gfw-climate',
                'prep',
                'aqueduct',
                'forest-atlas',
                'data4sdgs'
            ]
        }
    },
    ADMIN: {
        id: '1a10d7c6e0a37126611fd7a7',
        role: 'ADMIN',
        provider: 'local',
        email: 'user@control-tower.org',
        extraUserData: {
            apps: [
                'rw',
                'gfw',
                'gfw-climate',
                'prep',
                'aqueduct',
                'forest-atlas',
                'data4sdgs'
            ]
        }
    }
};

const DATASET_METADATA_ONE = {
    dataset: '44c7fa02-391a-4ed7-8efc-5d832c567d57',
    language: 'en',
    name: '44c7fa02-391a-4ed7-8efc-5d832c567d57 metadata',
    description: '44c7fa02-391a-4ed7-8efc-5d832c567d57 metadata description',
    sourceOrganization: 'fake data',
    dataSourceUrl: 'fake data',
    dataDownloadUrl: {
        csv: '/v1/download/44c7fa02-391a-4ed7-8efc-5d832c567d57?sql=select * from aqueduct_projections_20150309&format=csv',
        json: '/v1/download/44c7fa02-391a-4ed7-8efc-5d832c567d57?sql=select * from aqueduct_projections_20150309&format=json'
    },
    info: {},
    units: {},
    columns: {},
    userId: '1a10d7c6e0a37126611fd7a7',
    createdAt: '2018-05-09T16:19:59.249Z',
    updatedAt: '2018-05-09T16:19:59.249Z',
    status: 'published',
    loggedUser: ROLES.ADMIN
};

const DATASET_METADATA_TWO = {
    dataset: 'cdc4906a-ebd1-420f-9503-656ce8101fe3',
    language: 'en',
    name: 'cdc4906a-ebd1-420f-9503-656ce8101fe3 metadata',
    description: 'cdc4906a-ebd1-420f-9503-656ce8101fe3 metadata description',
    sourceOrganization: 'fake data',
    dataSourceUrl: 'fake data',
    dataDownloadUrl: {
        csv: '/v1/download/cdc4906a-ebd1-420f-9503-656ce8101fe3?sql=select * from aqueduct_projections_20150309&format=csv',
        json: '/v1/download/cdc4906a-ebd1-420f-9503-656ce8101fe3?sql=select * from aqueduct_projections_20150309&format=json'
    },
    info: {},
    units: {},
    columns: {},
    license: 'CC 4.0',
    userId: '1a10d7c6e0a37126611fd7a7',
    createdAt: '2018-05-09T16:19:59.249Z',
    updatedAt: '2018-05-09T16:19:59.249Z',
    status: 'published',
    loggedUser: ROLES.ADMIN
};

const DATASET_METADATA_ONE_RESPONSE_MOCK = {
    data: {
        id: '44c7fa02-391a-4ed7-8efc-5d832c567d57',
        type: 'dataset',
        attributes: {
            name: 'Seasonal variability',
            slug: 'Seasonal-variability',
            type: null,
            dataPath: null,
            attributesPath: null,
            connectorType: 'rest',
            provider: 'cartodb',
            userId: '1a10d7c6e0a37126611fd7a7',
            connectorUrl: 'https://wri-01.carto.com/tables/aqueduct_projections_20150309/public',
            tableName: 'aqueduct_projections_20150309',
            status: 'pending',
            published: true,
            sandbox: false,
            overwrite: false,
            verified: false,
            blockchain: {},
            subscribable: {},
            env: 'production',
            geoInfo: false,
            protected: false,
            legend: {
                date: [],
                region: [],
                country: [],
                nested: []
            },
            clonedHost: {},
            errorMessage: null,
            taskId: null,
            createdAt: '2018-05-14T13:51:53.396Z',
            updatedAt: '2018-05-14T13:51:53.455Z'
        }
    }
}

const DATASET_METADATA_TWO_RESPONSE_MOCK = {
    data: {
        id: 'cdc4906a-ebd1-420f-9503-656ce8101fe3',
        type: 'dataset',
        attributes: {
            name: 'Seasonal variability',
            slug: 'Seasonal-variability',
            type: null,
            dataPath: null,
            attributesPath: null,
            connectorType: 'rest',
            provider: 'cartodb',
            userId: '1a10d7c6e0a37126611fd7a7',
            connectorUrl: 'https://wri-01.carto.com/tables/aqueduct_projections_20150309/public',
            tableName: 'aqueduct_projections_20150309',
            status: 'pending',
            published: true,
            sandbox: false,
            overwrite: false,
            verified: false,
            blockchain: {},
            subscribable: {},
            env: 'production',
            geoInfo: false,
            protected: false,
            legend: {
                date: [],
                region: [],
                country: [],
                nested: []
            },
            clonedHost: {},
            errorMessage: null,
            taskId: null,
            createdAt: '2018-05-14T13:51:53.396Z',
            updatedAt: '2018-05-14T13:51:53.455Z'
        }
    }
};

module.exports = {
    ROLES,
    DATASET_METADATA_ONE,
    DATASET_METADATA_TWO,
    DATASET_METADATA_ONE_RESPONSE_MOCK,
    DATASET_METADATA_TWO_RESPONSE_MOCK
}
