const PermissionSetDiff = require('../lib/permission-set-diff');
const fs = require('fs');

// Very lazy tests! Not testing properly, just giving me a heads up if I've majorly broken something...

describe('permission set diff', () => {
	it('modify', async () => {
		const basePermissionSet = fs.readFileSync('test/resources/permission-set-modify-base.xml', 'utf8');
		const targetPermissionSet = fs.readFileSync('test/resources/permission-set-modify-target.xml', 'utf8');

		const permissionSetDiff = new PermissionSetDiff();
		await permissionSetDiff.setBasePermissionSet(basePermissionSet);
		await permissionSetDiff.addTargetPermissionSet(targetPermissionSet);

		const actualDiff = await permissionSetDiff.getDiff();

		const expectedDiff = JSON.parse(fs.readFileSync('test/resources/permission-set-modify-expected.json', 'utf8'));

		expect(actualDiff).toEqual(expectedDiff);
	});

	it('add', async () => {
		const basePermissionSet = fs.readFileSync('test/resources/permission-set-add-base.xml', 'utf8');
		const targetPermissionSet = fs.readFileSync('test/resources/permission-set-add-target.xml', 'utf8');

		const permissionSetDiff = new PermissionSetDiff();
		await permissionSetDiff.setBasePermissionSet(basePermissionSet);
		await permissionSetDiff.addTargetPermissionSet(targetPermissionSet);

		const actualDiff = await permissionSetDiff.getDiff();

		const expectedDiff = JSON.parse(fs.readFileSync('test/resources/permission-set-add-expected.json', 'utf8'));

		expect(actualDiff).toEqual(expectedDiff);
	});

	it('delete', async () => {
		const basePermissionSet = fs.readFileSync('test/resources/permission-set-delete-base.xml', 'utf8');
		const targetPermissionSet = fs.readFileSync('test/resources/permission-set-delete-target.xml', 'utf8');

		const permissionSetDiff = new PermissionSetDiff();
		await permissionSetDiff.setBasePermissionSet(basePermissionSet);
		await permissionSetDiff.addTargetPermissionSet(targetPermissionSet);

		const actualDiff = await permissionSetDiff.getDiff();

		const expectedDiff = JSON.parse(fs.readFileSync('test/resources/permission-set-delete-expected.json', 'utf8'));

		expect(actualDiff).toEqual(expectedDiff);
	});
});