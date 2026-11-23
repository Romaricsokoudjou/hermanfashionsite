import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Utilisateurs                                                        */
/* ------------------------------------------------------------------ */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull().unique(),
  country: text("country").notNull().default("Cameroun"),
  city: text("city").notNull().default("Douala"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("apprenant"), // apprenant | admin
  // Préparé pour le futur programme de parrainage (non actif en V1)
  referralCode: text("referral_code").unique(),
  referredById: integer("referred_by_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Catalogue                                                           */
/* ------------------------------------------------------------------ */
export const plans = pgTable("plans", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  label: text("label").notNull(),
  durationMonths: integer("duration_months").notNull(),
  price: integer("price").notNull(),
  registrationFee: integer("registration_fee").notNull().default(10000),
  diploma: text("diploma").notNull().default(""),
  installments: jsonb("installments").$type<number[]>().notNull().default([]),
  description: text("description").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  active: boolean("active").notNull().default(true),
});

export const formations = pgTable("formations", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  tagline: text("tagline").notNull().default(""),
  presentation: text("presentation").notNull().default(""),
  objectives: text("objectives").notNull().default(""),
  skills: text("skills").notNull().default(""),
  content: text("content").notNull().default(""),
  outcomes: text("outcomes").notNull().default(""),
  admission: text("admission").notNull().default(""),
  image: text("image").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  featured: boolean("featured").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const formationPlans = pgTable(
  "formation_plans",
  {
    formationId: integer("formation_id").notNull().references(() => formations.id, { onDelete: "cascade" }),
    planId: integer("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.formationId, t.planId] })],
);

/* ------------------------------------------------------------------ */
/* Inscriptions & paiements                                            */
/* ------------------------------------------------------------------ */
export const enrollments = pgTable(
  "enrollments",
  {
    id: serial("id").primaryKey(),
    reference: text("reference").notNull().unique(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    formationId: integer("formation_id").references(() => formations.id, { onDelete: "set null" }),
    planId: integer("plan_id").references(() => plans.id, { onDelete: "set null" }),
    centreId: integer("centre_id"),
    // Instantanés : le tarif reste figé même si l'administration modifie la grille plus tard
    formationTitle: text("formation_title").notNull(),
    planLabel: text("plan_label").notNull(),
    diploma: text("diploma").notNull().default(""),
    price: integer("price").notNull(),
    registrationFee: integer("registration_fee").notNull(),
    totalDue: integer("total_due").notNull(),
    installments: jsonb("installments").$type<number[]>().notNull().default([]),
    paymentMode: text("payment_mode").notNull().default("tranches"), // unique | tranches
    durationConfirmed: boolean("duration_confirmed").notNull().default(true),
    amountPaid: integer("amount_paid").notNull().default(0),
    // en_attente | paiement_partiel | paiement_confirme | validee | annulee
    status: text("status").notNull().default("en_attente"),
    validated: boolean("validated").notNull().default(false),
    cancelled: boolean("cancelled").notNull().default(false),
    message: text("message").notNull().default(""),
    adminNote: text("admin_note").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    validatedAt: timestamp("validated_at", { withTimezone: true }),
  },
  (t) => [index("enrollments_user_idx").on(t.userId), index("enrollments_status_idx").on(t.status)],
);

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  enrollmentId: integer("enrollment_id").notNull().references(() => enrollments.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  // especes en V1 — préparé pour orange_money | mtn_momo | carte
  method: text("method").notNull().default("especes"),
  label: text("label").notNull().default(""),
  reference: text("reference").notNull().default(""),
  note: text("note").notNull().default(""),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  recordedById: integer("recorded_by_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Communication                                                       */
/* ------------------------------------------------------------------ */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  link: text("link").notNull().default(""),
  readAt: timestamp("read_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("ouverte"), // ouverte | fermee
  unreadForAdmin: boolean("unread_for_admin").notNull().default(true),
  unreadForUser: boolean("unread_for_user").notNull().default(false),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  senderRole: text("sender_role").notNull(), // apprenant | admin
  senderId: integer("sender_id"),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiMessages = pgTable("ai_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // user | assistant
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Contenus administrables                                             */
/* ------------------------------------------------------------------ */
export const knowledgeEntries = pgTable("knowledge_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const faqs = pgTable("faqs", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").notNull().default("Général"),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

export const centres = pgTable("centres", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull().default("Douala"),
  description: text("description").notNull().default(""),
  mapQuery: text("map_query").notNull().default(""),
  image: text("image").notNull().default(""),
  phone: text("phone").notNull().default(""),
  hours: text("hours").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  type: text("type").notNull().default("image"), // image | video
  url: text("url").notNull(),
  title: text("title").notNull().default(""),
  category: text("category").notNull().default("Formations"),
  // pour les vidéos : presentation | immersion | temoignages
  slot: text("slot").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default(""),
  quote: text("quote").notNull(),
  photo: text("photo").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  body: text("body").notNull().default(""),
  image: text("image").notNull().default(""),
  published: boolean("published").notNull().default(true),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull().default(""),
});

export type User = typeof users.$inferSelect;
export type Plan = typeof plans.$inferSelect;
export type Formation = typeof formations.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Centre = typeof centres.$inferSelect;
export type Faq = typeof faqs.$inferSelect;
export type Media = typeof media.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type News = typeof news.$inferSelect;
