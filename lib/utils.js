const Parser = require('xml2js').Parser;

const ensureArray = objectOrArray => {
	if (!Array.isArray(objectOrArray)) {
		return [ objectOrArray ];
	}
	return objectOrArray;
}

const parseMetadata = async xmlMetadata => {
	const { parseStringPromise } = new Parser({ explicitArray : false, ignoreAttrs : true });

	return parseStringPromise(xmlMetadata);
}

module.exports = { ensureArray, parseMetadata };