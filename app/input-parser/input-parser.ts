type LengthAndIndex = [number, number];
type StringAndIndex = [string, number];

export const inputParser = (input: string): string[] => {
  let i = 0;
  let t = input[i++];

  switch(t) {
    case '*':
      const [arrayItemsCount, idx] = parseLength(input, i);
      return getArrayItems(input, idx, arrayItemsCount);
    default:
      new Error('unknown type');
      break;
  }

  return [];
}


const parseLength = (input: string, idx: number): LengthAndIndex  => {
  let len = 0;
  do {
    if(input[idx] === '\r') {
      idx = idx+2; //skip end of line
      break;
    }
    len = len * 10 + parseInt(input[idx]);
  } while(idx++ < input.length);

  return [len, idx];
}

function getBulkString(input: string, idx: number): StringAndIndex {
  let i = idx;
  if(input[i] !== '$')
    throw new Error(`not a bulkString ${input} at position ${i}`)
  const [len, new_i] = parseLength(input, i+1); //?
  i = new_i;

  let resultStr = '';
  for(let j=0; j<len; j++) {
    resultStr += input[i++];
  }

  return [resultStr, i+2];
}

const getArrayItems = (input: string, idx: number, count: number): string[] => {
  let i = idx;
  const results = [] as string[];
  for(let arrayIndex=0; arrayIndex<count; arrayIndex++) {
    const [str, new_i] = getBulkString(input, i); //?
    i = new_i;
    results.push(str);
  }

  return results;
}

/*
const str1 = "*1\r\n$4\r\nPING\r\n";
const str = "*2\r\n$4\r\nECHO\r\n$3\r\nhey\r\n";

let i = 0;
let t = str[i++];

switch(t) {
  case '*':
    const [arrayItemsCount, idx] = parseLength(str, i);
    console.log(arrayItemsCount, idx);
    const resp: string[] = getArrayItems(str, idx, arrayItemsCount);
    resp;
    break;
  case '$':
    console.log('bulk string');
    break;
  default:
    console.log('unknown');
    break;
}
if(t === '*') console.log('array');
if(t === '$') console.log('bulk string')

const [len, idx] = parseLength(str, i);

console.log(len)
console.log(str[idx]);

 */


