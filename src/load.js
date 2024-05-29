/**
 * @param {HTMLDivElement} page
 * @param {string} url
 */
async function load(page, url) {
 const response = await fetch(`/data/${url}`)
 const data = await response.json()
 const result = await sandbox(data.code, { url })
 console.log(result)
 if (result && typeof result === 'object') {
  page.appendChild(toElem(result))
 } else {
  page.append(
   elem({
    textContent:
     typeof result === 'string' ? result : String(result),
   })
  )
 }
}
