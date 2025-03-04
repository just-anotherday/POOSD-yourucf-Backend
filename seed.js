// seed.js
require('dotenv').config();
const mongoose = require('mongoose');

// Import your Mongoose models
const User = require('./models/user');
const Card = require('./models/card');

// Use the connection string from .env or default to a local database
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/Users";

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000, // 10 seconds
})
  .then(() => {
    console.log("MongoDB connected for seeding.");
    seedData();
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Pre-defined card list (sample data)
const cardList = [
  'Roy Campanella',
  'Paul Molitor',
  'Tony Gwynn',
  'Dennis Eckersley',
  'Reggie Jackson',
  'Gaylord Perry',
  'Buck Leonard',
  'Rollie Fingers',
  'Charlie Gehringer',
  'Wade Boggs',
  'Carl Hubbell',
  'Dave Winfield',
  'Jackie Robinson',
  'Ken Griffey, Jr.',
  'Al Simmons',
  'Chuck Klein',
  'Mel Ott',
  'Mark McGwire',
  'Nolan Ryan',
  'Ralph Kiner',
  'Yogi Berra',
  'Goose Goslin',
  'Greg Maddux',
  'Frankie Frisch',
  'Ernie Banks',
  'Ozzie Smith',
  'Hank Greenberg',
  'Kirby Puckett',
  'Bob Feller',
  'Dizzy Dean',
  'Joe Jackson',
  'Sam Crawford',
  'Barry Bonds',
  'Duke Snider',
  'George Sisler',
  'Ed Walsh',
  'Tom Seaver',
  'Willie Stargell',
  'Bob Gibson',
  'Brooks Robinson',
  'Steve Carlton',
  'Joe Medwick',
  'Nap Lajoie',
  'Cal Ripken, Jr.',
  'Mike Schmidt',
  'Eddie Murray',
  'Tris Speaker',
  'Al Kaline',
  'Sandy Koufax',
  'Willie Keeler',
  'Pete Rose',
  'Robin Roberts',
  'Eddie Collins',
  'Lefty Gomez',
  'Lefty Grove',
  'Carl Yastrzemski',
  'Frank Robinson',
  'Juan Marichal',
  'Warren Spahn',
  'Pie Traynor',
  'Roberto Clemente',
  'Harmon Killebrew',
  'Satchel Paige',
  'Eddie Plank',
  'Josh Gibson',
  'Oscar Charleston',
  'Mickey Mantle',
  'Cool Papa Bell',
  'Johnny Bench',
  'Mickey Cochrane',
  'Jimmie Foxx',
  'Jim Palmer',
  'Cy Young',
  'Eddie Mathews',
  'Honus Wagner',
  'Paul Waner',
  'Grover Alexander',
  'Rod Carew',
  'Joe DiMaggio',
  'Joe Morgan',
  'Stan Musial',
  'Bill Terry',
  'Rogers Hornsby',
  'Lou Brock',
  'Ted Williams',
  'Bill Dickey',
  'Christy Mathewson',
  'Willie McCovey',
  'Lou Gehrig',
  'George Brett',
  'Hank Aaron',
  'Harry Heilmann',
  'Walter Johnson',
  'Roger Clemens',
  'Ty Cobb',
  'Whitey Ford',
  'Willie Mays',
  'Rickey Henderson',
  'Babe Ruth'
];

async function seedData() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Card.deleteMany({});
    console.log("Existing Users and Cards cleared.");

    // Create sample users
    const users = [
      { UserId: 1, FirstName: "John", LastName: "Doe", Login: "johndoe", Password: "password" },
      { UserId: 2, FirstName: "Jane", LastName: "Doe", Login: "janedoe", Password: "password" },
      { UserId: 3, FirstName: "Alice", LastName: "Smith", Login: "alicesmith", Password: "password" },
    ];

    const createdUsers = await User.insertMany(users);
    console.log("Inserted Users:", createdUsers);

    // For each user, assign the first 5 cards from cardList as sample cards
    const cardsToInsert = [];
    for (let user of createdUsers) {
      // For simplicity, use the first 5 cards for every user.
      // You can randomize or assign different cards if needed.
      cardList.slice(0, 5).forEach(card => {
        cardsToInsert.push({ UserId: user.UserId, Card: card });
      });
    }
    const createdCards = await Card.insertMany(cardsToInsert);
    console.log("Inserted Cards:", createdCards);

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}
