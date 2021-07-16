
const stringifyCSV = data => new Promise((resolve, reject) => {
  stringify(data, (err, output) => {
    if (err) return reject(err)
    return resolve(output)
  })
})
const wrapArray = item => {
  if (!item) return []
  return Array.isArray(item) ? item : [item]
}

const headerArray = (name, items) => {
  if (items.length === 1) return [`${name}`]
  return new Array(items.length).fill().map((_, n) => `${name}[${n}]`)
}

const addSpecialCollections = (collections, item) => {
  if (item._test === 'true') {
    collections.push('test_collection')
  }
  return collections
}

const generateUploadCSV = syncitem => {
  const { files, basedir } = syncitem
  const { item } = syncitem.local.data
  const { identifier, metadata, fields } = item

  const collections = addSpecialCollections(wrapArray(metadata.collection), item)
  const subjects = wrapArray(metadata.subject)
  const fieldTypes = Object.entries(fields).map(([key, value]) => [key, wrapArray(value)])

  

  const headers = []
  headers.push(
    'identifier',
    'file',
    'REMOTE_NAME',
    'title',
    'description',
    'creator',
    'date',
    'language',
    'mediatype',
    ...headerArray('collection', collections),
    ...headerArray('subject', subjects),
    ...fieldTypes.map(field => headerArray(field[0], field[1])).flat()
  )

  const blanks = new Array(headers.length).fill(null)
  const blanksPost = blanks.slice(3)
  
  const rows = []
  for (let n = 0; n < files.length; ++n) {
    const fnLocal = `${basedir}/${files[n]}`
    const fnRemote = `${files[n]}`
    if (n === 0) {
      rows.push([
        identifier,
        fnLocal,
        fnRemote,
        metadata.title,
        metadata.description,
        metadata.creator,
        metadata.date,
        metadata.language,
        metadata.mediatype,
        ...collections,
        ...subjects,
        ...fieldTypes.map(field => field[1]).flat()
      ])
    }
    else {
      rows.push([
        identifier,
        fnLocal,
        fnRemote,
        ...blanksPost
      ])
    }
  }
  
  return [
    headers,
    ...rows
  ]
}
