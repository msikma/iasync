// iasync-lib <https://github.com/msikma/iasync>
// © MIT license

const { execCmd } = require('dada-cli-tools/util/exec')

/**
 * Runs execCmd() and treats the result as JSON.
 */
const execGetJSON = async (cmd) => {
  const res = await execCmd(cmd)
  const out = JSON.parse(res.stdout.trim())
  return out
}

module.exports = {
  execGetJSON
}
