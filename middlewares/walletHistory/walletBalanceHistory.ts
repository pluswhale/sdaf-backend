import cron from 'node-cron';
import axios from 'axios';
import { Wallet } from '../../db/entities';
import { AppDataSource } from '../../db/AppDataSource';

const walletRepository = AppDataSource.getRepository(Wallet);

async function snapshotWalletsBalanceHistory(maxRetries = 5, retryCount = 0): Promise<void> {
  const wallets: Wallet[] = await walletRepository.find();
  const timeStamp = new Date().toISOString();
  const currentYear = new Date().getFullYear();

  try {
    const walletsWithPrices: Wallet[] = (await axios.post('https://sdafcwap.com/app/api/wallets-with-prices', wallets))
      .data;

    const updatedSnapshots = walletsWithPrices.map((el: any) => {
      if (new Date(el.balanceHistory[0].timeStamp).getFullYear() !== currentYear) {
        el.balanceHistory = [];
      }

      if (el?.price?.usd) {
        el.balanceHistory.push({
          balance: el.price.usd,
          timeStamp: timeStamp,
        });
      }
      delete el?.price;
      return el;
    });

    await walletRepository.save(updatedSnapshots);
  } catch (error) {
    console.error(`Error fetching wallets with prices (attempt ${retryCount + 1}):`, error);
    if (retryCount < maxRetries - 1) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return snapshotWalletsBalanceHistory(maxRetries, retryCount + 1);
    } else {
      console.error('Max retries reached. Aborting.');
    }
  }
}

cron.schedule('0 0 * * *', async () => {
  await snapshotWalletsBalanceHistory();
});
