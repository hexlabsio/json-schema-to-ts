import {
  Block,
  ConstructorParameter, Dir, Imports, Parameter,
  TsClass,
  TsFile, TsFunction, TypeExp,
} from '@hexlabs/typescript-generator';
import { JSONSchema7, JSONSchema7Type } from './json-schema';
import { NameTransform, SchemaHolder, SchemaInfo, SchemaInfoBuilder } from './schema-info';

export class SchemaToTsBuilder {

  private constructor(public schemas: SchemaInfo[], private parent: Dir) {
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
      return `${info.typeName ?? {}} = ${validValue}`;
    }
    if(info.holder.type === 'object') {
      return 'Partial<' + name + `> = {}`;
    } else if(info.holder.type === 'array') {
      return `any[] = [] as any`;
    } else if(validValue) {
      return `${name} = ${validValue}`
    }
    return `${name} | undefined = ${validValue}`
  }

  builderFor(schemaInfo: SchemaInfo, imports: Imports, current: Dir): TsClass {
    const builderName = `${schemaInfo.typeName!}Builder`;
    const typeName = this.nameForProperty(schemaInfo.typeName!).camelCase;
    const methods = this.methodsFrom(schemaInfo, imports, current);
    const isObject = schemaInfo.holder.type === 'object';
    const c = TsClass.create(builderName + (isObject ? `<T = ${schemaInfo.typeName!}>`: ''))
      .withConstructor(
        constructor => constructor
          .isPrivate()
          .withParameters(ConstructorParameter.create(typeName, this.defaultValueFor(schemaInfo.typeName!, schemaInfo)).isPrivate())
      );
    methods.forEach(it => c.withMethod(it));
    return c
      .withMethod(
        TsFunction.create('build')
          .withReturnType(isObject ? `{[P in keyof ${schemaInfo.typeName!} & keyof T]: ${schemaInfo.typeName!}[P];}` : schemaInfo.typeName!)
          .withBody(block => block.add(`return this.${typeName} as ${schemaInfo.typeName!};`))
      )
      .withMethod(
        TsFunction.create('create')
          .makeStatic()
          .withReturnType(builderName + (isObject ? '<{}>': ''))
          .withBody(
            block => block.add(`return new ${builderName}${(isObject ? '<{}>': '')}();`)
          )
      );
  }

  modelFiles(): Dir {
    const types = this.typed();
    types.forEach(it => {
      const imports = Imports.create()
      const type = this.typeFromInfo(it, imports, it.location, true);
      const builder = this.builderFor(it, imports, it.location)
      const importLines = imports.getImports();
      const file = TsFile.create(it.typeName! + '.ts')
        .append(importLines);
      if(importLines )file.append('\n');
        file.append(`export type ${it.typeName!} = ${type}\n`)
        .append(builder, { exported: true })
      it.location.add(file);
    });
    return this.parent;
  }

  private additionalProperties(path: string, schema: JSONSchema7Type | undefined, imports: Imports, location: Dir): string {
    if(!schema) return '';
    return `[key: string]: ${this.typeFromSchema(`${path}/additionalProperties`, schema, imports, location)}`;
  }

  private typeFromObject(path: string, schema: JSONSchema7, imports: Imports, location: Dir): string {
    const required = schema.required ?? [];
    const extras = this.additionalProperties(path, schema.additionalProperties, imports, location);
    if(schema.properties) {
      return `{${[extras, ...Object.keys(schema.properties ?? {}).map(key => {
        const value = schema.properties![key];
        const isRequired = required.includes(key);
        return `${key}${isRequired ? '' : '?'}: ${this.typeFromSchema(`${path}/properties/${key}`, value, imports, location)}`;
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

  private builderFunctionsFor(schema: SchemaInfo, objectName: string, type: 'object' | 'array' | 'additionalProperties', imports: Imports, currentLocation: Dir, property?: string, variant?: string): TsFunction[] {
    if(schema.holder.type === 'oneOf'){
      return schema.holder.schema.oneOf!.map((it, index) => this.findSchema(`${schema.path}/oneOf/${index}`)).filter(it => !!it).flatMap((childSchema) => {
        const childName = this.nameForProperty(childSchema!.typeName!)
        return this.builderFunctionsFor(childSchema!, objectName, type, imports, currentLocation, property, childName.capitalised)
        }
      )
    }
    if(schema.holder.type === 'anyOf'){
      return schema.holder.schema.anyOf!.map((it, index) => this.findSchema(`${schema.path}/anyOf/${index}`)).filter(it => !!it).flatMap((childSchema, index) => {
          const childName = this.nameForProperty(childSchema!.typeName!)
          return this.builderFunctionsFor(childSchema!, objectName, type, imports, currentLocation, property, childName.capitalised + index)
        }
      )
    }
    if(schema.holder.type === 'allOf'){
      return schema.holder.schema.allOf!.map((it, index) => this.findSchema(`${schema.path}/allOf/${index}`)).filter(it => !!it).flatMap((childSchema) => {
          const childName = this.nameForProperty(childSchema!.typeName!)
          return this.builderFunctionsFor(childSchema!, objectName, type, imports, currentLocation, property, childName.capitalised)
        }
      )
    }
    return [this.builderFunctionsForChild(schema, objectName, type, imports, currentLocation, property, variant)];
  }
  private builderFunctionsForChild(schema: SchemaInfo, objectName: string, type: 'object' | 'array' | 'additionalProperties', imports: Imports, currentLocation: Dir, property?: string, variant?: string): TsFunction {
    const funcName = type === 'object' ? `${property}${variant ?? ''}` : `append${variant ?? ''}`;
    const propertyName = this.nameForProperty(funcName);
    const typeName = this.nameForProperty(objectName).camelCase;
    const block = Block.create();
    if(schema.hasBuilder) {
      const importing =  [...Dir.absoluteLocationFor(schema.location), schema.typeName!];
      const current = Dir.absoluteLocationFor(currentLocation);
      const relative = Dir.importLocation(current, importing);
      imports.addImport(schema.typeName! + 'Builder', relative);
      imports.addImport(schema.typeName!, relative);
      if(type === 'object') {
        block.add(`if (typeof ${propertyName.camelCase} === 'function'){ `)
          .add(`this.${typeName}.${property} = ${propertyName.camelCase}(${schema.typeName!}Builder.create()).build();`)
          .add('} else { ');
      } else if(type === 'additionalProperties') {
        block.add(`if (typeof ${propertyName.camelCase} === 'function'){ `)
          .add(`this.${typeName} = { ...this.${typeName}, [property]: ${propertyName.camelCase}(${schema.typeName!}Builder.create()).build() };`)
          .add('} else { ');
      } else if(type === 'array') {
        block.add(`if (typeof ${propertyName.camelCase} === 'function'){ `)
          .add(`this.${typeName} = [ ...this.${typeName}, ${propertyName.camelCase}(${schema.typeName!}Builder.create()).build() ];`)
          .add('} else { ');
      }
    }
    if(type === 'object') {
      block.add(`this.${typeName}.${property} = ${propertyName.camelCase};`)
    } else if(type === 'additionalProperties') {
      block.add(`this.${typeName} = { ...this.${typeName}, [property]: ${propertyName.camelCase}  };`)
    } else if(type === 'array') {
      block.add(`this.${typeName} = [ ...this.${typeName}, ${propertyName.camelCase}  ];`)
    }
    if(schema.hasBuilder) {
      block.add('}');
    }
    block.add('return this as any;');

    const func = TsFunction.create(propertyName.camelCase);
    if(schema.holder.schema.description) {
      func.withDescription(`/**\n* ${schema.holder.schema.description} \n*/`);
    }
    if(schema.hasBuilder) {
      func.withParameters(
        ...(type === 'additionalProperties' ? [Parameter.create('property', 'string')]: []),
        Parameter.create(propertyName.camelCase, `${schema.typeName} | ((${propertyName.camelCase}: ReturnType<typeof ${schema.typeName}Builder.create>) => ${schema.typeName}Builder)`)
      )
    } else {
      const type = this.typeFromSchema('', schema.holder.schema, {} as any, {} as any);
      func.withParameters(...(!property ? [Parameter.create('property', 'string')]: []), Parameter.create(propertyName.camelCase, type));
    }
    if(type === 'array') {
      func.withReturnType('this');
    } else {
      func.withReturnType(`${objectName}Builder<T & Pick<${objectName}, ${property ? `'${property}'` : 'string'}>>`)
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

  private builderMethodsFromAdditionalProperties(info: SchemaInfo, imports: Imports, currentLocation: Dir): TsFunction[] {
    if(info.holder.schema.additionalProperties) {
      const schema = this.findSchema(info.path + '/additionalProperties');
      if(schema)
        return this.builderFunctionsFor(schema, info.typeName!, 'additionalProperties', imports, currentLocation);
    }
    return [];
  }

  private builderMethodsFromObject(info: SchemaInfo, imports: Imports, currentLocation: Dir): TsFunction[] {
    const additionalPropsFunctions = this.builderMethodsFromAdditionalProperties(info, imports, currentLocation);
    if(info.holder.schema.properties) {
      return [...additionalPropsFunctions, ...Object.keys(info.holder.schema.properties).flatMap(property => {
        const schema = this.findSchema(info.path + '/properties/' + property);
        if(schema)
          return this.builderFunctionsFor(schema, info.typeName!, 'object', imports, currentLocation, property);
        return [];
      })];
    }
    return additionalPropsFunctions;
  }

  private builderMethodsFromArray(info: SchemaInfo, imports: Imports, currentLocation: Dir): TsFunction[] {
    if(!Array.isArray(info.holder.schema.items)) {
      const schema = this.findSchema(info.path + '/items');
      if(schema)
        return this.builderFunctionsFor(schema, info.typeName!, 'array', imports, currentLocation);
    } else {
      //TODO solve for tuples
    }
    return [];
  }

  private typeFromArray(path: string, schema: JSONSchema7, imports: Imports, location: Dir): string {
    if(!schema.items || typeof schema.items === 'boolean') return 'unknown[]';
    if(Array.isArray(schema.items)) {
      return `[${schema.items.map((it, index) => this.typeFromSchema(`${path}/items/${index}`, it, imports, location)).join(', ')}]`;
    }
    return `Array<${this.typeFromSchema(`${path}/items`, schema.items, imports, location)}>`
  }

  private typeFromRef(path: string, schema: JSONSchema7, imports: Imports, location: Dir): string {
    const reference = schema.$ref!;
    const referenced = this.findSchema(reference);
    if(!referenced) return 'unknown';
    if(referenced.hasBuilder) return referenced.typeName!;
    return this.typeFromHolder(`${path}/$ref`, referenced.holder, imports, location);
  }

  private typeFromSchema(path: string, schema: JSONSchema7Type, imports: Imports, location: Dir): string {
    if(typeof schema === 'boolean') return 'unknown';
    return this.typeFromHolder(path, SchemaInfoBuilder.schemaHolderFor(schema), imports, location);
  }

  private anyOf(path: string, schemas: JSONSchema7Type[], imports: Imports, location: Dir): string {
    return schemas.map((it, index) => this.typeFromSchema(`${path}/anyOf/${index}`, it, imports, location)).join(' | ');
  }

  private allOf(path: string, schemas: JSONSchema7Type[], imports: Imports, location: Dir): string {
    return schemas.map((it, index) => this.typeFromSchema(`${path}/allOf/${index}`, it, imports, location)).join(' & ');
  }

  private oneOf(path: string, schemas: JSONSchema7Type[], imports: Imports, location: Dir): string {
    return schemas.map((it, index) => this.typeFromSchema(`${path}/oneOf/${index}`, it, imports, location)).join(' | ');
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

  private typeFromInfo(info: SchemaInfo, imports: Imports, location: Dir, parent = false): string {
    if(!parent && info.typeName) {
      const importing =  [...Dir.absoluteLocationFor(info.location), info.typeName!];
      const current = Dir.absoluteLocationFor(location);
      const relative = Dir.importLocation(current, importing);
      imports.addImport(info.typeName, relative);
      return info.typeName;
    }
    return this.typeFromHolder(info.path, info.holder, imports, location, parent);
  }
  private typeFromHolder(path: string, holder: SchemaHolder, imports: Imports, location: Dir, parent = false): string {
    const match = this.findSchema(path);
    if(match && match.typeName && match.hasBuilder && !parent) return this.typeFromInfo(match, imports, location, parent);
    switch(holder.type) {
      case 'object': return this.typeFromObject(path, holder.schema, imports, location);
      case '$ref': return this.typeFromRef(path, holder.schema, imports, location);
      case 'anyOf': return this.anyOf(path, holder.schema.anyOf!, imports, location);
      case 'allOf': return this.allOf(path, holder.schema.allOf!, imports, location);
      case 'oneOf': return this.oneOf(path, holder.schema.oneOf!, imports, location);
      case 'const': return SchemaToTsBuilder.const(holder.schema.const!);
      case 'enum': return SchemaToTsBuilder.enum(holder.schema.enum!);
      case 'string': return 'string';
      case 'number': case 'integer': return 'number';
      case 'boolean': return 'boolean';
      case 'null': return 'null';
      case 'array': return this.typeFromArray(path, holder.schema, imports, location);
      default: return this.typeFromObject(path, holder as any, imports, location);
    }
  }

  private methodsFrom(info: SchemaInfo, imports: Imports, currentLocation: Dir): TsFunction[] {
    switch(info.holder.type) {
      case 'object': return this.builderMethodsFromObject(info, imports, currentLocation);
      case 'array': return this.builderMethodsFromArray(info, imports, currentLocation);
      default: return [];
    }
  }
  static createWithOthers(otherSchemas: Record<string, JSONSchema7>, schema: JSONSchema7, location: string, nameTransform: NameTransform = (name, location) => ({ name, location })): SchemaToTsBuilder {
    const dir = Dir.create(location);
    const others = Object.keys(otherSchemas).flatMap(key => {
      return SchemaInfoBuilder.schemaInfoFrom(dir, dir, nameTransform, SchemaInfoBuilder.extractSchemaInfoFrom(otherSchemas[key], key), key);
    })
    return new SchemaToTsBuilder([...others, ...SchemaInfoBuilder.schemaInfoFrom(dir, dir, nameTransform, SchemaInfoBuilder.extractSchemaInfoFrom(schema, '#'))], dir);
  }

  static create(schema: JSONSchema7, location: string, nameTransform: NameTransform = (name, location) => ({ name, location })): SchemaToTsBuilder {
    const dir = Dir.create(location);
    // const jschema = SchemaInfoBuilder.schemaInfoFrom(dir, dir, nameTransform, SchemaInfoBuilder.extractSchemaInfoFrom(jsonSchema as any, 'http://json-schema.org/draft-07/schema#'), 'http://json-schema.org/draft-07/schema#');
    return new SchemaToTsBuilder(SchemaInfoBuilder.schemaInfoFrom(dir, dir, nameTransform, SchemaInfoBuilder.extractSchemaInfoFrom(schema, '#')), dir);
  }
}