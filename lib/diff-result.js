class DiffResult {
	constructor() {
		this.diff = {
			additions: [],
			deletions: [],
			modifications: []
		};
	}

	getDiff() {
		return this.diff;
	}

	logAddition(permissionType, id, after) {
		this.#log('additions', permissionType, id, null, after);
	}

	logDeletion(permissionType, id, before) {
		this.#log('deletions', permissionType, id, before, null);
	}

	logModification(permissionType, id, before, after) {
		this.#log('modifications', permissionType, id, before, after);
	}

	#log(type, permissionType, id, before, after) {
		this.diff[type].push({
			permissionType, id, diff: { before, after }
		});
	}
}

module.exports = DiffResult;