import { expect, test, describe } from 'bun:test';
import { inputParser } from './input-parser';

describe('inputParser', () => {

  test('PING', () => {
    expect(inputParser('*1\r\n$4\r\nPING\r\n')).toEqual(['PING']);
  })

  test('ECHO', () => {
    expect(inputParser('*2\r\n$4\r\nECHO\r\n$3\r\nhey\r\n')).toEqual(['ECHO', 'hey']);
  })

  test('SET', () => {
    expect(inputParser('*3\r\n$3\r\nSET\r\n$3\r\nfoo\r\n$3\r\nbar\r\n')).toEqual(['SET', 'foo', 'bar']);
  })

  test('GET', () => {
    expect(inputParser('*2\r\n$3\r\nGET\r\n$3\r\nfoo\r\n')).toEqual(['GET', 'foo']);
  })

})

