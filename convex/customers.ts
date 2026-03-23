import { mutation, query, action, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Get normal customers
export const getCustomers = query({
  handler: async (ctx) => {
    return await ctx.db.query("customers").order("desc").collect();
  },
});

// Get guest customers
export const getGuestCustomers = query({
  handler: async (ctx) => {
    return await ctx.db.query("guest_customers").order("desc").collect();
  },
});

// Get a single customer by id
export const getCustomer = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    // 1. Try standard index lookup on customers
    let customer: any = await ctx.db
      .query("customers")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();
    
    // 2. Try standard index lookup on guest_customers
    if (!customer) {
      customer = await ctx.db
        .query("guest_customers")
        .withIndex("by_custom_id", (q) => q.eq("id", args.id))
        .first();
    }
    
    // 3. Try direct internal ID lookup (_id)
    if (!customer) {
      try {
        const byId = await ctx.db.get(args.id as any);
        if (byId && ("name" in byId) && ("phone" in byId)) {
          customer = byId as any;
        }
      } catch (e) {}
    }

    // 4. Ultimate fallback: scan and filter (only if small data set, but as a safety net)
    if (!customer) {
      const allC = await ctx.db.query("customers").collect();
      customer = allC.find(c => c.id === args.id || (c as any)._id === args.id) as any;
    }
    
    if (!customer) {
      const allG = await ctx.db.query("guest_customers").collect();
      customer = allG.find(c => c.id === args.id || (c as any)._id === args.id) as any;
    }
    
    return customer;
  },
});

// Create a new customer
export const createCustomer = mutation({
  args: {
    isGuest: v.optional(v.boolean()),
    id: v.string(), // KCCxxx
    customerName: v.string(),
    phone: v.string(),
    birthDate: v.string(),
    address: v.string(),
    amount: v.string(),
    downPayment: v.optional(v.string()),
    months: v.string(),
    transferDate: v.string(),
    status: v.optional(v.string()),
    remarks: v.optional(v.string()),
    date: v.optional(v.string()),
    ownershipType: v.optional(v.string()),
    partnerName: v.optional(v.string()),
    partnerId: v.optional(v.string()),
    constructionDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let table: "customers" | "guest_customers" = args.isGuest ? "guest_customers" : "customers";
    
    let targetId = args.id;
    if (!targetId || targetId.trim() === "") {
      const now = new Date();
      const yymmdd = now.toISOString().slice(2, 10).replace(/-/g, '');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      targetId = `KCC${yymmdd}${random}`;
    }

    // Check for duplicate ID
    const existing = await ctx.db
      .query(table)
      .withIndex("by_custom_id", (q) => q.eq("id", targetId))
      .first();
      
    if (existing) {
      return { result: "error", message: "이미 존재하는 ID입니다. (" + targetId + ")" };
    }
    
    const newId = await ctx.db.insert(table, {
      id: targetId,
      name: args.customerName,
      phone: args.phone,
      birthDate: args.birthDate,
      address: args.address,
      amount: args.amount,
      downPayment: args.downPayment || "0",
      months: args.months,
      transferDate: args.transferDate,
      date: args.date || new Date().toISOString().split('T')[0],
      status: args.status || "등록완료",
      remarks: args.remarks || "",
      ownershipType: args.ownershipType || "본인소유",
      docs_json: "{}",
      partnerName: args.partnerName || "관리자",
      partnerId: args.partnerId || "admin",
      constructionDate: args.constructionDate || "",
      statusUpdatedAt: new Date().toISOString().split('T')[0],
    });
    
    // Trigger Registration SMS to Customer
    await ctx.scheduler.runAfter(0, internal.sms.sendRegistrationSms, {
      customerId: targetId,
      isGuest: args.isGuest || false,
    });

    return { result: "success", id: newId };
  },
});

