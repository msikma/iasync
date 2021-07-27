// iasync-lib <https://github.com/msikma/iasync>
// © MIT license

const { languageCodes } = require('./marc21')

/*
 TODO

 TAG KEYS CANNOT HAVE SPACES IN THEM
 tag keys can only have _ and - in them as special characters
 tag keys can only start with a alphabetical char
*/

/**
 * Checks whether a given string is a valid identifier.
 *
 * See the following description from the Internet Archive:
 *
 * Each item at Internet Archive has an identifier. An identifier is composed of a unique
 * combination of alphanumeric characters (limited to ASCII), underscores (_), dashes (-),
 * or periods (.). The first character of an identifier must be alphanumeric (e.g. it cannot
 * start out with an underscore, dash, or period). The maximum length of an identifier is 100
 * characters, but we generally recommend that identifiers be between 5 and 80 characters
 * in length.
 *
 * See also: <https://archive.org/services/docs/api/metadata-schema/index.html#archive-org-identifiers>
 */
const isValidIdentifier = identifier => {
  // Check if there are any characters not alphanumeric or _ - .
  const match = identifier.match(/[^A-Za-z0-9_\-.]/)
  if (Array.isArray(match) && match.length > 0) return false
  // Check if the first character is non-alphanumeric
  if (['_', '-', '.'].includes(identifier[0])) return false
  // Check if the length is 100 or greater
  if (identifier.length > 99) return false

  return true
}

/**
 * Checks whether a given mediatype is valid.
 */
const isValidMediatype = type => {
  // TODO: not implemented yet
  return true
}

/**
 * Checks whether a given date is valid.
 *
 * A date should be in the format YYYY-MM-DD, YYYY-MM, or YYYY.
 */
const isValidDate = dateStr => {
  if (!dateStr) return false
  const match = dateStr.match(/[^0-9\-]/)
  if (Array.isArray(match) && match.length > 0) return false
  const bits = dateStr.split('-')
  if (bits.length > 3) return false
  if (bits[0].length !== 4) return false
  if (bits[1] != null && bits[1].length !== 2) return false
  if (bits[2] != null && bits[2].length !== 2) return false
  if (String(new Date(dateStr)) === 'Invalid Date') return false

  return true
}

/**
 * Checks whether a given language is a valid MARC21 language code.
 */
const isValidLanguage = lang => {
  if (!(lang in languageCodes)) return false
  return true
}

/**
 * Checks the data object for problems and returns an array of human-readable problems.
 */
const getSyncDataErrorNotes = (data) => {
  const notes = []
  if (!data || Object.keys(data).length === 0) {
    notes.push('data file is empty')
    return notes
  }
  const { item } = data
  if (!item) {
    notes.push('"item" object is not present')
    return notes
  }
  if (!item.identifier) {
    notes.push('identifier string is missing')
  }
  if (!isValidIdentifier(item.identifier)) {
    notes.push('identifier string is invalid')
  }
  if (!item.metadata) {
    notes.push('"item.metadata" object is not present')
    return notes
  }
  if (!item.metadata.title) {
    notes.push('"item.metadata.title" is missing')
  }
  if (!item.metadata.creator) {
    notes.push('"item.metadata.creator" is missing')
  }
  if (!item.metadata.description) {
    notes.push('"item.metadata.description" is missing')
  }
  if (!item.metadata.date) {
    notes.push('"item.metadata.date" is missing')
  }
  if (item.metadata.date && !isValidDate(item.metadata.date)) {
    notes.push('"item.metadata.date" is invalid')
  }
  if (!item.metadata.mediatype) {
    notes.push('mediatype string is missing')
  }
  if (!isValidMediatype(item.metadata.mediatype)) {
    notes.push('mediatype string is invalid')
  }
  if (!item.metadata.language) {
    notes.push('"item.metadata.language" is missing')
  }
  if (item.metadata.language && !isValidLanguage(item.metadata.language)) {
    notes.push('"item.metadata.language" is invalid')
  }
  return notes
}

/**
 * Runs validation checks on a given sync item's data file (the iasync.data.json file).
 */
const validateSyncData = (data) => {
  const notes = getSyncDataErrorNotes(data)
  return {
    notes,
    isValid: notes.length === 0
  }
}

module.exports = {
  validateSyncData
}
