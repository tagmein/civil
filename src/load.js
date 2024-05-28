/**
 * @param {HTMLDivElement} page
 */
async function load(page, url) {
 const response = await fetch(`/data/${url}`)
 const data = await response.json()
 const result = await sandbox(data.code)
 page.append(
  elem({
   textContent: result,
  })
 )
}
