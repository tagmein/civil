import { Action, Card, Value } from './card'

export const referenceSymbol = Symbol('reference')
export type SourceValue = [typeof referenceSymbol, any]

export const civil = {
 defaultValue<T>(
  defaultVal: any
 ): Card & { action: Action<T> } {
  return {
   title: `Default ${JSON.stringify(defaultVal)}`,
   action: {
    arguments: [],
    returnType: 'unknown',
    implementation(value: any) {
     return value ?? defaultVal
    },
   },
  }
 },
 extractProperty(
  ...names: (SourceValue | string)[]
 ): Card & { action: Action<any> } {
  return {
   title: `Extract ${JSON.stringify(names.join('.'))}`,
   action: {
    arguments: [{ title: 'source', type: 'object' }],
    returnType: 'unknown',
    implementation(source: any): any {
     let sourceOverride = false
     let sourceOverrideValue: any
     const namesCopy = names.slice()
     if (
      Array.isArray(namesCopy[0]) &&
      namesCopy[0][0] === referenceSymbol
     ) {
      sourceOverride = true
      sourceOverrideValue = namesCopy[0][1]
      namesCopy.splice(0, 1)
     }
     if (sourceOverride) {
      source = sourceOverrideValue
     }
     for (const name of namesCopy) {
      if (
       typeof source === 'undefined' ||
       source === null
      ) {
       return source
      }
      source = source[name as string]
     }
     return source
    },
   },
  }
 },
 invokeMethod(...names: (SourceValue | string)[]): Card & {
  action: Action<
   Card & { action: Action<Card & { action: Action<any> }> }
  >
 } {
  return {
   title: `Invoke ${JSON.stringify(names.join('.'))}`,
   action: {
    arguments: [],
    returnType: 'Action',
    implementation(
     ...args: any[]
    ): Card & { action: Action<any> } {
     if (names.length < 1) {
      throw new Error('not enough names to invoke method')
     }
     let sourceOverride = false
     let sourceOverrideValue: any
     const namesCopy = names.slice()
     const finalName = namesCopy.pop() as string
     if (
      Array.isArray(namesCopy[0]) &&
      namesCopy[0][0] === referenceSymbol
     ) {
      sourceOverride = true
      sourceOverrideValue = namesCopy[0][1]
      namesCopy.splice(0, 1)
     }
     return {
      title: `Invoke ${JSON.stringify(
       namesCopy.join('.')
      )} with ${JSON.stringify(args)}`,
      action: {
       arguments: [{ title: 'source', type: 'object' }],
       returnType: 'unknown',
       implementation(source: object) {
        if (sourceOverride) {
         source = sourceOverrideValue
        }
        for (const name of namesCopy) {
         if (
          typeof source === 'undefined' ||
          source === null
         ) {
          throw new Error(
           `cannot find ${JSON.stringify(
            name
           )} on ${JSON.stringify(namesCopy.join('.'))}`
          )
         }
         source = source[name as string]
        }
        if (
         typeof source === 'undefined' ||
         source === null
        ) {
         throw new Error(
          `cannot find ${JSON.stringify(
           namesCopy.join('.')
          )}`
         )
        }
        if (typeof source[finalName] !== 'function') {
         throw new Error(
          `cannot find method ${JSON.stringify(
           finalName
          )} on ${JSON.stringify(namesCopy.join('.'))}`
         )
        }
        return source[finalName](...args)
       },
      },
     }
    },
   },
  }
 },
 setProperty(...names: (SourceValue | string)[]): Card & {
  action: Action<Card & { action: Action<void> }>
 } {
  return {
   title: `Set ${JSON.stringify(names.join('.'))}`,
   action: {
    arguments: [{ title: 'value', type: 'unknown' }],
    returnType: 'Action',
    implementation(
     value: any
    ): Card & { action: Action<void> } {
     if (names.length < 1) {
      throw new Error('not enough names to set property')
     }
     let sourceOverride = false
     let sourceOverrideValue: any
     const namesCopy = names.slice()
     const finalName = namesCopy.pop() as string
     if (
      Array.isArray(namesCopy[0]) &&
      namesCopy[0][0] === referenceSymbol
     ) {
      sourceOverride = true
      sourceOverrideValue = namesCopy[0][1]
      namesCopy.splice(0, 1)
     }
     return {
      title: `Set ${JSON.stringify(
       namesCopy.join('.')
      )} to ${JSON.stringify(value)}`,
      action: {
       arguments: [{ title: 'source', type: 'object' }],
       returnType: 'void',
       implementation(source: object) {
        if (sourceOverride) {
         source = sourceOverrideValue
        }
        for (const name of namesCopy) {
         if (
          typeof source === 'undefined' ||
          source === null
         ) {
          throw new Error(
           `cannot find ${JSON.stringify(name)}`
          )
         }
         source = source[name as string]
        }
        if (
         typeof source === 'undefined' ||
         source === null
        ) {
         throw new Error(
          `cannot find ${JSON.stringify(
           namesCopy.join('.')
          )}`
         )
        }
        source[finalName] = value
       },
      },
     }
    },
   },
  }
 },
 object(): Omit<Card, 'action'> & {
  action: Action<Value<object>>
 } {
  return {
   title: 'Object',
   action: {
    arguments: [],
    returnType: 'object',
    implementation(): Value<object> {
     return {
      type: 'object',
      value: {},
     }
    },
   },
  }
 },
}
