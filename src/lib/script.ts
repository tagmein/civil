import { Card } from './card'
import { RequiredProperties } from './types'

interface Branch {
 run(
  runner: (x: RequiredProperties<Card, 'action'>) => any
 ): Script
}

export type Script = (
 runner: (x: RequiredProperties<Card, 'action'>) => any
) => void

export function script(
 ...instructions: (
  | RequiredProperties<Card, 'action'>
  | Branch
 )[]
): Script {
 return function (
  runner: (x: RequiredProperties<Card, 'action'>) => any
 ) {
  for (const instruction of instructions) {
   if ('run' in instruction) {
    instruction.run(runner)(runner)
   } else {
    runner(instruction)
   }
  }
 }
}

export function branch(
 callback: (
  runner: (x: RequiredProperties<Card, 'action'>) => any
 ) => Script
): Branch {
 return { run: callback }
}
