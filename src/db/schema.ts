import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  pgEnum,
  date,
  timestamp,
  jsonb,
  unique,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enum for challenge types
export const challengeTypeEnum = pgEnum("type", [
  "SELECT",
  "ASSIST",
  "INSERT",
  "MATCH",
  "DICTATION",
]);

// ===== COURSES =====
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  imageSrc: text("image_src").notNull(),
  languageCode: text("language_code").notNull().default("en"),
  language: text("language").notNull().default("English"),
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
  context: text("context"), // Scenario or dialogue snippet
  explanation: text("explanation"), // Reasoning for the answer
  questionAudioLang: text("question_audio_lang"),
  contextAudioLang: text("context_audio_lang"),
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
  audioLang: text("audio_lang"),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
});

export const challengeOptionsRelations = relations(
  challengeOptions,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeOptions.challengeId],
      references: [challenges.id],
    }),
  }),
);

// ===== CHALLENGE PROGRESS =====
export const challengeProgress = pgTable("challenge_progress", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
});

export const challengeProgressRelations = relations(
  challengeProgress,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeProgress.challengeId],
      references: [challenges.id],
    }),
  }),
);

// ===== USER PROGRESS =====
export const userProgress = pgTable(
  "user_progress",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull().unique(),
    userName: text("user_name").notNull().default("User"),
    userImageSrc: text("user_image_src").notNull().default("/duo_crying.png"),
    hearts: integer("hearts").notNull().default(5),
    points: integer("points").notNull().default(0),
    totalXpEarned: integer("total_xp_earned").notNull().default(0),
    activeCourseId: integer("active_course_id").references(() => courses.id, {
      onDelete: "cascade",
    }),
    activeLanguage: text("active_language").notNull().default("English"),
    nativeLanguage: text("native_language").notNull().default("pt"),
    // Streak system
    streak: integer("streak").notNull().default(0),
    longestStreak: integer("longest_streak").notNull().default(0),
    lastStreakDate: date("last_streak_date"),
    // Power-ups
    xpBoostLessons: integer("xp_boost_lessons").notNull().default(0),
    heartShields: integer("heart_shields").notNull().default(0),
    streakFreezes: integer("streak_freezes").notNull().default(0),
    // CEFR Placement — per-language levels: { "English": "B2", "Japanese": "A1" }
    cefrLevels: jsonb("cefr_levels").notNull().default({}),
    // Heart regeneration — timestamp of last heart loss
    lastHeartChange: timestamp("last_heart_change").defaultNow(),
    // Opt-out toggles
    notificationsEnabled: boolean("notifications_enabled")
      .default(true)
      .notNull(),
    // Onboarding data
    motivation: text("motivation"),
    experienceLevel: text("experience_level"),
    // League system — promoted/demoted weekly (BRONZE | SILVER | GOLD | PLATINUM | DIAMOND)
    league: text("league").notNull().default("BRONZE"),
    lastWeekResult: jsonb("last_week_result"),
    // Client UI Preferences Sync
    clientPreferences: jsonb("client_preferences").notNull().default({}),
    // Customization
    userBannerSrc: text("user_banner_src"),
    // Signal Protocol E2EE (Deprecated)
    signalRegistrationId: integer("signal_registration_id"),
    signalIdentityKey: text("signal_identity_key"), // base64 public identity key
    // Advanced WebCrypto E2EE
    e2ePublicKey: text("e2e_public_key"), // RSA-OAEP public key
    e2eEncryptedPrivateKey: text("e2e_encrypted_private_key"), // Private key encrypted with PIN
    e2eSalt: text("e2e_salt"), // Salt used for PBKDF2 PIN derivation
  },
  (t) => ({
    leagueIdx: index("user_progress_league_idx").on(t.league),
    pointsIdx: index("user_progress_points_idx").on(t.points),
    totalXpIdx: index("user_progress_total_xp_idx").on(t.totalXpEarned),
  }),
);

