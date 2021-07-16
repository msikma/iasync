#!/usr/bin/env node

// iasync <https://github.com/msikma/iasync>
// © MIT license

const { resolve } = require('path')
const { makeArgParser } = require('dada-cli-tools/argparse')
const { log, logLevels, logDefaultLevel, setVerbosity } = require('dada-cli-tools/log')
const { ensurePeriod } = require('dada-cli-tools/util/text')
const { resolveTilde, readJSONSync } = require('dada-cli-tools/util/fs')
const { cmdExec } = require('dada-cli-tools/util/exec')

// Path to the application code, i.e. where the top level package.json resides. No trailing slash.
const pkgPath = resolve(`${__dirname}/../../`)
const pkgData = readJSONSync(`${pkgPath}/package.json`)

const parser = makeArgParser({
  addHelp: true,
  longHelp: `
The --ignore-list option works like a .gitignore file and excludes files
from being synced. By default, if nothing is specified, an internal list
with some safe options is used (such as .DS_Store). An item directory can also
contain a local ignore file named .iasync.ignore.txt which will then be used.

See the readme file for more details.\n`,
  description: ensurePeriod(pkgData.description)
})

parser.addArgument(['-v', '--version'], { action: 'storeTrue', help: 'Show program\'s version number and exit.',  dest: 'checkVersion' })
parser.addArgument('--ignore-list', { help: 'Path to list of file patterns to ignore.', metavar: 'PATH', dest: 'ignoreFilePath', defaultValue: 'IASYNC_IGNORE_DEFAULT' })
parser.addArgument('--config-file', { help: 'File to use as config file.', metavar: 'PATH', dest: 'cfgFile', defaultValue: resolveTilde(`~/.config/ia.ini`) })
parser.addArgument('--config-check', { action: 'storeTrue', help: 'Checks whether the "ia" tool is configured.', dest: 'cfgCheck' })
parser.addArgument('--path', { help: 'Directory to sync (defaults to current directory).', metavar: 'PATH', dest: 'path', defaultValue: '.' })
parser.addArgument('--log', { help: `Sets console logging level ("${logDefaultLevel}" by default). Choices: {${logLevels.join(',')}}.`, dest: 'logLevel', choices: logLevels, metavar: 'LEVEL', defaultValue: logDefaultLevel })

const run = async () => {
  const parsed = { ...parser.parseArgs() }

  setVerbosity(parsed.logLevel)

  if (parsed.checkVersion) {
    const iaVersion = await cmdExec(`ia -v`)
    const iaLocation = await cmdExec(`which ia`)
    log(`iasync ${pkgData.version} (ia ${iaVersion.stdout.trim()} from ${iaLocation.stdout.trim()})`)
    process.exit(0)
  }
  else if (parsed.cfgCheck) {
    try {
      await cmdExec(`ia -v`)
      const { getUserConfig } = require('iasync-lib')
      const config = await getUserConfig(parsed.cfgFile)

      if (Object.keys(config.s3).length > 0 && Object.keys(config.cookies).length > 0 && config.general.screenname) {
        log(`iasync: ia is configured and authenticated for the following user: ${config.general.screenname}`)
        process.exit(0)
      }
      log(`iasync: error: ia is installed but not authenticated properly`)
      process.exit(1)
    }
    catch (result) {
      if (result.error && result.error.code === 'ENOENT') {
        log(`iasync: error: ia not installed or not on path`)
        process.exit(1)
      }
      if (result.code === 'CFG_INI_ERROR') {
        log(`iasync: error: ia is installed, but the user configuration ini file could not be read or parsed`)
        process.exit(1)
      }
      log(`iasync: error: an unknown error occurred while checking status of ia:`)
      log(result)
      process.exit(1)
    }
  }
  else {
    require('./main.js').main(parsed, { pkgData, baseDir: pkgPath })
  }
}

run()
