import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// OpenClaw only — Python backend never calls these functions.

export const getByClient = query({
  args: { client_id: v.id("clients") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chat_history")
      .withIndex("by_client_id", q => q.eq("client_id", args.client_id))
      .unique();
  },
});

export const appendMessage = mutation({
  args: {
    client_id: v.id("clients"),
    sender: v.union(v.literal("client"), v.literal("advisor")),
    message: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("chat_history")
      .withIndex("by_client_id", q => q.eq("client_id", args.client_id))
      .unique();

    const newMessage = {
      sender: args.sender,
      message: args.message,
      timestamp: args.timestamp,
    };

    if (existing) {
      await ctx.db.patch(existing._id, {
        messages: [...existing.messages, newMessage],
        updated_at: args.timestamp,
      });
    } else {
      await ctx.db.insert("chat_history", {
        client_id: args.client_id,
        messages: [newMessage],
        updated_at: args.timestamp,
      });
    }
  },
});