// ===== PLACEMENT TEST HISTORY =====
export const placementTestHistory = pgTable("placement_test_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  languageTested: text("language_tested").notNull(),
  finalLevel: text("final_level").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ===== PRACTICE SESSIONS =====
export const practiceSessions = pgTable("practice_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type", {
    enum: ["writing", "speaking", "reading", "listening"],
  }).notNull(),
  language: text("language").notNull().default("English"),
  cefrLevel: text("cefr_level").notNull().default("B1"),
  prompt: text("prompt").notNull(),
  // Store JSON data as text for simplicity in this setup
  promptData: text("prompt_data"),
  userInput: text("user_input"),
  audioUrl: text("audio_url"),
  feedback: text("feedback"), // JSON string
  score: integer("score"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const practiceSessionsRelations = relations(
  practiceSessions,
  ({ one }) => ({
    user: one(userProgress, {
      fields: [practiceSessions.userId],
      references: [userProgress.userId],
    }),
  }),
);

// ===== CHALLENGE MISTAKES (Heart Clinic) =====
export const challengeMistakes = pgTable("challenge_mistakes", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  challengeId: integer("challenge_id")
    .references(() => challenges.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const challengeMistakesRelations = relations(
  challengeMistakes,
  ({ one }) => ({
    challenge: one(challenges, {
      fields: [challengeMistakes.challengeId],
      references: [challenges.id],
    }),
  }),
);

// ===== USER VOCABULARY (Vault/Cofre) =====
export const userVocabulary = pgTable("user_vocabulary", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  word: text("word").notNull(),
  translation: text("translation").notNull(),
  explanation: text("explanation").notNull().default(""),
  contextSentence: text("context_sentence").notNull(),
  language: text("language").notNull().default("English"),
  strength: integer("strength").notNull().default(1), // Gamification: 1=Seed, 4=Mastered
  createdAt: timestamp("created_at").defaultNow(),
});

export const userVocabularyRelations = relations(userVocabulary, ({ one }) => ({
  user: one(userProgress, {
    fields: [userVocabulary.userId],
    references: [userProgress.userId],
  }),
}));

// ===== USER DAILY STATS (Analytics) =====
export const userDailyStats = pgTable(
  "user_daily_stats",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    date: text("date").notNull(), // Format YYYY-MM-DD
    xpGained: integer("xp_gained").notNull().default(0),
    lessonsCompleted: integer("lessons_completed").notNull().default(0),
    chestClaimed: boolean("chest_claimed").notNull().default(false),
  },
  (t) => ({
    userDateUnq: unique("user_id_date_unique").on(t.userId, t.date),
    dateIdx: index("user_daily_stats_date_idx").on(t.date),
  }),
);

export const userDailyStatsRelations = relations(userDailyStats, ({ one }) => ({
  user: one(userProgress, {
    fields: [userDailyStats.userId],
    references: [userProgress.userId],
  }),
}));

export const adminAuthAttempts = pgTable("admin_auth_attempts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  attempts: integer("attempts").notNull().default(0),
  lockoutUntil: timestamp("lockout_until"),
});

// ===== FEED & HIGH FIVES (Social) =====

export const feedActivities = pgTable("feed_activities", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(), // e.g., "STREAK", "LEAGUE", "PERFECT_LESSON", "NEW_FOLLOWER"
  metadata: text("metadata").notNull(), // Extra info e.g., "10", "Rubi", "5"
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedActivitiesRelations = relations(
  feedActivities,
  ({ one, many }) => ({
    user: one(userProgress, {
      fields: [feedActivities.userId],
      references: [userProgress.userId],
    }),
    highFives: many(highFives),
  }),
);

export const highFives = pgTable(
  "high_fives",
  {
    id: serial("id").primaryKey(),
    senderId: text("sender_id").notNull(),
    receiverId: text("receiver_id").notNull(),
    activityId: integer("activity_id")
      .references(() => feedActivities.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => ({
    // A user can only high-five a specific activity once
    unq: unique("high_five_unique").on(t.senderId, t.activityId),
  }),
);

export const highFivesRelations = relations(highFives, ({ one }) => ({
  sender: one(userProgress, {
    fields: [highFives.senderId],
    references: [userProgress.userId],
    relationName: "highFiveSender",
  }),
  receiver: one(userProgress, {
    fields: [highFives.receiverId],
    references: [userProgress.userId],
    relationName: "highFiveReceiver",
  }),
  activity: one(feedActivities, {
    fields: [highFives.activityId],
    references: [feedActivities.id],
  }),
}));

// ===== ADMIN AUDIT LOGS =====
export const adminAuditLogs = pgTable("admin_audit_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  action: text("action").notNull(),
  entityId: text("entity_id"),
  metadata: text("metadata"), // Stringified JSON info
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminAuditLogsRelations = relations(adminAuditLogs, ({ one }) => ({
  user: one(userProgress, {
    fields: [adminAuditLogs.userId],
    references: [userProgress.userId],
  }),
}));

// ===== USER REVIEWS (Wall of Love) =====
export const userReviews = pgTable("user_reviews", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull()
    .unique(),
  userName: text("user_name").notNull(),
  userImageSrc: text("user_image_src").notNull(),
  rating: integer("rating").notNull(), // 1 to 5
  comment: text("comment").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userReviewsRelations = relations(userReviews, ({ one }) => ({
  user: one(userProgress, {
    fields: [userReviews.userId],
    references: [userProgress.userId],
  }),
}));

// ===== SUPPORT TICKETS =====
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status", { enum: ["open", "resolved", "ignored"] })
    .notNull()
    .default("open"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const supportTicketsRelations = relations(supportTickets, ({ one }) => ({
  user: one(userProgress, {
    fields: [supportTickets.userId],
    references: [userProgress.userId],
  }),
}));

// ===== MESSAGING (Conversations & Group Chat) =====

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"), // Only used for group chats
  imageUrl: text("image_url"), // Optional custom group image
  isGroup: boolean("is_group").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipants = pgTable(
  "conversation_participants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => userProgress.userId, { onDelete: "cascade" })
      .notNull(),
    role: text("role").default("member").notNull(), // 'admin' or 'member'
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    clearedAt: timestamp("cleared_at"),
  },
  (t) => ({
    unq: unique("conversation_participant_unique").on(
      t.conversationId,
      t.userId,
    ),
  }),
);

export const conversationParticipantsRelations = relations(
  conversationParticipants,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationParticipants.conversationId],
      references: [conversations.id],
    }),
    user: one(userProgress, {
      fields: [conversationParticipants.userId],
      references: [userProgress.userId],
    }),
  }),
);

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  senderId: text("sender_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  type: text("type").default("text").notNull(),
  fileName: text("file_name"),
  read: boolean("read").default(false).notNull(),
  parentMessageId: integer("parent_message_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(userProgress, {
    fields: [messages.senderId],
    references: [userProgress.userId],
  }),
  parent: one(messages, {
    fields: [messages.parentMessageId],
    references: [messages.id],
    relationName: "replies",
  }),
  replies: many(messages, {
    relationName: "replies",
  }),
  reactions: many(messageReactions),
}));

