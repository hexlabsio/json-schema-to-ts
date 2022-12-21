import { JSONSchema7, JSONSchema7SimpleTypes, JSONSchema7Type } from './json-schema';

export interface ObjectSchema {
  type: 'object';
  schema: JSONSchema7;
}

export interface ArraySchema {
  type: 'array';
  schema: JSONSchema7;
}

export interface Primitive {
  type: 'string' | 'null' | 'boolean' | 'number' | 'integer';
  schema: JSONSchema7;
}

export interface OtherSchema {
  type: '$ref' | 'allOf' | 'anyOf' | 'oneOf' | 'enum' | 'const' | 'none' | 'any';
  schema: JSONSchema7;
}

export type SchemaHolder = ObjectSchema | ArraySchema | Primitive | OtherSchema;

export interface SchemaInfo {
  path: string;
  typeName?: string;
  holder: SchemaHolder;
  hasBuilder: boolean;
}

export abstract class SchemaInfoBuilder {
  static schemaHolderFor(schema: JSONSchema7): SchemaHolder | undefined {
    if (schema.enum) return {type: 'enum', schema};
    if (schema.const) return {type: 'const', schema};
    if(schema.type) return { type: schema.type as any, schema }
    if (schema.$ref) return {type: '$ref', schema};
    if (schema.allOf) return {type: 'allOf', schema};
    if (schema.anyOf) return {type: 'anyOf', schema};
    if (schema.oneOf) return {type: 'oneOf', schema};
    if(schema.type) return { type: schema.type as any, schema }
    if(schema.properties || schema.additionalProperties) return { type: 'object', schema }
    if(schema.items || schema.additionalItems) return { type: 'array', schema }
    return { type: schema.type as any, schema }
  }

  private static childFrom(transform: NameTransform, path: string, holder: SchemaHolder, key: keyof JSONSchema7, parent?: string): SchemaInfo[] {
    const element = holder.schema[key];
    if(!element) return [];
    const parentName = this.nameFrom(transform, holder.schema, parent);
    if(Array.isArray(element)) {
      const items = element as JSONSchema7Type[];
      const parts = items.flatMap((it, index) => this.schemaInfoFrom(transform, it, `${path}/${key}/${index}`, parentName + '_' + index));
      const children = parts.flatMap(child => this.childrenFrom(transform, child.path, child.holder, child.typeName!));
      return [...parts, ...children];
    }
    if(key === 'additionalProperties' || key === 'items') {
      return this.schemaInfoFrom(transform, element, `${path}/${key}`, parentName + 'Properties');
    }
    const parts = Object.keys(element).flatMap(it => this.schemaInfoFrom(transform, element[it],  `${path}/${key}/${it}`, parentName + it.substring(0, 1).toUpperCase() + it.substring(1)));
    const children = parts.flatMap(child => this.childrenFrom(transform, child.path, child.holder, child.typeName!));
    return [...parts, ...children];
  }

  private static childrenFrom(transform: NameTransform, path: string, holder: SchemaHolder, parent: string): SchemaInfo[] {
    const keys: (keyof JSONSchema7)[] = ['definitions', 'properties', 'additionalProperties', 'oneOf', 'anyOf', 'allOf', 'items', 'additionalItems'];
    return keys.flatMap(key => this.childFrom(transform, path, holder, key, parent));
  }

  static relevantPartsFrom(schema: JSONSchema7): JSONSchema7[] {
    const {
      type: types,
      enum: _enum,
      const: _const,
      multipleOf,
      maximum,
      exclusiveMaximum,
      minimum,
      maxLength,
      minLength,
      pattern,
      items,
      additionalItems,
      maxItems,
      minItems,
      uniqueItems,
      contains,
      maxProperties,
      minProperties,
      required,
      properties,
      patternProperties,
      additionalProperties,
      propertyNames,
      format,
      title, description,
      ...rest
    } = schema;
    const root = {...rest, title, description};
    const others = {
      enum: _enum,
      const: _const,
      multipleOf,
      maximum,
      exclusiveMaximum,
      minimum,
      maxLength,
      minLength,
      pattern,
      items,
      additionalItems,
      maxItems,
      minItems,
      uniqueItems,
      contains,
      maxProperties,
      minProperties,
      required,
      properties,
      patternProperties,
      additionalProperties,
      propertyNames,
      format,
      title,
      description
    }
    return [
      Object.keys(root).reduce((prev, next) => ({ ...prev, ...(root[next] ? { [next]: root[next] }: {}) }), {}),
      ...(types as JSONSchema7SimpleTypes[]).map(type => ({ type, ...Object.keys(others).reduce((prev, next) => ({ ...prev, ...(others[next] ? { [next]: others[next] }: {}) }), {})}))
    ];
  }

