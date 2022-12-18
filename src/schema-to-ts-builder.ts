import {
  Block,
  ConstructorParameter, Parameter,
  TopLevelPart,
  TsClass,
  TsFile, TsFunction, TypeExp,
} from '@hexlabs/typescript-generator';
import {
  JSONSchema7,
  JSONSchema7Definition,
  JSONSchema7Type, JSONSchema7TypeName,
} from 'json-schema';

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
  type: '$ref' | 'allOf' | 'anyOf' | 'oneOf' | 'enum' | 'const' | 'none';
  schema: JSONSchema7;
}

export type SchemaHolder = ObjectSchema | ArraySchema | Primitive | OtherSchema;

export interface SchemaInfo {
  path: string;
  id?: string;
  title: string;
  schema: SchemaHolder;
}

class Namer {
  constructor(private num = 0) {
  }
  name(): string {
    this.num = this.num + 1;
    return 'Unknown' + this.num;
  }
}

abstract class SchemaInfoBuilder {
  static schemaHolderFor(schema: JSONSchema7): SchemaHolder | undefined {
    if (schema.$ref) return {type: '$ref', schema};
    if (schema.allOf) return {type: 'allOf', schema};
    if (schema.anyOf) return {type: 'anyOf', schema};
    if (schema.oneOf) return {type: 'oneOf', schema};
    if (schema.enum) return {type: 'enum', schema};
    if (schema.const) return {type: 'const', schema};
    return { type: schema.type as any, schema }
  }

  private static childFrom(path: string, holder: SchemaHolder, key: keyof JSONSchema7, namer: Namer, parent?: string): SchemaInfo[] {
    const element = holder.schema[key];
    if(!element) return [];
    const parentName = this.nameFrom(holder.schema, namer, parent);
    if(Array.isArray(element)) {
      const items = element as JSONSchema7Definition[];
      return items.flatMap((it, index) => this.schemaInfoFrom(it, `${path}/${key}/${index}`, namer, parentName + 'Element' + index))
    }
    return Object.keys(element).flatMap(it => this.schemaInfoFrom(element[it],  `${path}/${key}/${it}`, namer, parentName + it.substring(0, 1).toUpperCase() + it.substring(1)));
  }

  private static childrenFrom(path: string, holder: SchemaHolder, namer: Namer, parent: string): SchemaInfo[] {
    const keys: (keyof JSONSchema7)[] = ['definitions', '$defs', 'properties', 'propertyNames', 'additionalProperties', 'oneOf', 'anyOf', 'allOf', 'additionalItems'];
    return keys.flatMap(key => this.childFrom(path, holder, key, namer, parent));
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
    return [root, ...(types as JSONSchema7TypeName[]).map(type => ({...others, type: type}))];
  }



  static schemaInfoFrom(schema: JSONSchema7Definition, path = '#', namer: Namer, posibleName?: string): SchemaInfo[] {
    const title = this.nameFrom(schema, namer, posibleName);
    if(typeof schema === 'boolean') return [{ path, title, schema: { type: 'none', schema: {} } }];
    if(Array.isArray(schema.type)) {
      const schemaParts = this.relevantPartsFrom(schema);
      const refVersion = { type: 'anyOf' as const, schema: { ...schemaParts[0], title, anyOf: schema.type.map((type, index) => ({ $ref: `${path}/anyOf/${index}`, title: `${title}${index}` }))} };
      const children = schemaParts.flatMap(it => this.childrenFrom(path, this.schemaHolderFor(it)!, namer, title))
        .filter((it, index, arr) => arr.findIndex(b => it.path === b.path) === index);
      const updated = [{path, title, schema: refVersion}, ...schemaParts.slice(1).map((schema, index) => ({ path: `${path}/anyOf/${index}`, title:`${title}Type_${index}`, schema: this.schemaHolderFor({...schema, title:`${title}Type_${index}`})!})), ...children];
      return updated;
    }
    const holder = this.schemaHolderFor(schema);
    return [{path, title, id: schema.$id, schema: holder!}, ...this.childrenFrom(path, holder!, namer, title)];
  }

  static nameFrom(schema: JSONSchema7Definition, namer: Namer, possibleName?: string): string {
    if(typeof schema === 'boolean') return possibleName ?? namer.name();
    const id = schema.$id ? schema.$id.split('/') : undefined;
    const lastId = id ? id[id.length - 1] : undefined;
    const name = schema.title ?? lastId ?? possibleName ?? namer.name();
    return name.endsWith('.json') ? name.substring(0, name.length - 5): name;
  }
}

export type ReferenceLocation = { location?: string, name: string };

export class SchemaToTsBuilder {


  private constructor(private schemas: SchemaInfo[], private namer: Namer, private nameTransform?: (ref: ReferenceLocation) => ReferenceLocation) {
  }

