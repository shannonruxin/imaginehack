import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  clients: defineTable({
    // Core info
    name: v.string(),
    age: v.number(),
    number: v.string(),
    nationality: v.string(),
    email: v.string(),
    occupation: v.string(),
    income_range: v.string(),
    website: v.optional(v.string()),
    known_family_members: v.array(v.string()),

    // Personal profile
    marital_status: v.union(
      v.literal("single"),
      v.literal("married"),
      v.literal("divorced"),
      v.literal("engaged")
    ),
    no_of_dependents: v.number(),

    // Insurance
    existing_policies: v.array(v.object({
      policy_id: v.string(),
      name: v.string(),
      type: v.string(),
      start_date: v.string(),
      end_date: v.optional(v.string()),
      beneficiaries: v.array(v.string()),
    })),

    // Goals & opportunities
    financial_goals: v.array(v.string()),
    sales_opportunities: v.array(v.string()),

    // Social handles + scan schedule (bounded: max 3 platforms)
    platforms: v.array(v.object({
      platform: v.union(
        v.literal("linkedin"),
        v.literal("instagram"),
        v.literal("legacy")
      ),
      handle: v.optional(v.string()),
      handle_confidence: v.optional(v.union(
        v.literal("confirmed"),
        v.literal("auto"),
        v.literal("pending")
      )),
      last_checked: v.optional(v.number()),
      next_check: v.optional(v.number()),
    })),

    created_at: v.number(),
  })
    .index("by_created_at", ["created_at"])
    .index("by_name", ["name"]),

  signals: defineTable({
    client_id: v.id("clients"),
    platform: v.union(
      v.literal("linkedin"),
      v.literal("instagram"),
      v.literal("legacy")
    ),
    signal_type: v.string(),
    summary: v.string(),
    evidence: v.optional(v.string()),
    confidence: v.union(
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    detected_at: v.number(),
    batched: v.boolean(),
    actioned: v.boolean(),
  })
    .index("by_client_id", ["client_id"])
    .index("by_client_id_and_batched", ["client_id", "batched"])
    .index("by_batched", ["batched"]),

  outreach_batches: defineTable({
    week_of: v.string(),
    batch_sales_angle: v.string(),
    created_at: v.number(),
    clients: v.array(v.object({
      client_id: v.id("clients"),
      notes: v.string(),
      outreached: v.boolean(),
    })),
  })
    .index("by_week_of", ["week_of"]),

  projects: defineTable({
    name: v.string(),
    sales_angle: v.string(),
    created_at: v.number(),
    clients: v.array(v.object({
      client_id: v.id("clients"),
      notes: v.optional(v.string()),
      status: v.union(
        v.literal("pending"),
        v.literal("contacted"),
        v.literal("responded"),
        v.literal("closed_won"),
        v.literal("closed_lost")
      ),
      outreached: v.boolean(),
    })),
  }),

  // OpenClaw only — Python backend never reads/writes here.
  // One record per client; messages are appended into the array.
  chat_history: defineTable({
    client_id: v.id("clients"),
    messages: v.array(v.object({
      sender: v.union(
        v.literal("client"),
        v.literal("advisor")
      ),
      message: v.string(),
      timestamp: v.number(),
    })),
    updated_at: v.number(),
  })
    .index("by_client_id", ["client_id"]),
});
