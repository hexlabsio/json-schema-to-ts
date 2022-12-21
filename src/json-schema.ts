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
  maxLength?: JSONSchema7NonNegativeInteger
  minLength?: JSONSchema7NonNegativeIntegerDefault0
  pattern?: string
  additionalItems?: JSONSchema7Type
  items?: JSONSchema7Type | JSONSchema7SchemaArray
  maxItems?: JSONSchema7NonNegativeInteger
  minItems?: JSONSchema7NonNegativeIntegerDefault0
  uniqueItems?: boolean
  contains?: JSONSchema7Type
  maxProperties?: JSONSchema7NonNegativeInteger
  minProperties?: JSONSchema7NonNegativeIntegerDefault0
  required?: JSONSchema7StringArray
  additionalProperties?: JSONSchema7Type
  definitions?: { [key: string]: JSONSchema7Type }
  properties?: { [key: string]: JSONSchema7Type }
  patternProperties?: { [key: string]: JSONSchema7Type }
  dependencies?: { [key: string]: JSONSchema7Type | JSONSchema7StringArray }
  propertyNames?: JSONSchema7Type
  const?: unknown
  enum?: unknown[]
  type?: JSONSchema7SimpleTypes | Array<JSONSchema7SimpleTypes>
  format?: string
  contentMediaType?: string
  contentEncoding?: string
  if?: JSONSchema7Type
  then?: JSONSchema7Type
  else?: JSONSchema7Type
  allOf?: JSONSchema7SchemaArray
  anyOf?: JSONSchema7SchemaArray
  oneOf?: JSONSchema7SchemaArray
  not?: JSONSchema7Type
}
export type JSONSchema7Type_1 = boolean
export type JSONSchema7SchemaArray = Array<JSONSchema7Type>
export type JSONSchema7NonNegativeInteger = number
export type JSONSchema7NonNegativeIntegerDefault0 =
  JSONSchema7NonNegativeInteger & {}
export type JSONSchema7SimpleTypes =
  | "array"
  | "boolean"
  | "integer"
  | "null"
  | "number"
  | "object"
  | "string"
export type JSONSchema7StringArray = Array<string>
export type JSONSchema7Items = JSONSchema7Type | JSONSchema7SchemaArray
export type JSONSchema7Definitions = { [key: string]: JSONSchema7Type }
export type JSONSchema7Properties = { [key: string]: JSONSchema7Type }
export type JSONSchema7PatternProperties = { [key: string]: JSONSchema7Type }
export type JSONSchema7Dependencies = {
  [key: string]: JSONSchema7Type | JSONSchema7StringArray
}
export class JSONSchema7TypeBuilder {
  private constructor(
    private JSONSchema7Type: JSONSchema7 | JSONSchema7Type_1 = true
  ) {}

  build(): JSONSchema7Type {
    return this.JSONSchema7Type as JSONSchema7Type
  }

