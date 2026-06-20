import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    sales_angle: v.string(),
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("projects", {
      ...args,
      created_at: Date.now(),
    });
  },
});

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

export const updateClientStatus = mutation({
  args: {
    id: v.id("projects"),
    client_id: v.id("clients"),
    status: v.union(
      v.literal("pending"),
      v.literal("contacted"),
      v.literal("responded"),
      v.literal("closed_won"),
      v.literal("closed_lost")
    ),
    outreached: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.id);
    if (!project) throw new Error("Project not found");

    const clients = project.clients.map(c => {
      if (c.client_id !== args.client_id) return c;
      return {
        ...c,
        status: args.status,
        ...(args.outreached !== undefined && { outreached: args.outreached }),
      };
    });
    await ctx.db.patch(args.id, { clients });
  },
});
