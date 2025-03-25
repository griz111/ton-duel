const { TonClient } = require('@tonclient/core');
const { libNode } = require('@tonclient/lib-node');

TonClient.useBinaryLibrary(libNode);

// Инициализация клиента
function getClient() {
    return new TonClient({
        network: {
            endpoints: [process.env.TON_ENDPOINT]
        }
    });
}

// Чтение контракта из файла
function loadContract(name) {
    const fs = require('fs');
    const path = require('path');
    
    return {
        abi: JSON.parse(fs.readFileSync(path.join(__dirname, `../contracts/${name}.abi.json`))),
        tvc: fs.readFileSync(path.join(__dirname, `../contracts/${name}.tvc`), 'base64')
    };
}

module.exports = { getClient, loadContract };