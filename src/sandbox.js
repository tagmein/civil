const workerBlob = new Blob([
 `const MAX_OUTPUT_SIZE = 1024 * 1024;
onmessage = (e) => {
 try {
  const result = String(eval(\`(function() {\${e.data}})()\`));
  if (result.length > MAX_OUTPUT_SIZE) {
    throw new Error("Output exceeds size limit");  
  }
  postMessage('S' + result);
 } catch (err) {
  postMessage('E' + err.message);  
 }
}`,
])

async function sandbox(code, maxTime = 5000) {
 const MAX_INPUT_SIZE = 32 * 1024

 if (code.length > MAX_INPUT_SIZE) {
  throw new Error('Formula exceeds size limit')
 }

 return new Promise((resolve, reject) => {
  const worker = new Worker(URL.createObjectURL(workerBlob))

  let workerTimeout
  const timeout = () => {
   worker.terminate()
   reject(new Error('Formula timed out'))
  }

  worker.onmessage = (e) => {
   clearTimeout(workerTimeout)
   if (e.data.startsWith('S')) {
    resolve(e.data.substring(1))
   } else {
    reject(new Error(e.data.substring(1)))
   }
  }

  worker.postMessage(code)
  workerTimeout = setTimeout(timeout, maxTime)
 })
}
