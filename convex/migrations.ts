import { mutation } from "./_generated/server";

export const migrateStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const customers = await ctx.db.query("customers").collect();
    let count = 0;
    for (const customer of customers) {
      if (customer.status === "녹취진행") {
        await ctx.db.patch(customer._id, { status: "녹취완료" });
        count++;
      }
    }

    const guestCustomers = await ctx.db.query("guest_customers").collect();
    for (const customer of guestCustomers) {
      if (customer.status === "녹취진행") {
        await ctx.db.patch(customer._id, { status: "녹취완료" });
        count++;
      }
    }

    return { result: "success", updatedCount: count };
  },
});