  private locationFor(reference: string): ReferenceLocation {
    const element = this.schemas.find(it => it.path === reference || it.id === reference);
    const transform = this.nameTransform ?? (ref => ref);
    if(element) {
      const name = SchemaInfoBuilder.nameFrom(element.schema.schema, this.namer, element.title);
      return transform({ name: this.nameForProperty(name).capitalised.replace(/[ -\.:]/g,'') });
    }
    return transform({ name: 'unknown' });
  }

  private typed(): SchemaInfo[] {
    return this.schemas.filter((it, index, array) => {
      return it.schema.schema && (it.schema.type === 'object' || it.schema.type === 'anyOf' || it.schema.type === 'oneOf' || it.schema.type === 'allOf' || it.schema.schema.properties || it.schema.schema.additionalProperties || it.schema.schema.title || array.find((item, other) => index !== other && (item.schema.schema?.$ref === it.path || (it.id && (item.schema.schema?.$ref === it.id)))));
    })
  }

  private defaultValueFor(name: string, schema: SchemaHolder): TypeExp | undefined {
    const type = this.typefromHolder(schema)
    if(schema.schema.default !== undefined) {
      return `${type} = ${SchemaToTsBuilder.fromGeneralType(schema.schema.default)}`;
    }
    if(schema.type === 'object') {
      return `Partial<${name}> = {}`;
    } else if(schema.type === 'array') {
      return `${type} = []`;
    }
    return undefined;
  }

  builderFile(): TopLevelPart[] {
    return this.typed().flatMap(it => {
      const { name } = this.locationFor(it.path);
      const builderName = `${name}Builder`;
      const methods = this.methodsFrom(name, it.schema);
      const typeFor = this.defaultValueFor(name, it.schema);
      if(!typeFor) return [];
      const c = TsClass.create(builderName)
        .withConstructor(
          constructor => constructor
            .isPrivate()
            .withParameters(ConstructorParameter.create(name, this.defaultValueFor(name, it.schema)).isPrivate())
        );
      methods.forEach(it => c.withMethod(it));
      return [c
        .withMethod(
          TsFunction.create('build')
            .withReturnType(name)
            .withBody(block => block.add(`return this.${name} as ${name};`))
        )
        .withMethod(
          TsFunction.create('create')
            .makeStatic()
            .withReturnType(builderName)
            .withBody(
              block => block.add(`return new ${builderName}();`)
            )
        )]
    })

  }

  modelFile(name: string): TsFile {
    const file = TsFile.create(name);
    const types = this.typed();
    types.forEach(it => {
      const { name } = this.locationFor(it.path);
      return file.append(`export type ${name} = ${this.typefromHolder(it.schema)}`);
    })
    return file;
  }

  transformNames(transform: (ref: ReferenceLocation) => ReferenceLocation): this {
    this.nameTransform = transform;
    return this;
  }

  private typeFromString(schema: JSONSchema7): string {
    return 'string';
  }

  private typeFromNumber(schema: JSONSchema7): string {
    return 'number';
  }

  private typeFromBoolean(schema: JSONSchema7): string {
    return 'boolean';
  }

  private typeFromNull(schema: JSONSchema7): string {
    return 'null';
  }

  private additionalProperties(schema?: JSONSchema7Definition): string {
    if(!schema) return '';
    return `[key: string]: ${this.typefromSchema(schema)}`;
  }

  private typeFromObject(schema: JSONSchema7): string {
    const required = schema.required ?? [];
    const extras = this.additionalProperties(schema.additionalProperties);
    if(schema.properties) {
      return `{${[extras, ...Object.keys(schema.properties ?? {}).map(key => {
        const value = schema.properties![key];
        const isRequired = required.includes(key);
        return `${key}${isRequired ? '' : '?'}: ${this.typefromSchema(value)}`;
      })].filter(it => !!it).join(', ')}}`;
    }
    return `{${extras}}`;
  }

  private nameForProperty(property: string): {name: string, camelCase: string, capitalised: string} {
    const starter = property.endsWith('.json') ? property.substring(0, property.length - 5) : property;
    const keywords = ['default', 'const', 'enum', 'if', 'else', 'in'];
    const alternative = ['defaultValue', 'constant', 'enumeration', 'setIf', 'setElse', 'setIn']
    const alt = keywords.includes(starter) ? alternative[keywords.findIndex(it => it === starter)]: starter;
    const camelCase = alt.substring(0, 1).toLowerCase() + alt.substring(1);
    const capitalised = alt.substring(0, 1).toUpperCase() + alt.substring(1);
    return { name: alt, camelCase, capitalised };
  }

