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
    
      const sampleData = [
        { name: "홍길동", phone: "010-1111-2222", status: "등록완료", amount: "5,000,000" },
        { name: "이순신", phone: "010-3333-4444", status: "계약완료", amount: "12,500,000" },
        { name: "유관순", phone: "010-5555-6666", status: "녹취완료", amount: "8,900,000" },
      ];

      for (const [index, data] of sampleData.entries()) {
        const id = `KCC_SAMPLE_${Date.now()}_${index + 1}`;
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
    
    return "Seeding complete.";
  },
});

export const forceSeed = mutation({
  handler: async (ctx) => {
    // 1. Ensure partner guest_demo exists
    const guest = await ctx.db.query("partners").withIndex("by_custom_id", q => q.eq("id", "guest_demo")).first();
    if (!guest) {
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

    // 2. Add sample customers
    const sampleData = [
        { name: "홍길동", phone: "010-1111-2222", status: "등록완료", amount: "5,000,000" },
        { name: "이순신", phone: "010-3333-4444", status: "계약완료", amount: "12,500,000" },
        { name: "유관순", phone: "010-5555-6666", status: "녹취완료", amount: "8,900,000" },
    ];
    
    for (const [index, data] of sampleData.entries()) {
        const id = `KCC_SAMPLE_${index + 1}`;
        // Delete if exists to avoid error if re-running
        const existing = await ctx.db.query("guest_customers").withIndex("by_custom_id", q => q.eq("id", id)).first();
        if (existing) {
            await ctx.db.delete(existing._id);
        }
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
    return "Samples added.";
  }
});

export const seedLots = mutation({
  handler: async (ctx) => {
    // 1. Reset/Ensure Admin
    const admin = await ctx.db.query("admins").withIndex("by_custom_id", q => q.eq("id", "admin")).first();
    if (admin) {
        await ctx.db.patch(admin._id, { password: "admin", name: "관리자" });
    } else {
        await ctx.db.insert("admins", { id: "admin", password: "admin", name: "관리자" });
    }

    // 2. Ensure Partner
    const guest = await ctx.db.query("partners").withIndex("by_custom_id", q => q.eq("id", "guest_demo")).first();
    if (!guest) {
        await ctx.db.insert("partners", {
            id: "guest_demo", password: "guest_demo", name: "체험 파트너", owner: "김체험",
            phone: "010-1234-5678", address: "서울시 강남구", region: "서울, 경기",
            bizNum: "123-45-67890", account: "국민 123456-12-123456", email: "demo@example.com",
            joinDate: new Date().toISOString(), origin: "admin", status: "정상"
        });
    }

    const statuses: any[] = ['등록완료', '신용동의', '계약완료', '시공자료요청', '녹취완료', '1차정산완료', '최종정산완료'];
    const names = ["김철수", "이영희", "박민준", "최수연", "정해인", "강하늘", "지창욱", "한소희", "송강", "임윤아"];
    
    // 3. Add 10 customers to 'customers' (for Admin view)
    for(let i=0; i<10; i++) {
        const id = `KCC_REAL_${i+1}`;
        const existing = await ctx.db.query("customers").withIndex("by_custom_id", q => q.eq("id", id)).first();
        if (existing) await ctx.db.delete(existing._id);
        
        await ctx.db.insert("customers", {
            id, name: names[i], phone: `010-0000-100${i}`, birthDate: "19850101",
            address: "서울시 종로구 세종대로 1", amount: String(5000000 + (i * 1000000)),
            downPayment: "0", months: "60", transferDate: "15",
            date: "2026-03-20", status: statuses[i % statuses.length],
            partnerName: "일반 파트너", partnerId: "partner_01", docs_json: "{}", 
            statusUpdatedAt: "2026-03-21", constructionDate: "2026-04-01"
        });
    }

    // 4. Add 10 customers to 'guest_customers' (for Guest/Trial view)
    for(let i=0; i<10; i++) {
        const id = `KCC_GUEST_${i+1}`;
        const existing = await ctx.db.query("guest_customers").withIndex("by_custom_id", q => q.eq("id", id)).first();
        if (existing) await ctx.db.delete(existing._id);
        
        await ctx.db.insert("guest_customers", {
            id, name: names[9-i], phone: `010-9999-200${i}`, birthDate: "19900101",
            address: "경기도 성남시 분당구", amount: String(3000000 + (i * 500000)),
            downPayment: "0", months: "48", transferDate: "5",
            date: "2026-03-21", status: statuses[i % statuses.length],
            partnerName: "체험 파트너", partnerId: "guest_demo", docs_json: "{}",
            statusUpdatedAt: "2026-03-22", constructionDate: ""
        });
    }

    return "Seed Lots complete.";
  }
});
