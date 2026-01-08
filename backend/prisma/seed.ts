import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.post.deleteMany();
  await prisma.log.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.userFollow.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      username: 'alice',
      password: await bcryptjs.hash('password123', 10),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      bio: 'Pet lover and travel enthusiast',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      username: 'bob',
      password: await bcryptjs.hash('password123', 10),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      bio: 'Dog trainer and pet photographer',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      username: 'charlie',
      password: await bcryptjs.hash('password123', 10),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
      bio: 'Veterinary student',
    },
  });

  // Create pets
  const pet1 = await prisma.pet.create({
    data: {
      name: 'Luna',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      image: 'https://images.unsplash.com/photo-1633722715463-d30628be4c4e?w=300',
      userId: user1.id,
    },
  });

  const pet2 = await prisma.pet.create({
    data: {
      name: 'Whiskers',
      species: 'Cat',
      breed: 'Persian',
      age: 2,
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300',
      userId: user2.id,
    },
  });

  const pet3 = await prisma.pet.create({
    data: {
      name: 'Max',
      species: 'Dog',
      breed: 'Labrador',
      age: 5,
      image: 'https://images.unsplash.com/photo-1633722713463-d30628be4c4e?w=300',
      userId: user3.id,
    },
  });

  // Create logs
  const now = new Date();
  await prisma.log.create({
    data: {
      petId: pet1.id,
      type: 'feeding',
      content: 'Fed Luna with premium dog food',
      date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  });

  await prisma.log.create({
    data: {
      petId: pet1.id,
      type: 'walk',
      content: '30 minute walk at the park',
      date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });

  // Create posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Luna loves the beach!',
      content: 'Had an amazing day at the beach with Luna. She loved running in the sand and swimming!',
      image: 'https://images.unsplash.com/photo-1633722715463-d30628be4c4e?w=500',
      petId: pet1.id,
      authorId: user1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Whiskers is the perfect cuddle buddy',
      content: 'Nothing beats a lazy Sunday afternoon with Whiskers on my lap',
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500',
      petId: pet2.id,
      authorId: user2.id,
    },
  });

  // Create likes
  await prisma.like.create({
    data: {
      userId: user2.id,
      postId: post1.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: user3.id,
      postId: post1.id,
    },
  });

  // Create comments
  await prisma.comment.create({
    data: {
      content: 'Luna is so beautiful! 🐕',
      authorId: user2.id,
      postId: post1.id,
    },
  });

  // Create badges
  await prisma.badge.create({
    data: {
      name: 'Best Post',
      postId: post1.id,
    },
  });

  // Create follows
  await prisma.userFollow.create({
    data: {
      followerId: user2.id,
      followingId: user1.id,
    },
  });

  await prisma.userFollow.create({
    data: {
      followerId: user3.id,
      followingId: user1.id,
    },
  });

  console.log('Seed data created successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
