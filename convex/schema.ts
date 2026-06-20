import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const relationship = v.union(
  v.literal("spouse"),
  v.literal("child"),
  v.literal("parent"),
  v.literal("sibling"),
  v.literal("grandparent"),
  v.literal("grandchild"),
  v.literal("in_law"),
  v.literal("other"),
);

export default defineSchema({
  clients: defineTable({
    // Demographic
    first_name: v.string(),
    last_name: v.string(),
    age: v.number(),
    nationality: v.string(),
    income_range: v.string(),

    // Contact
    number: v.string(),
    email: v.string(),

    // Socials
    socials: v.array(v.object({
      type: v.union(
        v.literal("website"),
        v.literal("instagram"),
        v.literal("linkedin"),
      ),
      value: v.string(),
    })),

    // Family
    marital_status: v.union(
      v.literal("single"),
      v.literal("married"),
      v.literal("divorced"),
      v.literal("engaged"),
    ),
    dependents: v.array(v.object({
      relationship,
      first_name: v.string(),
      last_name: v.string(),
      age: v.optional(v.number()),
    })),

    // Existing insurance
    existing_policies: v.array(v.object({
      policy_id: v.string(),
      name: v.string(),
      type: v.union(
        v.literal("term_life"),
        v.literal("whole_life"),
        v.literal("medical"),
        v.literal("critical_illness"),
        v.literal("takaful"),
        v.literal("investment_linked"),
        v.literal("other"),
      ),
      start_date: v.string(),
      end_date: v.optional(v.string()),
      beneficiaries: v.array(v.object({
        relationship,
        first_name: v.string(),
        last_name: v.string(),
      })),
    })),

    // Sales opportunities
    sales_opportunities: v.array(v.object({
      created_at: v.number(),
      description: v.string(),
    })),

    // Global persona — overwritten each classification run (cheap LLM, runs after each scan)
    persona: v.optional(v.object({
      tags: v.array(v.string()),
      summary: v.string(),
      updated_at: v.number(),
    })),

    // Recent signals — latest scan per platform (max 10 posts each, replaced not appended)
    recent_signals: v.array(v.object({
      date_fetched: v.number(),
      platform: v.union(
        v.literal("linkedin"),
        v.literal("instagram"),
        v.literal("legacy"),
      ),
      content: v.string(),
    })),

    created_at: v.number(),

    // Dev only — set to true in seed.ts so clearSeed() can target these rows safely.
    is_seed: v.optional(v.boolean()),
  })
    .index("by_number", ["number"])
    .index("by_created_at", ["created_at"]),

  projects: defineTable({
    batch_sales_angle: v.string(),
    created_at: v.number(),
    clients: v.array(v.object({
      client_id: v.id("clients"),
      notes: v.optional(v.string()),
      status: v.union(
        v.literal("to_follow_up"),
        v.literal("meeting_rescheduled"),
        v.literal("stale"),
        v.literal("help_me_out"),
      ),
      next_follow_up_scheduled: v.optional(v.string()),
      next_meeting_scheduled: v.optional(v.string()),
    })),
  })
    .index("by_created_at", ["created_at"]),

  // OpenClaw only — Python backend never reads/writes here.
  chat_history: defineTable({
    client_id: v.id("clients"),
    messages: v.array(v.object({
      sender: v.union(
        v.literal("client"),
        v.literal("advisor"),
      ),
      message: v.string(),
      timestamp: v.number(),
    })),
    updated_at: v.number(),
  })
    .index("by_client_id", ["client_id"]),
});
