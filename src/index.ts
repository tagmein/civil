import http from 'http'
import { Card } from './lib/card'
import { civil } from './lib/civil'
import { materializeScript } from './lib/materialize'
import { RequiredProperties } from './lib/types'
import mainJSON from './main.json'
// import { main } from './main-script'

const root = civil.object().action.implementation()
Object.assign(root.value, {
 global: globalThis ?? window,
 http,
})

function run(x: RequiredProperties<Card, 'action'>) {
 if (!x?.action) {
  console.error('x')
  console.error(x)
  throw new Error('action required')
 }
 return x.action.implementation(root.value)
}

function runMain() {
 const materializedMain = materializeScript(
  mainJSON,
  run,
  root
 )
 materializedMain(run)
}

runMain()
// main(run)
