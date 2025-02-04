const { spawn } = require('child_process');
const cluster = require('cluster');
const os = require('os');

// Toplam CPU sayısını al
const totalCPUs = os.cpus().length;
// Her script için CPU sayısını belirle (bir çekirdek sistem için ayrılsın)
const cpusPerScript = Math.floor((totalCPUs - 1) / 2);

// Script yapılandırmaları
const scripts = [
    {
        name: '67M',
        startKey: '57acaef6e2eabb7f4',
        targetAddress: '1BY8GQbnueYofwSuFAT3USAhGjPrkxDdW9',
        increment: 'minus' // i = i.minus(1) 67a57785d9efc367a
    },
    {
        name: '67P',
        startKey: '57acaef70c061bdf8',
        targetAddress: '1BY8GQbnueYofwSuFAT3USAhGjPrkxDdW9',
        increment: 'plus'  // i = i.plus(1) 67a57785e857a8f7b
    }
];

if (cluster.isMaster) {
    console.log(`Ana process başlatıldı. PID: ${process.pid}`);
    console.log(`Her script için ${cpusPerScript} CPU kullanılacak`);

    // Her script için worker başlat
    scripts.forEach((script, index) => {
        const worker = cluster.fork();
        worker.send({ 
            scriptConfig: script,
            cpuCount: cpusPerScript,
            scriptIndex: index
        });
    });

    // Worker'lardan gelen mesajları dinle
    cluster.on('message', (worker, message) => {
        if (message.found) {
            console.log(`Bulundu! Script: ${message.scriptName}`);
            console.log(`Address: ${message.address}`);
            console.log(`Private Key: ${message.privateKey}`);
            
            // Tüm worker'ları kapat
            Object.values(cluster.workers).forEach(w => w.kill());
            process.exit(0);
        }
    });

} else {
    // Worker process
    process.on('message', ({ scriptConfig, cpuCount, scriptIndex }) => {
        const fs = require('fs');
        const CoinKey = require('coinkey');
        const BigNumber = require('bignumber.js');
        const nodemailer = require('nodemailer');

        // BigNumber yapılandırması
        BigNumber.config({
            DECIMAL_PLACES: 0,
            ROUNDING_MODE: BigNumber.ROUND_DOWN,
            EXPONENTIAL_AT: 1e9,
            RANGE: 1e9
        });

        // Email yapılandırması
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: 'nodejs577@gmail.com', pass: 'khve hbqo fdgv ygdh' }
        });

        const PREFIX = '000000000000000000000000000000000000000000000';
        const startKey = new BigNumber(scriptConfig.startKey, 16);
        let i = new BigNumber(scriptIndex).multipliedBy(cpuCount);
        let counter = 0;

        function checkAddress() {
            const key66M = startKey.plus(i);
            const p66HexNumberM = key66M.toString(16);
            // Private key'in 64 karakter (32 byte) olmasını sağlayalım
            const paddedHex = p66HexNumberM.padStart(64, '0');
            const keyPairM = Buffer.from(paddedHex, 'hex');
            
            const keyM = new CoinKey(keyPairM);
            keyM.compressed = true;

            if (counter % 160000 === 0) {
                console.log(`${scriptConfig.name}:`, paddedHex);
            }
            counter++;

            if (keyM.publicAddress === scriptConfig.targetAddress) {
                // Başarılı eşleşme bulunduğunda
                fs.writeFileSync(`address_${scriptConfig.name}.json`, keyM.privateWif);
                
                transporter.sendMail({
                    from: 'nodejs577@gmail.com',
                    to: 'emrahsayin@yandex.com',
                    subject: paddedHex,
                    text: keyM.privateWif
                });

                process.send({
                    found: true,
                    scriptName: scriptConfig.name,
                    address: keyM.publicAddress,
                    privateKey: paddedHex
                });
                return true;
            }
            return false;
        }

        // Ana döngü
        while (true) {
            if (checkAddress()) break;
            
            // Artış yönünü script yapılandırmasına göre belirle
            if (scriptConfig.increment === 'plus') {
                i = i.plus(cpuCount * 2);
            } else {
                i = i.minus(cpuCount * 2);
            }
            
            // Her 1000 denemede bir bellek temizliği
            if (counter % 1000 === 0) {
                global.gc && global.gc();
            }
        }
    });
}
