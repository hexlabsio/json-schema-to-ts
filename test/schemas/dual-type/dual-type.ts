import { JSONSchema7 } from '../../../src';

export const dualType: JSONSchema7 = {
  title: 'TestAny',
  type: ['object', 'string', 'null'],
  required: ['test'],
  properties: {
    test: { type: 'string' }
  }
}