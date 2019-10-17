## 5.1.2 (2019-10-17)

### Chores


#### fixed bug ([5a3c20d](https://github.com/sealsystems/node-consul/commit/5a3c20d))



---

## 5.1.1 (2019-10-17)

### Chores


#### fix lookup in cloud ([0429e2e](https://github.com/sealsystems/node-consul/commit/0429e2e))



---

## 5.1.0 (2019-10-14)

### Features


#### PLS-431 ([628071b](https://github.com/sealsystems/node-consul/commit/628071b))

- Updated dependencies
 - Updated AppVeyor config
 - Updated CircleCI config
 - Added dependabot config
 - Added GitHub Pull Request template
 - Fixed linting
 - Used `seal-node:oss-module-update`


---

## 5.0.1 (2019-10-04)

### Bug Fixes


#### fixed bug in cloud version of resolveService ([53db833](https://github.com/sealsystems/node-consul/commit/53db833))



---

## 5.0.0 (2019-10-01)



####  ([08031cf](https://github.com/sealsystems/node-consul/commit/08031cf))



### BREAKING CHANGES

#### Consul client is not any longer used in case of running in a cloud environment. Most `node-consul` functions are defined empty or throwing an error in cloud.
If running in cloud or on premise is configured using the environment variable `SERVICE_DISCOVERY`. Possible values are `cloud` and `consul`, default is `consul`.
Additionally the overall service port may be configured using the environment variable `SERVICE_DISCOVERY_PORT`, default is 3000.

---

## 4.1.0 (2019-09-27)

### Features


#### PLS-431 ([e92b889](https://github.com/sealsystems/node-consul/commit/e92b889))

- Added dependabot config
 - Added GitHub Pull Request template
 - Updated appveyor config
 - Updated CircleCI config
 - Updated dependencies
 - Fixed linting


---

## 4.0.1 (2018-11-13)

### Bug Fixes


#### Fix missing lib files ([f50a48b](https://github.com/sealsystems/node-consul/commit/f50a48b))



---

## 4.0.0 (2018-09-08)

### Features


#### Switch to async/await ([cc3ba78](https://github.com/sealsystems/node-consul/commit/cc3ba78))



### BREAKING CHANGES

#### All callbacks must be replaced with async/await.

---

## 3.6.0 (2018-09-08)

### Features

#### Use semantic-release ([f70a048](https://github.com/sealsystems/node-consul/commit/f70a048))

---
