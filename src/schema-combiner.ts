import { JSONSchema7, JSONSchema7Type } from './json-schema';
import { SchemaInfo, SchemaInfoBuilder } from './schema-info';

type AnyOf = { type: 'any'; schema: SchemaPart[] }
type AllOf = { type: 'all'; schema: SchemaPart[] }
type SchemaPart = AllOf | AnyOf | { type: 'object' | 'primitive'; schema: SchemaInfo }


export class SchemaCombiner {

  private constructor(private schemas: SchemaInfo[]) {
  }

  private schemaPartFor(schema: SchemaInfo | undefined): SchemaPart | undefined {
    if(!schema) return undefined;
    if(schema.holder.type === 'allOf') return this.combineAllOf(schema);
    if(schema.holder.type === 'anyOf') return this.combineAnyOf(schema);
    if(schema.holder.type === '$ref') return this.schemaPartFor(SchemaInfoBuilder.findSchema(this.schemas, schema.holder.schema.$ref!)!);
    if(schema.holder.type === 'object') return { type: 'object', schema };
    return { type: 'primitive', schema };
  }

  private combineAnyOf(schema: SchemaInfo): SchemaPart {
    const anyOfSchemas = schema.holder.schema.anyOf!
      .map((_, index) => this.schemaPartFor(SchemaInfoBuilder.findSchema(this.schemas, `${schema.path}/anyOf/${index}`)!))
      .filter((it): it is SchemaPart => !!it);
    if(anyOfSchemas.length === 1) return anyOfSchemas[0];
    const objectSchemas = anyOfSchemas.filter(it => it.type === 'object');
    if(objectSchemas.length === 1) return objectSchemas[0];
    if(objectSchemas.length > 0) return { type: 'any', schema: objectSchemas };
    return { type: 'any', schema: anyOfSchemas };
  }

  private filterNonTypes(schema: JSONSchema7Type): boolean {
    if(typeof schema === 'boolean') return false;
    return !!schema.$ref || !!schema.type || !!schema.properties || !!schema.additionalProperties
  }

  private combineAllOf(schema: SchemaInfo): SchemaPart {
    const allOfSchemas = schema.holder.schema.allOf!
      .filter(it => this.filterNonTypes(it))
      .map((_, index) => this.schemaPartFor(SchemaInfoBuilder.findSchema(this.schemas, `${schema.path}/allOf/${index}`)!))
      .filter((it): it is SchemaPart => !!it);
    if(allOfSchemas.length === 1) return allOfSchemas[0];
    return { type: 'all', schema: allOfSchemas };
  }

  private static combineObjects(schemas: SchemaInfo[], parent: SchemaInfo): SchemaInfo {
    const properties = schemas.reduce((prev, next) => ({...prev, ...next.holder.schema.properties}), {});
    const required = schemas.reduce((prev, next) => [...prev, ...next.holder.schema.required ?? []], new Array<string>());
    const additionalProperties = schemas.reduce<JSONSchema7Type | undefined>((prev, next) => prev ?? next.holder.schema.additionalProperties, undefined);
    const schema: JSONSchema7 = {
      type: 'object',
      required,
      additionalProperties,
      properties
    }
    return { path: parent.path, location: parent.location, holder: {type: 'object', schema}, hasBuilder: true, typeName: parent.typeName! };
  }

  static variantsFromAllOf(schemas: SchemaInfo[], schema: SchemaInfo): SchemaInfo | undefined {
    const combiner = new SchemaCombiner(schemas);
    const expanded = combiner.combineAllOf(schema);
    if(expanded.type === 'all') {
      if(!expanded.schema.some(it => it.type !== 'object')) {
        return SchemaCombiner.combineObjects(expanded.schema.map(it => it.schema as SchemaInfo), schema);
      }
    }
    if(expanded.type === 'object' || expanded.type === 'primitive') return expanded.schema
    return undefined;
  }
}