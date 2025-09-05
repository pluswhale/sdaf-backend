import { Request, Response } from 'express';
import * as dotenv from 'dotenv';

dotenv.config();

export const getUserBinanceBalance = async (req: Request, res: Response): Promise<any> => {
  try {
    const { Spot } = require('@binance/connector');

    const accountType = req.query.account as string;

    // Сначала проверяем тип аккаунта
    if (!accountType) {
      return res.status(400).json({
        error: 'Тип аккаунта обязателен. Укажите параметр account в запросе.',
      });
    }

    let apiKey: string | undefined;
    let apiSecret: string | undefined;

    switch (accountType) {
      case 'hwat':
        apiKey = process.env.BINANCE_API_KEY_HWAT;
        apiSecret = process.env.BINANCE_API_SECRET_KEY_HWAT;
        break;
      case 'panchoBtc':
        apiKey = process.env.BINANCE_API_KEY_PANCHO_BTC;
        apiSecret = process.env.BINANCE_API_SECRET_KEY_PANCHO_BTC;
        break;
      case 'panchoBnb':
        apiKey = process.env.BINANCE_API_KEY_PANCHO_BNB;
        apiSecret = process.env.BINANCE_API_SECRET_KEY_PANCHO_BNB;
        break;
      case 'panchoSpot':
        apiKey = process.env.BINANCE_API_KEY_PANCHO_SPOT;
        apiSecret = process.env.BINANCE_API_SECRET_KEY_PANCHO_SPOT;
        break;
      default:
        return res.status(400).json({
          error: 'Указан неверный тип аккаунта. Допустимые варианты: hwat, panchoBtc, panchoBnb, panchoSpot',
        });
    }

    // Проверяем существование и формат учетных данных
    if (!apiKey || !apiSecret) {
      console.error(`Отсутствуют учетные данные для аккаунта: ${accountType}`);
      return res.status(400).json({
        error: 'Отсутствует API-ключ или секретный ключ для указанного аккаунта.',
        details: `Проверьте переменные окружения для ${accountType}`,
      });
    }

    // Проверяем формат API-ключа (обычно 64 символа)
    if (apiKey.length !== 64) {
      console.error(`Неверная длина API-ключа для аккаунта: ${accountType}`);
      return res.status(400).json({
        error: 'Неверный формат API-ключа',
        details: 'API-ключ должен содержать 64 символа',
      });
    }

    console.log(`Попытка подключения к Binance для аккаунта: ${accountType}`);

    const client = new Spot(apiKey, apiSecret);

    try {
      const response = await client.userAsset();

      if (response && response.data) {
        const assetsData = response.data || [];
        
        console.log(`Успешно получено ${assetsData.length} активов для аккаунта: ${accountType}`);
        
        res.status(200).json({
          account: accountType,
          balances: assetsData,
          totalAssets: assetsData.length,
        });
      } else {
        console.error('Нет данных в ответе:', response);
        res.status(500).json({
          error: 'Не удалось получить данные об активах',
          details: 'Нет данных от API Binance',
        });
      }
    } catch (binanceError: any) {
      console.error('Ошибка API Binance:', binanceError.message);
      console.error('Ответ API Binance:', binanceError.response?.data);
      
      // Обрабатываем специфичные коды ошибок Binance
      if (binanceError.response?.data?.code) {
        const errorCode = binanceError.response.data.code;
        let errorMessage = 'Ошибка API Binance';
        
        switch (errorCode) {
          case -2014:
            errorMessage = 'Неверный API-ключ, права доступа или IP';
            break;
          case -2015:
            errorMessage = 'Неверный секретный ключ API';
            break;
          case -1021:
            errorMessage = 'Временная метка запроса вышла за пределы recvWindow';
            break;
          default:
            errorMessage = `Код ошибки Binance: ${errorCode}`;
        }
        
        return res.status(400).json({
          error: errorMessage,
          details: binanceError.response.data.msg || 'Неизвестная ошибка Binance',
          code: errorCode,
        });
      }
      
      res.status(500).json({
        error: 'Ошибка запроса к API Binance',
        details: binanceError.message,
      });
    }

  } catch (error: any) {
    console.error('Неожиданная ошибка:', error.message);
    console.error('Стек ошибки:', error.stack);
    
    // Обрабатываем специфичные ошибки OpenSSL
    if (error.message.includes('asn1 encoding routines') || error.message.includes('header too long')) {
      return res.status(400).json({
        error: 'Неверный формат секретного ключа API',
        details: 'Секретный ключ API имеет неправильный формат. Проверьте переменные окружения.',
      });
    }
    
    res.status(500).json({
      error: 'Произошла непредвиденная ошибка',
      details: error.message,
    });
  }
};