import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const clientStatus = v.union(
  v.literal("to_follow_up"),
  v.literal("meeting_rescheduled"),
  v.literal("stale"),
  v.literal("help_me_out"),
);

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projects").order("desc").take(100);
  },
});

export const getById = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("projects").order("desc").first();
  },
});

export const create = mutation({
  args: {
    batch_sales_angle: v.string(),
    clients: v.array(v.object({
      client_id: v.id("clients"),
      notes: v.optional(v.string()),
      status: clientStatus,
      next_follow_up_scheduled: v.optional(v.string()),
      next_meeting_scheduled: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      ...args,
      created_at: Date.now(),
    });
  },
});

export const updateClientStatus = mutation({
  args: {
    id: v.id("projects"),
    client_id: v.id("clients"),
    status: clientStatus,
    notes: v.optional(v.string()),
    next_follow_up_scheduled: v.optional(v.string()),
    next_meeting_scheduled: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    const clients = project.clients.map(c => {
      if (c.client_id !== args.client_id) return c;
      return {
        ...c,
        status: args.status,
        ...(args.notes !== undefined && { notes: args.notes }),
        ...(args.next_follow_up_scheduled !== undefined && { next_follow_up_scheduled: args.next_follow_up_scheduled }),
        ...(args.next_meeting_scheduled !== undefined && { next_meeting_scheduled: args.next_meeting_scheduled }),
      };
    });
    await ctx.db.patch(args.id, { clients });
  },
});
