import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/* Added comment to force schema sync */
export default defineSchema({
  customers: defineTable({
    id: v.string(), // KCCxxx ID format
    name: v.string(),
    phone: v.string(),
    birthDate: v.string(),
    address: v.string(),
    amount: v.string(),
    downPayment: v.optional(v.string()), // Upfront payment
    months: v.string(),
    transferDate: v.string(),
    constructionDate: v.optional(v.string()), // Construction schedule
    date: v.string(), // ISO date or simple date string
    status: v.string(),
    statusUpdatedAt: v.optional(v.string()), // Date when status was last changed
    contractDate: v.optional(v.string()), // Date when status became '계약완료'
    recordingDate: v.optional(v.string()), // Date when status became '녹취완료'
    remarks: v.optional(v.string()),
    ownershipType: v.optional(v.string()),
    docs_json: v.optional(v.string()), // Completely renamed field to store serialized JSON string
    documents: v.optional(v.any()), // Legacy field for existing data
    settlement1Date: v.optional(v.string()),
    settlement1Amount: v.optional(v.string()),
    settlement2Date: v.optional(v.string()),
    settlement2Amount: v.optional(v.string()),
    partnerName: v.string(),
    partnerId: v.string(),
  }).index("by_custom_id", ["id"]).index("by_partner", ["partnerId"]),

  guest_customers: defineTable({
    id: v.string(),
    name: v.string(),
    phone: v.string(),
    birthDate: v.string(),
    address: v.string(),
    amount: v.string(),
    downPayment: v.optional(v.string()), // Upfront payment
    months: v.string(),
    transferDate: v.string(),
    constructionDate: v.optional(v.string()), // Construction schedule
    date: v.string(),
    status: v.string(),
    statusUpdatedAt: v.optional(v.string()),
    contractDate: v.optional(v.string()),
    recordingDate: v.optional(v.string()),
    remarks: v.optional(v.string()),
    ownershipType: v.optional(v.string()),
    docs_json: v.optional(v.string()),
    documents: v.optional(v.any()), // Legacy field for existing data
    settlement1Date: v.optional(v.string()),
    settlement1Amount: v.optional(v.string()),
    settlement2Date: v.optional(v.string()),
    settlement2Amount: v.optional(v.string()),
    partnerName: v.string(),
    partnerId: v.string(),
  }).index("by_custom_id", ["id"]).index("by_partner", ["partnerId"]),

  partners: defineTable({
    id: v.string(),
    password: v.string(),
    name: v.string(),
    owner: v.string(),
    phone: v.string(),
    address: v.string(),
    region: v.string(),
    bizNum: v.string(),
    account: v.string(),
    email: v.string(),
    joinDate: v.string(),
    origin: v.optional(v.string()), // 'admin' or 'request'
    status: v.optional(v.string()), // '정상', '승인대기', '정지'
  }).index("by_custom_id", ["id"]),

  admins: defineTable({
    id: v.string(),
    password: v.string(),
    name: v.string(),
  }).index("by_custom_id", ["id"]),

  settings: defineTable({
    key: v.string(), // e.g. 'sms_templates'
    value: v.any(),
  }).index("by_key", ["key"]),

  sms_logs: defineTable({
    customerId: v.optional(v.string()),
    type: v.string(), // 'registration', 'status', 'test'
    receiver: v.string(),
    message: v.string(),
    resultCode: v.string(),
    resultMessage: v.string(),
    timestamp: v.string(),
  }).index("by_timestamp", ["timestamp"]),
});
