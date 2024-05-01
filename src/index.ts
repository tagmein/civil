import { Card } from './lib/card'
import { civil } from './lib/civil'
import { materializeScript } from './lib/materialize'
import { RequiredProperties } from './lib/types'
import { main } from './main-script'
import mainJSON from './main.json'

const root = civil.object().action.implementation()

function run(x: RequiredProperties<Card, 'action'>) {
 return x.action.implementation(root.value)
}

function abc() {
 materializeScript(mainJSON, run)(run)
}

main(run)
