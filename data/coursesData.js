module.exports = [
  { courseCode: 'STA2023', courseName: 'Statistical Methods I', creditHours: 3, area: 'Math/Statistics', requiredFor: ['Computer Science'], prerequisites: [] },
  { courseCode: 'COP3330', courseName: 'Object Oriented Programming', creditHours: 3, area: 'Core', requiredFor: ['Computer Science'], prerequisites: ['COP3502C'] },
  { courseCode: 'COP3502C', courseName: 'Computer Science I', creditHours: 3, area: 'Core', requiredFor: ['Computer Science'], prerequisites: [] },
  { courseCode: 'COP3503C', courseName: 'Computer Science II', creditHours: 3, area: 'Core', requiredFor: ['Computer Science'], prerequisites: ['COP3502C'] },
  { courseCode: 'CDA3103C', courseName: 'Computer Logic and Organization', creditHours: 3, area: 'Systems', requiredFor: ['Computer Science'], prerequisites: [] },
  { courseCode: 'COT3100C', courseName: 'Introduction to Discrete Structures', creditHours: 3, area: 'Core', requiredFor: ['Computer Science'], prerequisites: [] },
  { courseCode: 'CIS3360', courseName: 'Security in Computing', creditHours: 3, area: 'Cybersecurity', requiredFor: ['Computer Science'], prerequisites: ['COP3503C'] },
  { courseCode: 'COP3402', courseName: 'Systems Software', creditHours: 3, area: 'Systems', requiredFor: ['Computer Science'], prerequisites: ['CDA3103C'] },
  { courseCode: 'COT4210', courseName: 'Discrete Structures II', creditHours: 3, area: 'Core', requiredFor: ['Computer Science'], prerequisites: ['COT3100C'] },
  { courseCode: 'COP4331C', courseName: 'Processes for Object-Oriented Software Development', creditHours: 3, area: 'Software Engineering', requiredFor: ['Computer Science'], prerequisites: ['COP3503C'] }
];
