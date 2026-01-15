import { pgTable, serial, text, integer, boolean, pgEnum, date, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enum for challenge types
export const challengeTypeEnum = pgEnum("type", ["SELECT", "ASSIST"]);

// ===== COURSES =====
export const courses = pgTable("courses", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    imageSrc: text("image_src").notNull(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
    units: many(units),
    userProgress: many(userProgress),
}));

// ===== UNITS =====
export const units = pgTable("units", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    order: integer("order").notNull(),
    courseId: integer("course_id")
        .references(() => courses.id, { onDelete: "cascade" })
        .notNull(),
});

export const unitsRelations = relations(units, ({ one, many }) => ({
    course: one(courses, {
        fields: [units.courseId],
        references: [courses.id],
    }),
    lessons: many(lessons),
}));

// ===== LESSONS =====
export const lessons = pgTable("lessons", {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    order: integer("order").notNull(),
    unitId: integer("unit_id")
        .references(() => units.id, { onDelete: "cascade" })
        .notNull(),
});

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
    unit: one(units, {
        fields: [lessons.unitId],
        references: [units.id],
    }),
    challenges: many(challenges),
}));

// ===== CHALLENGES =====
export const challenges = pgTable("challenges", {
    id: serial("id").primaryKey(),
    question: text("question").notNull(),
    type: challengeTypeEnum("type").notNull(),
    order: integer("order").notNull(),
    lessonId: integer("lesson_id")
        .references(() => lessons.id, { onDelete: "cascade" })
        .notNull(),
});

export const challengesRelations = relations(challenges, ({ one, many }) => ({
    lesson: one(lessons, {
        fields: [challenges.lessonId],
        references: [lessons.id],
    }),
    challengeOptions: many(challengeOptions),
    challengeProgress: many(challengeProgress),
}));

// ===== CHALLENGE OPTIONS =====
export const challengeOptions = pgTable("challenge_options", {
    id: serial("id").primaryKey(),
    text: text("text").notNull(),
    correct: boolean("correct").notNull(),
    imageSrc: text("image_src"),
    audioSrc: text("audio_src"),
    challengeId: integer("challenge_id")
        .references(() => challenges.id, { onDelete: "cascade" })
        .notNull(),
});

export const challengeOptionsRelations = relations(challengeOptions, ({ one }) => ({
    challenge: one(challenges, {
        fields: [challengeOptions.challengeId],
        references: [challenges.id],
    }),
}));

// ===== CHALLENGE PROGRESS =====
export const challengeProgress = pgTable("challenge_progress", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    completed: boolean("completed").notNull().default(false),
    challengeId: integer("challenge_id")
        .references(() => challenges.id, { onDelete: "cascade" })
        .notNull(),
});

export const challengeProgressRelations = relations(challengeProgress, ({ one }) => ({
    challenge: one(challenges, {
        fields: [challengeProgress.challengeId],
        references: [challenges.id],
    }),
}));

// ===== USER PROGRESS =====
export const userProgress = pgTable("user_progress", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    userName: text("user_name").notNull().default("User"),
    userImageSrc: text("user_image_src").notNull().default("/mascot.svg"),
    hearts: integer("hearts").notNull().default(5),
    points: integer("points").notNull().default(0),
    totalXpEarned: integer("total_xp_earned").notNull().default(0),
    activeCourseId: integer("active_course_id").references(() => courses.id, {
        onDelete: "cascade",
    }),
    // Streak system
    streak: integer("streak").notNull().default(0),
    longestStreak: integer("longest_streak").notNull().default(0),
    lastStreakDate: date("last_streak_date"),
    // Power-ups
    xpBoostLessons: integer("xp_boost_lessons").notNull().default(0),
    heartShields: integer("heart_shields").notNull().default(0),
    streakFreezes: integer("streak_freezes").notNull().default(0),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
    activeCourse: one(courses, {
        fields: [userProgress.activeCourseId],
        references: [courses.id],
    }),
}));

// ===== SOCIAL =====

export const follows = pgTable("follows", {
    id: serial("id").primaryKey(),
    followerId: text("follower_id").notNull(),
    followingId: text("following_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

export const followsRelations = relations(follows, ({ one }) => ({
    follower: one(userProgress, {
        fields: [follows.followerId],
        references: [userProgress.userId],
        relationName: "follower"
    }),
    following: one(userProgress, {
        fields: [follows.followingId],
        references: [userProgress.userId],
        relationName: "following"
    }),
}));

export const notifications = pgTable("notifications", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    type: text("type").notNull(),
    message: text("message").notNull(),
    link: text("link"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    senderId: text("sender_id").notNull(),
    receiverId: text("receiver_id").notNull(),
    content: text("content").notNull(),
    type: text("type", { enum: ["text", "image", "file"] }).default("text").notNull(),
    fileName: text("file_name"),
    read: boolean("read").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
    sender: one(userProgress, {
        fields: [messages.senderId],
        references: [userProgress.userId],
        relationName: "sender"
    }),
    receiver: one(userProgress, {
        fields: [messages.receiverId],
        references: [userProgress.userId],
        relationName: "receiver"
    }),
}));

// ===== PRACTICE SESSIONS =====
export const practiceSessions = pgTable("practice_sessions", {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    type: text("type", { enum: ["writing", "speaking"] }).notNull(),
    prompt: text("prompt").notNull(),
    // Store JSON data as text for simplicity in this setup
    promptData: text("prompt_data"),
    userInput: text("user_input"),
    audioUrl: text("audio_url"),
    feedback: text("feedback"), // JSON string
    score: integer("score"),
    createdAt: timestamp("created_at").defaultNow(),
});

export const practiceSessionsRelations = relations(practiceSessions, ({ one }) => ({
    user: one(userProgress, {
        fields: [practiceSessions.userId],
        references: [userProgress.userId],
    }),
}));
