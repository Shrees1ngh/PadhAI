import UserProgress from "./progress.model.js";
import Course from "../courses/course.model.js";
import Lesson from "../lessons/lesson.model.js";
import Quiz from "../quizzes/quiz.model.js";

/**
 * Helper: update learning streak based on the current date.
 * A streak continues if the user was last active yesterday.
 * If last active today → no change. If more than 1 day gap → reset to 1.
 */
const updateStreak = (streak) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!streak.lastActiveDate) {
    return { current: 1, lastActiveDate: today };
  }

  const lastActive = new Date(streak.lastActiveDate);
  const lastActiveDay = new Date(
    lastActive.getFullYear(),
    lastActive.getMonth(),
    lastActive.getDate()
  );

  const diffMs = today.getTime() - lastActiveDay.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already active today, no change
    return streak;
  } else if (diffDays === 1) {
    // Consecutive day → increment
    return { current: (streak.current || 0) + 1, lastActiveDate: today };
  } else {
    // Gap of >1 day → reset
    return { current: 1, lastActiveDate: today };
  }
};

/**
 * GET /api/progress/:courseId
 * Returns detailed progress for a specific course.
 */
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Find or create progress record
    let progress = await UserProgress.findOne({ userId, courseId });

    if (!progress) {
      return res.json({
        success: true,
        data: {
          courseId,
          completedLessons: [],
          totalLessons: 0,
          completionPercentage: 0,
          quizAttemptsCount: 0,
          questionsAnswered: 0,
          streak: { current: 0, lastActiveDate: null },
          enrolledAt: null,
        },
      });
    }

    // Get the course to calculate total lessons
    const course = await Course.findById(courseId).lean();
    let totalLessons = 0;
    if (course && course.modules) {
      totalLessons = course.modules.reduce(
        (sum, mod) => sum + (mod.lessons?.length || 0),
        0
      );
    }

    const completionPercentage =
      totalLessons > 0
        ? Math.round((progress.completedLessons.length / totalLessons) * 100)
        : 0;

    // Get quiz stats from Quiz collection for richer data
    const quizzes = await Quiz.find({ courseId, userId }).lean();
    const bestScores = {};
    let totalQuestionsAnswered = progress.questionsAnswered || 0;
    const weakConcepts = new Set();
    const strongConcepts = new Set();

    for (const quiz of quizzes) {
      const key = `${quiz.moduleIndex}-${quiz.lessonIndex}`;
      bestScores[key] = quiz.bestScore || 0;

      for (const attempt of quiz.attempts || []) {
        for (const concept of attempt.weakConcepts || []) {
          weakConcepts.add(concept);
        }
      }

      // If best score > 80%, consider it strong
      if (quiz.bestScore >= 80) {
        strongConcepts.add(quiz.lessonTitle);
      } else if (quiz.attempts?.length > 0) {
        weakConcepts.add(quiz.lessonTitle);
      }
    }

    return res.json({
      success: true,
      data: {
        courseId,
        courseTitle: course?.title || "Unknown Course",
        completedLessons: progress.completedLessons,
        totalLessons,
        completionPercentage,
        quizAttemptsCount: progress.quizAttemptsCount,
        questionsAnswered: totalQuestionsAnswered,
        bestScores,
        strongTopics: [...strongConcepts],
        weakTopics: [...weakConcepts],
        streak: progress.streak,
        enrolledAt: progress.enrolledAt,
      },
    });
  } catch (err) {
    console.error("Error fetching course progress:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch course progress.",
    });
  }
};

/**
 * POST /api/progress/complete-topic
 * Marks a specific lesson as completed for the user.
 *
 * Body: { courseId, moduleIndex, lessonIndex }
 */