// Update a customer
export const updateCustomer = mutation({
  args: {
    isGuest: v.optional(v.boolean()),
    id: v.string(),
    status: v.optional(v.string()),
    remarks: v.optional(v.string()),
    docs_json: v.optional(v.string()), 
    customerName: v.optional(v.string()),
    phone: v.optional(v.string()),
    birthDate: v.optional(v.string()),
    address: v.optional(v.string()),
    amount: v.optional(v.string()),
    downPayment: v.optional(v.string()),
    months: v.optional(v.string()),
    transferDate: v.optional(v.string()),
    ownershipType: v.optional(v.string()),
    constructionDate: v.optional(v.string()),
    statusUpdatedAt: v.optional(v.string()),
    settlement1Date: v.optional(v.string()),
    settlement1Amount: v.optional(v.string()),
    settlement2Date: v.optional(v.string()),
    settlement2Amount: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let table: "customers" | "guest_customers" = args.isGuest ? "guest_customers" : "customers";
    
    let customer = await ctx.db
      .query(table)
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();
      
    if (!customer) {
      const otherTable = table === "customers" ? "guest_customers" : "customers";
      customer = await ctx.db
        .query(otherTable)
        .withIndex("by_custom_id", (q) => q.eq("id", args.id))
        .first();
      if (customer) {
        table = otherTable;
      }
    }
    
    // Final fallback: try finding by _id directly if it looks like a Convex ID
    if (!customer) {
      try {
        const byId = await ctx.db.get(args.id as any);
        // Only accept if it's from customers or guest_customers tables
        if (byId && ("birthDate" in byId)) {
          customer = byId as any;
        }
      } catch (e) {
        // Not a valid ID format
      }
    }
    
    if (!customer) {
      return { result: "error", message: "ID를 찾을 수 없습니다: " + args.id };
    }
    
    const patch: any = {};
    if (args.status !== undefined) {
      const statusOrder = ['등록완료', '신용동의', '계약완료', '진행불가', '계약취소', '시공자료요청', '녹취완료', '1차정산완료', '최종정산완료'];
      const oldIdx = statusOrder.indexOf(customer.status || '등록완료');
      const newIdx = statusOrder.indexOf(args.status);
      
      // Block reverting to '등록완료' or '신용동의' if already at '계약완료' or later
      // Success milestones: 계약완료(2), 시공완료(5), 녹취진행(6), 정산완료(7)
      const milestoneIdx = 2; // 계약완료
      
      const nowStr = new Date().toISOString().split('T')[0];
      if (oldIdx >= milestoneIdx && newIdx < milestoneIdx) {
        // Just ignore illegal status downgrade
        console.log(`Status downgrade blocked: ${customer.status} -> ${args.status}`);
      } else if (args.status !== customer.status) {
        patch.status = args.status;
        patch.statusUpdatedAt = nowStr;
        
        // Capture specific success dates
        if (args.status === '계약완료' && !customer.contractDate) {
          patch.contractDate = nowStr;
        }
        if (args.status === '녹취완료' && !customer.recordingDate) {
          patch.recordingDate = nowStr;
        }
      }
    }
    
    if (args.remarks !== undefined) patch.remarks = args.remarks;
    if (args.docs_json !== undefined) patch.docs_json = args.docs_json;
    if (args.customerName !== undefined) patch.name = args.customerName;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.birthDate !== undefined) patch.birthDate = args.birthDate;
    if (args.address !== undefined) patch.address = args.address;
    if (args.amount !== undefined) patch.amount = args.amount;
    if (args.downPayment !== undefined) patch.downPayment = args.downPayment;
    if (args.months !== undefined) patch.months = args.months;
    if (args.transferDate !== undefined) patch.transferDate = args.transferDate;
    if (args.ownershipType !== undefined) patch.ownershipType = args.ownershipType;
    if (args.constructionDate !== undefined) patch.constructionDate = args.constructionDate;
    if (args.statusUpdatedAt !== undefined) patch.statusUpdatedAt = args.statusUpdatedAt;
    if (args.settlement1Date !== undefined) patch.settlement1Date = args.settlement1Date;
    if (args.settlement1Amount !== undefined) patch.settlement1Amount = args.settlement1Amount;
    if (args.settlement2Date !== undefined) patch.settlement2Date = args.settlement2Date;
    if (args.settlement2Amount !== undefined) patch.settlement2Amount = args.settlement2Amount;
    
    await ctx.db.patch(customer._id, patch);

    // Trigger SMS if status changed
    if (patch.status && patch.status !== customer.status) {
      await ctx.scheduler.runAfter(0, internal.sms.sendStatusSms, {
        customerId: customer.id,
        status: patch.status,
        isGuest: table === "guest_customers",
      });
    }

    return { result: "success", message: "업데이트 되었습니다." };
  },
});

// Delete a customer
export const deleteCustomer = mutation({
  args: {
    isGuest: v.optional(v.boolean()),
    id: v.string(),
  },
  handler: async (ctx, args) => {
    const table = args.isGuest ? "guest_customers" : "customers";
    const customer = await ctx.db
      .query(table)
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();
      
    if (customer) {
      await ctx.db.delete(customer._id);
      return { result: "success" };
    }
    return { result: "error", message: "고객을 찾을 수 없습니다." };
  },
});

// Migration for '녹취진행' to '녹취완료'
export const migrateStatus = mutation({
  args: {},
  handler: async (ctx) => {
    let count = 0;
    const customers = await ctx.db.query("customers").collect();
    for (const c of customers) {
      if (c.status === "녹취진행") {
        await ctx.db.patch(c._id, { status: "녹취완료" });
        count++;
      }
    }
    const guestCustomers = await ctx.db.query("guest_customers").collect();
    for (const c of guestCustomers) {
      if (c.status === "녹취진행") {
        await ctx.db.patch(c._id, { status: "녹취완료" });
        count++;
      }
    }
    return { result: "success", updatedCount: count };
  },
});
