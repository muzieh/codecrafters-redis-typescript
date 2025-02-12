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
