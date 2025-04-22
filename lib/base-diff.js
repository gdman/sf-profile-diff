const profileMetadata = require('../metadata/profile.json');
const { ensureArray } = require('./utils');
const DiffResult = require('./diff-result');
const fs = require('fs');
const path = require('path');

class BaseDiff {
	constructor() {
		this.targets = [];
		this.basePermissionMapCache = new Map();
	}

	setMetadataConfig(file) {
		this.metadataConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'metadata', file), 'utf8'));
	}

	setBase(base) {
		this.base = base;
	}

	addTarget(target) {
		this.targets.push({ metadata: target, result: new DiffResult() });
	}

	async getDiff() {
		this.#validateInputs();
		this.#fixEmptyPermissions();

		const basePermissionTypes = this.#getPermissionTypes(this.base);

		for (const target of this.targets) {
			const targetPermissionTypes = this.#getPermissionTypes(target.metadata);

			const { 
				deleted: deletedPermissionTypes, 
				added: addedPermissionTypes, 
				common: commonPermissionTypes
			} = getKeyDiff(basePermissionTypes, targetPermissionTypes);

			this.#logPermissionTypeDeletions(target, deletedPermissionTypes);
			this.#logPermissionTypeAdditions(target, addedPermissionTypes);
			this.#logPermissionTypeModifications(target, commonPermissionTypes);
		}

		const results = this.targets.map(target => target.result.getDiff());

		return results.length > 1 ? results : results[0];
	}

	#validateInputs() {
		if (!this.base) {
			throw new Error('Must specify base file for comparison');
		}

		if (!this.targets.length === 0) {
			throw new Error('Must specify a target file for comparison');
		}
	}

	// If there are no nodes in the XML, the parser returns an empty string - probably with newlines/tabs.
	// The parser can be configured to do something like: emptyTag : () => ({}) which would have an empty
	// object instead but that would change all nodes and empty strings are better for genuine empty nodes.
	// Ideally, it wouldn't be a concern of this class but then it would need to be changed for each derived
	// class... I don't really like it but this 'fixes' the issue.
	#fixEmptyPermissions() {
		if (typeof this.base !== 'object') {
			this.base = {};
		}

		for (const target of this.targets) {
			if (typeof target.metadata !== 'object') {
				target.metadata = {};
			}
		}
	}

	#getPermissionTypes(permissionsMetadataFile) {
		return new Set(Object.keys(permissionsMetadataFile));
	}

	#logPermissionTypeDeletions(target, deletedPermissionTypes) {
		for (const permissionType of deletedPermissionTypes) {
			const getKey = this.#getKeyHandler(permissionType);

			for (const entry of ensureArray(this.base[permissionType])) {
				target.result.logDeletion(permissionType, getKey(entry), entry);
			}
		}
	}

	#logPermissionTypeAdditions(target, addedPermissionTypes) {
		for (const permissionType of addedPermissionTypes) {
			const getKey = this.#getKeyHandler(permissionType);

			for (const entry of ensureArray(target.metadata[permissionType])) {
				target.result.logAddition(permissionType, getKey(entry), entry);
			}
		}
	}

	#logPermissionTypeModifications(target, permissionTypes) {
		for (const permissionType of permissionTypes) {
			const { supportsKeys } = this.#getMetadataConfig(permissionType);

			if (!supportsKeys) {
				this.#compareAndLogModification(
					this.base[permissionType], 
					target.metadata[permissionType], 
					target, 
					permissionType, 
					null
				);
				continue;
			}

			const baseMap = this.#getBasePermissionMap(permissionType);
			const targetMap = this.#buildPermissionMap(target.metadata, permissionType);

			const basePermissionIds = this.#getPermissionIds(baseMap);
			const targetPermissionIds = this.#getPermissionIds(targetMap);

			const { 
				deleted: deletedPermissionIds, 
				added: addedPermissionIds, 
				common: commonPermissionIds
			} = getKeyDiff(basePermissionIds, targetPermissionIds);

			for (const deletedPermissionId of deletedPermissionIds) {
				target.result.logDeletion(permissionType, deletedPermissionId, baseMap.get(deletedPermissionId));
			}

			for (const addedPermissionId of addedPermissionIds) {
				target.result.logAddition(permissionType, addedPermissionId, targetMap.get(addedPermissionId));
			}

			for (const commonPermissionId of commonPermissionIds) {
				this.#compareAndLogModification(
					baseMap.get(commonPermissionId), 
					targetMap.get(commonPermissionId), 
					target, 
					permissionType, 
					commonPermissionId
				);
			}
		}
	}

	#buildPermissionMap(profile, permissionType) {
		const getKey = this.#getKeyHandler(permissionType);
		const entries = ensureArray(profile[permissionType]);
		const map = new Map();

		for (const entry of entries) {
			map.set(getKey(entry), entry);
		}

		return map;
	}

	#getBasePermissionMap(permissionType) {
		if (!this.basePermissionMapCache.has(permissionType)) {
			this.basePermissionMapCache.set(permissionType, this.#buildPermissionMap(this.base, permissionType));
		}

		return this.basePermissionMapCache.get(permissionType);
	}

	#getPermissionIds(permissionMap) {
		return new Set(permissionMap.keys());
	}

	#compareAndLogModification(before, after, target, permissionType, id) {
		const beforeJson = JSON.stringify(before);
		const afterJson = JSON.stringify(after);

		// This isn't a foolproof way of comparing - if the attributes are in different orders it'll log
		// a difference but shouldn't happen with profile/permission set metadata so this will probably do.
		// Not going to overengineer for now.
		if (beforeJson !== afterJson) {
			target.result.logModification(permissionType, id, before, after);
		}
	}

	#getMetadataConfig(permissionType) {
		if (!(permissionType in this.metadataConfig)) {
			throw new Error('Unsupported profile attribute: ' + permissionType);
		}
	
		const metadata = this.metadataConfig[permissionType];

		return {
			supportsKeys : metadata.keyHandler !== 'noKey',
			keyHandler : metadata.keyHandler ?? 'default',
			permissionKey : metadata.key
		};
	};
	
	#getKeyHandler(permissionType) {
		const { keyHandler, permissionKey } = this.#getMetadataConfig(permissionType);
	
		switch (keyHandler) {
			case 'layoutAssignment':
				return entry => entry['layout'].split('-')[0] + ':' + (entry['recordType'] ?? '!DEFAULT!');
			
			case 'loginIpRange':
				return entry => entry['startAddress'] + ':' + entry['endAddress'];
			
			case 'noKey':
				return entry => null;
	
			default:
				if (!permissionKey) {
					throw new Error('No configured permission key for: ' + permissionType);
				}
				return entry => entry[permissionKey];
		}
	};
}

const getDeletedKeys = (base, target) => base.difference(target);

const getAddedKeys = (base, target) => target.difference(base);

const getCommonKeys = (base, target) => base.intersection(target);

const getKeyDiff = (base, target) => ({ 
	deleted: getDeletedKeys(base, target),
	added: getAddedKeys(base, target),
	common: getCommonKeys(base, target)
});

module.exports = BaseDiff;