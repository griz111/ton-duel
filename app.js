import { TonConnectUI } from '@tonconnect/ui';

const tg = window.Telegram.WebApp;
const connector = new TonConnectUI({
    manifestUrl: 'https://yourdomain.com/tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

let currentDuel = {
    id: null,
    bet: 0,
    timer: null
};

// Инициализация
tg.ready();
tg.expand();

// Обновление баланса
const updateBalance = async () => {
    const balance = await connector.send({ method: 'ton_getBalance' });
    document.getElementById('balance').textContent = 
        `${(parseInt(balance) / 1e9).toFixed(2)} TON`;
};

// Обработчик ставок
document.querySelectorAll('.bet-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        currentDuel.bet = parseFloat(btn.dataset.bet);
        startDuel();
    });
});

// Запуск дуэли
async function startDuel() {
    const response = await fetch('/api/duels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            bet: currentDuel.bet,
            user: connector.account?.address 
        })
    });
    
    const data = await response.json();
    currentDuel.id = data.duelId;
    
    startTimer(60, (timeLeft) => {
        document.querySelector('.timer-text').textContent = `${timeLeft}s`;
        document.querySelector('.timer-progress').style.width = 
            `${(timeLeft / 60) * 100}%`;
    });
}

// Обработка выбора элемента
document.querySelectorAll('.element-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        const tx = {
            validUntil: Date.now() + 300000,
            messages: [{
                address: process.env.CONTRACT_ADDRESS,
                amount: (currentDuel.bet * 1e9).toString(),
                payload: JSON.stringify({
                    action: 'submit_choice',
                    duelId: currentDuel.id,
                    choice: btn.dataset.element
                })
            }]
        };
        
        await connector.sendTransaction(tx);
        showResultAnimation();
    });
});

// Анимация результата
function showResultAnimation() {
    const elements = document.querySelectorAll('.element-btn');
    elements.forEach(el => el.classList.add('disabled'));
    
    setTimeout(() => {
        elements.forEach(el => el.classList.remove('disabled'));
    }, 4000);
}