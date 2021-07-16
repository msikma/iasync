// iasync-lib <https://github.com/msikma/iasync>
// © MIT license

const { loadLocalItem } = require('./local')
const { loadRemoteItem } = require('./remote')
const { getUserConfig } = require('./user')
const commands = require('./commands')

module.exports = {
  loadLocalItem,
  loadRemoteItem,
  getUserConfig,
  ...commands
}
