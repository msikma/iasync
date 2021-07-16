// iasync-lib <https://github.com/msikma/iasync>
// © MIT license

const fs = require('fs').promises

const readJSON = async (file) => {
  const data = await fs.readFile(file, 'utf8')
  return JSON.parse(data)
}

const checkAccess = async (basedir, accessType) => {
  try {
    await fs.access(basedir, accessType) == null
  }
  catch (err) {
    return false
  }
  return true
}

module.exports = {
  checkAccess,
  readJSON
}
