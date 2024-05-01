export interface Card {
 action?: Action
 card?: Card
 list?: List
 slot?: Slot
 title?: string
 type?: Type
 value?: Value
}

export type Type =
 | 'boolean'
 | 'number'
 | 'object'
 | 'string'
 | 'unknown'
 | 'void'
 | 'Action'
 | 'Card'
 | 'List'
 | 'Slot'
 | 'Type'
 | 'Value'

export interface Slot {
 title: string
 type: Type
}

export interface Value<T = any> {
 type: Type
 value: T
}

export interface List {
 type: Type
 list: any[]
}

export interface Action<T = any> {
 arguments: Slot[]
 returnType: Type
 implementation(...args: any[]): T
}