export const messageReactions = pgTable("message_reactions", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id")
    .references(() => messages.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messageReactionsRelations = relations(
  messageReactions,
  ({ one }) => ({
    message: one(messages, {
      fields: [messageReactions.messageId],
      references: [messages.id],
    }),
    user: one(userProgress, {
      fields: [messageReactions.userId],
      references: [userProgress.userId],
    }),
  }),
);

// ===== FOLLOWS (Social Graph) =====

export const follows = pgTable(
  "follows",
  {
    id: serial("id").primaryKey(),
    followerId: text("follower_id")
      .references(() => userProgress.userId, { onDelete: "cascade" })
      .notNull(),
    followingId: text("following_id")
      .references(() => userProgress.userId, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    unq: unique("follow_unique").on(t.followerId, t.followingId),
  }),
);

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(userProgress, {
    fields: [follows.followerId],
    references: [userProgress.userId],
    relationName: "follower",
  }),
  following: one(userProgress, {
    fields: [follows.followingId],
    references: [userProgress.userId],
    relationName: "following",
  }),
}));

// ===== NOTIFICATIONS =====

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(), // e.g., "follow", "message", "high_five"
  message: text("message").notNull(),
  read: boolean("read").default(false).notNull(),
  link: text("link"), // Link to redirect when clicked
  senderImage: text("sender_image"), // Avatar of the sender
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(userProgress, {
    fields: [notifications.userId],
    references: [userProgress.userId],
  }),
}));

