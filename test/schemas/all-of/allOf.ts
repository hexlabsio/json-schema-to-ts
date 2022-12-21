import { JSONSchema7 } from '../../../src';

export const allOf: JSONSchema7 = {
  title: 'TestAllOf',
  definitions: {
    part1: { type: 'object', properties: { a: { type: 'string' }} },
    part2: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'number'}} }
  },
  type: 'object',
  required: ['parent'],
  properties: {
    parent: { allOf: [ { $ref: '#/definitions/part1' }, { $ref: '#/definitions/part2' }] }
  }
}