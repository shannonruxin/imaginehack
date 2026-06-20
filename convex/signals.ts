import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("signals", {
      ...args,
      batched: false,
      actioned: false,
    });
  },
});

export const listByClient = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("signals")
      .withIndex("by_client_id", q => q.eq("client_id", args.client_id))
      .order("desc")
      .take(100);
  },
});

export const listUnbatched = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("signals")
      .withIndex("by_batched", q => q.eq("batched", false))
      .take(200);
  },
});

export const markBatched = mutation({
  args: { id: v.id("signals") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { batched: true });
  },
});

export const markActioned = mutation({
  args: { id: v.id("signals") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { actioned: true });
  },
});
