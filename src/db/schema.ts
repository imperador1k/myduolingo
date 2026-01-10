import { pgTable, serial, text, integer, boolean, pgEnum } from "drizzle-orm/pg-core";
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
    activeCourseId: integer("active_course_id").references(() => courses.id, {
        onDelete: "cascade",
    }),
});

export const userProgressRelations = relations(userProgress, ({ one }) => ({
    activeCourse: one(courses, {
        fields: [userProgress.activeCourseId],
        references: [courses.id],
    }),
}));
