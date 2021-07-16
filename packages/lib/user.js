// iasync-lib <https://github.com/msikma/iasync>
// © MIT license

const fs = require('fs').promises
const ini = require('ini')

const getUserConfig = async (file) => {
  try {
    const str = await fs.readFile(file, 'utf8')
    const data = ini.parse(str)
    return data
  }
  catch (err) {
    throw { code: 'CFG_INI_ERROR' }
  }
}

module.exports = {
  getUserConfig
}
