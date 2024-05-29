const SANDBOX_MAX_INPUT_SIZE = 32 * 1024
const SANDBOX_MAX_OUTPUT_SIZE = 1024 * 1024

const workerBlob = new Blob([
 `const SANDBOX_MAX_OUTPUT_SIZE = ${SANDBOX_MAX_OUTPUT_SIZE};
onmessage = ({ data }) => {
 try {
  const result = eval(\`(function() {\${data}})()\`);
  if (result.length > SANDBOX_MAX_OUTPUT_SIZE) {
    throw new Error("Output exceeds size limit");  
  }
  postMessage({ success: true, result });
 } catch (err) {
  postMessage({ success: false, message: err.message });  
 }
}`,
])

async function sandbox(code, vars, maxTime = 5000) {
 if (code.length > SANDBOX_MAX_INPUT_SIZE) {
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
   if (e.data.success) {
    resolve(e.data)
   } else {
    reject(new Error(e.data.message))
   }
  }

  worker.postMessage(
   `globalThis.VARS = ${JSON.stringify({
    ...vars,
    maxInputSize: SANDBOX_MAX_INPUT_SIZE,
    maxOutputSize: SANDBOX_MAX_OUTPUT_SIZE,
   })}; ${code}`
  )
  workerTimeout = setTimeout(timeout, maxTime)
 })
}
