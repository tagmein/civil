import { Card } from './card'
import { civil, referenceSymbol } from './civil'
import { materializeValue } from './materialize'
import { RequiredProperties } from './types'

export function handleActionValue(
 value: any,
 run: (x: RequiredProperties<Card, 'action'>) => any,
 args: any[],
 root: any,
 functionName?: string
): any {
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
     const expectsValueArray = ['invokeMethod'].includes(
      action.function
     )
     if (expectsValueArray && !Array.isArray(value.value)) {
      throw new Error(
       `action value must be an array, got ${typeof value.value}`
      )
     }
     const materializedValue = materializeValue(
      value.value,
      run,
      args,
      root,
      value.function
     )
     const result = expectsValueArray
      ? action.action.implementation(...materializedValue)
      : action.action.implementation(materializedValue)
     return result
    },
   },
  }
 }
 return run(action)
}

export function handleArgumentReferenceValue(
 value: any,
 args: any[]
): any {
 return [referenceSymbol, args[value.index]]
}

export function handleInvokeActionValue(
 value: any,
 run: (x: RequiredProperties<Card, 'action'>) => any,
 args: any[],
 root: any,
 functionName?: string
): any {
 const actionToInvoke = materializeValue(
  value.value,
  run,
  args,
  root,
  functionName
 )
 if (actionToInvoke?.action) {
  return actionToInvoke.action.implementation(root.value)
 } else {
  throw new Error(
   `invokeAction expects an Action, got ${typeof actionToInvoke}`
  )
 }
}

export function handleTemplateValue(
 value: any,
 root: any
): any {
 return value.value.replace(
  /\{\{(\w+)\}\}/g,
  (_: unknown, key: string) => root.value[key]
 )
}

export function handleDefaultValue(
 value: any,
 run: (x: RequiredProperties<Card, 'action'>) => any,
 args: any[],
 root: any,
 functionName?: string
): any {
 const defaultVal = value.arguments[0]
 const materializedValue = materializeValue(
  value.value,
  run,
  args,
  root,
  functionName
 )
 return materializedValue ?? defaultVal
}

export function handleActionFunctionValue(
 value: any,
 run: (x: RequiredProperties<Card, 'action'>) => any,
 args: any[],
 root: any,
 functionName?: string
): any {
 const actionValue = value.value
 const materializedAction = materializeValue(
  actionValue,
  run,
  args,
  root,
  functionName
 )
 return function (...args: any[]) {
  const finalAction = materializedAction.implementation
   ? materializedAction.implementation(...args)
   : materializedAction.action.implementation(...args)
  return finalAction.action.implementation(root.value)
 }
}
