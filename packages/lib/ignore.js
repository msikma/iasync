// iasync-lib <https://github.com/msikma/iasync>
// © MIT license

const fs = require('fs').promises
const parser = require('@gerhobbelt/gitignore-parser')
const static = require('./static')

/**
 * Returns a parser for ignore pattern files.
 * 
 * This uses a .gitignore parser library since the format is the same.
 */
const createIgnoreParser = async (file) => {
  if (!file) return null
  const fn = file === static.IASYNC_IGNORE_DEFAULT ? `${__dirname}/static/.iasync.ignore.txt` : file
  const ignoreContent = await fs.readFile(fn, 'utf8')
  const ignoreParser = parser.compile(ignoreContent)
  return ignoreParser
}

module.exports = {
  createIgnoreParser
}
