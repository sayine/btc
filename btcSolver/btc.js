const bitcoin = require("bitcoinjs-lib");
const ec = require("elliptic").ec;
const sha256 = require('js-sha256');
const ripemd160 = require('ripemd160');
const base58 = require('bs58');

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'nodejs577@gmail.com',
      pass: 'khve hbqo fdgv ygdh'
    }
  });

let Bitcoin = {};
do {

function getRN() {
  let arrayRN = new Uint8Array(1);
  crypto.getRandomValues(arrayRN);
  return arrayRN[0] % 16;
}

var list = ["a","b","c","d","e","f",0,1,2,3,4,5,6,7,8,9];
var pK = '00000000000000000000000000000000000000';
var pKArray = [...pK];

for (let i = 0; i < pKArray.length; i++) {
  pKArray[i] = list[getRN()];
}

//console.log(pKArray.join(''));

var address = 0;
var privateKey = 0;
// Generate the key and address
Bitcoin.createWalletAddress = (callback) => {
    let privateKey = Bitcoin.createPrivateKey();
    let hash = Bitcoin.generatePublicKeyHash(privateKey);
    address = Bitcoin.createPublicAddress(hash);

    console.log(privateKey);
    console.log(address);
}
// 1NBC8uXJy1GiJ6drkiZa1WuKn51ps7EPTv
// Create the private key 
Bitcoin.createPrivateKey = () => {
    var keyPair = '00000000000000000000000001' + pKArray.join('');
    privateKey = keyPair.toString('hex');
    return privateKey;
}

/**
 * Generate the public key hash
 * 
 * @param {String} privateKey 
 */
Bitcoin.generatePublicKeyHash = privateKey => {
    const ecdsa = new ec('secp256k1'),
        keys = ecdsa.keyFromPrivate(privateKey),
        publicKey = keys.getPublic('hex'),
        hash = sha256(Buffer.from(publicKey, 'hex')),
        publicKeyHash = new ripemd160().update(Buffer.from(hash, 'hex')).digest();

    return publicKeyHash;
}

/**
 * Create a public address based on the hash
 * 
 * @param {String} publicKeyHash 
 */
Bitcoin.createPublicAddress = publicKeyHash => {
    // step 1 - add prefix "00" in hex
    const step1 = Buffer.from("00" + publicKeyHash.toString('hex'), 'hex');
    // step 2 - create SHA256 hash of step 1
    const step2 = sha256(step1);
    // step 3 - create SHA256 hash of step 2
    const step3 = sha256(Buffer.from(step2, 'hex'));
    // step 4 - find the 1st byte of step 3 - save as "checksum"
    const checksum = step3.substring(0, 8);
    // step 5 - add step 1 + checksum
    const step4 = step1.toString('hex') + checksum;
    // return base 58 encoding of step 5
    const address = base58.encode(Buffer.from(step4, 'hex'));
    return address;
  }

  Bitcoin.createWalletAddress();

  if (address === '18192XpzzdDi2K11QVHR7td2HcPS6Qs5vg') {
    var mailOptions = {
  from: 'nodejs577@gmail.com',
  to: 'sayinemrah@gmail.com',
  subject: 'Sending Email using Node.js',
  text: privateKey
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
  };}
  while(address !== '18192XpzzdDi2K11QVHR7td2HcPS6Qs5vg');