  private otherParameterOptionsFor(objectName: string, name: string, schema: JSONSchema7Definition): { name: string; parameters: Parameter[]; body: Block }[] {
    const propertyName = this.nameForProperty(name);
    const type = this.typefromSchema(schema);
    const body = Block.create().add(`this.${objectName}.${name} = ${propertyName.camelCase};`).add('return this;');
    const parameter = Parameter.create(propertyName.camelCase, type);
    const defaultParams = { name: propertyName.camelCase, parameters: [parameter], body };
    if(typeof schema !== 'boolean' && schema.type === 'object' && schema.additionalProperties) {
      const childType = this.typefromSchema(schema.additionalProperties);
      const childBody = Block.create().add(`this.${objectName}.${propertyName.name} = { ...this.${objectName}?.${propertyName.name}, [key]: ${propertyName.camelCase} };`).add('return this;');
      return [defaultParams, { name: `add${propertyName.capitalised}`, parameters: [Parameter.create('key', 'string'), Parameter.create(propertyName.camelCase, childType)], body: childBody}];
    }
    return [defaultParams];
  }

  private builderFunctionsFor(objectName: string, property: string, schema: JSONSchema7Definition): TsFunction[] {
    const parameterOptions = this.otherParameterOptionsFor(objectName, property, schema);
    return parameterOptions.map(option => TsFunction.create(option.name)
      .withParameters(...option.parameters)
      .withReturnType('this')
      .withBody(option.body));
  }

  private builderMethodsFromObject(name: string, schema: JSONSchema7): TsFunction[] {
    if(schema.properties) {
      return Object.keys(schema.properties).flatMap(property => {
        const propertySchema = schema.properties![property];
        return this.builderFunctionsFor(name, property, propertySchema);
      });
    }
    return [];
  }

  private typeFromArray(schema: JSONSchema7): string {
    if(!schema.items || typeof schema.items === 'boolean') return 'unknown[]';
    if(Array.isArray(schema.items)) {
      return `[${schema.items.map(it => this.typefromSchema(it)).join(', ')}]`;
    }
    return `Array<${this.typefromSchema(schema.items)}>`
  }

  private typeFromRef(schema: JSONSchema7): string {
    const reference = schema.$ref!;
    const { name } = this.locationFor(reference);
    return name;
  }

  private typefromSchema(schema: JSONSchema7Definition): string {
    if(typeof schema === 'boolean') return 'unknown';
    const holders = SchemaInfoBuilder.schemaHolderFor(schema);
    const type = this.typefromHolder(holders!);
    return type;
  }

  private anyOf(schemas: JSONSchema7Definition[]): string {
    return schemas.map(it => this.typefromSchema(it)).join(' | ');
  }

  private allOf(schemas: JSONSchema7Definition[]): string {
    return schemas.map(it => this.typefromSchema(it)).join(' & ');
  }

  static fromGeneralType(type: JSONSchema7Type): string {
    if(type === null) return 'null';
    if(type === undefined) return 'undefined';
    switch(typeof type) {
      case 'string': return `'${type}'`;
      case 'number':
      case 'boolean':
        return `${type}`;
      default: {
        if(Array.isArray(type)) {
          return `[${type.map(this.fromGeneralType).join(', ')}]`
        }
        return `{${Object.keys(type).map(key => `${key}: ${this.fromGeneralType(type[key])}`).join(', ')}}`;
      }
    }
  }

  static enum(types: JSONSchema7Type[]): string {
    return types.map(this.fromGeneralType).join(' | ');
  }

  static const(schema: JSONSchema7Type): string {
    return this.fromGeneralType(schema);
  }

  private typefromHolder(holder: SchemaHolder): string {
    switch(holder.type) {
      case '$ref': return this.typeFromRef(holder.schema);
      case 'anyOf': return this.anyOf(holder.schema.anyOf!);
      case 'allOf': return this.allOf(holder.schema.allOf!);
      case 'oneOf': return this.anyOf(holder.schema.oneOf!);
      case 'const': return SchemaToTsBuilder.const(holder.schema.const!);
      case 'enum': return SchemaToTsBuilder.enum(holder.schema.enum!);
      case 'string': return this.typeFromString(holder.schema);
      case 'number': case 'integer': return this.typeFromNumber(holder.schema);
      case 'boolean': return this.typeFromBoolean(holder.schema);
      case 'null': return this.typeFromNull(holder.schema);
      case 'array': return this.typeFromArray(holder.schema);
      default: return this.typeFromObject(holder.schema);
    }
  }

  private methodsFrom(name: string, holder: SchemaHolder): TsFunction[] {
    switch(holder.type) {
      case 'object': return this.builderMethodsFromObject(name, holder.schema)
      default: return [];
    }
  }


  static create(schema: JSONSchema7): SchemaToTsBuilder {
    return new SchemaToTsBuilder(SchemaInfoBuilder.schemaInfoFrom(schema, '#', new Namer()), new Namer());
  }
}