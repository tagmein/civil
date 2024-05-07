import { Card } from './card'
import { civil } from './civil'
import {
 materializeScript,
 materializeValue,
} from './materialize'
import { branch } from './script'
import { RequiredProperties } from './types'

export function handleActionInstruction(
 instruction: any,
 run: (x: RequiredProperties<Card, 'action'>) => any,
 root: any
): any {
 const action = civil[instruction.function](
  ...instruction.arguments
 )
 switch (instruction.function) {
  case 'invokeMethod':
   if (instruction.value) {
    return {
     ...action,
     action: {
      ...action.action,
      implementation: (...args: any[]) => {
       if (!Array.isArray(instruction.value)) {
        throw new Error(
         `invokeMethod: value must be an array`
        )
       }
       const value = materializeValue(
        instruction.value,
        run,
        args,
        root
       )
       const materializedAction =
        action.action.implementation(...value)
       materializedAction.action.implementation(root.value)
      },
     },
    }
   } else {
    return {
     ...action,
     action: {
      ...action.action,
      implementation: () =>
       action.action.implementation()(root.value),
     },
    }
   }
  case 'setProperty':
   if (instruction.value) {
    return {
     ...action,
     action: {
      ...action.action,
      implementation: () => {
       const value = materializeValue(
        instruction.value,
        run,
        [],
        root
       )
       if (typeof value === 'function') {
        root.value[instruction.arguments[0]] = value(
         root.value
        )
       } else if (value?.action?.implementation) {
        root.value[instruction.arguments[0]] =
         value.action.implementation(root.value)
       } else {
        root.value[instruction.arguments[0]] = value
       }
       return root.value
      },
     },
    }
   } else {
    return {
     ...action,
     action: {
      ...action.action,
      implementation: () => {
       root.value[instruction.arguments[0]] = undefined
       return root.value
      },
     },
    }
   }
  default:
   if (instruction.value) {
    return {
     ...action,
     action: {
      ...action.action,
      implementation: () => {
       if (!Array.isArray(instruction.value)) {
        throw new Error(
         `instruction value must be array, got ${typeof instruction.value}`
        )
       }
       const value = materializeValue(
        instruction.value,
        run,
        [],
        root
       )
       return action.action.implementation(...value)
      },
     },
    }
   } else {
    return action
   }
 }
}

export function handleBranchInstruction(
 instruction: any,
 run: (x: RequiredProperties<Card, 'action'>) => any,
 root: any
): any {
 return branch((nestedRun) =>
  materializeScript(instruction.script, nestedRun, root)
 )
}
