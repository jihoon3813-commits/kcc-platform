# KCC HomeCC Subscription Platform Development Plan

## 1. System Architecture
- **Frontend**: Next.js 15 (App Router)
- **Backend**: Node.js (NestJS or Express)
- **Database**: PostgreSQL (Prisma ORM)
- **Storage**: AWS S3 (Contract PDFs, Install Photos)
- **Auth**: NextAuth.js (Partner/Admin) + PASS API (Customer)

## 2. Database Schema (Draft)

### Partner Table
- id (UUID)
- business_name (string)
- business_number (string)
- region (string)
- settlement_rate (float)
- status (enum: ACTIVE, SUSPENDED, PENDING)

### SubscriptionApplication Table
- id (UUID)
- partner_id (FK)
- customer_name (string)
- customer_phone (string)
- amount (decimal)
- months (int)
- status (enum: LINK_CREATED, AUTH_COMPLETED, CONTRACT_SIGNED, APPROVED, COMPLETED, CANCELLED)
- contract_url (string)

### Settlement Table
- id (UUID)
- partner_id (FK)
- application_id (FK)
- amount (decimal)
- due_date (date)
- is_paid (boolean)

## 3. Key Integration Points
1. **Financial API**: Connect to credit screening API for real-time limit check.
2. **Electronic Contract**: Integration with Modusign or HelloSign for legal validity.
3. **Notification Talk**: Kakao Alimtalk for link delivery and status updates.
4. **Subscription Payment**: PG integration for monthly recurring billing.

## 4. Next Steps (Phase 3)
- Implement real backend routes (API) for the dashboard.
- Connect to a database using Prisma.
- Implement Authentication using NextAuth.
- Integrate mockup credit card/account registration for customers.