  static create(): JSONSchema7TypeBuilder {
    return new JSONSchema7TypeBuilder()
  }
}

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

  defaultValue(defaultValue: unknown): this {
    this.JSONSchema7.default = defaultValue
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

  maxLength(maxLength: JSONSchema7NonNegativeInteger): this {
    this.JSONSchema7.maxLength = maxLength
    return this
  }

  minLength(minLength: JSONSchema7NonNegativeIntegerDefault0): this {
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

  items(items: JSONSchema7Type | JSONSchema7SchemaArray): this {
    this.JSONSchema7.items = items
    return this
  }

  maxItems(maxItems: JSONSchema7NonNegativeInteger): this {
    this.JSONSchema7.maxItems = maxItems
    return this
  }

  minItems(minItems: JSONSchema7NonNegativeIntegerDefault0): this {
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

  maxProperties(maxProperties: JSONSchema7NonNegativeInteger): this {
    this.JSONSchema7.maxProperties = maxProperties
    return this
  }

  minProperties(minProperties: JSONSchema7NonNegativeIntegerDefault0): this {
    this.JSONSchema7.minProperties = minProperties
    return this
  }

  required(required: JSONSchema7StringArray): this {
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

  addDefinitions(key: string, definitions: JSONSchema7Type): this {
    this.JSONSchema7.definitions = {
      ...this.JSONSchema7?.definitions,
      [key]: definitions,
    }
    return this
  }

  properties(properties: { [key: string]: JSONSchema7Type }): this {
    this.JSONSchema7.properties = properties
    return this
  }

  addProperties(key: string, properties: JSONSchema7Type): this {
    this.JSONSchema7.properties = {
      ...this.JSONSchema7?.properties,
      [key]: properties,
    }
    return this
  }

  patternProperties(patternProperties: {
    [key: string]: JSONSchema7Type
  }): this {
    this.JSONSchema7.patternProperties = patternProperties
    return this
  }

  addPatternProperties(key: string, patternProperties: JSONSchema7Type): this {
    this.JSONSchema7.patternProperties = {
      ...this.JSONSchema7?.patternProperties,
      [key]: patternProperties,
    }
    return this
  }

  dependencies(dependencies: {
    [key: string]: JSONSchema7Type | JSONSchema7StringArray
  }): this {
    this.JSONSchema7.dependencies = dependencies
    return this
  }

  addDependencies(
    key: string,
    dependencies: JSONSchema7Type | JSONSchema7StringArray
  ): this {
    this.JSONSchema7.dependencies = {
      ...this.JSONSchema7?.dependencies,
      [key]: dependencies,
    }
    return this
  }

  propertyNames(propertyNames: JSONSchema7Type): this {
    this.JSONSchema7.propertyNames = propertyNames
    return this
  }

  constant(constant: unknown): this {
    this.JSONSchema7.const = constant
    return this
  }

  enumeration(enumeration: unknown[]): this {
    this.JSONSchema7.enum = enumeration
    return this
  }

  type(type: JSONSchema7SimpleTypes | Array<JSONSchema7SimpleTypes>): this {
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

  setIf(setIf: JSONSchema7Type): this {
    this.JSONSchema7.if = setIf
    return this
  }

  then(then: JSONSchema7Type): this {
    this.JSONSchema7.then = then
    return this
  }

  setElse(setElse: JSONSchema7Type): this {
    this.JSONSchema7.else = setElse
    return this
  }

  allOf(allOf: JSONSchema7SchemaArray): this {
    this.JSONSchema7.allOf = allOf
    return this
  }

  anyOf(anyOf: JSONSchema7SchemaArray): this {
    this.JSONSchema7.anyOf = anyOf
    return this
  }

  oneOf(oneOf: JSONSchema7SchemaArray): this {
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

export class JSONSchema7SchemaArrayBuilder {
  private constructor(
    private JSONSchema7SchemaArray: Array<JSONSchema7Type> = []
  ) {}

  build(): JSONSchema7SchemaArray {
    return this.JSONSchema7SchemaArray as JSONSchema7SchemaArray
  }

  static create(): JSONSchema7SchemaArrayBuilder {
    return new JSONSchema7SchemaArrayBuilder()
  }
}

export class JSONSchema7StringArrayBuilder {
  private constructor(private JSONSchema7StringArray: Array<string> = []) {}

  build(): JSONSchema7StringArray {
    return this.JSONSchema7StringArray as JSONSchema7StringArray
  }

  static create(): JSONSchema7StringArrayBuilder {
    return new JSONSchema7StringArrayBuilder()
  }
}

export class JSONSchema7ItemsBuilder {
  private constructor(
    private JSONSchema7Items: JSONSchema7Type | JSONSchema7SchemaArray = true
  ) {}

  build(): JSONSchema7Items {
    return this.JSONSchema7Items as JSONSchema7Items
  }

  static create(): JSONSchema7ItemsBuilder {
    return new JSONSchema7ItemsBuilder()
  }
}

export class JSONSchema7DefinitionsBuilder {
  private constructor(
    private JSONSchema7Definitions: { [key: string]: JSONSchema7Type } = {}
  ) {}

  build(): JSONSchema7Definitions {
    return this.JSONSchema7Definitions as JSONSchema7Definitions
  }

  static create(): JSONSchema7DefinitionsBuilder {
    return new JSONSchema7DefinitionsBuilder()
  }
}

export class JSONSchema7PropertiesBuilder {
  private constructor(
    private JSONSchema7Properties: { [key: string]: JSONSchema7Type } = {}
  ) {}

  build(): JSONSchema7Properties {
    return this.JSONSchema7Properties as JSONSchema7Properties
  }

  static create(): JSONSchema7PropertiesBuilder {
    return new JSONSchema7PropertiesBuilder()
  }
}

export class JSONSchema7PatternPropertiesBuilder {
  private constructor(
    private JSONSchema7PatternProperties: {
      [key: string]: JSONSchema7Type
    } = {}
  ) {}

  build(): JSONSchema7PatternProperties {
    return this.JSONSchema7PatternProperties as JSONSchema7PatternProperties
  }

  static create(): JSONSchema7PatternPropertiesBuilder {
    return new JSONSchema7PatternPropertiesBuilder()
  }
}

export class JSONSchema7DependenciesBuilder {
  private constructor(
    private JSONSchema7Dependencies: Partial<JSONSchema7Dependencies> = {}
  ) {}

  build(): JSONSchema7Dependencies {
    return this.JSONSchema7Dependencies as JSONSchema7Dependencies
  }

  static create(): JSONSchema7DependenciesBuilder {
    return new JSONSchema7DependenciesBuilder()
  }
}
