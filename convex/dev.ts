import { internalMutation } from "./_generated/server";

// Deletes only rows that were inserted by seed.ts (is_seed === true).
// Safe to run against a live DB — real clients are never touched.
// Run via: npx convex run dev:clearSeed
export const clearSeed = internalMutation({
  args: {},
  handler: async (ctx) => {
    const seedClients = await ctx.db
      .query("clients")
      .filter(q => q.eq(q.field("is_seed"), true))
      .collect();

    const seedClientIds = new Set(seedClients.map(c => c._id));

    const [projects, chats] = await Promise.all([
      ctx.db.query("projects").collect(),
      ctx.db.query("chat_history").collect(),
    ]);

    // Delete seed clients
    const deleteClients = seedClients.map(c => ctx.db.delete(c._id));

    // Delete projects whose entire client list overlaps seed clients
    const seedProjects = projects.filter(p =>
      p.clients.every(c => seedClientIds.has(c.client_id))
    );
    const deleteProjects = seedProjects.map(p => ctx.db.delete(p._id));

    // Delete chat_history for seed clients
    const seedChats = chats.filter(ch => seedClientIds.has(ch.client_id));
    const deleteChats = seedChats.map(ch => ctx.db.delete(ch._id));

    await Promise.all([...deleteClients, ...deleteProjects, ...deleteChats]);

    return {
      deleted: {
        clients: seedClients.length,
        projects: seedProjects.length,
        chat_history: seedChats.length,
      },
    };
  },
});
