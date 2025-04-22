const ProfileDiff = require('../lib/profile-diff');
const fs = require('fs');

// Very lazy tests! Not testing properly, just giving me a heads up if I've majorly broken something...

describe('profile diff', () => {
	it('modify', async () => {
		const baseProfile = fs.readFileSync('test/resources/profile-modify-base.xml', 'utf8');
		const targetProfile = fs.readFileSync('test/resources/profile-modify-target.xml', 'utf8');

		const profileDiff = new ProfileDiff();
		await profileDiff.setBaseProfile(baseProfile);
		await profileDiff.addTargetProfile(targetProfile);

		const actualDiff = await profileDiff.getDiff();

		const expectedDiff = fs.readFileSync('test/resources/profile-modify-expected.json', 'utf8');

		expect(JSON.stringify(actualDiff, null, 4)).toEqual(expectedDiff);
	});

	it('add', async () => {
		const baseProfile = fs.readFileSync('test/resources/profile-add-base.xml', 'utf8');
		const targetProfile = fs.readFileSync('test/resources/profile-add-target.xml', 'utf8');

		const profileDiff = new ProfileDiff();
		await profileDiff.setBaseProfile(baseProfile);
		await profileDiff.addTargetProfile(targetProfile);

		const actualDiff = await profileDiff.getDiff();

		const expectedDiff = fs.readFileSync('test/resources/profile-add-expected.json', 'utf8');

		expect(JSON.stringify(actualDiff, null, 4)).toEqual(expectedDiff);
	});

	it('delete', async () => {
		const baseProfile = fs.readFileSync('test/resources/profile-delete-base.xml', 'utf8');
		const targetProfile = fs.readFileSync('test/resources/profile-delete-target.xml', 'utf8');

		const profileDiff = new ProfileDiff();
		await profileDiff.setBaseProfile(baseProfile);
		await profileDiff.addTargetProfile(targetProfile);

		const actualDiff = await profileDiff.getDiff();

		const expectedDiff = fs.readFileSync('test/resources/profile-delete-expected.json', 'utf8');

		expect(JSON.stringify(actualDiff, null, 4)).toEqual(expectedDiff);
	});
});