// ===== USER SUBSCRIPTIONS (Stripe PRO) =====

export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull()
    .unique(),
  stripeCustomerId: text("stripe_customer_id").notNull().unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripePriceId: text("stripe_price_id"),
  stripeCurrentPeriodEnd: timestamp("stripe_current_period_end"),
});

export const userSubscriptionsRelations = relations(
  userSubscriptions,
  ({ one }) => ({
    user: one(userProgress, {
      fields: [userSubscriptions.userId],
      references: [userProgress.userId],
    }),
  }),
);

// Update UserProgress with all relations
export const userProgressRelations = relations(
  userProgress,
  ({ one, many }) => ({
    activeCourse: one(courses, {
      fields: [userProgress.activeCourseId],
      references: [courses.id],
    }),
    subscription: one(userSubscriptions),
    placementTests: many(placementTestHistory),
    conversationParticipations: many(conversationParticipants),
    sentMessages: many(messages),
    supportTickets: many(supportTickets),
    followers: many(follows, { relationName: "following" }),
    following: many(follows, { relationName: "follower" }),
    notifications: many(notifications),
    survivalSessions: many(survivalSessions),
  }),
);

// ===== SIGNAL PROTOCOL (E2EE) DEPRECATED =====

export const signalPreKeys = pgTable("signal_pre_keys", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  keyId: integer("key_id").notNull(),
  publicKey: text("public_key").notNull(), // base64
});

export const signalPreKeysRelations = relations(signalPreKeys, ({ one }) => ({
  user: one(userProgress, {
    fields: [signalPreKeys.userId],
    references: [userProgress.userId],
  }),
}));

export const signalSignedPreKeys = pgTable("signal_signed_pre_keys", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  keyId: integer("key_id").notNull(),
  publicKey: text("public_key").notNull(), // base64
  signature: text("signature").notNull(), // base64
});

export const signalSignedPreKeysRelations = relations(
  signalSignedPreKeys,
  ({ one }) => ({
    user: one(userProgress, {
      fields: [signalSignedPreKeys.userId],
      references: [userProgress.userId],
    }),
  }),
);

// ===== ADVANCED WEBCRYPTO E2EE =====

export const conversationKeys = pgTable("conversation_keys", {
  id: serial("id").primaryKey(),
  conversationId: uuid("conversation_id")
    .references(() => conversations.id, { onDelete: "cascade" })
    .notNull(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  encryptedRoomKey: text("encrypted_room_key").notNull(), // Room key encrypted with user's RSA public key
});

export const conversationKeysRelations = relations(
  conversationKeys,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [conversationKeys.conversationId],
      references: [conversations.id],
    }),
    user: one(userProgress, {
      fields: [conversationKeys.userId],
      references: [userProgress.userId],
    }),
  }),
);

// ===== COURSE CERTIFICATES =====

export const certificates = pgTable("certificates", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  courseId: integer("course_id")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  userName: text("user_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const certificatesRelations = relations(certificates, ({ one }) => ({
  user: one(userProgress, {
    fields: [certificates.userId],
    references: [userProgress.userId],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
}));

// ===== SURVIVAL MODE SCENARIOS =====
export const survivalScenarios = pgTable("survival_scenarios", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  aiRole: text("ai_role").notNull(), // e.g., "A strict border control officer in Madrid"
  userRole: text("user_role").notNull(), // e.g., "A tourist who lost their passport"
  npcBaseImage: text("npc_base_image").notNull().default("/npc/base_body.png"),
  npcClothes: jsonb("npc_clothes").notNull().default([]), // ["/npc/police_hat.png", "/npc/police_uniform.png"]
  storyContext: text("story_context").notNull().default(""), // Ex: "Ias a 120km/h e a polícia mandou-te parar."
  hint: text("hint").notNull().default(""), // Ex: "Sê educado e compreensivo."
  targetLevel: text("target_level").notNull(), // e.g., "A1", "B2"
  courseId: integer("course_id").references(() => courses.id, {
    onDelete: "cascade",
  }),
  unitId: integer("unit_id").references(() => units.id, {
    onDelete: "cascade",
  }),
});

