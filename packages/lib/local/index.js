// iasync-lib <https://github.com/msikma/iasync>
// © MIT license

const { constants } = require('fs')
const fg = require('fast-glob')
const { createIgnoreParser } = require('../ignore')
const { readJSON, checkAccess, validateSyncData } = require('../util')
const static = require('../static')

/**
 * Returns an object containing arrays of all files in an item:
 * one for accepted files, and one for ignored files (mostly for debugging).
 */
const globItemFiles = async (basedir, ignorePath) => {
  const ignoreParser = await createIgnoreParser(ignorePath)
  const files = await fg(['**/*.*'], { dot: true, cwd: basedir, followSymbolicLinks: false, ignore: [static.IASYNC_DATA_FN] })

  if (ignoreParser == null) {
    return {
      files: files,
      filesIgnored: []
    }
  }

  return {
    files: files.filter(n => ignoreParser.accepts(n)),
    filesIgnored: files.filter(n => ignoreParser.denies(n))
  }
}

const openDirectory = async (basedir) => {
  const isExtant = await checkAccess(basedir, constants.F_OK)
  const isAccessible = await checkAccess(basedir, constants.R_OK)
  const file = `${basedir}/${static.IASYNC_DATA_FN}`
  const ret = {
    error: null,
    local: {
      data: null,
      notes: [],
      isExtant,
      isAccessible,
      isValid: null,
      isSyncItem: null
    },
    remote: {
      data: null,
      isDeleted: null,
      isExtant: null,
      isSyncItem: null
    }
  }
  try {
    const data = await readJSON(file)
    const validation = validateSyncData(data)
    ret.local.data = data
    ret.local.notes = validation.notes
    ret.local.isValid = validation.isValid
    ret.local.isSyncItem = static.IASYNC_VERSION
  }
  catch (err) {
    ret.error = err
    if (err.name === 'SyntaxError') {
      ret.local.isValid = false
      ret.local.notes = ['JSON has a syntax error']
    }
    if (err.code === 'ENOENT') {
      ret.local.isSyncItem = false
    }
  }
  return ret
}

const loadLocalItem = async (basedir, options) => {
  const shell = await openDirectory(basedir)
  const files = await globItemFiles(basedir, options.ignore)
  return {
    ...shell,
    ...files,
    basedir
  }
}

module.exports = {
  loadLocalItem
}
