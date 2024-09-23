import * as mpcf from 'mpc-framework';
import * as summon from 'summon-ts';
import { MpzSemiHonestBackend } from 'mpz-ts';

import { LocalComms, makeLocalCommsPair } from './LocalComms';
import { Protocol } from 'mpc-framework';

async function main() {
  await summon.init();

  const [aliceComms, bobComms] = makeLocalCommsPair();

  const circuit = summon.compileBoolean('/src/main.ts', 8, {
    '/src/main.ts': `
      export default function main(a: number, b: number) {
        return a + b;
      }
    `,
  });

  const mpcSettings = [
    {
      name: 'alice',
      inputs: ['a'],
      outputs: ['main'],
    },
    {
      name: 'bob',
      inputs: ['b'],
      outputs: ['main'],
    },
  ];

  const protocol = new mpcf.Protocol(
    circuit,
    mpcSettings,
    new MpzSemiHonestBackend(),
  );

  const startTime = Date.now();

  const outputs = await Promise.all([
    runAlice(protocol, aliceComms),
    runBob(protocol, bobComms),
  ]);

  const endTime = Date.now();

  console.log(endTime - startTime, outputs);
}

async function runAlice(protocol: Protocol, comms: LocalComms) {
  const session = protocol.join(
    'alice',
    { a: 3 },
    (to, msg) => {
      assert(to === 'bob');
      comms.send(msg);
    },
  );

  const buffered = comms.recv();

  if (buffered.length > 0) {
    session.handleMessage('bob', buffered);
  }

  comms.recvBuf.on('data', data => session.handleMessage('bob', data));

  const output = await session.output();

  return output;
}

async function runBob(protocol: Protocol, comms: LocalComms) {
  const session = protocol.join(
    'bob',
    { b: 5 },
    (to, msg) => {
      assert(to === 'alice');
      comms.send(msg);
    },
  );

  const buffered = comms.recv();

  if (buffered.length > 0) {
    session.handleMessage('alice', buffered);
  }

  comms.recvBuf.on('data', data => session.handleMessage('alice', data));

  const output = await session.output();

  return output;
}

function assert(value: unknown): asserts value {
    if (!value) {
        throw new Error('Assertion failed');
    }
}

main().catch(console.error);
