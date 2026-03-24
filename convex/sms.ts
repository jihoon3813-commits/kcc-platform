import { mutation, query, action, internalMutation, internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

export const logSms = internalMutation({
  args: {
    customerId: v.optional(v.string()),
    type: v.string(),
    receiver: v.string(),
    message: v.string(),
    resultCode: v.string(),
    resultMessage: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("sms_logs", {
      customerId: args.customerId,
      type: args.type,
      receiver: args.receiver,
      message: args.message,
      resultCode: args.resultCode,
      resultMessage: args.resultMessage,
      timestamp: new Date().toISOString(),
    });
  },
});

export const getLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sms_logs").order("desc").take(50);
  },
});

export const sendStatusSms = internalAction({
  args: { 
    customerId: v.string(), 
    status: v.string(),
    isGuest: v.boolean()
  },
  handler: async (ctx, args) => {
    // 1. Get Customer & Partner Info
    const customer: any = await ctx.runQuery(api.customers.getCustomer, { id: args.customerId });
    if (!customer) return;

    const partner: any = await ctx.runQuery(api.auth.getPartnerById, { id: customer.partnerId });
    if (!partner || !partner.phone) {
        console.log("No partner phone found for SMS");
        return;
    }

    // 2. Get Aligo Config & Templates
    const aligoConfig: any = await ctx.runQuery(api.settings.getSetting, { key: "aligo_config" });
    const templates: any = await ctx.runQuery(api.settings.getSetting, { key: "sms_templates" });

    if (!aligoConfig || !aligoConfig.apiKey || !aligoConfig.userId || !aligoConfig.senderNumber) {
      console.log("Aligo API not configured properly");
      return;
    }

    // 3. Map status to template key
    const statusToKey: Record<string, string> = {
      '신용동의': 'status_agreed',
      '계약완료': 'status_completed',
      '진행불가': 'status_failed',
      '계약취소': 'status_canceled',
      '시공자료요청': 'status_construction',
      '녹취완료': 'status_recording',
      '1차정산완료': 'status_settlement1',
      '최종정산완료': 'status_settlement2',
    };

    const templateKey = statusToKey[args.status];
    if (!templateKey || !templates || !templates[templateKey]) {
      console.log(`No SMS template found for status: ${args.status}`);
      return;
    }

    let message = templates[templateKey];

    // 4. Replace variables with flexible regex (allows spaces like #{ 고객명 })
    message = message.replace(/#\{\s*고객명\s*\}/g, customer.name || "");
    message = message.replace(/#\{\s*파트너명\s*\}/g, customer.partnerName || "");
    message = message.replace(/#\{\s*ID\s*\}/g, customer.id || "");
    message = message.replace(/#\{\s*최종금액\s*\}/g, Number(customer.amount || 0).toLocaleString() + "원");

    console.log(`Sending SMS to Partner: ${partner.name} (${partner.phone}), Message: ${message}`);

    // 5. Call Aligo API
    try {
      const formData = new URLSearchParams();
      formData.set("key", aligoConfig.apiKey);
      formData.set("user_id", aligoConfig.userId);
      formData.set("sender", (aligoConfig.senderNumber || "").replace(/[^0-9]/g, ""));
      formData.set("receiver", (partner.phone || "").replace(/[^0-9]/g, ""));
      formData.set("msg", message);
      
      // Mandatory for LMS (Long messages over 90 bytes)
      if (message.length > 80) {
        formData.set("msg_type", "LMS");
        formData.set("subject", "[KCC 구독 센터]");
      }

      const response = await fetch("https://apis.aligo.in/send/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Aligo SMS Result:", result);
      
      if (result.result_code !== "1") {
        console.error(`Aligo SMS Failed: ${result.message} (Code: ${result.result_code})`);
      }
    } catch (error) {
      console.error("Aligo API Network/Fetch Error:", error);
    }
  },
});

export const sendAdminPartnerNotifySms = internalAction({
  args: { 
    partnerId: v.string(), 
  },
  handler: async (ctx, args) => {
    // 1. Get Partner Info
    const partner: any = await ctx.runQuery(api.auth.getPartnerById, { id: args.partnerId });
    if (!partner) return;

    // 2. Get Aligo Config & Templates
    const aligoConfig: any = await ctx.runQuery(api.settings.getSetting, { key: "aligo_config" });
    const templates: any = await ctx.runQuery(api.settings.getSetting, { key: "sms_templates" });

    if (!aligoConfig || !aligoConfig.apiKey || !aligoConfig.userId || !aligoConfig.senderNumber || !aligoConfig.adminPhone) {
      const missing = [];
      if (!aligoConfig) missing.push("config");
      else {
        if (!aligoConfig.apiKey) missing.push("apiKey");
        if (!aligoConfig.userId) missing.push("userId");
        if (!aligoConfig.senderNumber) missing.push("senderNumber");
        if (!aligoConfig.adminPhone) missing.push("adminPhone");
      }
      
      console.log(`Aligo API or Admin Phone not configured properly: ${missing.join(", ")}`);
      
      // Log as failure
      await ctx.runMutation(internal.sms.logSms, {
        type: "admin_notify_error",
        receiver: "ADMIN",
        message: "Config missing: " + missing.join(", "),
        resultCode: "error_config",
        resultMessage: "관리자 번호 또는 API 설정 미흡",
      });
      return;
    }

    const templateKey = 'admin_new_partner';
    let message = "";
    if (!templates || !templates[templateKey]) {
      console.log(`No SMS template found for admin notification (key: ${templateKey}). Using default.`);
      message = "[KCC구독] 신규 파트너 신청이 들어왔습니다.\n업체명: #{파트너명}\n지역: #{시공지역}\n확인 바랍니다.";
    } else {
      message = templates[templateKey];
    }

    // 3. Replace variables
    message = message.replace(/#\{\s*파트너명\s*\}/g, partner.name || "");
    message = message.replace(/#\{\s*고객명\s*\}/g, partner.owner || "");
    message = message.replace(/#\{\s*ID\s*\}/g, partner.id || "");
    message = message.replace(/#\{\s*시공지역\s*\}/g, partner.region || "");

    console.log(`Sending Admin Notification SMS to: ${aligoConfig.adminPhone}, Message: ${message}`);

    // 4. Call Aligo API
    try {
      const receiver = (aligoConfig.adminPhone || "").replace(/[^0-9]/g, "");
      const formData = new URLSearchParams();
      formData.set("key", aligoConfig.apiKey);
      formData.set("user_id", aligoConfig.userId);
      formData.set("sender", (aligoConfig.senderNumber || "").replace(/[^0-9]/g, ""));
      formData.set("receiver", receiver);
      formData.set("msg", message);
      
      if (message.length > 80) {
        formData.set("msg_type", "LMS");
        formData.set("subject", "[KCC 구독 센터]");
      }

      const response = await fetch("https://apis.aligo.in/send/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Aligo Admin Notify SMS Result:", result);
      
      // Log the result
      await ctx.runMutation(internal.sms.logSms, {
        type: "admin_notify",
        receiver: receiver,
        message: message,
        resultCode: String(result.result_code),
        resultMessage: result.message || (result.result_code === "1" ? "Success" : "Unknown Error"),
      });

    } catch (error) {
      console.error("Aligo API Network/Fetch Error:", error);
    }
  },
});

export const sendRegistrationSms = internalAction({
  args: { 
    customerId: v.string(), 
    isGuest: v.boolean()
  },
  handler: async (ctx, args) => {
    // 1. Get Customer Info
    const customer: any = await ctx.runQuery(api.customers.getCustomer, { id: args.customerId });
    if (!customer || !customer.phone) return;

    // 2. Get Aligo Config & Templates
    const aligoConfig: any = await ctx.runQuery(api.settings.getSetting, { key: "aligo_config" });
    const templates: any = await ctx.runQuery(api.settings.getSetting, { key: "sms_templates" });

    if (!aligoConfig || !aligoConfig.apiKey || !aligoConfig.userId || !aligoConfig.senderNumber) {
      console.log("Aligo API not configured properly");
      return;
    }

    const templateKey = 'customer_registration';
    console.log(`[SMS DEBUG] Searching for template: ${templateKey}. Available keys:`, Object.keys(templates || {}));
    
    let message = "";
    if (!templates || !templates[templateKey]) {
      console.log(`[SMS DEBUG] No SMS template found for new registration (key: ${templateKey}). Using default.`);
      // Default fallback template
      message = "[KCC창호] #{고객명}님, 구독 서비스 등록이 완료되었습니다. 아래 전용 URL을 통해 계약을 진행해 주세요.\n#{전용URL}";
    } else {
      message = templates[templateKey];
    }

    // 3. Replace variables with flexible regex
    const baseUrl = (aligoConfig.baseUrl || "https://kcc-subscribe.vercel.app").replace(/\/$/, "");
    const applyUrl = `${baseUrl}/customer/${customer.id}`;

    message = message.replace(/#\{\s*고객명\s*\}/g, customer.name || "");
    message = message.replace(/#\{\s*파트너명\s*\}/g, customer.partnerName || "");
    message = message.replace(/#\{\s*ID\s*\}/g, customer.id || "");
    message = message.replace(/#\{\s*전용URL\s*\}/g, applyUrl);

    console.log(`Sending SMS to Customer: ${customer.name} (${customer.phone}), Message: ${message}`);

    // 4. Call Aligo API
    try {
      const receiver = (customer.phone || "").replace(/[^0-9]/g, "");
      const formData = new URLSearchParams();
      formData.set("key", aligoConfig.apiKey);
      formData.set("user_id", aligoConfig.userId);
      formData.set("sender", (aligoConfig.senderNumber || "").replace(/[^0-9]/g, ""));
      formData.set("receiver", receiver);
      formData.set("msg", message);
      
      // Mandatory for LMS (Long messages over 90 bytes)
      if (message.length > 80) {
        formData.set("msg_type", "LMS");
        formData.set("subject", "[KCC 구독 센터]");
      }

      const response = await fetch("https://apis.aligo.in/send/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Aligo Registration SMS Raw Result:", result);
      
      // Log the result
      await ctx.runMutation(internal.sms.logSms, {
        customerId: args.customerId,
        type: "registration",
        receiver: receiver,
        message: message,
        resultCode: String(result.result_code),
        resultMessage: result.message || (result.result_code === "1" ? "Success" : "Unknown Error"),
      });

      if (result.result_code !== "1") {
        console.error(`Aligo SMS Failed: ${result.message} (Code: ${result.result_code})`);
      } else {
        console.log(`[SMS SUCCESS] Sent to ${customer.phone}`);
      }
    } catch (error) {
      console.error("Aligo API Network/Fetch Error:", error);
    }
  },
});

export const testSms = action({
  args: { 
    receiver: v.string(), 
    message: v.string() 
  },
  handler: async (ctx, args) => {
    const aligoConfig: any = await ctx.runQuery(api.settings.getSetting, { key: "aligo_config" });

    if (!aligoConfig || !aligoConfig.apiKey || !aligoConfig.userId || !aligoConfig.senderNumber) {
      return { result: "error", message: "알리고 설정이 완료되지 않았습니다." };
    }

    try {
      const formData = new URLSearchParams();
      formData.set("key", aligoConfig.apiKey);
      formData.set("user_id", aligoConfig.userId);
      formData.set("sender", (aligoConfig.senderNumber || "").replace(/[^0-9]/g, ""));
      formData.set("receiver", (args.receiver || "").replace(/[^0-9]/g, ""));
      formData.set("msg", args.message);
      
      if (args.message.length > 80) {
        formData.set("msg_type", "LMS");
      }

      const response = await fetch("https://apis.aligo.in/send/", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      console.log("Aligo Test SMS Raw Result:", result);
      
      // Always try to get IP info for diagnostic
      let serverIp = "Unknown";
      try {
          const ipCheck = await fetch("https://api.ipify.org?format=json");
          const ipData = await ipCheck.json();
          serverIp = ipData.ip;
          console.log("Current Server Outbound IP:", serverIp);
      } catch (ipErr) {
          console.error("Failed to detect server IP:", ipErr);
      }
      
      if (result.result_code !== "1") {
          return { 
              ...result, 
              message: `${result.message} (서버IP: ${serverIp}, 코드: ${result.result_code})` 
          };
      }
      
      return result;
    } catch (error: any) {
      console.error("Aligo Test API Error:", error);
      return { result_code: "-999", message: error.message };
    }
  },
});
