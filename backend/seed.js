const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Institution = require('./models/Institution');
const Department = require('./models/Department');
const Course = require('./models/Course');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Institution.deleteMany({});
    await Department.deleteMany({});
    await Course.deleteMany({});

    // Create Institution
    const institution = await Institution.create({
      name: 'Demo University',
      code: 'DU',
      address: '123 University Ave, Education City'
    });
    console.log('Institution created');

    // Create Departments
    const csDept = await Department.create({
      name: 'Computer Science',
      code: 'CS',
      institution: institution._id
    });

    const mathDept = await Department.create({
      name: 'Mathematics',
      code: 'MATH',
      institution: institution._id
    });
    console.log('Departments created');

    // Create Courses
    const courses = await Course.insertMany([
      { name: 'Data Structures & Algorithms', code: 'CS201', department: csDept._id, semester: 3 },
      { name: 'Database Management Systems', code: 'CS301', department: csDept._id, semester: 5 },
      { name: 'Web Development', code: 'CS302', department: csDept._id, semester: 5 },
      { name: 'Operating Systems', code: 'CS401', department: csDept._id, semester: 7 },
      { name: 'Linear Algebra', code: 'MATH201', department: mathDept._id, semester: 3 },
      { name: 'Calculus', code: 'MATH101', department: mathDept._id, semester: 1 }
    ]);
    console.log('Courses created');

    // Create Users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@demo.com',
        password: 'admin123',
        role: 'super_admin',
        institution: institution._id,
        department: csDept._id
      },
      {
        name: 'Prof. Smith',
        email: 'professor@demo.com',
        password: 'prof123',
        role: 'professor',
        institution: institution._id,
        department: csDept._id
      },
      {
        name: 'John Student',
        email: 'student@demo.com',
        password: 'student123',
        role: 'student',
        institution: institution._id,
        department: csDept._id
      },
      {
        name: 'Jane Student',
        email: 'jane@demo.com',
        password: 'student123',
        role: 'student',
        institution: institution._id,
        department: csDept._id
      },
      {
        name: 'Dept Admin',
        email: 'deptadmin@demo.com',
        password: 'admin123',
        role: 'dept_admin',
        institution: institution._id,
        department: csDept._id
      }
    ]);
    console.log('Users created');

    console.log('\n=== Seed Complete ===');
    console.log('\nTest Accounts:');
    console.log('Admin:     admin@demo.com / admin123');
    console.log('Professor: professor@demo.com / prof123');
    console.log('Student:   student@demo.com / student123');
    console.log('Student2:  jane@demo.com / student123');
    console.log('DeptAdmin: deptadmin@demo.com / admin123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
