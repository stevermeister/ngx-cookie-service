# 14.0.1

### New Features

- feat(ssr): adds SSR support by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/237
- feat(deps): updates `angular-eslint` version to 14.0.0 by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/239
- docs: updates README.md by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/238

# 14.0.0

## What's Changed

- feat(core): adds Angular 14 support by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/234
- chore(cicd): updates github actions to force install deps by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/236

# 13.2.1

### What's Changed

- chore(deps): bump ejs from 3.1.6 to 3.1.7 by @dependabot in https://github.com/stevermeister/ngx-cookie-service/pull/226
- chore(deps): bump async from 2.6.3 to 2.6.4 by @dependabot in https://github.com/stevermeister/ngx-cookie-service/pull/227

# 13.2.0

### New Features

- feat(core): expose typings for options by @minijus in https://github.com/stevermeister/ngx-cookie-service/pull/218
- feat(cicd): removes Node 12 from CICD pipeline as it reaches EOl on April 30th, 2022

### Bug Fixes

- fix(cicd): fixes build issues in cicd pipeline by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/208
- fix(security): fixes workspace vulnerabilities detected by GitHub by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/213
- chore(deps): bump node-forge from 1.2.1 to 1.3.0 by @dependabot in https://github.com/stevermeister/ngx-cookie-service/pull/220
- chore(deps): bump nanoid from 3.1.30 to 3.3.1 by @dependabot in https://github.com/stevermeister/ngx-cookie-service/pull/221
- chore(deps): bump minimist from 1.2.5 to 1.2.6 by @dependabot in https://github.com/stevermeister/ngx-cookie-service/pull/222
- release: bump version to 13.2.0 by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/224

### New Contributors

- @minijus made their first contribution in https://github.com/stevermeister/ngx-cookie-service/pull/218

# 13.2.0-rc.1

### New Features

- feat: expose typings for options by @minijus in https://github.com/stevermeister/ngx-cookie-service/pull/218

### Bug Fixes

- fix(cicd): fixes build issues in cicd pipeline by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/208
- fix(security): fixes workspace vulnerabilities detected by GitHub by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/213
- chore(deps): bump node-forge from 1.2.1 to 1.3.0 by @dependabot in https://github.com/stevermeister/ngx-cookie-service/pull/220
- chore(deps): bump nanoid from 3.1.30 to 3.3.1 by @dependabot in https://github.com/stevermeister/ngx-cookie-service/pull/221
- chore(deps): bump minimist from 1.2.5 to 1.2.6 by @dependabot in https://github.com/stevermeister/ngx-cookie-service/pull/222
- release: bump version to 13.2.0-rc.1 by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/223

### New Contributors

- @minijus made their first contribution in https://github.com/stevermeister/ngx-cookie-service/pull/218

# 13.1.2

### Bug Fixes

- reverts ssr changes by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/205

# 13.1.1

### Improvements

- chore(build): re-enables linting as angular-eslint supports angular 13 by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/202
- reverts ssr changes by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/204

# 13.1.0

### New Features

- feat(ssr): adds SSR support by @pavankjadda in #199
- docs: updates README.md with new SSR instructions by @pavankjadda in #200
- merge angular universal docs to master by @pavankjadda in #201

# 13.1.0-rc.1

### New Feature

- feat(ssr): adds SSR support by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/199

# 13.0.1

### New Features

- feat(ci): updates CI to run on multiple OSes and Node versions by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/192
- Create FUNDING.yml by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/190
- chore(format): formats code with prettier by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/194
- chore: upgrade angular eslint by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/195

### Bug Fixes

- fix(tests): updates karma configuration by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/193

# 13.0.0

### New Features

- Added support for Angular 13
- Updated docs with changes and [compatibility matrix](https://github.com/stevermeister/ngx-cookie-service#supported-versions)

### Breaking Changes

- `ViewEngine` support has been removed on [13.x.x](https://github.com/stevermeister/ngx-cookie-service#supported-versions). See compatibility matrix for details

# 13.0.0-rc.1

- backport 12.x.x changes to 13.x.x by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/168
- chore(deps): upgrades base angular version to 13.0.0-rc.0 by @pavankjadda in https://github.com/stevermeister/ngx-cookie-service/pull/169

# 13.0.0-rc.1

- Upgraded Angular Version to 13.0.0-rc.1

# 12.0.3

### Bug Fixes

- Fixed bugs where `ViewEngine` libraries that use `ngx-cookie-service` as dependency fails. Disabled ivy compilation as well.
- Closed #144 and #145

# 12.0.2

### Bug Fix

Cicd: Fixes a bug where incorrect folder published to NPM. Closes #142

# 12.0.1

### Docs

Updates README.MD file with correct link to gitter channel

### CICD

Add the ability to publish new version to NPM when new tag published. See #136 for details

# 12.0.0

- upgrade to Angular
  12 ( [106ad8f](https://github.com/stevermeister/ngx-cookie-service/pull/125/commits/106ad8f6bccb96a9bc8b9b0db5d6b5f26ca71100) )
- cleanup

# 11.0.2

- upgrade to Angular
  11 ( [49a45b1](https://github.com/stevermeister/ngx-cookie-service/commit/49a45b1f8638e97af51f7757960d7a6ed98eace8) )
- options_body_param ([2c9de92](https://github.com/stevermeister/ngx-cookie-service/commit/2c9de92df7bb509c2adb9488b426d6cf3230aab7))
- Added the 2nd variant set() with options
  body ( [bf15abc](https://github.com/stevermeister/ngx-cookie-service/commit/bf15abc51e6e063e8075dd1531f4b70b24fe3739) )

# 10.0.1

- fix peerDependencies

# 10.0.0

- major version sync with angular core
- update up to Angular 10.0.5

# 3.0.0

- new build structure
- update up to Angular 9.0.4

# 2.3.0

- `sameSite` now defaults to `None`

# 2.2.0

- use `ng-packagr` instead of our own outdated build script
- use one single readme file for both NPM and GitHub
- update `package.json` scripts

# 2.1.0

- add `SameSite` support

# 2.0.2

- fix publishing error

# 2.0.1

- improve platform identification

# 2.0.0

- `package.json`: change min. requirement from Angular 4 to 4.2
- `package.json`: fix `main` and `typings` references
- update readme and add more frequently asked questions
- fix the `delete` method
- fix e2e tests
- introduce `CHANGELOG.md`
