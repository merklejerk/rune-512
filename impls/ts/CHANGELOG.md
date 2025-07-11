# Changelog

## [0.3.0](https://github.com/merklejerk/rune-512/compare/rune-512-ts-v0.2.0...rune-512-ts-v0.3.0) (2025-07-11)


### ⚠ BREAKING CHANGES

* use lower 17 bits of sha256 for crc instead of crc16, taking advantage of full 18 bits represented by 2-word header.
* fix package manifest pointing to cli instead of lib as `main`

### Features

* use lower 17 bits of sha256 for crc instead of crc16, taking advantage of full 18 bits represented by 2-word header. ([c0c4573](https://github.com/merklejerk/rune-512/commit/c0c4573546a48974deefad92d983fe7afb5e5ce6))


### Bug Fixes

* fix package manifest pointing to cli instead of lib as `main` ([3924fd0](https://github.com/merklejerk/rune-512/commit/3924fd0a57ab4d388566508fef02a76cccaeff53))
* remove bigint-buffers dependency and replace due to outstanding vuln ([3924fd0](https://github.com/merklejerk/rune-512/commit/3924fd0a57ab4d388566508fef02a76cccaeff53))
* ts package missing deps in manifest ([c0c4573](https://github.com/merklejerk/rune-512/commit/c0c4573546a48974deefad92d983fe7afb5e5ce6))
* update stale encodings in READMEs ([9a1f094](https://github.com/merklejerk/rune-512/commit/9a1f09478bb7faaf6a6ae6c38d92ce945d9f2013))

## [0.2.0](https://github.com/merklejerk/rune-512/compare/rune-512-ts-v0.1.0...rune-512-ts-v0.2.0) (2025-07-11)


### ⚠ BREAKING CHANGES

* use lower 17 bits of sha256 for crc instead of crc16, taking advantage of full 18 bits represented by 2-word header.

### Features

* use lower 17 bits of sha256 for crc instead of crc16, taking advantage of full 18 bits represented by 2-word header. ([c0c4573](https://github.com/merklejerk/rune-512/commit/c0c4573546a48974deefad92d983fe7afb5e5ce6))


### Bug Fixes

* ts package missing deps in manifest ([c0c4573](https://github.com/merklejerk/rune-512/commit/c0c4573546a48974deefad92d983fe7afb5e5ce6))

## Changelog

All notable changes to this project will be documented in this file.
