const BaseDiff = require('./base-diff');
const { parseMetadata } = require('./utils');

class PermissionSetDiff extends BaseDiff {
	constructor() {
		super();
		this.setMetadataConfig('permission-set.json');
	}

	async setBasePermissionSet(basePermissionSetXml) {
		this.setBase((await parseMetadata(basePermissionSetXml)).PermissionSet);
	}

	async addTargetPermissionSet(targetPermissionSetXml) {
		this.addTarget((await parseMetadata(targetPermissionSetXml)).PermissionSet);
	}
}

module.exports = PermissionSetDiff;