const BaseDiff = require('./base-diff');
const { parseMetadata } = require('./utils');

class ProfileDiff extends BaseDiff {
	constructor() {
		super();
		this.setMetadataConfig('profile.json');
	}

	async setBaseProfile(baseProfileXml) {
		this.setBase((await parseMetadata(baseProfileXml)).Profile);
	}

	async addTargetProfile(targetProfileXml) {
		this.addTarget((await parseMetadata(targetProfileXml)).Profile);
	}
}

module.exports = ProfileDiff;