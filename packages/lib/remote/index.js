// iasync-lib <https://github.com/msikma/iasync>
// © MIT license

const { getAllMetadata } = require('../metadata')

const loadRemoteItem = async (identifier, item) => {
  try {
    const data = await getAllMetadata(identifier)
    const { metadata } = data
    const isSyncItem = metadata?.iasync_version != null ? metadata.iasync_version : false
    const isDeleted = !!data.is_dark
    const isExtant = Object.keys(data).length > 0
    return {
      ...item,
      remote: {
        ...item.remote,
        data,
        isSyncItem,
        isDeleted,
        isExtant
      }
    }
  }
  catch (err) {
    return {
      ...item,
      remote: {
        ...item.remote,
        data: null,
        error: err
      }
    }
  }
}
  

module.exports = {
  loadRemoteItem
}
