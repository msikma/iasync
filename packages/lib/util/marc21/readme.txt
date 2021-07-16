These are the MARC21 language codes preferred by the Internet Archive.
Although technically any code can be set, only codes from this list are
considered valid by iasync.

The full list can be found here: https://www.loc.gov/marc/languages/language_code.html

To create a new list, run the following code in the console:

const codes = {}
for (const tr of document.querySelectorAll('table[summary="language codes arranged in code order"] tr')) {
  const k = tr.querySelector('td:nth-child(1)')
  const v = tr.querySelector('td:nth-child(2)')
  if (!k) continue
  codes[k.innerText.trim()] = v.innerText.trim()
}
console.log(JSON.stringify(codes, 0, 2))
