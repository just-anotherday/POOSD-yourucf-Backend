require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');
const FoundationExam = require('../models/FoundationExam');
const DegreeRequirement = require('../models/DegreeRequirement');
const Area = require('../models/Area');

// Import Data
const coursesData = require('./coursesData');
const foundationExamData = require('./foundationExamData');
const degreeRequirementsData = require('./degreeRequirementsData');
const areasData = require('./areasData');

async function seedDatabase() {
  try {
    console.log('Seeding database...');

    // **Clear existing data**
    await Promise.all([
      Course.deleteMany(),
      FoundationExam.deleteMany(),
      DegreeRequirement.deleteMany(),
      Area.deleteMany()
    ]);

    console.log('Existing data cleared.');

    // **Insert Courses First to Get ObjectIds**
    const insertedCourses = await Course.insertMany(
      coursesData.map(course => ({ ...course, prerequisites: [] })) // Insert without prerequisites first
    );

    // **Map course codes to ObjectIds**
    const courseMap = {};
    insertedCourses.forEach(course => {
      courseMap[course.courseCode] = course._id;
    });

    // **Update prerequisites with ObjectIds**
    for (let course of insertedCourses) {
      course.prerequisites = (coursesData.find(c => c.courseCode === course.courseCode).prerequisites || [])
        .map(code => courseMap[code] || null)
        .filter(id => id !== null);
      await course.save();
    }

    console.log('Courses inserted with prerequisites.');

    // **Insert Other Data**
    await Promise.all([
      FoundationExam.insertMany(foundationExamData),
      DegreeRequirement.insertMany(degreeRequirementsData),
      Area.insertMany(areasData)
    ]);

    console.log('Data seeded successfully!');

    // **Close Connection**
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
    process.exit(0);

  } catch (err) {
    console.error('Error seeding data:', err);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// **Database Connection**
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Database connected!');
    return seedDatabase();
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
