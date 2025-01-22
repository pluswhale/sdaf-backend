import { DataSource } from 'typeorm';
import { User } from '../entities/User';

export const seedUsers = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);

  // User data to seed
  const userData = [
    { fullName: 'Pancho Vanhees', username: 'p_vanhees_sv', password: 'hwapp_0' },
    { fullName: 'Dmitry Rybachenok', username: 'd_rybachenok_bh', password: 'hwapp_01' },
    { fullName: 'Yaraslau Zubrytski', username: 'y_zubrytski_bh', password: 'hwapp_02' },
    { fullName: 'Siarhei Labodzin', username: 'slabodzin_bh', password: 'hwapp_03' },
    { fullName: 'Yahor Dultsau', username: 'ydultsau_bh', password: 'hwapp_04' },
    { fullName: 'Andrey Chisty', username: 'achisty_bh', password: 'hwapp_05' },
    { fullName: 'Rastsislau Yushkevich', username: 'ryushkevich_bh', password: 'hwapp_06' },
    { fullName: 'Igor Mamonenko', username: 'gen_dir_bh', password: 'hwapp_10' },
    { fullName: 'Сергей', username: 'sergio_bh', password: 'hwapp_50' },
    { fullName: 'admin', username: 'admin', password: 'hwapp_admin' },
  ];

  for (const user of userData) {
    // Check if the user already exists by username
    const existingUser = await userRepository.findOne({ where: { username: user.username } });

    // If user doesn't exist, create and save
    if (!existingUser) {
      const newUser = userRepository.create(user); // Create user instance
      await userRepository.save(newUser); // Save to the database
      console.log(`User ${user.username} seeded successfully.`);
    } else {
      console.log(`User ${user.username} already exists, skipping.`);
    }
  }

  console.log('User seeding completed.');
};

