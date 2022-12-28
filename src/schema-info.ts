import { Dir } from '@hexlabs/typescript-generator';
import { JSONSchema7, JSONSchema7SimpleTypes, JSONSchema7Type } from './json-schema';
import { SchemaCombiner } from './schema-combiner';

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

export type BuilderInfo = {
  path: string;
  location: Dir;
  holder: SchemaHolder;
  hasBuilder: true;
  typeName: string;
}
export type SchemaInfo = {
  path: string;
  location: Dir;
  holder: SchemaHolder;
  hasBuilder: false;
  typeName?: string;
} | BuilderInfo;

export abstract class SchemaInfoBuilder {
  static schemaHolderFor(schema: JSONSchema7): SchemaHolder {
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

  private static childFrom(parentDir: Dir, parentLocation: Dir, path: string, holder: SchemaHolder, key: keyof JSONSchema7, parent?: string): SchemaInfo[] {
    const element = holder.schema[key];
    if(!element) return [];
    const {name: parentName, location} = this.nameFrom(parentDir, parentLocation, holder.schema, parent);
    if(Array.isArray(element)) {
      const items = element as JSONSchema7Type[];
      const parts = items.flatMap((it, index) => this.schemaInfoFrom(parentDir, location, it, `${path}/${key}/${index}`, parentName + '_' + index));
      const children = parts.flatMap(child => this.childrenFrom(parentDir, location, child.path, child.holder, child.typeName!));
      return [...parts, ...children];
    }
    if(key === 'additionalProperties' || key === 'items') {
      return this.schemaInfoFrom(parentDir, location, element, `${path}/${key}`, parentName + 'Properties');
    }
    const parts = Object.keys(element).flatMap(it => {
      const keyName = it.substring(0, 1).toUpperCase() + it.substring(1);
      const possibleParent = key === 'definitions' ? keyName : (parent + keyName);
      return this.schemaInfoFrom(parentDir, location, element[it],  `${path}/${key}/${it}`,  possibleParent);
    });
    const children = parts.flatMap(child => this.childrenFrom(parentDir, location, child.path, child.holder, child.typeName!));
    return [...parts, ...children];
  }

  private static childrenFrom(parentDir: Dir, parentLocation: Dir, path: string, holder: SchemaHolder, parent: string): SchemaInfo[] {
    const keys: (keyof JSONSchema7)[] = ['definitions', 'properties', 'additionalProperties', 'oneOf', 'anyOf', 'allOf', 'items', 'additionalItems'];
    return keys.flatMap(key => this.childFrom(parentDir, parentLocation, path, holder, key, parent));
  }

  private static extractForType({ type, enum: _enum, const: _const, multipleOf, maximum, exclusiveMaximum, minimum, maxLength, minLength, pattern, items, additionalItems, maxItems, minItems, uniqueItems, contains, maxProperties, minProperties, required, properties, patternProperties, additionalProperties, propertyNames, format, title, description }: JSONSchema7): JSONSchema7 {
    const defaultValues = { type, enum: _enum, const: _const, title, description };
    switch(type) {
      case 'string': return { ...defaultValues, maxLength, minLength, pattern, format };
      case 'number': return { ...defaultValues, multipleOf, maximum, exclusiveMaximum, minimum };
      case 'array': return { ...defaultValues, items, additionalItems, maxItems, minItems, uniqueItems, contains };
      case 'object': return { ...defaultValues, maxProperties, minProperties, required, properties, patternProperties, additionalProperties, propertyNames, };
      default: return defaultValues;
    }
  }

  private static relevantPartsFrom(schema: JSONSchema7): JSONSchema7[] {
    const { type: types, enum: _enum, const: _const, multipleOf, maximum, exclusiveMaximum, minimum, maxLength, minLength, pattern, items, additionalItems, maxItems, minItems, uniqueItems, contains, maxProperties, minProperties, required, properties, patternProperties, additionalProperties, propertyNames, format, title, description, ...rest } = schema;
    const onlyOneObject = (types as string[]).filter(it => it === 'object').length === 1;
    const root = {...rest, ...((onlyOneObject && title) ? { title: title + '_Type' } : {}), description};
    const others = { enum: _enum, const: _const, multipleOf, maximum, exclusiveMaximum, minimum, maxLength, minLength, pattern, items, additionalItems, maxItems, minItems, uniqueItems, contains, maxProperties, minProperties, required, properties, patternProperties, additionalProperties, propertyNames, format, description
    }
    return [
      Object.keys(root).reduce((prev, next) => ({ ...prev, ...(root[next] ? { [next]: root[next] }: {}) }), {}),
      ...(types as JSONSchema7SimpleTypes[])
        .map(type => {
          const parts = this.extractForType({ type, ...others, ...((onlyOneObject && type === 'object') ? { title: title } : {}) });
          return Object.keys(parts).reduce((prev, next) => ({ ...prev, ...(parts[next] ? { [next]: parts[next] }: {}) }), {});
        })
    ];
  }

  private static hasBuilder(schema: JSONSchema7): boolean {
    if(schema.anyOf || schema.oneOf || schema.allOf) return true;
    if(Array.isArray(schema.type)) return schema.type.some(type => this.hasBuilder({ ...schema, type }));
    return schema.type === 'object' || schema.type === 'array' || !!schema.properties || !!schema.items || !!schema.additionalProperties || !!schema.$id;
  }

  private static extractSchemaInfoFromObject(rootSchema: Record<string, JSONSchema7Type>, translateRoot: string): Record<string, JSONSchema7Type> {
    return Object.keys(rootSchema).reduce((prev, next) => ({...prev, [next]: this.extractSchemaInfoFrom(rootSchema[next], translateRoot)}), rootSchema)
  }

  private static extractSchemaInfoFromArray(rootSchema: JSONSchema7Type[], translateRoot: string): JSONSchema7Type[] {
    return rootSchema.map(it => this.extractSchemaInfoFrom(it, translateRoot));
  }

  private static extractSchemaInfoFrom(rootSchema: JSONSchema7Type, translateRoot: string): JSONSchema7Type {
    if(typeof rootSchema === 'boolean') return rootSchema;
    if(Array.isArray(rootSchema.type)) {
      const schemaParts = this.relevantPartsFrom(rootSchema);
      return { ...(this.extractSchemaInfoFrom(schemaParts[0], translateRoot) as any), anyOf: this.extractSchemaInfoFromArray(schemaParts.slice(1), translateRoot) };
    }
    return {
      ...rootSchema,
      ...(rootSchema.$ref ? { $ref: rootSchema.$ref.replace('#', translateRoot) } : {}),
      ...(rootSchema.definitions ? { definitions: this.extractSchemaInfoFromObject(rootSchema.definitions, translateRoot) } : {}),
      ...(rootSchema.properties ? { properties: this.extractSchemaInfoFromObject(rootSchema.properties, translateRoot) } : {}),
      ...(rootSchema.additionalProperties ? { additionalProperties: this.extractSchemaInfoFrom(rootSchema.additionalProperties, translateRoot) } : {}),
      ...(rootSchema.additionalItems ? { additionalItems: this.extractSchemaInfoFrom(rootSchema.additionalItems, translateRoot) } : {}),
      ...(rootSchema.oneOf ? { oneOf: this.extractSchemaInfoFromArray(rootSchema.oneOf, translateRoot) } : {}),
      ...(rootSchema.allOf ? { allOf: this.extractSchemaInfoFromArray(rootSchema.allOf, translateRoot) } : {}),
      ...(rootSchema.anyOf ? { anyOf: this.extractSchemaInfoFromArray(rootSchema.anyOf, translateRoot) } : {}),
      ...(rootSchema.items ? { items: Array.isArray(rootSchema.items) ? this.extractSchemaInfoFromArray(rootSchema.items, translateRoot) : this.extractSchemaInfoFrom(rootSchema.items, translateRoot) } : {}),
    }
  }

  private static schemaInfoFrom(parent: Dir, parentLocation: Dir, schema: JSONSchema7Type, path = '#', possibleName?: string): SchemaInfo[] {
    const { name, location } = this.nameFrom(parent, parentLocation, schema, possibleName);
    if(typeof schema === 'boolean') return [{ path, typeName: name, location, hasBuilder: false, holder: { type: 'any', schema: {}}  }];
    const holder = this.schemaHolderFor(schema);
    const children = this.childrenFrom(parent, location, path, holder!, name);
    return [{path, typeName: name, location, hasBuilder: this.hasBuilder(schema), holder: holder!}, ...children].filter((it, index, arr) => arr.findIndex(b => b.path === it.path) === index);
  }

  private static nameFrom(parent: Dir, parentLocation: Dir, schema: JSONSchema7Type, possibleName?: string): { name: string; location: Dir } {
    if(typeof schema === 'boolean') return { name: possibleName ?? 'Unknown', location: parentLocation };
    const id = schema.$id ? schema.$id.split('/') : undefined;
    const lastId = id ? id[id.length - 1] : undefined;
    const name = schema.title ?? lastId ?? possibleName ?? 'Unknown';
    const result = name.endsWith('.json') ? name.substring(0, name.length - 5): name;
    const removed = result.replace(/[ -\.:]/g,'');
    const actualName = removed.substring(0, 1).toUpperCase() + removed.substring(1);
    const location =  schema.$id?.startsWith('http://') ? parent.getChildAt(schema.$id!.substring(7).split('/').slice(0, -1).join('/')) : parentLocation;
    return { name: actualName, location };
  }

  static findSchema(schemas: SchemaInfo[], path: string): SchemaInfo | undefined {
    const direct = schemas.find(it => it.path === path || (it.holder.schema.$id && it.holder.schema.$id === path));
    if(direct?.holder.type === '$ref') {
      return this.findSchema(schemas, direct.holder.schema.$ref!);
    }
    return direct;
  }

  private static unwrapAllOfs(parent: Dir, root: string, infos: SchemaInfo[]): SchemaInfo[] {
    return infos.flatMap(it => {
      if(it.holder.type === 'allOf') {
        const variants = SchemaCombiner.variantsFromAllOf(infos, it);
        if(variants) return this.schemaInfoFrom(parent, parent, variants.holder.schema, it.path, it.typeName);
      }
      return [it];
    });
  }

  static schemaInfo(parent: Dir, schema: JSONSchema7Type, root = '#', transform: NameTransform = (name, location) => ({name, location})): SchemaInfo[] {
    const extract = this.extractSchemaInfoFrom(schema, root);
    const info = this.schemaInfoFrom(parent, parent, extract, root);
    const unwrapped = this.unwrapAllOfs(parent, root, info);
    return unwrapped.map(it => {
      const transformed = transform(it.typeName!, it.location, it.holder.schema);
      return ({...it, typeName: transformed.name, location: transformed.location});
    })
  }
}

export type NameTransform = (name: string, location: Dir, schema: JSONSchema7Type) => { name: string; location: Dir };