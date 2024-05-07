import {
 handleActionInstruction,
 handleBranchInstruction,
} from './actions'
import { Card } from './card'
import { referenceSymbol } from './civil'
import { Script, script } from './script'
import { RequiredProperties } from './types'
import {
 handleActionFunctionValue,
 handleActionValue,
 handleArgumentReferenceValue,
 handleDefaultValue,
 handleInvokeActionValue,
 handleTemplateValue,
} from './values'

export function materializeScript(
 json: any,
 run: (x: RequiredProperties<Card, 'action'>) => any,
 root: any
): Script {
 if (json.type === 'script') {
  const instructions = json.instructions.map(
   (instruction: any) => {
    switch (instruction.type) {
     case 'action':
      return handleActionInstruction(instruction, run, root)
     case 'branch':
      return handleBranchInstruction(instruction, run, root)
     default:
      throw new Error(
       `Invalid instruction type: ${instruction.type}`
      )
    }
   }
  )
  return script(...instructions)
 }
 throw new Error('Invalid script JSON')
}

export function materializeValue(
 value: any,
 run: (x: RequiredProperties<Card, 'action'>) => any,
 args: any[] = [],
 root: any,
 functionName?: string
): any {
 if (Array.isArray(value)) {
  if (value[0] === referenceSymbol) {
   return value
  }
  return value.map((item) =>
   materializeValue(item, run, args, root, functionName)
  )
 } else if (typeof value?.type === 'string') {
  switch (value.type) {
   case 'action':
    return handleActionValue(
     value,
     run,
     args,
     root,
     functionName
    )
   case 'actionFunction':
    return handleActionFunctionValue(
     value,
     run,
     args,
     root,
     functionName
    )
   case 'argumentReference':
    return handleArgumentReferenceValue(value, args)
   case 'invokeAction':
    return handleInvokeActionValue(
     value,
     run,
     args,
     root,
     functionName
    )
   case 'template':
    return handleTemplateValue(value, root)
   case 'defaultValue':
    return handleDefaultValue(
     value,
     run,
     args,
     root,
     functionName
    )
  }
 } else if (Array.isArray(value?.implementation)) {
  return {
   ...value,
   implementation: (...implArgs: any[]) => {
    const materializedImplementation =
     value.implementation.map((action: any) => {
      const materializedAction = {
       ...action,
       arguments: action.arguments.map((arg: any) => {
        if (arg.type === 'argumentReference') {
         return [referenceSymbol, implArgs[arg.index]]
        }
        return arg
       }),
      }
      return materializeValue(
       materializedAction,
       run,
       implArgs,
       root,
       functionName
      )
     })
    return materializedImplementation.reduce(
     (result: any, action: any) => {
      if (typeof action === 'function') {
       return action(result)
      } else if (action?.action?.implementation) {
       return action.action.implementation(result)
      } else {
       return action
      }
     },
     undefined
    )
   },
  }
 }
 return value
}
