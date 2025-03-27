const PlanOfStudy = require('../models/PlanOfStudy');
const Course = require("../models/Course");
const mongoose = require('mongoose');

const addCourseToPlan = async (req, res) => {
    try {
        const { userId, semester, courseId } = req.body;

        // Find the user's Plan of Study
        let plan = await PlanOfStudy.findOne({ studentId: userId });

        if (!plan) {
            return res.status(404).json({ error: "Plan of Study not found." });
        }

        // Add course to the semester
        const semesterIndex = plan.semesters.findIndex(s => s.semester === semester);
        if (semesterIndex !== -1) {
            plan.semesters[semesterIndex].courses.push({ courseId, status: "Planned" });
        } else {
            plan.semesters.push({
                semester,
                year: new Date().getFullYear(),
                courses: [{ courseId, status: "Planned" }]
            });
        }

        await plan.save();
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: "Error adding course to Plan of Study" });
    }
};

// Fetch User's Plan of Study
const getUserPlanOfStudy = async (req, res) => {
    try {
        const userId = req.params.userId;

        // Find the user's Plan of Study
        const planOfStudy = await PlanOfStudy.findOne({ studentId: userId }).populate("semesters.courses.courseId");

        if (!planOfStudy) {
            return res.status(404).json({ message: "Plan of Study not found for user." });
        }

        res.json(planOfStudy);
    } catch (error) {
        res.status(500).json({ error: "Error fetching plan of study" });
    }
};

// Fetch Available Courses (Excluding those already in Plan of Study)
const getAvailableCourses = async (req, res) => {
    try {
        console.log("✅ Received request at /api/plans/available/:userId with userId:", req.params.userId);

        const userId = req.params.userId;
        const planOfStudy = await PlanOfStudy.findOne({ studentId: userId });

        console.log("🔍 Retrieved Plan of Study:", planOfStudy);

        if (!planOfStudy) {
            console.log("❌ No Plan of Study found for user:", userId);
            return res.status(404).json({ error: "Plan of Study not found." });
        }

        // Extract course IDs already in the Plan of Study
        const userCourseIds = new Set();
        planOfStudy.semesters.forEach(semester => {
            semester.courses.forEach(course => {
                console.log("🔍 Found course in Plan of Study:", course);
                if (course.courseId) {
                    userCourseIds.add(course.courseId.toString());
                }
            });
        });

        console.log("🔍 Excluded course IDs (already in Plan of Study):", Array.from(userCourseIds));

        // Fetch courses NOT in user's Plan of Study
        const availableCourses = await Course.find({ courseCode: { $nin: Array.from(userCourseIds) } });

        console.log("✅ Available Courses Retrieved:", availableCourses.length);
        res.json(availableCourses);
    } catch (error) {
        console.error("❌ Error fetching available courses:", error);
        res.status(500).json({ error: "Error fetching available courses", details: error.message });
    }
};


const createPlanOfStudy = async (req, res) => {
    try {
        const { studentId, semesters, totalCredits } = req.body;

        if (!studentId || !semesters || !totalCredits) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newPlan = new PlanOfStudy({
            studentId,
            semesters,
            totalCredits
        });

        await newPlan.save();
        res.status(201).json(newPlan);
    } catch (error) {
        res.status(500).json({ error: "Error creating Plan of Study" });
    }
};

