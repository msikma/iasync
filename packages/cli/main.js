// iasync <https://github.com/msikma/iasync>
// © MIT license

const path = require('path')
const chalk = require('chalk')
const stringify = require('csv-stringify')
const { log, logFatal, die, logTable } = require('dada-cli-tools/log')
const { progName } = require('dada-cli-tools/util/fs')
const { loadLocalItem, loadRemoteItem, createCommands } = require('iasync-lib')


const printHeader = proj => {
  const { item, custom } = proj.local.data
  const { metadata } = item
  logTable([
    ['Title', [metadata.title]],
    ['Creator', [metadata.creator]],
    ['Identifier', [item.identifier]],
    ['Pub. date', [metadata.date]],
    ['Topics', [metadata.subject.join(', ')]],
    ['Language', [metadata.language]],
  ])
}


/** Main program. */
const main = async (args) => {
  const base = path.resolve(args.path)
  const syncLocal = await loadLocalItem(base, { ignore: args.ignoreFilePath })

  if (syncLocal.local.isExtant === false) die('directory not found:', base)
  if (syncLocal.local.isAccessible === false) die('read access denied:', base)
  if (syncLocal.local.isSyncItem === false) die('not an iasync item:', base)
  if (syncLocal.local.isValid === false) {
    logFatal(`${progName()}: item metadata contains errors:`, base, '- errors follow:')
    logFatal(syncLocal.local.notes.map(note => ` * ${note}`).join('\n'))
    die()
  }

  const { identifier } = syncLocal.local.data.item
  const sync = await loadRemoteItem(identifier, syncLocal)
  if (sync.remote.error) die(`could not retrieve remote data:`, sync.error)
  if (sync.remote.isDeleted) die(`the item has been deleted remotely:`, identifier)
  
  log(sync)
  const commands = await createCommands(sync)
  for (const command of commands) {
    console.log(command)
  }

  //printHeader(item)
  //log(item)
  //log(createUploadCommand(item.local.data.item, item.files, item.basedir))
  //const proj = await 
  //log('iasync: all tasks completed')
  process.exit(0)
}

module.exports = {
  main
}
