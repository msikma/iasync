// iasync-lib <https://github.com/msikma/iasync>
// © MIT license

const { cmdExec } = require('dada-cli-tools/util/exec')

/**
 * Runs cmdExec() and treats the result as JSON.
 */
const execGetJSON = async (cmd) => {
  const res = await cmdExec(cmd)
  const out = JSON.parse(res.stdout.trim())
  return out
}

module.exports = {
  execGetJSON
}
