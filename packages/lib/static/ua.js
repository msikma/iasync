// iasync-lib <https://github.com/msikma/iasync>
// © MIT license

const { cmdExec } = require('dada-cli-tools/util/exec')
const static = require('./index')

const cache = {
  iaVersion: null
}

/**
 * Returns the user agent that all requests will be sent with.
 */
const getUA = async () => {
  if (cache.iaVersion == null) {
    cache.iaVersion = await cmdExec(`ia -v`)
  }
  return `${static.IASYNC_UA} (ia ${cache.iaVersion.stdout.trim()})`
}

module.exports = {
  getUA
}
