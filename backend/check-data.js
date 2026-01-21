const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.count();
  const posts = await prisma.post.count();
  const logs = await prisma.log.count();
  const badges = await prisma.badge.count();
  const follows = await prisma.userFollow.count();
  
  console.log(`Users: ${users}`);
  console.log(`Posts: ${posts}`);
  console.log(`Logs: ${logs}`);
  console.log(`Badges: ${badges}`);
  console.log(`Follows: ${follows}`);
  
  const users_list = await prisma.user.findMany({ take: 3 });
  console.log('\nSample users:');
  users_list.forEach(u => console.log(`- ${u.username} (${u.email})`));
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });
