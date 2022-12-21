import {
  Block,
  ConstructorParameter, Parameter,
  TsClass,
  TsFile, TsFunction, TypeExp,
} from '@hexlabs/typescript-generator';
import { JSONSchema7, JSONSchema7Type } from './json-schema';
import { NameTransform, SchemaHolder, SchemaInfo, SchemaInfoBuilder } from './schema-info';

export type ReferenceLocation = { location?: string, name: string };

export class SchemaToTsBuilder {


  private constructor(private schemas: SchemaInfo[], private rootId?: string, private nameTransform?: (ref: ReferenceLocation) => ReferenceLocation) {
  }

  private locationFor(reference: string): ReferenceLocation {
    const element = this.schemas.find(it => it.path === reference || it.holder.schema.$id === reference);
    const transform = this.nameTransform ?? (ref => ref);
    if(element?.typeName) {
      const location = this.rootId ? (element.holder.schema.$id?.startsWith(this.rootId) ? element.holder.schema.$id!.substring(this.rootId.length) : undefined) : undefined;
      const name = element.typeName;
      return transform({ name: this.nameForProperty(name).capitalised.replace(/[ -\.:]/g,''), location: location && (location.endsWith('json') ? location.substring(0, location.length - 5) : location) });
    }
    return transform({ name: 'unknown' });
  }

  private typed(): SchemaInfo[] {
    return this.schemas.filter((it) => it.hasBuilder).filter((it, index, arr) => arr.findIndex(b => it.path === b.path || (it.typeName && (it.typeName === b.typeName))) === index);
  }

  private validValueFor(info: SchemaInfo): TypeExp | undefined {
    if(info.holder.schema.default !== undefined) {
      return SchemaToTsBuilder.fromGeneralType(info.holder.schema.default);
    }
    if(info.holder.type === '$ref') {
      const match = this.schemas.find(it => it.path === info.holder.schema.$ref || (info.holder.schema.$id && info.holder.schema.$id === it.path));
      if(match) {
        return this.validValueFor(match);
      }
    }
    if(info.holder.type === 'object') {
      return '{}';
    } else if(info.holder.type === 'array') {
      return '[] as any';
    } else if(info.holder.type === 'anyOf' || info.holder.type === 'oneOf') {
      const anyOf = info.holder.type === 'anyOf' ? info.holder.schema.anyOf! : info.holder.schema.oneOf!;
      const paths = anyOf.map((it, index) => info.path + '/anyOf/' + index)
      const parts = this.schemas.filter(it => paths.includes(it.path));
      const res = parts.map(it => this.validValueFor(it)).filter(it => !!it);
      return res[0]
    } else if(info.holder.type === 'null') {
      return 'null';
    } else if(info.holder.type === 'string') {
      return `''`;
    }else if(info.holder.type === 'number') {
      return '0';
    }else if(info.holder.type === 'boolean') {
      return 'false';
    }
    return undefined;
  }

  private defaultValueFor(name: string, info: SchemaInfo): TypeExp | undefined {
    const validValue = this.validValueFor(info);
    if(info.holder.schema.default !== undefined) {
      const type = this.typefromHolder(info.holder)
      return `${type} = ${validValue}`;
    }
    if(info.holder.type === 'object') {
      return 'Partial<' + name + `> = {}`;
    } else if(info.holder.type === 'array') {
      const type = this.typefromHolder(info.holder)
      return `${type} = [] as any`;
    } else if(validValue) {
      return `${name} = ${validValue}`
    }
    return `${name} | undefined = ${validValue}`
  }

  builderFile(): TsClass[] {
    return this.typed().flatMap(it => {
      const { name } = this.locationFor(it.path);
      const builderName = `${name}Builder`;
      const methods = this.methodsFrom(it);
      const isObject = it.holder.type === 'object';
      const c = TsClass.create(builderName + (isObject ? `<T = ${name}>`: ''))
        .withConstructor(
          constructor => constructor
            .isPrivate()
            .withParameters(ConstructorParameter.create(name, this.defaultValueFor(name, it)).isPrivate())
        );
      methods.forEach(it => c.withMethod(it));
      return [c
        .withMethod(
          TsFunction.create('build')
            .withReturnType(isObject ? `{[P in keyof ${name} & keyof T]: ${name}[P];}` : name)
            .withBody(block => block.add(`return this.${name} as ${name};`))
        )
        .withMethod(
          TsFunction.create('create')
            .makeStatic()
            .withReturnType(builderName + (isObject ? '<{}>': ''))
            .withBody(
              block => block.add(`return new ${builderName}${(isObject ? '<{}>': '')}();`)
            )
        )]
    })

  }

