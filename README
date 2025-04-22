# Development In Progress - more docs, examples and general explanation maybe on the way (we'll see if it works first)

# Interfaces may change

sf-profile-diff
================

Library for comparing Salesforce profile and permission set metadata

[![Version](https://img.shields.io/npm/v/sf-profile-diff.svg)](https://npmjs.org/package/sf-profile-diff)
[![Known Vulnerabilities](https://snyk.io/test/github/gdman/sf-profile-diff/badge.svg)](https://snyk.io/test/github/gdman/sf-profile-diff)
[![Downloads/week](https://img.shields.io/npm/dw/sf-profile-diff.svg)](https://npmjs.org/package/sf-profile-diff)
[![License](https://img.shields.io/npm/l/sf-profile-diff.svg)](https://github.com/gdman/sf-profile-diff/blob/master/package.json)
[![Build and Test](https://github.com/gdman/sf-profile-diff/actions/workflows/build.yml/badge.svg?event=push)](https://github.com/gdman/sf-profile-diff/actions/workflows/build.yml)

# Usage

```javascript
	const profileDiff = new ProfileDiff();
	await profileDiff.setBaseProfile([base profile xml]);
	await profileDiff.addTargetProfile([target profile xml]);

	const actualDiff = await profileDiff.getDiff();
```