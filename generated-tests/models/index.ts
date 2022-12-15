export type JSONSchema7Type = JSONSchema7 | JSONSchema7Type_1
export type JSONSchema7 = {
  $id?: string
  $schema?: string
  $ref?: string
  $comment?: string
  title?: string
  description?: string
  default?: unknown
  readOnly?: boolean
  writeOnly?: boolean
  examples?: unknown[]
  multipleOf?: number
  maximum?: number
  exclusiveMaximum?: number
  minimum?: number
  exclusiveMinimum?: number
  maxLength?: nonNegativeInteger
  minLength?: nonNegativeIntegerDefault0
  pattern?: string
  additionalItems?: JSONSchema7Type
  items?: JSONSchema7Type | schemaArray
  maxItems?: nonNegativeInteger
  minItems?: nonNegativeIntegerDefault0
  uniqueItems?: boolean
  contains?: JSONSchema7Type
  maxProperties?: nonNegativeInteger
  minProperties?: nonNegativeIntegerDefault0
  required?: stringArray
  additionalProperties?: JSONSchema7Type
  definitions?: { [key: string]: JSONSchema7Type }
  properties?: { [key: string]: JSONSchema7Type }
  patternProperties?: { [key: string]: JSONSchema7Type }
  dependencies?: { [key: string]: JSONSchema7Type | stringArray }
  propertyNames?: JSONSchema7Type
  const?: unknown
  enum?: unknown[]
  type?: simpleTypes | Array<simpleTypes>
  format?: string
  contentMediaType?: string
  contentEncoding?: string
  if?: JSONSchema7Type
  then?: JSONSchema7Type
  else?: JSONSchema7Type
  allOf?: schemaArray
  anyOf?: schemaArray
  oneOf?: schemaArray
  not?: JSONSchema7Type
}
export type JSONSchema7Type_1 = boolean
export type schemaArray = Array<JSONSchema7Type>
export type nonNegativeInteger = number
export type nonNegativeIntegerDefault0 = nonNegativeInteger & {}
export type simpleTypes =
  | "array"
  | "boolean"
  | "integer"
  | "null"
  | "number"
  | "object"
  | "string"
export type stringArray = Array<string>
export class JSONSchema7Builder {
  private constructor(private JSONSchema7: Partial<JSONSchema7> = {}) {}

  $id($id: string): this {
    this.JSONSchema7.$id = $id
    return this
  }

  $schema($schema: string): this {
    this.JSONSchema7.$schema = $schema
    return this
  }

  $ref($ref: string): this {
    this.JSONSchema7.$ref = $ref
    return this
  }

  $comment($comment: string): this {
    this.JSONSchema7.$comment = $comment
    return this
  }

  title(title: string): this {
    this.JSONSchema7.title = title
    return this
  }

  description(description: string): this {
    this.JSONSchema7.description = description
    return this
  }

  _default(_default: unknown): this {
    this.JSONSchema7.default = _default
    return this
  }

  readOnly(readOnly: boolean): this {
    this.JSONSchema7.readOnly = readOnly
    return this
  }

  writeOnly(writeOnly: boolean): this {
    this.JSONSchema7.writeOnly = writeOnly
    return this
  }

  examples(examples: unknown[]): this {
    this.JSONSchema7.examples = examples
    return this
  }

  multipleOf(multipleOf: number): this {
    this.JSONSchema7.multipleOf = multipleOf
    return this
  }

  maximum(maximum: number): this {
    this.JSONSchema7.maximum = maximum
    return this
  }

  exclusiveMaximum(exclusiveMaximum: number): this {
    this.JSONSchema7.exclusiveMaximum = exclusiveMaximum
    return this
  }

  minimum(minimum: number): this {
    this.JSONSchema7.minimum = minimum
    return this
  }

  exclusiveMinimum(exclusiveMinimum: number): this {
    this.JSONSchema7.exclusiveMinimum = exclusiveMinimum
    return this
  }

  maxLength(maxLength: nonNegativeInteger): this {
    this.JSONSchema7.maxLength = maxLength
    return this
  }

  minLength(minLength: nonNegativeIntegerDefault0): this {
    this.JSONSchema7.minLength = minLength
    return this
  }

  pattern(pattern: string): this {
    this.JSONSchema7.pattern = pattern
    return this
  }

