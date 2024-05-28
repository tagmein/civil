import fs from 'node:fs/promises'
import path from 'node:path'
import http from 'node:http'

const MAX_REQUEST_BODY_SIZE = 1024 * 1024

const contentTypesByExtension = {
 html: 'text/html',
 ico: 'image/x-icon',
 js: 'text/javascript',
 json: 'application/json',
}
const dataDirectory = 'data'
const srcDirectory = 'src'
const port = parseInt(process.env.PORT ?? '8000', 10)

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
async function GET(req, res) {
 switch (req.url) {
  case '/':
   sendFile(res, path.join(srcDirectory, 'index.html'))
   break
  case '/favicon.ico':
   sendFile(res, 'favicon.ico')
   break
  default:
   const dataPrefix = '/data/'
   const srcPrefix = '/src/'
   if (req.url.startsWith(srcPrefix)) {
    sendFile(
     res,
     path.join(
      srcDirectory,
      ...req.url.substring(srcPrefix.length).split('/')
     )
    )
   } else if (req.url.startsWith(dataPrefix)) {
    const fileName = req.url.substring(dataPrefix.length)
    const fileDir = segmentedDir(fileName)
    sendFile(
     res,
     path.join(dataDirectory, fileDir, fileName)
    )
   } else {
    res.writeHead(404)
    res.end('Not found')
   }
 }
}

/**
 * Get segmented file path
 * @param {string} file
 * @returns {string}
 */
function segmentedDir(file) {
 const a = file.substring(0, 5)
 const b = file.substring(5, 10)
 return path.join(a, b)
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
async function POST(req, res) {
 switch (req.url) {
  case '/data':
   try {
    const data = await getBody(req)
    const now = Date.now()
    const id = (
     Math.random().toString(32) + '0000'
    ).substring(2, 6)
    const file = `${now}-${id}.json`
    const fileDir = path.join(
     dataDirectory,
     segmentedDir(file)
    )
    await fs.mkdir(fileDir, { recursive: true })
    await fs.writeFile(path.join(fileDir, file), data, {
     encoding: 'utf-8',
    })
    const responseBody = JSON.stringify({ url: file })
    res.writeHead(200, {
     'Content-Type': 'application/json',
     'Content-Length': Buffer.byteLength(responseBody),
    })
    res.end(responseBody)
   } catch (e) {
    if (e.clientError) {
     res.writeHead(400)
     res.end(e.message)
    } else {
     console.error(e)
     res.writeHead(500)
     res.end('Server error')
    }
   }
   break
  default:
   res.writeHead(404)
   res.end('Not found')
 }
}

/**
 * Get request body
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<string>}
 */
async function getBody(req) {
 return new Promise((resolve, reject) => {
  let body = ''
  let ok = true
  req.on('data', (chunk) => {
   if (ok) {
    if (
     body.length + chunk.length >
     MAX_REQUEST_BODY_SIZE
    ) {
     ok = false
     const requestBodyError = new Error(
      `Request body too large (limit is ${MAX_REQUEST_BODY_SIZE})`
     )
     requestBodyError.clientError = true
     reject(requestBodyError)
    }
    body += chunk
   }
  })
  req.on('end', () => {
   if (ok) {
    resolve(body)
   }
  })
 })
}

/**
 * @param {import('http').ServerResponse} res
 * @param {string} file
 */
async function sendFile(res, file) {
 try {
  const extension = file.substring(
   file.lastIndexOf('.') + 1
  )
  const content = await fs.readFile(
   file,
   extension === 'ico'
    ? {}
    : {
       encoding: 'utf-8',
      }
  )
  res.writeHead(200, {
   'Content-Type':
    contentTypesByExtension[extension] ?? 'text/plain',
  })
  res.end(content)
 } catch (e) {
  res.writeHead(404)
  res.end('Not found')
 }
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
async function listener(req, res) {
 const handler = { GET, POST }[req.method]
 if (handler) {
  handler(req, res)
 } else {
  res.writeHead(404)
  res.end('Not found')
 }
}

async function main() {
 console.log('Starting...')
 await fs.mkdir(dataDirectory, { recursive: true })
 http
  .createServer(listener)
  .listen(port, () =>
   console.log(`Listening on http://localhost:${port}`)
  )
}

main().catch((e) => console.error(e))
