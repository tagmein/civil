document.getElementById('civil-splash').remove()

let page

async function route() {
 const { hash } = location
 const lastPage = page
 page = document.createElement('div')
 page.classList.add('page')
 if (hash.length > 1) {
  await load(page, hash.substring(1))
 } else {
  await home(page)
 }
 lastPage?.classList?.add?.('hide')
 document.body.appendChild(page)
 await new Promise((r) => setTimeout(r, 500))
 lastPage?.remove?.()
}

addEventListener('hashchange', route)

route().catch((e) => console.error(e))