  private static hasBuilder(schema: JSONSchema7): boolean {
    if(schema.anyOf) return schema.anyOf.some(it => this.hasBuilder(it as JSONSchema7))
    if(schema.oneOf) return schema.oneOf.some(it => this.hasBuilder(it as JSONSchema7))
    if(schema.allOf) return schema.allOf.some(it => this.hasBuilder(it as JSONSchema7))
    if(Array.isArray(schema.type)) return schema.type.some(type => this.hasBuilder({ ...schema, type }));
    return schema.type === 'object' || schema.type === 'array' || !!schema.properties || !!schema.items || !!schema.additionalProperties || !!schema.$id;
  }

  static extractSchemaInfoFromObject(rootSchema: Record<string, JSONSchema7Type>): Record<string, JSONSchema7Type> {
    return Object.keys(rootSchema).reduce((prev, next) => ({...prev, [next]: this.extractSchemaInfoFrom(rootSchema[next])}), rootSchema)
  }

  static extractSchemaInfoFromArray(rootSchema: JSONSchema7Type[]): JSONSchema7Type[] {
    return rootSchema.map(it => this.extractSchemaInfoFrom(it));
  }

  static extractSchemaInfoFrom(rootSchema: JSONSchema7Type): JSONSchema7Type {
    if(typeof rootSchema === 'boolean') return rootSchema;
    if(Array.isArray(rootSchema.type)) {
      const schemaParts = this.relevantPartsFrom(rootSchema);
      return { ...(this.extractSchemaInfoFrom(schemaParts[0]) as any), anyOf: this.extractSchemaInfoFromArray(schemaParts.slice(1)) };
    }
    return {
      ...rootSchema,
      ...(rootSchema.definitions ? { definitions: this.extractSchemaInfoFromObject(rootSchema.definitions) } : {}),
      ...(rootSchema.properties ? { properties: this.extractSchemaInfoFromObject(rootSchema.properties) } : {}),
      ...(rootSchema.additionalProperties ? { additionalProperties: this.extractSchemaInfoFrom(rootSchema.additionalProperties) } : {}),
      ...(rootSchema.additionalItems ? { additionalItems: this.extractSchemaInfoFrom(rootSchema.additionalItems) } : {}),
      ...(rootSchema.oneOf ? { oneOf: this.extractSchemaInfoFromArray(rootSchema.oneOf) } : {}),
      ...(rootSchema.allOf ? { allOf: this.extractSchemaInfoFromArray(rootSchema.allOf) } : {}),
      ...(rootSchema.anyOf ? { anyOf: this.extractSchemaInfoFromArray(rootSchema.anyOf) } : {}),
      ...(rootSchema.items ? { items: Array.isArray(rootSchema.items) ? this.extractSchemaInfoFromArray(rootSchema.items) : this.extractSchemaInfoFrom(rootSchema.items) } : {}),
    }
  }

  static schemaInfoFrom(transform: NameTransform, schema: JSONSchema7Type, path = '#', possibleName?: string): SchemaInfo[] {
    const typeName = this.nameFrom(transform, schema, possibleName);
    if(typeof schema === 'boolean') return [{ path, typeName, hasBuilder: false, holder: { type: 'any', schema: {}}  }];
    const holder = this.schemaHolderFor(schema);
    const children = this.childrenFrom(transform, path, holder!, typeName);
    return [{path, typeName, hasBuilder: this.hasBuilder(schema), holder: holder!}, ...children].filter((it, index, arr) => arr.findIndex(b => b.path === it.path) === index);
  }

  static nameFrom(transform: NameTransform, schema: JSONSchema7Type, possibleName?: string): string {
    if(typeof schema === 'boolean') return transform(possibleName ?? 'Unknown', schema);
    const id = schema.$id ? schema.$id.split('/') : undefined;
    const lastId = id ? id[id.length - 1] : undefined;
    const name = schema.title ?? lastId ?? possibleName ?? 'Unknown';
    const result = name.endsWith('.json') ? name.substring(0, name.length - 5): name;
    const removed = result.replace(/[ -\.:]/g,'');
    return transform(removed.substring(0, 1).toUpperCase() + removed.substring(1), schema);
  }
}

export type NameTransform = (name: string, schema: JSONSchema7Type) => string;