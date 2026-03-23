import { mutation } from "./_generated/server";

export const seed = mutation({
  handler: async (ctx) => {
    // Check if admins exist
    const admins = await ctx.db.query("admins").collect();
    if (admins.length === 0) {
      await ctx.db.insert("admins", {
        id: "admin",
        password: "admin",
        name: "관리자",
      });
    }

    // Check if demo partner exists
    const partners = await ctx.db.query("partners").collect();
    if (partners.length === 0) {
      await ctx.db.insert("partners", {
        id: "guest_demo",
        password: "guest_demo",
        name: "체험 파트너",
        owner: "김체험",
        phone: "010-1234-5678",
        address: "서울시 강남구",
        region: "서울, 경기",
        bizNum: "123-45-67890",
        account: "국민 123456-12-123456",
        email: "demo@example.com",
        joinDate: new Date().toISOString(),
        origin: "admin",
      });
    }
    
    return "Seeding complete.";
  },
});
