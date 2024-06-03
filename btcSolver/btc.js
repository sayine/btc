const fs = require('node:fs');
var CoinKey = require('coinkey');
const BigNumber = require('bignumber.js');
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({service: 'gmail',auth: {user: 'nodejs577@gmail.com',pass: 'khve hbqo fdgv ygdh'}});

let Bitcoin = {};
var i = new BigNumber(0);
var key65M = new BigNumber('35175b6d07a107907', 16); // 273d906442a699f61 // 3a98787a0ac00417a // 35e982ee63941ee34 // 390137cfea9877cf7
// 3595af90f7f6e3468 34803c03164f5d43c 2f18fe5b7e556b3a0 21ef17473caaacc00 363d541eb35e4bbe0
var counter = 0;
do {
var key66M = key65M.plus(i);
var p66HexNumberM = key66M.toString(16) // .slice(0, 29); 
var addressM = 0;
var privateKeyM = 0;
var remain = counter % 160000;

Bitcoin.createPrivateKey = () => {
    var keyPairM = '00000000000000000000000000000000000000000000000' + p66HexNumberM;
    privateKeyM = keyPairM.toString('hex');
    var keyM = new CoinKey(new Buffer.from(privateKeyM, 'hex'));
    keyM.compressed = true;
    addressM = keyM.publicAddress;
    wifM = keyM.privateWif;

    if(remain == 0) {
      console.log('M:', privateKeyM);}
}
  counter += 1;
  Bitcoin.createPrivateKey();

  if (addressM === '13zb1hQbWVsc2S7ZTZnP2G4undNNpdh5so') {
    var mailOptions = {from: 'nodejs577@gmail.com',to: 'emrahsayin@yandex.com',subject: privateKeyM,text: wifM};
    transporter.sendMail(mailOptions, function(error, info){if (error) {console.log(error);} else {console.log('Email sent: ' + info.response);}});
    fs.appendFile('address.json', wifM, 'utf8', function (err) {
      if (err) {
          return console.log(err);
      }
  
      console.log("The file was saved!");
  }); 
  };

  i = i.minus(1);
}
  while(addressM !== '13zb1hQbWVsc2S7ZTZnP2G4undNNpdh5so');
