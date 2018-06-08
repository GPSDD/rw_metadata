function isArray(element) {
    if (element instanceof Array) {
        return true;
    }
    return false;
}

function isObject(property) {
    if (property instanceof Object && property.length === undefined) {
        return true;
    }
    return false;
}

function deserializeStandardJSONDataset(response) {
    if (isArray(response.body.data)) {
        return response.body.data.map(el => el.attributes);
    } else if (isObject(response.body.data)) {
        return response.body.data.attributes;
    }
    return response;
}

function validateStandardJSONMetadata(actual, expected) {
    actual.should.have.property('dataset').and.equal(expected.dataset);
    actual.should.have.property('language').and.equal(expected.language);
    actual.should.have.property('name').and.equal(expected.name);
    actual.should.have.property('description').and.equal(expected.description);
    actual.should.have.property('sourceOrganization').and.equal(expected.sourceOrganization);
    actual.should.have.property('dataSourceUrl').and.equal(expected.dataSourceUrl);
    actual.should.have.property('dataDownloadUrl').and.be.a('object');
    actual.should.have.property('info').and.be.a('object');
    actual.should.have.property('units').and.be.a('object');
    actual.should.have.property('columns').and.be.a('object');
    actual.should.have.property('userId').and.equal(expected.userId);
    actual.should.have.property('status').and.equal(expected.status);
    actual.should.have.property('createdAt').and.be.a('string');
    actual.should.have.property('updatedAt').and.be.a('string');

    new Date(actual.createdAt).should.beforeTime(new Date());
    new Date(actual.updatedAt).should.beforeTime(new Date());
}

function validateDataJSONMetadata(actual, expected) {
    actual.should.have.property('accessLevel').and.equal('restricted public');
    actual.should.have.property('accessLevelComment').and.equal('Accessible through free registration');
    actual.should.have.property('description').and.equal(expected.description);
    actual.should.have.property('distribution').and.be.a('array').and.lengthOf.at.least(2);
    actual.should.have.property('identifier').and.equal(expected.dataset);
    actual.should.have.property('keyword').and.be.a('array').and.lengthOf.at.least(1);
    actual.should.have.property('mbox').and.be.a('string');
    actual.should.have.property('modified').and.be.a('string');
    actual.should.have.property('publisher').and.be.a('object').and.deep.equal({
        '@type': 'org:Organization',
        name: expected.sourceOrganization
    });
    actual.should.have.property('title').and.equal(expected.name);
    actual.should.have.property('license');

    new Date(actual.modified).should.beforeTime(new Date());
}

module.exports = {
    deserializeStandardJSONDataset,
    validateStandardJSONMetadata,
    validateDataJSONMetadata
}
