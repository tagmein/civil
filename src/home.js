/**
 * @param {HTMLDivElement} page
 */
async function home(page) {
 const code = elem({
  tagName: 'textarea',
 })
 async function submitCode() {
  code.disabled = true
  const body = JSON.stringify({
   code: code.value,
  })
  const response = await fetch('/data', {
   method: 'POST',
   headers: {
    'content-type': 'application/json',
   },
   body,
  })
  const result = await response.json()
  await new Promise((r) => setTimeout(r, 500))
  if (result.url) {
   location.hash = result.url
  }
 }
 page.append(
  elem({
   textContent: 'Hello world',
   children: [
    code,
    elem({
     events: {
      click: submitCode,
     },
     textContent: 'Submit',
     tagName: 'button',
    }),
   ],
  })
 )
}