export const survivalScenariosRelations = relations(
  survivalScenarios,
  ({ one, many }) => ({
    course: one(courses, {
      fields: [survivalScenarios.courseId],
      references: [courses.id],
    }),
    unit: one(units, {
      fields: [survivalScenarios.unitId],
      references: [units.id],
    }),
    sessions: many(survivalSessions),
  }),
);

// ===== SURVIVAL SESSIONS (Chat State) =====
export const survivalSessions = pgTable("survival_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  scenarioId: integer("scenario_id")
    .references(() => survivalScenarios.id, { onDelete: "cascade" })
    .notNull(),
  chatHistory: jsonb("chat_history").notNull().default([]),
  status: text("status", { enum: ["active", "completed", "failed"] })
    .notNull()
    .default("active"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const survivalSessionsRelations = relations(
  survivalSessions,
  ({ one }) => ({
    user: one(userProgress, {
      fields: [survivalSessions.userId],
      references: [userProgress.userId],
    }),
    scenario: one(survivalScenarios, {
      fields: [survivalSessions.scenarioId],
      references: [survivalScenarios.id],
    }),
  }),
);

// ===== KNOWLEDGE FEED =====

export const postStatusEnum = pgEnum("post_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const knowledgePosts = pgTable("knowledge_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  originalSourceUrl: text("original_source_url"),
  imageBase64: text("image_base64"),
  targetLanguage: text("target_language").notNull(),
  cefrLevel: text("cefr_level").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  body: text("body").notNull(),
  author: text("author").notNull().default("System"),
  authorImg: text("author_img").notNull().default("https://i.pravatar.cc/150"),
  bgClass: text("bg_class").notNull().default("from-slate-900 to-black"),
  status: postStatusEnum("status").default("APPROVED").notNull(),
  authorId: text("author_id").references(() => userProgress.userId, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userReadHistory = pgTable("user_read_history", {
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  postId: uuid("post_id")
    .references(() => knowledgePosts.id, { onDelete: "cascade" })
    .notNull(),
  readAt: timestamp("read_at").defaultNow().notNull(),
});

export const knowledgeSaves = pgTable("knowledge_saves", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  postId: uuid("post_id")
    .references(() => knowledgePosts.id, { onDelete: "cascade" })
    .notNull(),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});

export const knowledgeLikes = pgTable("knowledge_likes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .references(() => userProgress.userId, { onDelete: "cascade" })
    .notNull(),
  postId: uuid("post_id")
    .references(() => knowledgePosts.id, { onDelete: "cascade" })
    .notNull(),
  likedAt: timestamp("liked_at").defaultNow().notNull(),
});

export const knowledgePostsRelations = relations(
  knowledgePosts,
  ({ many, one }) => ({
    saves: many(knowledgeSaves),
    likes: many(knowledgeLikes),
    reads: many(userReadHistory),
    creator: one(userProgress, {
      fields: [knowledgePosts.authorId],
      references: [userProgress.userId],
    }),
  }),
);

export const knowledgeSavesRelations = relations(knowledgeSaves, ({ one }) => ({
  user: one(userProgress, {
    fields: [knowledgeSaves.userId],
    references: [userProgress.userId],
  }),
  post: one(knowledgePosts, {
    fields: [knowledgeSaves.postId],
    references: [knowledgePosts.id],
  }),
}));

export const knowledgeLikesRelations = relations(knowledgeLikes, ({ one }) => ({
  user: one(userProgress, {
    fields: [knowledgeLikes.userId],
    references: [userProgress.userId],
  }),
  post: one(knowledgePosts, {
    fields: [knowledgeLikes.postId],
    references: [knowledgePosts.id],
  }),
}));
