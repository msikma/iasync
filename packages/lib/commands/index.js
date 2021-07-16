// iasync-lib <https://github.com/msikma/iasync>
// © MIT license

const static = require('../static')
const { getUA } = require('../static/ua')

/** "Standard" metadata items that always have only one value. All mandated to be present in .iasync.data.json. */
const singularMetadataKeys = ['title', 'description', 'creator', 'date', 'language', 'mediatype']

/** Primary collections used on the Internet Archive. */
const standardCollections = [
  'opensource_audio',     // Community Audio
  'test_collection',      // Collection of Test Items
  'opensource_movies',    // Community Video
  'opensource',           // Community Texts
  'opensource_media',     // Community Data
  'opensource_image',     // Community Images
  'open_source_software'  // Community Software
]

/** Collection used for testing purposes (all items in here are deleted in 30 days). */
const testCollection = 'test_collection'

/** Escapes strings for use in command line arguments. TODO: multiple levels of escaping */
const escapeQuotes = item => item.replace(/"/g, `\\"`)

/** Wraps array items in quotes. */
const wrapQuotes = item => `"${escapeQuotes(item)}"`

/** Wraps an item in an array if it isn't one already. */
const wrapArray = item => {
  if (!item) return []
  return Array.isArray(item) ? item : [item]
}

/**
 * Adds special collections to a list of collection metatags.
 */
const addSpecialCollections = (collections, item) => {
  if (item._test === 'true') {
    collections.push(testCollection)
  }
  return collections
}

//- "scanner" metadata may NOT be an array
const getSpecialFields = async (sync) => {
  const fields = []
  fields.push(['scanner', await getUA()])
  fields.push(['iasync_version', static.IASYNC_VERSION])
  return fields
}

/**
 * Returns a list of ia commands to run to get an item synchronized with the local files.
 * 
 * TODO: explain more
 */
const createCommands = async (sync) => {
  const { files, basedir } = sync
  const { item } = sync.local.data
  const { identifier, metadata, fields } = item

  // Whether we need to create a new item.
  const needToCreate = !sync.remote.isExtant
  // Whether we need to turn an existing item into an iasync item.
  const needToUpgrade = sync.remote.isExtant && !sync.remote.isSyncItem

  const filesLocal = files.map(fn => `${basedir}/${fn}`).map(wrapQuotes)
  const filesRemote = files.map(wrapQuotes)
  
  const subjectFields = wrapArray(metadata.subject)
  const collectionFields = addSpecialCollections(wrapArray(metadata.collection), item)
  const customFields = Object.entries(fields).map(([key, values]) => wrapArray(values).map(value => [key, value])).flat()

  // Contains special fields, such as the user agent string.
  const additionalFields = await getSpecialFields(sync)

  const singularFields = [...singularMetadataKeys.map(key => [key, metadata[key]]), ...additionalFields]
  const pluralFields = [
    subjectFields.map(value => ['subject', value]),
    collectionFields.map(value => ['collection', value]),
    customFields
  ]

  const commands = []
  let hasDoneInitial = false
  for (let n = 0; n < filesLocal.length; ++n) {
    let segments = []
    segments.push(`upload`)
    segments.push(`"${identifier}"`)
    segments.push(filesLocal[n])
    segments.push(`--remote-name=${filesRemote[n]}`)

    // Add metadata fields, if this is the initial file upload.
    if (needToCreate && !hasDoneInitial) {
      for (const field of singularFields) {
        segments.push(`--metadata="${field[0]}:${escapeQuotes(field[1])}"`)
      }
      for (const fieldType of pluralFields) {
        for (let m = 0; m < fieldType.length; ++m) {
          const field = fieldType[m]
          segments.push(`--metadata="${field[0]}[${m}]:${escapeQuotes(field[1])}"`)
        }
      }
      hasDoneInitial = true
    }

    commands.push(segments)
  }

  return commands.map(cmd => `ia ${cmd.join(' ')}`)
}

module.exports = {
  createCommands
}
