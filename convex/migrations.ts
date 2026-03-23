import { mutation } from "./_generated/server";

export const fixTimestamps = mutation({
  handler: async (ctx) => {
    let count = 0;
    
    // Fix regular customers
    const customers = await ctx.db.query("customers").collect();
    for (const c of customers) {
      if (typeof c.updatedAt === 'string') {
        const timestamp = new Date(c.updatedAt).getTime();
        if (!isNaN(timestamp)) {
          await ctx.db.patch(c._id, { updatedAt: timestamp });
          count++;
        }
      }
    }
    
    // Fix guest customers
    const guestCustomers = await ctx.db.query("guest_customers").collect();
    for (const gc of guestCustomers) {
      if (typeof gc.updatedAt === 'string') {
        const timestamp = new Date(gc.updatedAt).getTime();
        if (!isNaN(timestamp)) {
          await ctx.db.patch(gc._id, { updatedAt: timestamp });
          count++;
        }
      }
    }
    
    return { result: "success", correctedCount: count };
  }
});
