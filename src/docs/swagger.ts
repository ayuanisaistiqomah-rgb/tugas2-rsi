import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: { title: 'Review Kantin API', version: '1.0.0' },
  servers: [{ url: 'http://localhost:3000' }],
  definitions: {
    StallInput: {
      $ownerId: 2,
      $name: 'Warung Baru',
      category: 'Nasi',
      location: 'Kantin FK',
      description: '',
    },
    MenuItemInput: {
      $stallId: 5,
      $name: 'Es Jeruk Peras',
      $price: 6000,
      isAvailable: true,
    },
    MenuItemUpdate: {
      price: 16000,
    },
    UserInput: {
      $name: 'Sausan Nisa',
      $email: 'sausan@student.test',
      $password: 'rahasia123',
      role: 'customer',
    },
    ReviewInput: {
      $stallId: 4,
      $userId: 12,
      $rating: 5,
      comment: 'Mie ayamnya enak, porsinya pas',
    },
    LikeInput: {
      $reviewId: 1,
      $userId: 13,
    },
  },
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/index.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);