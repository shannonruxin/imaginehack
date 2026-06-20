import { mutation, query } from "./_generated/server";
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

const policyType = v.union(
  v.literal("term_life"),
  v.literal("whole_life"),
  v.literal("medical"),
  v.literal("critical_illness"),
  v.literal("takaful"),
  v.literal("investment_linked"),
  v.literal("other"),
);

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

export const getByNumber = query({
  args: { number: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("clients")
      .withIndex("by_number", q => q.eq("number", args.number))
      .first();
  },
});

export const create = mutation({
  args: {
    first_name: v.string(),
    last_name: v.string(),
    age: v.number(),
    nationality: v.string(),
    income_range: v.string(),
    number: v.string(),
    email: v.string(),
    marital_status: v.union(
      v.literal("single"),
      v.literal("married"),
      v.literal("divorced"),
      v.literal("engaged"),
    ),
    dependents: v.optional(v.array(v.object({
      relationship,
      first_name: v.string(),
      last_name: v.string(),
      age: v.optional(v.number()),
    }))),
    existing_policies: v.optional(v.array(v.object({
      policy_id: v.string(),
      name: v.string(),
      type: policyType,
      start_date: v.string(),
      end_date: v.optional(v.string()),
      beneficiaries: v.array(v.object({
        relationship,
        first_name: v.string(),
        last_name: v.string(),
      })),
    }))),
    socials: v.optional(v.array(v.object({
      type: v.union(v.literal("website"), v.literal("instagram"), v.literal("linkedin")),
      value: v.string(),
    }))),
    sales_opportunities: v.optional(v.array(v.object({
      created_at: v.number(),
      description: v.string(),
    }))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("clients", {
      ...args,
      dependents: args.dependents ?? [],
      existing_policies: args.existing_policies ?? [],
      socials: args.socials ?? [],
      sales_opportunities: args.sales_opportunities ?? [],
      recent_signals: [],
      created_at: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("clients"),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    age: v.optional(v.number()),
    nationality: v.optional(v.string()),
    income_range: v.optional(v.string()),
    number: v.optional(v.string()),
    email: v.optional(v.string()),
    marital_status: v.optional(v.union(
      v.literal("single"),
      v.literal("married"),
      v.literal("divorced"),
      v.literal("engaged"),
    )),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, fields);
  },
});

export const addSocial = mutation({
  args: {
    id: v.id("clients"),
    type: v.union(v.literal("website"), v.literal("instagram"), v.literal("linkedin")),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");
    const socials = client.socials.filter(s => s.type !== args.type);
    socials.push({ type: args.type, value: args.value });
    await ctx.db.patch(args.id, { socials });
  },
});

export const addDependent = mutation({
  args: {
    id: v.id("clients"),
    relationship,
    first_name: v.string(),
    last_name: v.string(),
    age: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");
    const { id, ...dependent } = args;
    await ctx.db.patch(id, { dependents: [...client.dependents, dependent] });
  },
});

export const addSalesOpportunity = mutation({
  args: {
    id: v.id("clients"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");
    await ctx.db.patch(args.id, {
      sales_opportunities: [
        ...client.sales_opportunities,
        { created_at: Date.now(), description: args.description },
      ],
    });
  },
});

// Replaces the latest scan entry for one platform (keeps other platforms untouched).
export const setRecentSignals = mutation({
  args: {
    id: v.id("clients"),
    platform: v.union(v.literal("linkedin"), v.literal("instagram"), v.literal("legacy")),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const client = await ctx.db.get(args.id);
    if (!client) throw new Error("Client not found");
    const others = client.recent_signals.filter(s => s.platform !== args.platform);
    await ctx.db.patch(args.id, {
      recent_signals: [
        ...others,
        { date_fetched: Date.now(), platform: args.platform, content: args.content },
      ],
    });
  },
});

// Overwrites the global persona classification.
export const updatePersona = mutation({
  args: {
    id: v.id("clients"),
    tags: v.array(v.string()),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      persona: { tags: args.tags, summary: args.summary, updated_at: Date.now() },
    });
  },
});
