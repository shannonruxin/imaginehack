import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    week_of: v.string(),
    batch_sales_angle: v.string(),
    clients: v.array(v.object({
      client_id: v.id("clients"),
      notes: v.string(),
      outreached: v.boolean(),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("outreach_batches", {
      ...args,
      created_at: Date.now(),
    });
  },
});

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("outreach_batches")
      .order("desc")
      .first();
  },
});

export const getByWeek = query({
  args: { week_of: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("outreach_batches")
      .withIndex("by_week_of", q => q.eq("week_of", args.week_of))
      .unique();
  },
});

export const markOutreached = mutation({
  args: {
    id: v.id("outreach_batches"),
    client_id: v.id("clients"),
  },
  handler: async (ctx, args) => {
    const batch = await ctx.db.get(args.id);
    if (!batch) throw new Error("Batch not found");

    const clients = batch.clients.map(c =>
      c.client_id === args.client_id ? { ...c, outreached: true } : c
    );
    await ctx.db.patch(args.id, { clients });
  },
});
