// iasync-lib <https://github.com/msikma/iasync>
// © MIT license

const { execGetJSON } = require('./util')

/**
 * 
 */
const getAllMetadata = async (identifier) => {
  const data = await execGetJSON(`ia metadata "${identifier}"`)
  return data
}

module.exports = {
  getAllMetadata
}
