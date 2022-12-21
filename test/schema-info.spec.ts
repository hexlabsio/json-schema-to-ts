import { JSONSchema7 } from '../src';
import { SchemaInfoBuilder } from '../src/schema-info';


describe('Schema Info', () => {
  describe('Primitives', () => {
    it('should gather info for string type', async () => {
      const schema: JSONSchema7 = { title: 'stringType', type: 'string' };
      expect(SchemaInfoBuilder.schemaInfoFrom(n => n, schema))
        .toEqual([{"holder": { schema, type: 'string' }, "path": "#", "typeName": "StringType" }])
    });

    it('should gather info for number type', async () => {
      const schema: JSONSchema7 = { title: 'numberType', type: 'number' };
      expect(SchemaInfoBuilder.schemaInfoFrom(n => n, schema))
        .toEqual([{"holder": { schema, type: 'number' }, "path": "#", "typeName": "NumberType" }])
    });

    it('should gather info for boolean type', async () => {
      const schema: JSONSchema7 = { title: 'booleanType', type: 'boolean' };
      expect(SchemaInfoBuilder.schemaInfoFrom(n => n, schema))
        .toEqual([{"holder": { schema, type: 'boolean' }, "path": "#", "typeName": "BooleanType" }])
    });

    it('should gather info for null type', async () => {
      const schema: JSONSchema7 = { title: 'nullType', type: 'null' };
      expect(SchemaInfoBuilder.schemaInfoFrom(n => n, schema))
        .toEqual([{"holder": { schema, type: 'null' }, "path": "#", "typeName": "NullType" }])
    });
  });

  describe('Basic Objects', () => {
    it('should gather info for object type', async () => {
      const schema: JSONSchema7 = {title: 'objectType', type: 'object', properties: { a: { type: 'string' }}};
      expect(SchemaInfoBuilder.schemaInfoFrom(n => n, schema))
        .toEqual([
          {"holder": {schema, type: 'object'}, "path": "#", "typeName": "ObjectType"},
          {"holder": {schema: schema.properties!.a, type: 'string'}, "path": "#/properties/a", "typeName": "ObjectTypeA"}
        ])
    });
  });

  describe('Multiple Types', () => {
    it('should split multiple types into anyOf schema', async () => {
      const schema: JSONSchema7 = {definitions: { 'objectType': { type: ['object', 'null'], properties: { a: { type: 'string' }}} } };
      expect(SchemaInfoBuilder.extractSchemaInfoFrom(schema))
        .toEqual({"definitions": {"objectType": {"anyOf": [{"properties": {"a": {"type": "string"}}, "type": "object"}, {"properties": {"a": {"type": "string"}}, "type": "null"}]}}})
    });
  });

})