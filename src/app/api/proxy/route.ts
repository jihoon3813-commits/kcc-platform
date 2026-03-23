import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '../../../../convex/_generated/api';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || process.env.CONVEX_URL || "https://agreeable-poodle-811.convex.cloud";
let convex: ConvexHttpClient | null = null;

if (convexUrl) {
    convex = new ConvexHttpClient(convexUrl);
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'customers';
    const id = searchParams.get('id');

    try {
        if (!convexUrl) {
            console.error("CONVEX_URL is not defined in environment variables.");
            return NextResponse.json(type.includes('customers') ? [] : { error: 'Not configured' }, { status: 500 });
        }

        let data: any = [];

        if (id) {
            // New unified single customer fetch
            const single = await convex!.query(api.customers.getCustomer, { id });
            data = single ? [single] : [];
        } else if (type === 'partners') {
            data = await convex!.query(api.auth.getPartners);
        } else if (type === 'guest_customers') {
            data = await convex!.query(api.customers.getGuestCustomers);
            if (Array.isArray(data)) {
                data = data.map(c => ({ ...c, isGuest: true }));
            }
        } else {
            // customers
            data = await convex!.query(api.customers.getCustomers);
        }

        if (Array.isArray(data)) {
            data = data.map((c: any) => {
                if (c) {
                    // Try new field first, then fallback to old field
                    const docField = c.docs_json || c.documents;
                    if (typeof docField === 'string') {
                        try {
                            c.documents = JSON.parse(docField);
                        } catch (e) {
                            c.documents = {};
                        }
                    } else if (docField && typeof docField === 'object') {
                        c.documents = docField;
                    } else {
                        c.documents = {};
                    }
                }
                return c;
            });
        } else if (data) {
            const c = data as any;
            const docField = c.docs_json || c.documents;
            if (typeof docField === 'string') {
                try {
                    c.documents = JSON.parse(docField);
                } catch (e) {
                    c.documents = {};
                }
            } else if (docField && typeof docField === 'object') {
                c.documents = docField;
            } else {
                c.documents = {};
            }
        }

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
            }
        });
    } catch (error: any) {
        console.error('Convex GET Proxy Error:', error);
        return NextResponse.json({ 
            error: 'Failed to fetch', 
            details: error.message,
            stack: error.stack,
            configured: !!convexUrl,
            envKeysToCheck: ['NEXT_PUBLIC_CONVEX_URL', 'CONVEX_URL']
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        if (!convexUrl) {
            return NextResponse.json({ error: 'CONVEX_URL is not configured' }, { status: 500 });
        }

        const body = await request.json();
        const action = body.action;

        if (action === "update") {
            const updateArgs: any = {
                id: String(body.id || "").trim(),
                isGuest: body.type === 'guest_customers',
                status: body.status !== undefined ? String(body.status) : undefined,
                remarks: body.remarks !== undefined ? String(body.remarks) : undefined,
                docs_json: body.documents !== undefined ? String(body.documents) : undefined,
                customerName: body.customerName !== undefined ? String(body.customerName) : undefined,
                phone: body.phone !== undefined ? String(body.phone) : undefined,
                birthDate: body.birthDate !== undefined ? String(body.birthDate) : undefined,
                address: body.address !== undefined ? String(body.address) : undefined,
                amount: body.amount !== undefined ? String(body.amount) : undefined,
                downPayment: body.downPayment !== undefined ? String(body.downPayment) : undefined,
                months: body.months !== undefined ? String(body.months) : undefined,
                transferDate: body.transferDate !== undefined ? String(body.transferDate) : undefined,
                ownershipType: body.ownershipType !== undefined ? String(body.ownershipType) : undefined,
                constructionDate: body.constructionDate !== undefined ? String(body.constructionDate) : undefined,
                settlement1Date: body.settlement1Date !== undefined ? String(body.settlement1Date) : undefined,
                settlement1Amount: body.settlement1Amount !== undefined ? String(body.settlement1Amount) : undefined,
                settlement2Date: body.settlement2Date !== undefined ? String(body.settlement2Date) : undefined,
                settlement2Amount: body.settlement2Amount !== undefined ? String(body.settlement2Amount) : undefined
            };

            try {
                const result = await convex!.mutation(api.customers.updateCustomer, updateArgs);
                return NextResponse.json(result);
            } catch (mutationError: any) {
                console.error('Convex Mutation Error:', mutationError);
                return NextResponse.json({ 
                    result: 'error', 
                    message: mutationError.message || '업데이트 중 오류가 발생했습니다.'
                }, { status: 400 });
            }
        } 
        else if (action === "adminLogin") {
            const result = await convex!.mutation(api.auth.loginAdmin, {
                id: body.id,
                password: body.password,
            });
            return NextResponse.json(result);
        }
        else if (action === "login") {
            const result = await convex!.mutation(api.auth.loginPartner, {
                id: body.id,
                password: body.password,
            });
            return NextResponse.json(result);
        }
        else if (action === "create") {
            try {
                const result = await convex!.mutation(api.customers.createCustomer, {
                    isGuest: body.type === 'guest_customers',
                    id: String(body.id || ""),
                    customerName: String(body.customerName || ""),
                    phone: String(body.phone || ""),
                    birthDate: String(body.birthDate || ""),
                    address: String(body.address || ""),
                    amount: String(body.amount || "0"),
                    downPayment: String(body.downPayment || "0"),
                    months: String(body.months || "60"),
                    transferDate: String(body.transferDate || "15"),
                    remarks: String(body.remarks || ""),
                    ownershipType: String(body.ownershipType || "본인소유"),
                    partnerName: String(body.partnerName || "관리자"),
                    partnerId: String(body.partnerId || "admin"),
                    constructionDate: String(body.constructionDate || ""),
                    status: body.status !== undefined ? String(body.status) : undefined,
                });
                return NextResponse.json(result);
            } catch (err: any) {
                console.error('Create Customer Mutation Error:', err);
                return NextResponse.json({ 
                    result: 'error', 
                    message: err.message || '데이터 생성 중 오류가 발생했습니다.'
                }, { status: 400 });
            }
        }
        else if (action === "upload") {
            const uploadUrl = await convex!.mutation(api.files.generateUploadUrl);
            const buffer = Buffer.from(body.base64, "base64");
            const uploadResponse = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": body.mimeType },
                body: buffer,
            });
            
            if (!uploadResponse.ok) {
                return NextResponse.json({ result: "error", message: "Storage upload failed" });
            }
            
            const { storageId } = await uploadResponse.json();
            const fileUrl = await convex!.query(api.files.getFileUrl, { storageId });
            return NextResponse.json({ result: "success", url: fileUrl });
        }
        else if (action === "createPartner") {
            const result = await convex!.mutation(api.auth.createPartner, {
                id: body.id,
                password: body.password,
                name: body.name,
                owner: body.owner || "",
                phone: body.phone || "",
                region: body.region || "",
                bizNum: body.bizNum || "",
                account: body.account || "",
                email: body.email || "",
                origin: body.origin,
            });
            return NextResponse.json(result);
        }
        else if (action === "updatePartner") {
            const updatePartnerArgs: any = { id: body.id };
            if (body.name !== undefined) updatePartnerArgs.name = body.name;
            if (body.owner !== undefined) updatePartnerArgs.owner = body.owner;
            if (body.phone !== undefined) updatePartnerArgs.phone = body.phone;
            if (body.address !== undefined) updatePartnerArgs.address = body.address;
            if (body.bizNum !== undefined) updatePartnerArgs.bizNum = body.bizNum;
            if (body.account !== undefined) updatePartnerArgs.account = body.account;
            if (body.email !== undefined) updatePartnerArgs.email = body.email;
            if (body.status !== undefined) updatePartnerArgs.status = body.status;
            if (body.joinDate !== undefined) updatePartnerArgs.joinDate = body.joinDate;

            const result = await convex!.mutation(api.auth.updatePartner, updatePartnerArgs);
            return NextResponse.json(result);
        }
        else if (action === "changePassword") {
            const result = await convex!.mutation(api.auth.changePassword, {
                id: body.id,
                newPassword: body.newPassword,
            });
            return NextResponse.json(result);
        }
        else if (action === "deleteCustomer") {
            const result = await convex!.mutation(api.customers.deleteCustomer, {
                isGuest: body.type === 'guest_customers',
                id: body.id,
            });
            return NextResponse.json(result);
        }
        else if (action === "deletePartner") {
            const result = await convex!.mutation(api.auth.deletePartner, {
                id: body.id,
            });
            return NextResponse.json(result);
        }
        else if (action === "adminLoginAsPartner") {
            const partner = await convex!.query(api.auth.getPartnerById, { id: body.id });
            if (partner) {
                return NextResponse.json({ result: "success", partner });
            }
            return NextResponse.json({ result: "error", message: "Partner not found" });
        }
        else if (action === "getSetting") {
            const result = await convex!.query(api.settings.getSetting, { key: body.key });
            return NextResponse.json({ result: "success", value: result });
        }
        else if (action === "updateSetting") {
            const result = await convex!.mutation(api.settings.updateSetting, { key: body.key, value: body.value });
            return NextResponse.json(result);
        }
        else if (action === "testSms") {
            const result = await convex!.action(api.sms.testSms, { receiver: body.receiver, message: body.message });
            return NextResponse.json(result);
        }
        else if (action === "getSmsLogs") {
            const result = await convex!.query(api.sms.getLogs);
            return NextResponse.json({ result: "success", value: result });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    } catch (error: any) {
        console.error('Convex POST Proxy Error:', error);
        return NextResponse.json({ 
            result: 'error', 
            message: error.message || 'Failed to process request to Convex',
            details: error.stack
        }, { status: 500 });
    }
}
