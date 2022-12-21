import { JSONSchema7 } from '../../src';

export const simple: JSONSchema7 = {
  title: 'TestObject1',
  type: 'object',
  properties: {
    a: { type: 'string' }
  }
}