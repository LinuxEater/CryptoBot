//Nessa aula vamos implementar o RSI (Relative Strength Index) para tomar decisões de compra e venda.
/* 

RSI é a sigla para Relative Strength Index, que em português significa Índice de Força Relativa. É uma ferramenta de análise técnica que mede a força de uma tendência de preços. 
O RSI foi criado em 1978 por J. Welles Wilder. É um dos indicadores técnicos mais utilizados por traders. 
Como funciona o RSI

O RSI varia entre 0 e 100 
*É calculado comparando os ganhos e perdas médios de um ativo ao longo de um período específico 
*É usado para identificar zonas de sobrecompra e sobrevenda 
*Ajuda a determinar o estado do mercado 
*Ajuda a identificar os pontos fortes e fracos de um ativo 

Como usar o RSI?
- O RSI de 14 dias é o mais popular, mas é possível escolher o número de dias para o cálculo 
- O RSI não deve ser o único indicador usado, é importante confirmar a situação em outros indicadores 
- A teoria de Dow e os gráficos candlestick são outras formas de estudar o mercado   

*/

const axios = require("axios");
const SYMBOL = "BTCUSDT";
const BUY_PRICE = 96590;
const SELL_PRICE = 96600;
const PERIOD = 14;
const API_URL = "https://api.binance.com";//"https://testnet.binance.vision";

//npm init -y (inicia um projeto node)
console.log('Hello World!');// exibe mensagem na tela
//node aula01.js (executa o arquivo)

//vamos fazer uma funcao para calcular os ganhos
function averages(prices, period, startIndex) {
    let gains = 0, losses = 0;

    for (let i = 0; i < period && (i + startIndex) < prices.length; i++) {
        const diff = prices[i + startIndex] - prices[i + startIndex - 1];
        if (diff >= 0)
            gains += diff;
        else
            losses += Math.abs(diff);
    }

    let avgGains = gains / period;
    let avgLosses = losses / period;
    return { avgGains, avgLosses };
}

//vamos fazer uma funcao para calcular o RSI de fato

function RSI(prices, period){
    let avgGains = 0, avgLosses = 0;

    for(let i=1; i < prices.length; i++){
        let newAverages = averages(prices, period, i);

        if(i === 1){
            avgGains = newAverages.avgGains;
            avgLosses = newAverages.avgLosses;
            continue;
        }

        avgGains = (avgGains * (period -1) + newAverages.avgGains) / period;
        avgLosses = (avgLosses * (period -1) + newAverages.avgLosses) / period;
    }

    const rs = avgGains / avgLosses;
    return 100 - (100 / (1 + rs));
}



//2 tipos de monitoramento - manual ou automático

// estar aberto significa que eu ja comprei ou vendi


let isOpened = false;

async function start() {
    const { data } = await axios.get(API_URL + "/api/v3/klines?limit=100&interval=15m&symbol=" + SYMBOL);
    const candle = data[data.length - 1];
    //covertendo o price para float
    const lastPrice = parseFloat(candle[4]);

    console.clear();
    console.log("Price: " + lastPrice);

    const prices = data.map(k => parseFloat(k[4]));
    const rsi = RSI(prices, PERIOD);
    console.log("RSI: " + rsi);


    if(rsi <= 30 && isOpened === false) {
        console.log("Sobrecomprado, hora de Comprar");
        console.log("Comprado com sucesso!");
        isOpened = true;
    }else if(rsi >= 70  && isOpened === true){
        console.log("Sobrevendido, hora de vender");
        console.log("Vendido com sucesso!");
        isOpened = false;
    }else
        console.log("Aguardar");


}

setInterval(start, 3000);

start();