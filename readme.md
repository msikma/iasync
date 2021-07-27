# iasync

This is a command line tool for syncing local directories to corresponding items on the Internet Archive.
By preparing a local JSON file with metadata (such as the title, identifier, description and tags) and then running `iasync` inside the directory, all files are uploaded and downloaded as needed. It's also an easy way to upload things from the command line without having to use the `ia` tool manually.

Additionally, `iasync` is able to run scripts that set or modify the metadata before upload, for example to generate a description automatically based on the files in the directory or any custom data set in the local JSON file.

My goal in creating `iasync` was mainly to simplify bulk uploads and to also have an easy path towards mass updating items, especially their descriptions, if I needed it.

## Temp

The `iasync.local-settings.json` file is used to keep track of local options and is never synced to the Internet Archive. For example, if you download an item with metadata only, this file will contain a flag instructing `iasync` to do nothing with regard to syncing files.

## tmp2

"the item has been deleted remotely:"

iasync help deleted-remotely

## Installation

To install:

```
npm install --global iasync-cli
```

`iasync` uses the `ia` command line tool, which has to be installed and configured separately. A small library that powers the command line tool is available as [`iasync-lib` on npm](https://www.npmjs.com/package/iasync).

## Usage

To prepare a directory for use with `iasync`, first a local sync data file needs to be created inside of it. This is a simple JSON file containing things like the title and description of the item among other things, as well as any custom data that you might want to store. This file should be named `iasync.data.json` (or the hidden file variant, `.iasync.data.json`) and needs, *at minimum*, to have the following structure:

```json
{
  "item": {
    "identifier": "MyCoolArchiveOfTextDocs",
    "metadata": {
      "title": "My Cool Archive of Text Documents",
      "creator": "John Donk",
      "description": "<p>Some cool files I made that have text in them.</p>",
      "date": "1999-05-20",
      "language": "eng",
      "mediatype": "text"
    }
  }
}
```

The above is a minimal sync data file that works for most purposes. [There's also an annotated example that has every available option.](example.md)

Once this file has been made, all you need to do to sync content with the Internet Archive is go inside that directory and run `iasync`. Alternatively you can run `iasync --path path/to/dir` to target the directory from anywhere.

To get a default file with some placeholder values to edit, run `iasync --new`, or run `iasync --new-comments` to get a more comprehensive file with comments that explain what the various things are. These comments need to be removed before using the file, but they're useful to get a quick overview of what each item represents.

## Checking out items

Aside from preparing new items, you can check out existing items on the Internet Archive (as long as you own them):

```
iasync checkout MyCoolArchiveOfCatPictures
```

If you're only interested in having the metadata, for example to be able to easily edit it without having a local copy of all the files, use `--metadata`:

```
iasync checkout --metadata MyCoolArchiveOfCatPictures
```

This way you can make edits and re-sync them by using `iasync` like normal.

## Sync data file format

The sync data file can contain three main objects:

| Field | Description |
|:------|:------------|
| item | All main metadata of this Internet Archive item—the only mandatory item |
| custom | Optional data used for automation |
| iasync | Optional settings that change how `iasync` runs |

### Internet Archive metadata

The `item` object has three fields:

| Field | Description |
|:------|:------------|
| identifier | Unique descriptor that is used for the URL—see below |
| metadata | Mandatory metadata key-value pairs, such as title and description |
| fields | Optional custom metadata tags that will be shown on the Internet Archive item page |
| files | Optional file-level metadata tags |

`iasync` uses strict validation on the sync data file. Any errors will be reported by the program before any work is done.

#### Mandatory metadata

Technically the Internet Archive only requires a valid identifier for an upload to go through. Since normally you'd want to make sure all basic metadata is present, `iasync` will error out if it's not there unless you pass the `--no-basic-metadata` option.

Mandatory metadata fields are the following:

| Field | Description |
|:------|:------------|
| title | Human-readable title of the item |
| creator | Original author or publisher of the content of the item (or the principal one if there are more)—usually this is whoever the copyright belonged to at the time of publication |
| description | Explanation of what the content is (HTML) |
| date | Original publication date of the content of the item |
| mediatype | Primary type of media that the item is—audio, video, software, etc. |
| language | What language the content is (primarily) in |

The `date` field must be in the format `YYYY-MM-DD`, `YYYY-MM` or `YYYY`.

The `language` field must be a valid MARC21 three-letter language string, such as `eng` for English.

TODO mediatype

#### Unique identifier

Each Internet Archive item has a unique identifier that is used for the URL. It's subjected to the following rules:

* It can only contain alphanumeric characters (a-z and 0-9) and the special characters underscore, dash and period
* It must start with an alphanumeric character (it cannot start with an underscore, dash or period, but it can start with a number)
* It can't be longer than 100 characters in size (we recommend that you make it between 5 and 80 characters)
* It must be unique

Valid example identifiers are `MyCoolArchive`, `Wedding-Photos-1970`, `Website_Archive_www.mycoolwebsite.com`. Case is maintained.

Once uploaded, your item will be available at a URL such as `https://archive.org/details/MyCoolArchive`. Once it's set, *it can not be changed.*

#### Custom metadata rules

For custom metadata, the *values* are unrestricted strings or arrays of strings, but each *key* must meet the following rules:

* It can only contain alphanumeric characters and the underscore and dash (unlike identifiers, periods are not allowed)
* It must start with an alphabetical character (it cannot start with a number, again unlike identifiers)

Custom metadata values can be either a single string or an array of strings. Here's an example of a valid custom metadata object:

```json
"metadata": {
  "game": "StarCraft",
  "map": ["Neo Sylphid", "Fighting Spirit", "Skull Desert"],
  "player_names": ["a", "b"]
}
```

Note that the values can have spaces and non-alphanumeric characters, but the keys can not.

#### File-level metadata

Metadata can be set for individual files as well:

```json
"files": {
  "dir/my file.jpg": {
    "something": "something else"
  }
}
```

The tags themselves have the same restrictions as the custom metadata listed above.

### Scripting and optional custom data

Aside from the Internet Archive metadata explained above, there is a space for any custom JSON data that does not directly get used except for scripting purposes. This data does not have any restrictions (except that it must be valid JSON).

In fact, there's no reason why you can't simply put whatever custom data you need in a separate file with whatever name you want. But having it in the sync data file makes it easy to find, and your script will be passed a full path to this file.

If all you're interested in is syncing files to the Internet Archive, you can ignore this section. But for those who might want to generate their metadata dynamically (especially the title and description), here's a demonstration of how that would work.

First, we need to have some custom data that we'll want to use:

```json5
"custom": {
  "things": ["Thing one", "Thing two", "Thing three"]
}
```

Of course, you can just generate a title and description without any custom data as well, but we'll go with this for now. With the custom data in place, let's make our script that will do the work:

```js
#!/usr/bin/env node

const fs = require('fs').promises

function makeTitle(custom) {
  return `Item containing ${custom.things.length} things`
}

function makeDescription(custom, files) {
  const lines = []
  lines.push(`<p>Generated description.</p>`)
  lines.push(`<ul>`)
  for (const item of custom.things) {
    lines.push(`<li>${item}</li>`)
  }
  lines.push(`</ul>`)
  lines.push(`<p>There are <strong>${files.length}</strong> files in this collection.</p>`)
  return lines.join('\n')
}

async function main() {
  if (!process.argv[1]) {
    process.stdout.write('please invoke this script from iasync')
    process.exit(1)
  }
  const syncfile = process.argv[1]
  const syncdata = JSON.parse(await fs.readFile(syncfile, 'utf8'))
  const syncfiles = JSON.parse(process.argv[2])

  const title = makeTitle(syncdata.custom)
  const description = makeDescription(syncdata.custom, syncfiles)

  // These are the items that will be merged together with our iasync.data.json file.
  // The original iasync.data.json file itself will not be modified, but the resulting
  // merged data is used when communicating with the Internet Archive.
  // This code runs each time you invoke iasync on an item that has this script set.
  const updates = {
    item: {
      metadata: {
        title,
        description
      }
    }
  }

  process.stdout.write(JSON.stringify(updates))
  process.exit(0)
}

main()
```

We'll save this script as `/Users/msikma/my-script.js` and make sure it's executable.

Now we'll edit our `iasync.data.json` file to add this script as a metadata hook. We'll add the following data to the `iasync` object of the sync data file:

```json
"iasync": {
  "hooks": {
    "syncdata": "/Users/msikma/my-script.js`
  }
}
```

That's it. Now whenever you invoke `iasync` on this item, the program will run `my-script.js` and generate a new title and description that will then be used when communicating with the Internet Archive.

## Command line options

The following command line options are available:

| Option | Argument | Description |
|:-------|:---------|:------------|
| --ignore-list | PATH | Path to list of file patterns to ignore. |
| --ia-config-file | PATH | Internet Archive config file to use (for the `ia` tool) |
| --ia-config-check |  | Checks whether the config file is correct |
| --path | PATH | Path to the item to work with (defaults to the current working directory) |
| --log | LEVEL | Sets console logging verbosity |


## License

© MIT license.
