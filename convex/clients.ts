import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("clients").order("desc").take(200);
  },
});

export const getById = query({
  args: { id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    age: v.number(),
    number: v.string(),
    nationality: v.string(),
    email: v.string(),
    occupation: v.string(),
    income_range: v.string(),
    website: v.optional(v.string()),
    known_family_members: v.array(v.string()),
    marital_status: v.union(
      v.literal("single"),
      v.literal("married"),
      v.literal("divorced"),
      v.literal("engaged")
    ),
    no_of_dependents: v.number(),
    existing_policies: v.array(v.object({
      policy_id: v.string(),
      name: v.string(),
      type: v.string(),
      start_date: v.string(),
      end_date: v.optional(v.string()),
      beneficiaries: v.array(v.string()),
    })),
    financial_goals: v.array(v.string()),
    sales_opportunities: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clients", {
      ...args,
      platforms: [],
      created_at: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    number: v.optional(v.string()),
    occupation: v.optional(v.string()),
    income_range: v.optional(v.string()),
    marital_status: v.optional(v.union(
      v.literal("single"),
      v.literal("married"),
      v.literal("divorced"),
      v.literal("engaged")
    )),
    no_of_dependents: v.optional(v.number()),
    financial_goals: v.optional(v.array(v.string())),
    sales_opportunities: v.optional(v.array(v.string())),
    known_family_members: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const updatePlatformHandle = mutation({
  args: {
    id: v.id("clients"),
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
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");

    const platforms = client.platforms.filter(p => p.platform !== args.platform);
    const existing = client.platforms.find(p => p.platform === args.platform) ?? {};
    platforms.push({
      ...existing,
      platform: args.platform,
      handle: args.handle,
      handle_confidence: args.handle_confidence,
    });

    await ctx.db.patch(args.id, { platforms });
  },
});

export const updateScanSchedule = mutation({
  args: {
    id: v.id("clients"),
    platform: v.union(
      v.literal("linkedin"),
      v.literal("instagram"),
      v.literal("legacy")
    ),
    last_checked: v.number(),
    next_check: v.number(),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");

    const platforms = client.platforms.filter(p => p.platform !== args.platform);
    const existing = client.platforms.find(p => p.platform === args.platform) ?? { platform: args.platform };
    platforms.push({
      ...existing,
      platform: args.platform,
      last_checked: args.last_checked,
      next_check: args.next_check,
    });

    await ctx.db.patch(args.id, { platforms });
  },
});
