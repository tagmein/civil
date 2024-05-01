import { Card } from './card'
import { civil, referenceSymbol } from './civil'
import { Script, branch, script } from './script'
import { RequiredProperties } from './types'

export function materializeScript(
 json: any,
 run: (x: RequiredProperties<Card, 'action'>) => any
): Script {
 if (json.type === 'script') {
  const instructions = json.instructions.map(
   (instruction: any) => {
    if (instruction.type === 'action') {
     const action = civil[instruction.function](
      ...instruction.arguments
     )
     if (instruction.value) {
      return {
       ...action,
       action: {
        ...action.action,
        implementation: (...args: any[]) => {
         const value = materializeValue(
          instruction.value,
          run,
          args
         )
         return action.action.implementation(value)
        },
       },
      }
     }
     return action
    } else if (instruction.type === 'branch') {
     return branch((nestedRun) =>
      materializeScript(instruction.script, nestedRun)
     )
    }
   }
  )
  return script(...instructions)
 }
 throw new Error('Invalid script JSON')
}

function materializeValue(
 value: any,
 run: (x: RequiredProperties<Card, 'action'>) => any,
 args: any[] = []
): any {
 if (Array.isArray(value)) {
  return value.map((item) =>
   materializeValue(item, run, args)
  )
 } else if (typeof value === 'object') {
  if (value.type === 'action') {
   if (typeof civil[value.function] !== 'function') {
    throw new Error(
     `civil.${value.function} is not a function`
    )
   }
   const action = civil[value.function](...value.arguments)
   if (value.value) {
    return {
     ...action,
     action: {
      ...action.action,
      implementation: (...args: any[]) => {
       const materializedValue = materializeValue(
        value.value,
        run,
        args
       )
       return action.action.implementation(
        materializedValue
       )
      },
     },
    }
   }
   return run(action)
  } else if (value.type === 'argumentReference') {
   return [referenceSymbol, args[value.index]]
  } else {
   const result: any = {}
   for (const key in value) {
    result[key] = materializeValue(value[key], run, args)
   }
   return result
  }
 }
 return value
}
