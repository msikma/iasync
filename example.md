The following is an annotated example of a complete `iasync.data.json` file that has all available options. Normally JSON files don't have comments, so be careful to remove them if copypasting this for editing.

```json5
{
  "item": {
    // Unique descriptor that is used for the URL
    "identifier": "MyCoolArchiveOfTextDocs",

    // Mandatory metadata values
    "metadata": {
      // Human-readable title of the item
      "title": "My Cool Archive of Text Documents",
      // Original author or publisher of the content of the item (or the principal one if there are more)
      // -- usually this is whoever the copyright belonged to at the time of publication
      "creator": "John Donk",
      // Explanation of what the content is (HTML)
      "description": "<p>Some cool files I made that have text in them.</p>",
      // Original publication date of the content of the item
      "date": "1999-05-20",
      // What language the content is (primarily) in
      "language": "eng",
      // Primary type of media that the item is -- audio, video, software, etc.
      "mediatype": "text"
    },

    // [Note: everything below this point is optional]

    // Optional custom metadata tags that will be shown on the Internet Archive item page
    // The keys for these fields have some limitations (see readme) and the values
    // can only be strings or arrays of strings.
    "fields": {
      "custom_metadata_field": "some_value",
      "another_field": ["or", "an", "array"]
    },
    // Optional metadata for files. Most items just have item-level metadata, but it is possible
    // to set arbitrary metadata for files too. The same limitations as for custom fields applies here.
    "files": {
      "recipes/cookies.wp5": {
        "created_with": "WordPerfect 5.1"
      }
    },

    // Whether this item is for testing purposes only
    // Testing items are added to 'test_collection', which causes them to be deleted after 30 days.
    "_test": false
  },

  // [Note: the "custom" and "iasync" items are optional too.]

  // Optional custom data for automation purposes
  "custom": {
    "wordTotal": 548903,
    "numberOfTimesIveWrittenAboutCats": 4
  },
  // Optional settings that change what iasync does when it runs
  "iasync": {
    // Shortcut for CLI option --no-basic-metadata - enables skipping otherwise mandatory metadata
    "no_basic_metadata": true,
    // Shortcut for CLI option --no-ignore - runs without ignore list
    "no_ignore": true,
    // Automation hooks for running scripts on the content when using iasync
    "hooks": {
      // The syncdata hook is used for generating metadata dynamically -- see readme
      "syncdata": "/Users/msikma/my-script.js`
    }
  }
}
```
