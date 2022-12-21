import { JSONSchema7 } from '../../src';

export const simpleRequired: JSONSchema7 = {
  title: 'TestObject2',
  type: 'object',
  required: ['a'],
  properties: {
    a: { type: 'string' }
  }
}