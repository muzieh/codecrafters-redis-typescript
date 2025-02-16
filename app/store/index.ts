import { createReadStream } from 'fs'
import * as fs from "node:fs";
import type { Store } from "../main.ts";
const path = '/Users/muzieh/learning/dump.rdb'

type StringWithIndex = [string, number];
type BufferWithIndex = [Buffer, number];
type NumberWithIndex = [number, number];
type AuxWithIndex = [string, string | number | bigint,  number];


const RDB_OP_CODE_AUX= 0xFA;
const RDB_OP_CODE_RESIZEDB = 0xFB;
const RDB_OP_CODE_EXPMS = 0xFC;
const RDB_OP_CODE_EXP = 0xFD;
const RDB_OP_CODE_SELECTDB = 0xFE;
const RDB_OP_CODE_END = 0xFF;


//2 most significant bits
const RDB_LENGTH_6BIT =   0;
const RDB_LENGTH_14BIT =  1;
const RDB_LENGTH_4BYTES = 2;
const RDB_LENGTH_ENC =    3;

const RDB_INT_1BYTE =     0b11000001;
const RDB_INT_2BYTES =    0b11000001;
const RDB_INT_4BYTES =    0b11000010;

type EncodedLengthWithIndex = [number, boolean, number];

console.log(process.cwd());

function lengthWithEncoding(input: Buffer, i: number): EncodedLengthWithIndex {
  const encodedLength= input[i++];

  const encodingType= (encodedLength & 0xC0) >> 6;

  if(encodingType === RDB_LENGTH_6BIT) {
    const ln = encodedLength & 0b00111111;
    return [ln,false, i];
  } else if (encodingType === RDB_LENGTH_14BIT) {
    const mostSignificant = encodedLength & 0b00111111;
    const leastSignificant = input[i++];
    return [(mostSignificant << 8) | leastSignificant, false, i];
  } else if(encodingType === RDB_LENGTH_4BYTES) {
    const ln = input.readUInt32BE(i);
    i += 4;
    return [ln, false, i];
  } else if(encodingType === RDB_LENGTH_ENC) {
    const ln = 1 << (encodedLength & 0b00111111);
    return [ln, true, i]
  }
  throw new Error('Invalid RDB encoding type');
}

function readString(input: Buffer, i: number, len: number): string {
  return input.subarray(i, i+len).toString();
}

function readInt(input: Buffer, i: number, len: number): number | bigint {
  if(len === 1) {
    return input[i];
  } else if(len === 2) {
    return input.readUInt16BE(i);
  } else if(len === 4) {
    return input.readUInt32LE(i);
  } else if(len === 8) {
    return input.readBigInt64BE(i);
  } else {
    throw new Error('Invalid length');
  }
}

function readHeader(input: Buffer): StringWithIndex {
  return [input.subarray(0,9).toString(), 9];
}

function readAux(input: Buffer, i: number = 0): AuxWithIndex {
  if(input[i++] != RDB_OP_CODE_AUX) {
    throw new Error('Invalid RDB opcode');
  }
  //get opconde name
  const [opcNameLen, _, idx] = lengthWithEncoding(input, i);
  i = idx;

  const opcodeName = readString(input, i, opcNameLen);
  i += opcNameLen;

  // get opcode value
  const [opcValLen, isOpcValEncoded, idx2] = lengthWithEncoding(input, i);
  i = idx2;

  let opcVal: string | number | bigint;
  if(!isOpcValEncoded) {
    opcVal = readString(input, i, opcValLen);
    i += opcValLen;
  } else {
    opcVal = readInt(input, i, opcValLen);
    i += opcValLen;
  }

  return [opcodeName, opcVal, i]
}

type KeyValue = [string, string, bigint | undefined, number | undefined, number];
function readKey(input: Buffer, i: number): KeyValue {
  let expMs : bigint | undefined = 0n;
  let expS : number | undefined = 0;

  const first = input[i];
  if(first === RDB_OP_CODE_EXPMS) {
    console.log(`expired key MS ${i}`);
    i++;
    expMs = input.readBigUInt64LE(i);
    i += 8
    console.log(['exp MS', expMs]);
  } else if(first === RDB_OP_CODE_EXP) {
    console.log(`expired key S ${i}`);
    i++;
    const expS = input.readUInt32LE(i);
    i += 4
    console.log(['exp S', expS]);
  }

  const valueType = input[i++];
  switch(valueType) {
    case 0: //string
      const [keyValueLen,isValueEncoded,idx] = lengthWithEncoding(input, i);
      i = idx;
      const r = readString(input, i, keyValueLen);
      i+=keyValueLen;

      const [valLen,isVEncoded,idxVal] = lengthWithEncoding(input, i);
      i = idxVal;

      const val = readString(input, i, valLen);
      i += valLen;
      console.log([r, val])
      return [r, val, expMs, expS, i];
  }

  throw new Error('Invalid value type');
}

export async function readFromFile(fpath: string, store: Store<string>): Promise<void> {
  console.log('Reading RDB file from:', fpath);
  if(!fs.existsSync(fpath)) {
    return;
  }

  const readStream = createReadStream(fpath, {highWaterMark: 64 * 1000});

  readStream.on('data', (chunk) => {
    if(typeof chunk === 'string') {
      console.error('Received non-buffer data:', chunk);
      return;
    }
    let i = 0;
    //readStream.pause(); // pause reading until processing is done
    console.log('Received chunk:', chunk.length);
    const [header, idx] = readHeader(chunk);
    console.log(header);
    i = idx;
    let endOfHeader = false;

    while(chunk[i] !== RDB_OP_CODE_END && !endOfHeader) {
      switch(chunk[i]) {
        case RDB_OP_CODE_AUX:
          const [aux, auxVal, idx1] = readAux(chunk, i);
          console.log(aux, auxVal);
          i = idx1;
          break;
        case RDB_OP_CODE_SELECTDB:
          console.log('SELECTDB opcode');
          console.log(readInt(chunk, i+1, 1));
          i += 2;
          break;
        case RDB_OP_CODE_RESIZEDB:
          console.log('RESIZEDB opcode');

          console.log(readInt(chunk, i+1, 1));
          console.log(readInt(chunk, i+2, 1));
          i += 3;
          endOfHeader = true;
          break;
        default:
          console.error(`Unknown RDB opcode: ${chunk[i].toString(16)} index: ${i}`);
          i++;
          break;
      }
    }

    console.log(`end of header ${endOfHeader}`);
    while(chunk[i] !== RDB_OP_CODE_END) {
      const [key, value, exp_ms, exp_sec, idx3] = readKey(chunk, i);
      i = idx3;
      store[key] = {
        data: value,
        expires: undefined
      };
      console.log([key, value, exp_ms, exp_sec]);

    }
  })


  readStream.on('end', () => {
    console.log('Read operation completed.');
  })

  readStream.on('error', (error) => {
    console.error('Error reading file:', error);
  })

}

//await readFromFile(path);

