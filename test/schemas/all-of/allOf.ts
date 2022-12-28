import { JSONSchema7 } from '../../../src';

export const allOf: JSONSchema7 = {
  title: 'TestAllOf',
  definitions: {
    part1: { type: 'object', properties: { a: { type: 'string' }} },
    part2: { anyOf: [ { $ref: '#/definitions/part1' }, {type: 'string'}] },
    part3: { type: 'object', properties: { a: { type: 'string', const: 'X' }, b: { type: 'number'}} },
    combined: { allOf: [ { $ref: '#/definitions/part2' }, { $ref: '#/definitions/part3' }] }
  },
  type: 'object',
  required: ['parent'],
  properties: {
    parent: { $ref: '#/definitions/combined' }
  }
}
export const primitiveAllOf: JSONSchema7 = {
  title: 'PrimitiveAllOf',
  definitions: {
    nonNegativeInteger: {
      "type": "integer",
      "minimum": 0
    },
    nonNegativeIntegerDefault0: {
      "allOf": [
        { "$ref": "#/definitions/nonNegativeInteger" },
        { "default": 0 }
      ]
    },
  },
  type: 'object',
  required: ['parent'],
  properties: {
    parent: { $ref: '#/definitions/nonNegativeIntegerDefault0' }
  }
}