export const completeTopic = async (req, res) => {
  try {
    const userId = req.user.id;
    const { courseId, moduleIndex, lessonIndex } = req.body;

    if (!courseId || moduleIndex === undefined || lessonIndex === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: courseId, moduleIndex, and lessonIndex.",
      });
    }

    // Find or create progress record
    let progress = await UserProgress.findOne({ userId, courseId });

    if (!progress) {
      progress = new UserProgress({
        userId,
        courseId,
        completedLessons: [],
        streak: { current: 0, lastActiveDate: null },
      });
    }

    // Check if already completed
    const alreadyCompleted = progress.completedLessons.some(
      (l) => l.moduleIndex === moduleIndex && l.lessonIndex === lessonIndex
    );

    if (!alreadyCompleted) {
      progress.completedLessons.push({
        moduleIndex,
        lessonIndex,
        completedAt: new Date(),
      });
    }

    // Update streak
    progress.streak = updateStreak(progress.streak);

    // Also mark the lesson document as completed if it exists
    try {
      await Lesson.findOneAndUpdate(
        { courseId, moduleIndex, lessonIndex },
        { completed: true }
      );
    } catch {
      // Non-critical — lesson doc may not exist yet
    }

    await progress.save();

    // Calculate completion percentage
    const course = await Course.findById(courseId).lean();
    let totalLessons = 0;
    if (course && course.modules) {
      totalLessons = course.modules.reduce(
        (sum, mod) => sum + (mod.lessons?.length || 0),
        0
      );
    }

    const completionPercentage =
      totalLessons > 0
        ? Math.round((progress.completedLessons.length / totalLessons) * 100)
        : 0;

    return res.json({
      success: true,
      data: {
        courseId,
        moduleIndex,
        lessonIndex,
        alreadyCompleted,
        totalCompleted: progress.completedLessons.length,
        totalLessons,
        completionPercentage,
        streak: progress.streak,
      },
    });
  } catch (err) {
    console.error("Error completing topic:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark topic as completed.",
    });
  }
};

/**
 * GET /api/progress/enrolled-courses
 * Returns a summary of all courses the user has progress in.
 */
export const getEnrolledCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch all courses owned by or created by this user
    const userCourses = await Course.find({ userId }).sort({ updatedAt: -1 }).lean();

    // 2. Fetch all progress records for this user
    const progressRecords = await UserProgress.find({ userId }).lean();
    const progressMap = {};
    for (const p of progressRecords) {
      progressMap[p.courseId.toString()] = p;
    }

    // 3. Fetch all quizzes attempted by this user for topic strengths/weaknesses
    const userQuizzes = await Quiz.find({ userId }).lean();
    let totalQuestionsAnswered = 0;
    const strongTopicsSet = new Set();
    const weakTopicsSet = new Set();

    for (const q of userQuizzes) {
      if (q.bestScore >= 75) {
        if (q.lessonTitle) strongTopicsSet.add(q.lessonTitle);
      } else if (q.attempts?.length > 0) {
        if (q.lessonTitle) weakTopicsSet.add(q.lessonTitle);
      }
      for (const att of q.attempts || []) {
        totalQuestionsAnswered += att.answers?.length || att.totalQuestions || 0;
        for (const wk of att.weakConcepts || []) {
          weakTopicsSet.add(wk);
        }
      }
    }

    let totalLessonsCompleted = 0;
    let totalLessonsInAllCourses = 0;
    let bestStreak = { current: 0, lastActiveDate: null };

    // Combine courses with their progress
    const courseSummaries = userCourses.map((course) => {
      const courseIdStr = course._id.toString();
      const p = progressMap[courseIdStr];

      let totalLessons = 0;
      if (course && course.modules) {
        totalLessons = course.modules.reduce(
          (sum, mod) => sum + (mod.lessons?.length || 0),
          0
        );
      } else if (course && course.days) {
        totalLessons = course.days.reduce(
          (sum, day) => sum + (day.lessons?.length || 0),
          0
        );
      }

      totalLessonsInAllCourses += totalLessons;
      const completed = p?.completedLessons?.length || 0;
      totalLessonsCompleted += completed;

      if (p?.streak) {
        if (
          p.streak.current > bestStreak.current ||
          (p.streak.current === bestStreak.current &&
            p.streak.lastActiveDate > bestStreak.lastActiveDate)
        ) {
          bestStreak = p.streak;
        }
      }

      return {
        courseId: course._id,
        courseTitle: course.title || course.topic || "Untitled Course",
        courseTopic: course.setupParams?.topic || course.title || "",
        category: course.category || course.setupParams?.category || "General",
        completedLessons: completed,
        totalLessons,
        completionPercentage:
          totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0,
        quizAttemptsCount: p?.quizAttemptsCount || 0,
        questionsAnswered: p?.questionsAnswered || 0,
        streak: p?.streak || { current: 0, lastActiveDate: null },
        enrolledAt: p?.enrolledAt || course.createdAt,
        lastUpdated: p?.updatedAt || course.updatedAt,
      };
    });

    return res.json({
      success: true,
      data: {
        courses: courseSummaries,
        totalCourses: courseSummaries.length,
        totalLessonsCompleted,
        totalLessonsInAllCourses,
        totalQuestionsAnswered,
        strongTopics: Array.from(strongTopicsSet).slice(0, 6),
        weakTopics: Array.from(weakTopicsSet).slice(0, 6),
        overallStreak: bestStreak,
      },
    });
  } catch (err) {
    console.error("Error fetching enrolled courses:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch enrolled courses.",
    });
  }
};
