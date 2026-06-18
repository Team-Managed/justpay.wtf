import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";
import { internalMutation } from "./_generated/server";

export const expireLinks = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const activeLinks = await ctx.db
      .query("paymentLinks")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    for (const link of activeLinks) {
      if (link.expiresAt && link.expiresAt < now) {
        await ctx.db.patch(link._id, { status: "expired" });
      }
    }
  },
});

const crons = cronJobs();
crons.interval("expire stale links", { minutes: 1 }, internal.crons.expireLinks);
export default crons;
