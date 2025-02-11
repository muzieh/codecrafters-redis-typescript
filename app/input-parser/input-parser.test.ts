import { expect, test, describe } from 'bun:test';
import { inputParser } from './input-parser';

describe('inputParser', () => {

  test('PING', () => {
    expect(inputParser('*1\r\n$4\r\nPING\r\n')).toEqual(['PING']);
  })

  test('ECHO', () => {
    expect(inputParser('*2\r\n$4\r\nECHO\r\n$3\r\nhey\r\n')).toEqual(['ECHO', 'hey']);
  })

})

