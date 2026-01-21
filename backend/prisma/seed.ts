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

  // Create multilingual users (without personal information)
  // Female users (한국어, 영어, 덴마크어)
  const userJiEun = await prisma.user.create({
    data: {
      email: 'jieun.pet@example.com',
      username: 'PetLover_지은',
      password: await bcryptjs.hash('password123', 10),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jieun',
      bio: '반려동물과 함께하는 일상',
    },
  });

  const userEmma = await prisma.user.create({
    data: {
      email: 'emma.pet@example.com',
      username: 'PetJourney_Emma',
      password: await bcryptjs.hash('password123', 10),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      bio: 'Sharing happy moments with my furry friends',
    },
  });

  const userAnna = await prisma.user.create({
    data: {
      email: 'anna.pet@example.com',
      username: 'PetTales_Anna',
      password: await bcryptjs.hash('password123', 10),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna',
      bio: 'Mit mit mine kæledyr',
    },
  });

  // Male users (독일어, 프랑스어, 네덜란드어, 스페인어)
  const userKlaus = await prisma.user.create({
    data: {
      email: 'klaus.pet@example.com',
      username: 'HundeFreund_Klaus',
      password: await bcryptjs.hash('password123', 10),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=klaus',
      bio: 'Mein Leben mit Haustieren',
    },
  });

  const userPierre = await prisma.user.create({
    data: {
      email: 'pierre.pet@example.com',
      username: 'AmourPet_Pierre',
      password: await bcryptjs.hash('password123', 10),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pierre',
      bio: 'La vie est belle avec les animaux de compagnie',
    },
  });

  const userJan = await prisma.user.create({
    data: {
      email: 'jan.pet@example.com',
      username: 'HuisdierjournaalJan',
      password: await bcryptjs.hash('password123', 10),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jan',
      bio: 'Momenten met mijn gezellige huisdieren',
    },
  });

  const userCarlos = await prisma.user.create({
    data: {
      email: 'carlos.pet@example.com',
      username: 'MascotaVida_Carlos',
      password: await bcryptjs.hash('password123', 10),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos',
      bio: 'Mi vida con mis queridas mascotas',
    },
  });

  // Create pets for each user
  const petMelody = await prisma.pet.create({
    data: {
      name: 'Melody',
      species: 'Dog',
      breed: 'Maltese',
      age: 2,
      image: 'https://images.unsplash.com/photo-1633722715463-d30628be4c4e?w=300',
      userId: userJiEun.id,
    },
  });

  const petBailey = await prisma.pet.create({
    data: {
      name: 'Bailey',
      species: 'Dog',
      breed: 'Golden Retriever',
      age: 3,
      image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=300',
      userId: userEmma.id,
    },
  });

  const petLoki = await prisma.pet.create({
    data: {
      name: 'Loki',
      species: 'Cat',
      breed: 'British Shorthair',
      age: 4,
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=300',
      userId: userAnna.id,
    },
  });

  const petMax = await prisma.pet.create({
    data: {
      name: 'Max',
      species: 'Dog',
      breed: 'German Shepherd',
      age: 5,
      image: 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=300',
      userId: userKlaus.id,
    },
  });

  const petChouchou = await prisma.pet.create({
    data: {
      name: 'Chouchou',
      species: 'Cat',
      breed: 'Siamese',
      age: 2,
      image: 'https://images.unsplash.com/photo-1567633949008-58fc508d9ee0?w=300',
      userId: userPierre.id,
    },
  });

  const petLucy = await prisma.pet.create({
    data: {
      name: 'Lucy',
      species: 'Dog',
      breed: 'Dachshund',
      age: 3,
      image: 'https://images.unsplash.com/photo-1623807917808-ab3efb4a9bdc?w=300',
      userId: userJan.id,
    },
  });

  const petSabor = await prisma.pet.create({
    data: {
      name: 'Sabor',
      species: 'Dog',
      breed: 'Spanish Mastiff',
      age: 4,
      image: 'https://images.unsplash.com/photo-1633722815463-d30628be4c4e?w=300',
      userId: userCarlos.id,
    },
  });

  // Create posts for each language/user
  // Korean post (여성 - 지은)
  const postKorean = await prisma.post.create({
    data: {
      title: 'Melody와 함께한 공원 산책',
      content: '날씨가 너무 좋아서 공원에 다녀왔어요. Melody가 다른 강아지들과 잘 놀았어요 🐕',
      image: 'https://images.unsplash.com/photo-1633722715463-d30628be4c4e?w=500',
      petId: petMelody.id,
      authorId: userJiEun.id,
    },
  });

  // English post (여성 - Emma)
  const postEnglish = await prisma.post.create({
    data: {
      title: 'Bailey\'s first time at the beach',
      content: 'Bailey absolutely loved the beach today! She ran around, played in the sand, and made new friends. What a wonderful day! 🏖️',
      image: 'https://images.unsplash.com/photo-1558788353-f76d92427f16?w=500',
      petId: petBailey.id,
      authorId: userEmma.id,
    },
  });

  // Danish post (여성 - Anna)
  const postDanish = await prisma.post.create({
    data: {
      title: 'Loki\'s afslappende dag hjemme',
      content: 'Loki elsker at ligge i solen ved vinduet. Han er så fredeligt og sødt. Et perfekt eftermiddag med min katte veninde! 😸',
      image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=500',
      petId: petLoki.id,
      authorId: userAnna.id,
    },
  });

  // German post (남성 - Klaus)
  const postGerman = await prisma.post.create({
    data: {
      title: 'Max beim Training im Park',
      content: 'Max ist ein wundervoller Hund. Heute haben wir ein intensives Trainings sitzung im Park gemacht. Er liebt es, seine Fähigkeiten zu zeigen! 🐕‍🦺',
      image: 'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=500',
      petId: petMax.id,
      authorId: userKlaus.id,
    },
  });

  // French post (남성 - Pierre)
  const postFrench = await prisma.post.create({
    data: {
      title: 'Chouchou, mon petit compagnon',
      content: 'Chouchou est la plus gracieuse des chattes. Elle aime s\'asseoir sur mes genoux pendant que je travaille. C\'est un vrai plaisir d\'avoir ce petit amour! 💕',
      image: 'https://images.unsplash.com/photo-1567633949008-58fc508d9ee0?w=500',
      petId: petChouchou.id,
      authorId: userPierre.id,
    },
  });

  // Dutch post (남성 - Jan)
  const postDutch = await prisma.post.create({
    data: {
      title: 'Lucy\'s eerste dag in de achtertuin',
      content: 'Lucy exploert nu voor het eerst onze nieuwe achtertuin! Ze snuffelt overal en geniet van alle nieuwe geuren. Ze is zo enthousiast! 🐕',
      image: 'https://images.unsplash.com/photo-1623807917808-ab3efb4a9bdc?w=500',
      petId: petLucy.id,
      authorId: userJan.id,
    },
  });

  // Spanish post (남성 - Carlos)
  const postSpanish = await prisma.post.create({
    data: {
      title: 'Sabor, mi fiel compañero',
      content: 'Sabor ha sido mi compañero más leal durante estos años. Hoy disfrutamos de un hermoso paseo en el campo. ¡La vida es mucho mejor con él! 🐾',
      image: 'https://images.unsplash.com/photo-1633722815463-d30628be4c4e?w=500',
      petId: petSabor.id,
      authorId: userCarlos.id,
    },
  });

  // Create comments from different users
  // Comments on Korean post
  await prisma.comment.create({
    data: {
      content: 'Bailey도 공원을 너무 좋아해요! 멋진 사진이네요! 😊',
      authorId: userEmma.id,
      postId: postKorean.id,
    },
  });

  // Comments on English post
  await prisma.comment.create({
    data: {
      content: 'Max hat der Strand auch sehr genossen!',
      authorId: userKlaus.id,
      postId: postEnglish.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Bella immagine! 📸',
      authorId: userPierre.id,
      postId: postEnglish.id,
    },
  });

  // Comments on Danish post
  await prisma.comment.create({
    data: {
      content: 'Lucy is ook dol op zonnebaden! 🌞',
      authorId: userJan.id,
      postId: postDanish.id,
    },
  });
  await prisma.comment.create({
    data: {
      content: 'Loke ser så sød ud!',
      authorId: userJiEun.id,
      postId: postDanish.id,
    },
  });

  // Comments on German post
  await prisma.comment.create({
    data: {
      content: 'Sabor también es muy inteligente. ¡Excelente entrenamiento! 👏',
      authorId: userCarlos.id,
      postId: postGerman.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: 'Max ist so süß! 🥰',
      authorId: userAnna.id,
      postId: postGerman.id,
    },
  });

  // Comments on French post
  await prisma.comment.create({
    data: {
      content: 'Chouchou is adorable! 💕',
      authorId: userEmma.id,
      postId: postFrench.id,
    },
  });

  // Comments on Dutch post
  await prisma.comment.create({
    data: {
      content: 'Loki vindt het ook geweldig! Fantastische foto\'s! 📷',
      authorId: userAnna.id,
      postId: postDutch.id,
    },
  });

  // Comments on Spanish post
  await prisma.comment.create({
    data: {
      content: 'Das Feld ist ein großartiger Ort zum Spielen! 🌳',
      authorId: userKlaus.id,
      postId: postSpanish.id,
    },
  });

  // Create likes for posts
  // Korean post likes
  await prisma.like.create({
    data: {
      userId: userEmma.id,
      postId: postKorean.id,
    },
  });

  // English post likes
  await prisma.like.create({
    data: {
      userId: userJiEun.id,
      postId: postEnglish.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: userKlaus.id,
      postId: postEnglish.id,
    },
  });

  // Danish post likes
  await prisma.like.create({
    data: {
      userId: userPierre.id,
      postId: postDanish.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: userCarlos.id,
      postId: postDanish.id,
    },
  });

  // German post likes
  await prisma.like.create({
    data: {
      userId: userEmma.id,
      postId: postGerman.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: userAnna.id,
      postId: postGerman.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: userJiEun.id,
      postId: postGerman.id,
    },
  });

  // French post likes
  await prisma.like.create({
    data: {
      userId: userJiEun.id,
      postId: postFrench.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: userJan.id,
      postId: postFrench.id,
    },
  });

  // Dutch post likes
  await prisma.like.create({
    data: {
      userId: userCarlos.id,
      postId: postDutch.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: userAnna.id,
      postId: postDutch.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: userKlaus.id,
      postId: postDutch.id,
    },
  });

  // Spanish post likes
  await prisma.like.create({
    data: {
      userId: userKlaus.id,
      postId: postSpanish.id,
    },
  });

  await prisma.like.create({
    data: {
      userId: userJan.id,
      postId: postSpanish.id,
    },
  });

  // Create follow relationships
  // 지은 follows Emma, Anna, Klaus
  await prisma.userFollow.create({
    data: {
      followerId: userJiEun.id,
      followingId: userEmma.id,
    },
  });

  await prisma.userFollow.create({
    data: {
      followerId: userJiEun.id,
      followingId: userAnna.id,
    },
  });

  await prisma.userFollow.create({
    data: {
      followerId: userJiEun.id,
      followingId: userKlaus.id,
    },
  });

  // Emma follows 지은, Klaus, Pierre
  await prisma.userFollow.create({
    data: {
      followerId: userEmma.id,
      followingId: userJiEun.id,
    },
  });

  await prisma.userFollow.create({
    data: {
      followerId: userEmma.id,
      followingId: userKlaus.id,
    },
  });

  await prisma.userFollow.create({
    data: {
      followerId: userEmma.id,
      followingId: userPierre.id,
    },
  });

  // Anna follows Emma, Klaus, Jan
  await prisma.userFollow.create({
    data: {
      followerId: userAnna.id,
      followingId: userEmma.id,
    },
  });

  await prisma.userFollow.create({
    data: {
      followerId: userAnna.id,
      followingId: userKlaus.id,
    },
  });

  await prisma.userFollow.create({
    data: {
      followerId: userAnna.id,
      followingId: userJan.id,
    },
  });

  // Klaus follows Jan, Emma, Pierre, Carlos
  await prisma.userFollow.create({
    data: {
      followerId: userKlaus.id,
      followingId: userJan.id,
    },
  });

  await prisma.userFollow.create({
    data: {
      followerId: userKlaus.id,
      followingId: userEmma.id,
    },
  });

  await prisma.userFollow.create({
    data: {
      followerId: userKlaus.id,
      followingId: userPierre.id,
    },
  });

  await prisma.userFollow.create({
    data: {
      followerId: userKlaus.id,
      followingId: userCarlos.id,
    },
  });

  // Create logs for pets
  // Melody's logs (지은)
  await prisma.log.create({
    data: {
      petId: petMelody.id,
      type: 'feeding',
      content: '아침 사료: 스탠다드 양',
      date: new Date('2026-01-20'),
    },
  });

  await prisma.log.create({
    data: {
      petId: petMelody.id,
      type: 'walk',
      content: '공원 산책 1시간',
      date: new Date('2026-01-20'),
    },
  });

  await prisma.log.create({
    data: {
      petId: petMelody.id,
      type: 'play',
      content: '장난감으로 30분간 놀이',
      date: new Date('2026-01-19'),
    },
  });

  // Bailey's logs (Emma)
  await prisma.log.create({
    data: {
      petId: petBailey.id,
      type: 'feeding',
      content: 'Morning meal - standard portion',
      date: new Date('2026-01-20'),
    },
  });

  await prisma.log.create({
    data: {
      petId: petBailey.id,
      type: 'health',
      content: 'Grooming session - coat looks healthy',
      date: new Date('2026-01-18'),
    },
  });

  await prisma.log.create({
    data: {
      petId: petBailey.id,
      type: 'walk',
      content: 'Beach walk for 2 hours',
      date: new Date('2026-01-17'),
    },
  });

  // Loki's logs (Anna)
  await prisma.log.create({
    data: {
      petId: petLoki.id,
      type: 'feeding',
      content: 'Morgenmad - standard portion',
      date: new Date('2026-01-20'),
    },
  });

  await prisma.log.create({
    data: {
      petId: petLoki.id,
      type: 'play',
      content: 'Legende med fjerkat i 15 minutter',
      date: new Date('2026-01-19'),
    },
  });

  // Max's logs (Klaus)
  await prisma.log.create({
    data: {
      petId: petMax.id,
      type: 'feeding',
      content: 'Frühstück - große Portion',
      date: new Date('2026-01-20'),
    },
  });

  await prisma.log.create({
    data: {
      petId: petMax.id,
      type: 'health',
      content: 'Zahnarzt Besuch - alles ist in Ordnung',
      date: new Date('2026-01-15'),
    },
  });

  await prisma.log.create({
    data: {
      petId: petMax.id,
      type: 'walk',
      content: 'Trainings sitzung im Park - 1.5 Stunden',
      date: new Date('2026-01-20'),
    },
  });

  // Chouchou's logs (Pierre)
  await prisma.log.create({
    data: {
      petId: petChouchou.id,
      type: 'feeding',
      content: 'Petit déjeuner - portion standard',
      date: new Date('2026-01-20'),
    },
  });

  await prisma.log.create({
    data: {
      petId: petChouchou.id,
      type: 'play',
      content: 'Jeu avec des jouets pour chat - 20 minutes',
      date: new Date('2026-01-19'),
    },
  });

  // Lucy's logs (Jan)
  await prisma.log.create({
    data: {
      petId: petLucy.id,
      type: 'feeding',
      content: 'Ontbijt - standaard portie',
      date: new Date('2026-01-20'),
    },
  });

  await prisma.log.create({
    data: {
      petId: petLucy.id,
      type: 'walk',
      content: 'Wandeling in de achterin - 45 minuten',
      date: new Date('2026-01-20'),
    },
  });

  // Sabor's logs (Carlos)
  await prisma.log.create({
    data: {
      petId: petSabor.id,
      type: 'feeding',
      content: 'Desayuno - porción grande',
      date: new Date('2026-01-20'),
    },
  });

  await prisma.log.create({
    data: {
      petId: petSabor.id,
      type: 'walk',
      content: 'Paseo en el campo - 2 horas',
      date: new Date('2026-01-19'),
    },
  });

  // Create badges for posts
  // Korean post badge
  await prisma.badge.create({
    data: {
      name: 'Adorable',
      postId: postKorean.id,
    },
  });

  // English post badges
  await prisma.badge.create({
    data: {
      name: 'Best Photo',
      postId: postEnglish.id,
    },
  });

  await prisma.badge.create({
    data: {
      name: 'Heartwarming',
      postId: postEnglish.id,
    },
  });

  // Danish post badge
  await prisma.badge.create({
    data: {
      name: 'Peaceful',
      postId: postDanish.id,
    },
  });

  // German post badge
  await prisma.badge.create({
    data: {
      name: 'Outstanding',
      postId: postGerman.id,
    },
  });

  // French post badge
  await prisma.badge.create({
    data: {
      name: 'Lovely',
      postId: postFrench.id,
    },
  });

  // Dutch post badge
  await prisma.badge.create({
    data: {
      name: 'Exciting',
      postId: postDutch.id,
    },
  });

  // Spanish post badges
  await prisma.badge.create({
    data: {
      name: 'Inspiring',
      postId: postSpanish.id,
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