// Create Semester (POST)
const addSemester = async (req, res) => {
    try {
        
        const { userId, semesterName, year } = req.body;
        
        // if name is not valid
        if(semesterName !== "Spring" && semesterName !== "Summer" && semesterName !== "Fall")
        {
            return res.status(400).json({ error: "Invalid semester (Valid Options: Spring, Summer, Fall)" });
        }

        if(year < 2025)
        {
            return res.status(400).json({ error: "Invalid year (Must be 2025 or later)" });
        }

        // Find the user's Plan of Study
        let plan = await PlanOfStudy.findOne({ studentId: new mongoose.Types.ObjectId(userId) });

        if (!plan) {
            return res.status(404).json({ error: "Plan of Study not found." });
        }

        // Now we need to add another semester index
        // if empty, no checking needed add whatever is passed
        if(plan.semesters.length === 0)
        {
            plan.semesters.push(
            {
                semester: semesterName, 
                year: year, 
                courses: [] // empty courses
            });
        }
        // else we need to calculate what semester it is and year
        else
        {
            // need to check if semester and year are valid based off previous semester
            if(plan.semesters[plan.semesters.length-1].semester === "Fall" && plan.semesters[plan.semesters.length-1].year === year)
            {
                return res.status(400).json({ error: "Invalid semester and year combination" });
            }
            else if(plan.semesters[plan.semesters.length-1].semester === "Spring" && semesterName === "Spring" && plan.semesters[plan.semesters.length-1].year === year) 
            {
                return res.status(400).json({ error: "Invalid semester and year combination" });
            }
            else if(plan.semesters[plan.semesters.length-1].semester === "Summer" && (semesterName === "Spring" || semesterName === "Summer") && plan.semesters[plan.semesters.length-1].year === year)
            {
                return res.status(400).json({ error: "Invalid semester and year combination" });
            }

            // valid semester/year combo
            plan.semesters.push(
            {
                semester: semesterName,
                year: year,
                courses: []
            });
        }

        // send response
        await plan.save();
        res.json(plan);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Delete Semester (DELETE)
const deleteSemester = async (req, res) => {
    try {
            // get user id and semester id from parameter
            const userId = req.params.userId;
            const semesterId = req.params.semesterId;
    
            // find plan of study semester to be deleted is in
            const plan = await PlanOfStudy.findOne({ studentId: new mongoose.Types.ObjectId(userId) });

            // no plan of study
            if (!plan)
            {
                return res.status(404).json({ error: 'Plan of Study not found.' });
            }
            
            // find semester index
            let j = -1;
            for(let i = 0; i < plan.semesters.length; i++)
            {
                if(plan.semesters[i]._id.equals(new mongoose.Types.ObjectId(semesterId)))
                {
                    j = i;
                    plan.semesters.splice(i,1); // remove semester from array
                    break;
                }
            }

            // if nothing was found
            if(j < 0)
            {
                return res.status(404).json({ error: 'Semester not found.' });
            }

            // Successful
            await plan.save();
            res.json({ message: 'Semester deleted successfully!' });

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
}

// Search for Semester (POST)
const searchSemester = async (req, res) => {
    try {

        // semesters with same semester name
        function checkName(semester){
            return semester.semester.includes(search);
        }

        // semesters with same year
        function checkYear(semester){
            return semester.year === Number(search);
        }

        // semester with same name/year
        function checkSearch(semester){
            return semester.semester.includes(search.split(" ")[0]) && semester.year === Number(search.split(" ")[1]); 
        }

        const { userId, search, mode} = req.body;

        // find plan of study we are searching
        const plan = await PlanOfStudy.findOne({ studentId: new mongoose.Types.ObjectId(userId) });

        // no plan of study
        if (!plan)
        {
            return res.status(404).json({ error: 'Plan of Study not found.' });
        }

        let result = [];
        if(mode === 0) // searching for name
        {
            result = plan.semesters.filter(checkName);
        } else if (mode === 1) // searching for year
        {
            result = plan.semesters.filter(checkYear);
        } else if (mode === 2) // searching for one name + year
        {
            result = plan.semesters.filter(checkSearch);
        }

        res.json({ semesters: result });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }

}

const addCourseToSemester = async (req, res) => {
    try {
      const { userId, semesterId } = req.params;
      const { courseId } = req.body;
  
      // 1. Find the Plan of Study
      const plan = await PlanOfStudy.findOne({ studentId: userId });
      if (!plan) return res.status(404).json({ error: "Plan not found." });
  
      // 2. Find the target semester
      const semester = plan.semesters.id(semesterId);
      if (!semester) return res.status(404).json({ error: "Semester not found." });
  
      // 3. Check if course already exists in this semester
      const courseExists = semester.courses.some(
        c => c.courseId.toString() === courseId
      );
  
      if (courseExists) {
        return res.status(400).json({ 
          error: "Course already exists in this semester.",
          solution: "Remove the existing entry first if you want to re-add it."
        });
      }
  
      // 4. Add the course if it doesn't exist
      semester.courses.push({ courseId, status: "Planned" });
      await plan.save();
  
      res.status(200).json({
        message: "Course added successfully",
        semester: semester
      });
  
    } catch (error) {
      res.status(500).json({ 
        error: "Internal server error",
        details: error.message 
      });
    }
  };

// Helper function
function isSemesterBefore(a, b) {
  const order = { 'Spring': 0, 'Summer': 1, 'Fall': 2 };
  return order[a] < order[b];
}

const removeCourseFromSemester = async (req, res) => {
    try {
        const { userId, semesterId, courseId } = req.params;

        // Find the Plan of Study
        const plan = await PlanOfStudy.findOne({ studentId: userId });
        if (!plan) {
            return res.status(404).json({ error: "Plan of Study not found." });
        }

        // Find the semester
        const semester = plan.semesters.id(semesterId);
        if (!semester) {
            return res.status(404).json({ error: "Semester not found." });
        }

        // Find and remove the course
        const courseIndex = semester.courses.findIndex(
            c => c.courseId.toString() === courseId
        );
        
        if (courseIndex === -1) {
            return res.status(404).json({ error: "Course not found in this semester." });
        }

        semester.courses.splice(courseIndex, 1);
        await plan.save();

        res.status(200).json({
            message: "Course removed from semester successfully",
            semester: semester
        });
    } catch (error) {
        res.status(500).json({ 
            error: "Error removing course from semester",
            details: error.message 
        });
    }
};

const searchCoursesInPlan = async (req, res) => {
    try {
      const { userId } = req.params;
      const { query } = req.query;
  
      // 1. Get the user's plan with populated courses
      const plan = await PlanOfStudy.findOne({ studentId: userId })
        .populate({
          path: 'semesters.courses.courseId',
          select: 'courseCode courseName creditHours semestersOffered'
        });
  
      if (!plan) {
        return res.status(404).json({ error: "Plan not found." });
      }
  
      // 2. Filter courses matching the search term
      const results = [];
      plan.semesters.forEach(semester => {
        semester.courses.forEach(course => {
          const { courseId, status } = course;
          if (
            courseId.courseCode.toLowerCase().includes(query.toLowerCase()) ||
            courseId.courseName.toLowerCase().includes(query.toLowerCase())
          ) {
            results.push({
              courseCode: courseId.courseCode,
              courseName: courseId.courseName,
              semester: semester.semester,
              year: semester.year,
              status,
              creditHours: courseId.creditHours
            });
          }
        });
      });
  
      res.json({ results });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };

module.exports = { 
    addCourseToPlan, 
    getUserPlanOfStudy, 
    getAvailableCourses, 
    createPlanOfStudy, 
    addSemester, 
    deleteSemester, 
    searchSemester,
    addCourseToSemester,
    removeCourseFromSemester,
    searchCoursesInPlan
}