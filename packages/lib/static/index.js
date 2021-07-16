// iasync-lib <https://github.com/msikma/iasync>
// © MIT license

const pkg = require('../package.json')
const static = {
  IA_TEST_COLLECTION: 'test_collection',
  
  IASYNC_DATA_FN: '.iasync.data.json',
  IASYNC_IGNORE_FN: '.iasync.ignore.txt',
  IASYNC_UA: `iasync ${pkg.version}`,
  IASYNC_VERSION: `${pkg.version}`,

  IASYNC_IGNORE_DEFAULT: 'IASYNC_IGNORE_DEFAULT'
}

module.exports = static