  modelFile(name: string): TsFile {
    const file = TsFile.create(name);
    const types = this.typed();
    types.forEach(it => {
      const { name } = this.locationFor(it.path);
      return file.append(`export type ${name} = ${this.typefromHolder(it.holder)}`);
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

  private additionalProperties(schema?: JSONSchema7Type): string {
    if(!schema) return '';
    return `[key: string]: ${this.typeFromSchema(schema)}`;
  }

  private typeFromObject(schema: JSONSchema7): string {
    const required = schema.required ?? [];
    const extras = this.additionalProperties(schema.additionalProperties);
    if(schema.properties) {
      return `{${[extras, ...Object.keys(schema.properties ?? {}).map(key => {
        const value = schema.properties![key];
        const isRequired = required.includes(key);
        return `${key}${isRequired ? '' : '?'}: ${this.typeFromSchema(value)}`;
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

  private builderFunctionsFor(schema: SchemaInfo, objectName: string, type: 'object' | 'array' | 'additionalProperties', property?: string, variant?: string): TsFunction[] {
    if(schema.holder.type === 'oneOf'){
      return schema.holder.schema.oneOf!.map((it, index) => this.findSchema(`${schema.path}/oneOf/${index}`)).filter(it => !!it).flatMap((childSchema) => {
        const childName = this.nameForProperty(childSchema!.typeName!)
        return this.builderFunctionsFor(childSchema!, objectName, type, property, childName.capitalised)
        }
      )
    }
    if(schema.holder.type === 'anyOf'){
      return schema.holder.schema.anyOf!.map((it, index) => this.findSchema(`${schema.path}/anyOf/${index}`)).filter(it => !!it).flatMap((childSchema, index) => {
          const childName = this.nameForProperty(childSchema!.typeName!)
          return this.builderFunctionsFor(childSchema!, objectName, type, property, childName.capitalised + index)
        }
      )
    }
    if(schema.holder.type === 'allOf'){
      return schema.holder.schema.allOf!.map((it, index) => this.findSchema(`${schema.path}/allOf/${index}`)).filter(it => !!it).flatMap((childSchema) => {
          const childName = this.nameForProperty(childSchema!.typeName!)
          return this.builderFunctionsFor(childSchema!, objectName, type, property, childName.capitalised)
        }
      )
    }
    return [this.builderFunctionsForChild(schema, objectName, type, property, variant)];
  }
  private builderFunctionsForChild(schema: SchemaInfo, objectName: string, type: 'object' | 'array' | 'additionalProperties', property?: string, variant?: string): TsFunction {
    const funcName = type === 'object' ? `${property}${variant ?? ''}` : `append${variant ?? ''}`;
    const propertyName = this.nameForProperty(funcName);
    const block = Block.create();
    if(schema.hasBuilder) {
      if(type === 'object') {
        block.add(`if (typeof ${propertyName.camelCase} === 'function'){ `)
          .add(`this.${objectName}.${property} = ${propertyName.camelCase}(${schema.typeName!}Builder.create()).build();`)
          .add('} else { ');
      } else if(type === 'additionalProperties') {
        block.add(`if (typeof ${propertyName.camelCase} === 'function'){ `)
          .add(`this.${objectName} = { ...this.${objectName}, [property]: ${propertyName.camelCase}(${schema.typeName!}Builder.create()).build() };`)
          .add('} else { ');
      } else if(type === 'array') {
        block.add(`if (typeof ${propertyName.camelCase} === 'function'){ `)
          .add(`this.${objectName} = [ ...this.${objectName}, ${propertyName.camelCase}(${schema.typeName!}Builder.create()).build() ];`)
          .add('} else { ');
      }
    }
    if(type === 'object') {
      block.add(`this.${objectName}.${property} = ${propertyName.camelCase};`)
    } else if(type === 'additionalProperties') {
      block.add(`this.${objectName} = { ...this.${objectName}, [property]: ${propertyName.camelCase}  };`)
    } else if(type === 'array') {
      block.add(`this.${objectName} = [ ...this.${objectName}, ${propertyName.camelCase}  ];`)
    }
    if(schema.hasBuilder) {
      block.add('}');
    }
    block.add('return this as any;');
    if(propertyName.camelCase === 'appendCoreschemametaschema') {
      console.log('')
    }

    const func = TsFunction.create(propertyName.camelCase);
    if(schema.hasBuilder) {
      func.withParameters(
        ...(type === 'additionalProperties' ? [Parameter.create('property', 'string')]: []),
        Parameter.create(propertyName.camelCase, `${schema.typeName} | ((${propertyName.camelCase}: ReturnType<typeof ${schema.typeName}Builder.create>) => ${schema.typeName}Builder)`)
      )
    } else {
      const type = this.typeFromSchema(schema.holder.schema);
      func.withParameters(...(!property ? [Parameter.create('property', 'string')]: []), Parameter.create(propertyName.camelCase, type));
    }
    if(type === 'array') {
      func.withReturnType('this');
    } else {
      func.withReturnType(`${objectName}Builder<T & Pick<${objectName}, '${property}'>>`)
    }
    return func.withBody(block);
  }

  private findSchema(path: string): SchemaInfo | undefined {
    const direct = this.schemas.find(it => it.path === path || (it.holder.schema.$id && it.holder.schema.$id === path));
    if(direct?.holder.type === '$ref') {
      return this.findSchema(direct.holder.schema.$ref!);
    }
    return direct;
  }

  private builderMethodsFromAdditionalProperties(info: SchemaInfo): TsFunction[] {
    if(info.holder.schema.additionalProperties) {
      const schema = this.findSchema(info.path + '/additionalProperties');
      if(schema)
        return this.builderFunctionsFor(schema, info.typeName!, 'additionalProperties');
    }
    return [];
  }

  private builderMethodsFromObject(info: SchemaInfo): TsFunction[] {
    const additionalPropsFunctions = this.builderMethodsFromAdditionalProperties(info);
    if(info.holder.schema.properties) {
      return [...additionalPropsFunctions, ...Object.keys(info.holder.schema.properties).flatMap(property => {
        const schema = this.findSchema(info.path + '/properties/' + property);
        if(schema)
          return this.builderFunctionsFor(schema, info.typeName!, 'object', property);
        return [];
      })];
    }
    return additionalPropsFunctions;
  }

  private builderMethodsFromArray(info: SchemaInfo): TsFunction[] {
    if(!Array.isArray(info.holder.schema.items)) {
      const schema = this.findSchema(info.path + '/items');
      if(schema)
        return this.builderFunctionsFor(schema, info.typeName!, 'array');
    } else {
      //TODO solve for tuples
    }
    return [];
  }

  private typeFromArray(schema: JSONSchema7): string {
    if(!schema.items || typeof schema.items === 'boolean') return 'unknown[]';
    if(Array.isArray(schema.items)) {
      return `[${schema.items.map(it => this.typeFromSchema(it)).join(', ')}]`;
    }
    return `Array<${this.typeFromSchema(schema.items)}>`
  }

  private typeFromRef(schema: JSONSchema7): string {
    const reference = schema.$ref!;
    const referenced = this.findSchema(reference);
    if(!referenced) return 'unknown';
    if(referenced.hasBuilder) return referenced.typeName!;
    return this.typefromHolder(referenced.holder);
  }

  private typeFromSchema(schema: JSONSchema7Type): string {
    if(typeof schema === 'boolean') return 'unknown';
    const holders = SchemaInfoBuilder.schemaHolderFor(schema);
    const type = this.typefromHolder(holders!);
    return type;
  }

  private anyOf(schemas: JSONSchema7Type[]): string {
    return schemas.map(it => this.typeFromSchema(it)).join(' | ');
  }

  private allOf(schemas: JSONSchema7Type[]): string {
    return schemas.map(it => this.typeFromSchema(it)).join(' & ');
  }

  static fromGeneralType(type: unknown): string {
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

  static enum(types: unknown[]): string {
    return types.map(this.fromGeneralType).join(' | ');
  }

  static const(schema: JSONSchema7Type): string {
    return this.fromGeneralType(schema);
  }

  private typefromHolder(holder: SchemaHolder): string {
    switch(holder.type) {
      case 'object': return this.typeFromObject(holder.schema);
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

  private methodsFrom(info: SchemaInfo): TsFunction[] {
    switch(info.holder.type) {
      case 'object': return this.builderMethodsFromObject(info);
      case 'array': return this.builderMethodsFromArray(info);
      default: return [];
    }
  }


  static create(schema: JSONSchema7, rootId?: string, nameTransform: NameTransform = name => name): SchemaToTsBuilder {
    return new SchemaToTsBuilder(SchemaInfoBuilder.schemaInfoFrom(nameTransform, SchemaInfoBuilder.extractSchemaInfoFrom(schema)), rootId);
  }
}