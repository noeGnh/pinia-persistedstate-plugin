declare module 'json-stringify-safe' {
  namespace stringify {
    export type CycleReplacer = (key: string, value: any) => string
    export type Replacer = (key: string, value: any) => any

    export function getSerialize(
      replacer?: Replacer,
      cycleReplacer?: CycleReplacer
    ): any
  }

  function stringify(
    obj: object,
    replacer?: stringify.Replacer,
    space?: string | number,
    cycleReplacer?: stringify.CycleReplacer
  ): string

  export = stringify
}