  additionalItems(additionalItems: JSONSchema7Type): this {
    this.JSONSchema7.additionalItems = additionalItems
    return this
  }

  items(items: JSONSchema7Type | schemaArray): this {
    this.JSONSchema7.items = items
    return this
  }

  maxItems(maxItems: nonNegativeInteger): this {
    this.JSONSchema7.maxItems = maxItems
    return this
  }

  minItems(minItems: nonNegativeIntegerDefault0): this {
    this.JSONSchema7.minItems = minItems
    return this
  }

  uniqueItems(uniqueItems: boolean): this {
    this.JSONSchema7.uniqueItems = uniqueItems
    return this
  }

  contains(contains: JSONSchema7Type): this {
    this.JSONSchema7.contains = contains
    return this
  }

  maxProperties(maxProperties: nonNegativeInteger): this {
    this.JSONSchema7.maxProperties = maxProperties
    return this
  }

  minProperties(minProperties: nonNegativeIntegerDefault0): this {
    this.JSONSchema7.minProperties = minProperties
    return this
  }

  required(required: stringArray): this {
    this.JSONSchema7.required = required
    return this
  }

  additionalProperties(additionalProperties: JSONSchema7Type): this {
    this.JSONSchema7.additionalProperties = additionalProperties
    return this
  }

  definitions(definitions: { [key: string]: JSONSchema7Type }): this {
    this.JSONSchema7.definitions = definitions
    return this
  }

  adddefinitions(key: string, definitions: JSONSchema7Type): this {
    this.JSONSchema7 = { ...this.JSONSchema7, [key]: definitions }
    return this
  }

  properties(properties: { [key: string]: JSONSchema7Type }): this {
    this.JSONSchema7.properties = properties
    return this
  }

  addproperties(key: string, properties: JSONSchema7Type): this {
    this.JSONSchema7 = { ...this.JSONSchema7, [key]: properties }
    return this
  }

  patternProperties(patternProperties: {
    [key: string]: JSONSchema7Type
  }): this {
    this.JSONSchema7.patternProperties = patternProperties
    return this
  }

  addpatternProperties(key: string, patternProperties: JSONSchema7Type): this {
    this.JSONSchema7 = { ...this.JSONSchema7, [key]: patternProperties }
    return this
  }

  dependencies(dependencies: {
    [key: string]: JSONSchema7Type | stringArray
  }): this {
    this.JSONSchema7.dependencies = dependencies
    return this
  }

  adddependencies(
    key: string,
    dependencies: JSONSchema7Type | stringArray
  ): this {
    this.JSONSchema7 = { ...this.JSONSchema7, [key]: dependencies }
    return this
  }

  propertyNames(propertyNames: JSONSchema7Type): this {
    this.JSONSchema7.propertyNames = propertyNames
    return this
  }

  _const(_const: unknown): this {
    this.JSONSchema7.const = _const
    return this
  }

  _enum(_enum: unknown[]): this {
    this.JSONSchema7.enum = _enum
    return this
  }

  type(type: simpleTypes | Array<simpleTypes>): this {
    this.JSONSchema7.type = type
    return this
  }

  format(format: string): this {
    this.JSONSchema7.format = format
    return this
  }

  contentMediaType(contentMediaType: string): this {
    this.JSONSchema7.contentMediaType = contentMediaType
    return this
  }

  contentEncoding(contentEncoding: string): this {
    this.JSONSchema7.contentEncoding = contentEncoding
    return this
  }

  _if(_if: JSONSchema7Type): this {
    this.JSONSchema7.if = _if
    return this
  }

  then(then: JSONSchema7Type): this {
    this.JSONSchema7.then = then
    return this
  }

  _else(_else: JSONSchema7Type): this {
    this.JSONSchema7.else = _else
    return this
  }

  allOf(allOf: schemaArray): this {
    this.JSONSchema7.allOf = allOf
    return this
  }

  anyOf(anyOf: schemaArray): this {
    this.JSONSchema7.anyOf = anyOf
    return this
  }

  oneOf(oneOf: schemaArray): this {
    this.JSONSchema7.oneOf = oneOf
    return this
  }

  not(not: JSONSchema7Type): this {
    this.JSONSchema7.not = not
    return this
  }

  build(): JSONSchema7 {
    return this.JSONSchema7 as JSONSchema7
  }

  static create(): JSONSchema7Builder {
    return new JSONSchema7Builder()
  }
}
