require('dotenv').config();
const { TonClient } = require('@tonclient/core');
const { libNode } = require('@tonclient/lib-node');
const { readFileSync } = require('fs');
const path = require('path');

TonClient.useBinaryLibrary(libNode);

const client = new TonClient({
    network: {
        endpoints: [process.env.TON_ENDPOINT]
    }
});

async function deploy() {
    try {
        // Загрузка ABI и TVC контракта
        const contractABI = JSON.parse(
            readFileSync(path.join(__dirname, '../contracts/Duel.abi.json'), 'utf8')
        );
        const contractTVC = readFileSync(
            path.join(__dirname, '../contracts/Duel.tvc'),
            { encoding: 'base64' }
        );

        // Генерация ключей
        const keys = await client.crypto.generate_random_sign_keys();

        // Деплой контракта
        const response = await client.abi.encode_message({
            abi: contractABI,
            signer: {
                type: 'Keys',
                keys: keys
            },
            deploy_set: {
                tvc: contractTVC,
                initial_data: {}
            },
            call_set: {
                function_name: 'constructor',
                input: {}
            }
        });

        console.log('✅ Контракт успешно задеплоен!');
        console.log('Адрес:', response.address);
        console.log('Ключи:', JSON.stringify(keys, null, 2));

    } catch (error) {
        console.error('❌ Ошибка деплоя:', error);
        process.exit(1);
    }
}

deploy();