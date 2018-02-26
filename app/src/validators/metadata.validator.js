
const logger = require('logger');
const MetadataNotValid = require('errors/metadataNotValid.error');
const CloneNotValid = require('errors/cloneNotValid.error');

class MetadataValidator {

    static isArray(property) {
        if (property instanceof Array) {
            return true;
        }
        return false;
    }

    static isString(property) {
        if (typeof property === 'string' && property.length >= 0) {
            return true;
        }
        return false;
    }

    static notEmptyString(property) {
        if (typeof property === 'string' && property.length > 0) {
            return true;
        }
        return false;
    }

    static isObject(property) {
        if (property instanceof Object && property.length === undefined) {
            return true;
        }
        return false;
    }

    static isValidProperty(field, type) {
        let isValid = false;
        switch (type) {

        case 'string':
            if (MetadataValidator.isString(field)) {
                isValid = true;
            } else {
                isValid = false;
            }
            break;
        default:

        }
        return isValid;
    }

    static validate(koaObj) {
        logger.info('Validating Metadata Creation');
        koaObj.checkBody('language').notEmpty().toLow();
        koaObj.checkBody('name').optional().check(name => MetadataValidator.isString(name), 'should be a valid string');
        koaObj.checkBody('info').optional().check((info) => {
            if (MetadataValidator.isObject(info)) {
                return true;
            }
            return false;
        }, 'should be a valid object');
        if (koaObj.errors) {
            logger.error('Error validating metadata creation');
            throw new MetadataNotValid(koaObj.errors);
        }
        return true;
    }

    static validateClone(koaObj) {
        logger.info('Validating Metadata Cloning');
        koaObj.checkBody('newDataset').notEmpty().toLow();
        if (koaObj.errors) {
            logger.error('Error validating metadata cloning');
            throw new CloneNotValid(koaObj.errors);
        }
        return true;
    }

}

module.exports = MetadataValidator;
