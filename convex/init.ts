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

    // Check if demo customers exist
    const demoCustomers = await ctx.db.query("guest_customers")
      .withIndex("by_partner", (q) => q.eq("partnerId", "guest_demo"))
      .collect();
    
    if (demoCustomers.length === 0) {
      const sampleData = [
        { name: "홍길동", phone: "010-1111-2222", status: "등록완료", amount: "5,000,000" },
        { name: "이순신", phone: "010-3333-4444", status: "계약완료", amount: "12,500,000" },
        { name: "유관순", phone: "010-5555-6666", status: "녹취완료", amount: "8,900,000" },
      ];

      for (const [index, data] of sampleData.entries()) {
        const id = `KCC_DEMO_${index + 1}`;
        await ctx.db.insert("guest_customers", {
          id,
          name: data.name,
          phone: data.phone,
          birthDate: "19800101",
          address: "서울시 강남구 테헤란로 123",
          amount: data.amount,
          downPayment: "0",
          months: "60",
          transferDate: "5",
          date: new Date().toISOString().split('T')[0],
          status: data.status,
          remarks: "체험용 샘플 데이터입니다.",
          ownershipType: "본인소유",
          docs_json: "{}",
          partnerName: "체험 파트너",
          partnerId: "guest_demo",
          constructionDate: "",
          statusUpdatedAt: new Date().toISOString().split('T')[0],
        });
      }
    }
    
    return "Seeding complete.";
  },
});
