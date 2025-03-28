import cron from 'node-cron';
import axios from 'axios';
import { Wallet } from '../../db/entities';
import { AppDataSource } from '../../db/AppDataSource';

const walletRepository = AppDataSource.getRepository(Wallet);

async function snapshotWalletsBalanceHistory(): Promise<void> {
  const wallets: Wallet[] = await walletRepository.find();
  const timeStamp = new Date().toISOString();

  const updatedSnapshots: Wallet[] = (
    await axios.post('https://sdafcwap.com/app/api/wallets-with-prices', {
      wallets,
    })
  ).data.map((el: any) => {
    el.balanceHistory.push({
      balance: el.price.usd,
      timeStamp: timeStamp,
    });
    delete el.price;
  });

  await walletRepository.save(updatedSnapshots);
}

cron.schedule('0 0 * * *', async () => {
  await snapshotWalletsBalanceHistory();
});
