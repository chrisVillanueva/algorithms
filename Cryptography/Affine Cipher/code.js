function randString(length) {
  const choices = 'abcdefghijklmnopqrstuvwxyz';
  let text = '';

  for (let i = 0; i < length; i++) {
    text += choices[Randomize.integer(0, choices.length - 1)];
  }

  return text;
}

// let plainText = randString (5);
const plainText = 'secret';
const ptTracer = new Array1DTracer('Encryption');
const ctTracer = new Array1DTracer('Decryption');
const logger = new LogTracer();

ptTracer.set(plainText);

/*
 code assumes that plainText contains ONLY LOWER CASE ALPHABETS
 */

Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

let keys = { a: 5, b: 7 },
  N = 26;

function encrypt(plainText) {
  let cypherText = '';

  function cryptAlpha(alpha) {
    const index = alpha.charCodeAt(0) - 'a'.charCodeAt(0);
    let result = ((keys.a * index) + keys.b).mod(N);

    logger.print(`Index of ${alpha} = ${index}`);

    result += 'a'.charCodeAt(0);
    return String.fromCharCode(result);
  }

  logger.print('Beginning Affine Encryption');
  logger.print('Encryption formula: <b>((keys.a * indexOfAlphabet) + keys.b) % N</b>');
  logger.print(`keys.a=${keys.a}, keys.b=${keys.b}, N=${N}`);

  for (const i in plainText) {
    ptTracer.select(i).wait();
    ptTracer.deselect(i);

    cypherText += cryptAlpha(plainText[i]);

    ptTracer.notify(i, cypherText.slice(-1)).wait();
    ptTracer.denotify(i);
  }

  return cypherText;
}

function decrypt(cypherText) {
  let plainText = '';
  const aInverse = (function () {
    for (let i = 1; i < N; i++) {
      if (((keys.a * i).mod(N)) === 1) {
        return i;
      }
    }
  }());

  logger.print(`a<sup>-1</sup> = ${aInverse}`);

  function decryptAlpha(alpha) {
    const index = alpha.charCodeAt(0) - 'a'.charCodeAt(0);
    let result = (aInverse * (index - keys.b)).mod(N);

    logger.print(`Index of ${alpha} = ${index}`);

    result += 'a'.charCodeAt(0);
    return String.fromCharCode(result);
  }

  logger.print('Beginning Affine Decryption');
  logger.print('Decryption formula: <b>(a<sup>-1</sup> * (index - keys.b)) % N</b>');
  logger.print(`keys.b=${keys.b}, N=${N}`);

  for (const i in cypherText) {
    ctTracer.select(i).wait();
    ctTracer.deselect(i).wait();

    plainText += decryptAlpha(cypherText[i]);

    ctTracer.notify(i, plainText.slice(-1)).wait();
    ctTracer.denotify(i).wait();
  }

  return plainText;
}

const cipherText = encrypt(plainText);
ctTracer.set(cipherText);
decrypt(cipherText);
