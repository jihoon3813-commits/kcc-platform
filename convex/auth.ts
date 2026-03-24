import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Partners login
export const loginPartner = mutation({
  args: {
    id: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.db
      .query("partners")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (partner && partner.password === args.password) {
      if (partner.status !== "정상") {
        return { result: "error", message: "승인 대기 중이거나 중지된 파트너 계정입니다." };
      }
      return {
        result: "success",
        partner: {
          id: partner.id,
          name: partner.name,
          owner: partner.owner,
          phone: partner.phone,
          address: partner.address,
          region: partner.region,
          bizNum: partner.bizNum,
          account: partner.account,
          email: partner.email,
          joinDate: partner.joinDate || "-",
          status: partner.status || "정상",
        },
      };
    }
    return { result: "error", message: "아이디 또는 비밀번호가 일치하지 않습니다." };
  },
});

// Admin login
export const loginAdmin = mutation({
  args: {
    id: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (admin && admin.password === args.password) {
      return {
        result: "success",
        admin: {
          id: admin.id,
          name: admin.name,
        },
      };
    }
    return { result: "error", message: "관리자 정보가 일치하지 않습니다." };
  },
});

export const getPartners = query({
  handler: async (ctx) => {
    return await ctx.db.query("partners").collect();
  },
});

export const createPartner = mutation({
  args: {
    id: v.string(),
    password: v.string(),
    name: v.string(),
    owner: v.string(),
    phone: v.string(),
    region: v.string(),
    bizNum: v.string(),
    account: v.string(),
    email: v.string(),
    address: v.optional(v.string()),
    origin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if ID already exists
    const existing = await ctx.db
      .query("partners")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (existing) {
      return { result: "error", message: "이미 존재하는 아이디입니다." };
    }

    const { origin, address, ...restArgs } = args;
    const dateStr = new Date().toISOString();
    
    // Status depends on origin: admin -> '정상', request -> '승인대기'
    const status = origin === 'admin' ? "정상" : "승인대기";
    const joinDate = origin === 'admin' ? dateStr : "-";

    await ctx.db.insert("partners", {
      ...restArgs,
      address: address || "",
      joinDate: joinDate,
      status: status,
      origin: origin || "admin"
    });

    // Send notification to admin if it's a new request from website
    if (origin === 'request') {
      await ctx.scheduler.runAfter(0, internal.sms.sendAdminPartnerNotifySms, {
        partnerId: args.id
      });
    }
    
    return { result: "success" };
  },
});

export const updatePartner = mutation({
  args: {
    id: v.string(),
    name: v.optional(v.string()),
    owner: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    bizNum: v.optional(v.string()),
    account: v.optional(v.string()),
    email: v.optional(v.string()),
    status: v.optional(v.string()),
    joinDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.db
      .query("partners")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (!partner) return { result: "error" };

    const patch: any = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.owner !== undefined) patch.owner = args.owner;
    if (args.phone !== undefined) patch.phone = args.phone;
    if (args.address !== undefined) patch.address = args.address;
    if (args.bizNum !== undefined) patch.bizNum = args.bizNum;
    if (args.account !== undefined) patch.account = args.account;
    if (args.email !== undefined) patch.email = args.email;
    if (args.status !== undefined) patch.status = args.status;
    if (args.joinDate !== undefined) patch.joinDate = args.joinDate;

    await ctx.db.patch(partner._id, patch);
    return { result: "success" };
  },
});

export const changePassword = mutation({
  args: {
    id: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const partner = await ctx.db
      .query("partners")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();

    if (!partner) return { result: "error" };

    await ctx.db.patch(partner._id, { password: args.newPassword });
    return { result: "success" };
  },
});

export const getPartnerById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("partners")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();
  },
});

export const deletePartner = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const partner = await ctx.db
      .query("partners")
      .withIndex("by_custom_id", (q) => q.eq("id", args.id))
      .first();
    if (!partner) return { result: "error", message: "존재하지 않는 파트너입니다." };
    await ctx.db.delete(partner._id);
    return { result: "success" };
  },
});
