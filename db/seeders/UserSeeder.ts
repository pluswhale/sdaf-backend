import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Role } from '../entities';

export const seedUsers = async (dataSource: DataSource) => {
  const userRepository = dataSource.getRepository(User);
  const roleRepository = dataSource.getRepository(Role);

  // User data to seed
  const userData = [
    { fullName: 'Pancho Vanhees', username: 'p_vanhees_sv', password: 'hwapp_0', email: 'p_vanhees@savaim.com', comment: 'MM', created_at: '2024-10-12' },
    { fullName: 'Dmitry Rybachenok', username: 'd_rybachenok_bh', password: 'hwapp_01', email: 'd_rybachenok@belhard.com', comment: 'Belhard Tech Lead', created_at: '2024-10-12' },
    { fullName: 'Yaraslau Zubrytski', username: 'y_zubrytski_bh', password: 'hwapp_02', email: 'y_zubrytski@belahard.com', comment: 'Sys Engineer, Belhard', created_at: '2024-10-12' },
    { fullName: 'Siarhei Labodzin', username: 'slabodzin_bh', password: 'hwapp_03', email: 's_labodzin@belhard.com', comment: 'Belhard dev, full-stack', created_at: '2024-10-12' },
    { fullName: 'Yahor Dultsau', username: 'ydultsau_bh', password: 'hwapp_04', email: 'y_dultsau@belhard.com', comment: 'Belhard dev, full-stack', created_at: '2024-10-12' },
    { fullName: 'Andrey Chisty', username: 'achisty_bh', password: 'hwapp_05', email: '', comment: '', created_at: '2024-10-12' },
    { fullName: 'Rastsislau Yushkevich', username: 'ryushkevich_bh', password: 'hwapp_06', email: 'r_yushkevich@belhard.com', comment: 'Belhard dev, full-stack', created_at: '2024-10-12' },
    { fullName: 'Igor Mamonenko', username: 'gen_dir_bh', password: 'hwapp_10', email: '', comment: '', created_at: '2024-10-12' },
    { fullName: 'Сергей', username: 'sergio_bh', password: 'hwapp_50', email: 'sergio@belhard.com', comment: 'Belhard Tech Lead', created_at: '2024-10-12' },
    { fullName: 'admin', username: 'admin', password: 'hwapp_admin', email: '', comment: '', created_at: '2024-10-12' },
    { fullName: 'QA', username: 'qa_evgen_khilkovich', password: 'hwapp_60', email: '', comment: 'QA Engineer', created_at: '2024-10-12' },
    { fullName: 'Johan Ditz Lemche', username: 'jd_lemche', password: 'hwapp_90', email: 'j_lemche@savaim.com', comment: 'SAVA Representative', created_at: '2024-10-12' },
  ];

  const userRole = await roleRepository.findOne({ where: { name: 'user' } });

  for (const user of userData) {
    // Check if the user already exists by username
    const existingUser = await userRepository.findOne({ where: { username: user.username } });

    // If user doesn't exist, create and save
    if (!existingUser) {
      const newUser = userRepository.create(user); // Create user instance
      newUser.roles = [userRole] as Role[];
      await userRepository.save(newUser); // Save to the database
      console.log(`User ${user.username} seeded successfully.`);
    } else {
      console.log(`User ${user.username} already exists, skipping.`);
    }
  }

  console.log('User seeding completed.');
};
