module.exports = [
  {
    program: 'Computer Science',
    foundationExamRequired: true,
    residencyRequirement: {
      totalHours: 24,
      advancedHours: 18
    },
    minimumGPA: 2.5,
    passingGrade: 'C',
    probationRules: {
      maxAttempts: 3,
      maxUnsuccessfulAttempts: 7,
      exclusionThreshold: 10
    },
    requiredCourses: [
      'STA2023', 'COP3330', 'COP3502C', 'COP3503C', 'CDA3103C',
      'COT3100C', 'CIS3360', 'COP3402', 'COT4210', 'COP4331C'
    ],
    restrictedElectives: {
      advancedCS: ['COP4600', 'CAP4611', 'CAP4630', 'COP4710'],
      mathStats: ['MAP2302', 'MAS3105'],
      capstone: ['COP4934', 'COP4935']
    }
  }
];
