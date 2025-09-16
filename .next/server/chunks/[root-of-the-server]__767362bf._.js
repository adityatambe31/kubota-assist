module.exports = [
"[project]/.next-internal/server/app/api/chat/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/mongoose [external] (mongoose, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("mongoose", () => require("mongoose"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/lib/mongodb.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "connectDB",
    ()=>connectDB
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dotenv$2f$lib$2f$main$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/dotenv/lib/main.js [app-route] (ecmascript)");
;
;
// Load environment variables
__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$dotenv$2f$lib$2f$main$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].config({
    path: ".env.local"
});
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    throw new Error("Please add your MongoDB URI to .env.local");
}
const connectDB = async ()=>{
    try {
        const conn = await __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].connect(MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
};
}),
"[project]/src/lib/models/ITIssue.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ITIssue",
    ()=>ITIssue,
    "TicketDescriptions",
    ()=>TicketDescriptions,
    "TicketType",
    ()=>TicketType
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/mongoose [external] (mongoose, cjs)");
;
var TicketType = /*#__PURE__*/ function(TicketType) {
    TicketType["LOGIN_ISSUES"] = "Login / Password Reset Issues";
    TicketType["HARDWARE_SOFTWARE"] = "New Laptop / Hardware / Software Requests";
    TicketType["VPN_ACCESS"] = "VPN / Remote Access Issues";
    TicketType["APPLICATION"] = "Application Issues";
    TicketType["EMAIL"] = "Email / Outlook Problems";
    TicketType["PRINTER"] = "Printer / Peripheral Issues";
    TicketType["TEAMS"] = "Microsoft Teams / Phone Issues";
    TicketType["SYSTEM"] = "Windows Updates / System Performance";
    return TicketType;
}({});
const TicketDescriptions = {
    ["Login / Password Reset Issues"]: "Password reset, account unlock, and general login assistance",
    ["New Laptop / Hardware / Software Requests"]: "Request new hardware, software, or system access",
    ["VPN / Remote Access Issues"]: "VPN and remote access assistance",
    ["Application Issues"]: "Help with AS400, DealerLink, IBM Notes, etc",
    ["Email / Outlook Problems"]: "Email and Outlook related issues",
    ["Printer / Peripheral Issues"]: "Printer and peripheral device support",
    ["Microsoft Teams / Phone Issues"]: "Microsoft Teams and phone system support",
    ["Windows Updates / System Performance"]: "Windows updates and system performance issues"
};
const ITIssueSchema = new __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].Schema({
    title: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    solution: [
        {
            type: String,
            required: true
        }
    ],
    keywords: [
        {
            type: String,
            index: true
        }
    ],
    category: {
        type: String,
        required: true,
        enum: Object.values(TicketType),
        description: "Type of support ticket"
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Add text search index
ITIssueSchema.index({
    title: "text",
    description: "text",
    keywords: "text"
});
const ITIssue = __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].models.ITIssue || __TURBOPACK__imported__module__$5b$externals$5d2f$mongoose__$5b$external$5d$__$28$mongoose$2c$__cjs$29$__["default"].model("ITIssue", ITIssueSchema);
}),
"[project]/src/lib/prompts.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SUPPORT_PROMPTS",
    ()=>SUPPORT_PROMPTS
]);
const SUPPORT_PROMPTS = [
    {
        icon: "🔑",
        title: "Login / Password Reset Issues",
        subPrompts: [
            {
                text: "I'm locked out of my account",
                keywords: [
                    "locked",
                    "lockout",
                    "can't login",
                    "locked out"
                ]
            },
            {
                text: "I need to reset my password",
                keywords: [
                    "forgot",
                    "password",
                    "reset",
                    "change password"
                ]
            },
            {
                text: "My account is disabled or expired",
                keywords: [
                    "disabled",
                    "expired",
                    "inactive"
                ]
            }
        ]
    },
    {
        icon: "💻",
        title: "New Laptop / Hardware / Software Requests",
        subPrompts: [
            {
                text: "I need a new or replacement laptop",
                keywords: [
                    "new laptop",
                    "replacement",
                    "broken",
                    "hardware"
                ]
            },
            {
                text: "I need software installed",
                keywords: [
                    "software",
                    "install",
                    "program"
                ]
            },
            {
                text: "I need hardware accessories",
                keywords: [
                    "accessories",
                    "mouse",
                    "keyboard",
                    "monitor"
                ]
            }
        ]
    },
    {
        icon: "🌐",
        title: "VPN / Remote Access Issues",
        subPrompts: [
            {
                text: "I can't connect to VPN",
                keywords: [
                    "vpn",
                    "connect",
                    "remote access",
                    "connection"
                ]
            },
            {
                text: "VPN keeps disconnecting",
                keywords: [
                    "vpn disconnect",
                    "unstable",
                    "dropping"
                ]
            },
            {
                text: "VPN is very slow",
                keywords: [
                    "vpn slow",
                    "laggy",
                    "performance"
                ]
            }
        ]
    },
    {
        icon: "📂",
        title: "Application Issues",
        subPrompts: [
            {
                text: "I'm having issues with an application",
                keywords: [
                    "application",
                    "software",
                    "program",
                    "as400",
                    "dealerlink"
                ]
            },
            {
                text: "Application is not responding",
                keywords: [
                    "frozen",
                    "crash",
                    "not responding",
                    "hang"
                ]
            },
            {
                text: "I need access to an application",
                keywords: [
                    "access",
                    "permission",
                    "license"
                ]
            }
        ]
    },
    {
        icon: "📧",
        title: "Email / Outlook Problems",
        subPrompts: [
            {
                text: "Outlook is not working properly",
                keywords: [
                    "outlook",
                    "email",
                    "not working",
                    "issues"
                ]
            },
            {
                text: "I'm not receiving emails",
                keywords: [
                    "not receiving",
                    "missing emails",
                    "delayed"
                ]
            },
            {
                text: "I can't send emails",
                keywords: [
                    "can't send",
                    "sending failed",
                    "outbox"
                ]
            }
        ]
    },
    {
        icon: "🖨️",
        title: "Printer / Peripheral Issues",
        subPrompts: [
            {
                text: "I can't print documents",
                keywords: [
                    "print",
                    "printer",
                    "not printing",
                    "print failed"
                ]
            },
            {
                text: "Printer is not detected",
                keywords: [
                    "printer not found",
                    "not detected",
                    "missing"
                ]
            },
            {
                text: "Scanner is not working",
                keywords: [
                    "scanning",
                    "scanner",
                    "scan failed"
                ]
            }
        ]
    },
    {
        icon: "📞",
        title: "Microsoft Teams / Phone Issues",
        subPrompts: [
            {
                text: "Teams calls are not working",
                keywords: [
                    "teams",
                    "calls",
                    "audio",
                    "voice"
                ]
            },
            {
                text: "Issues with Teams meetings",
                keywords: [
                    "meetings",
                    "conference",
                    "video"
                ]
            },
            {
                text: "Teams is slow or crashing",
                keywords: [
                    "teams slow",
                    "teams crash",
                    "not responding"
                ]
            }
        ]
    },
    {
        icon: "🔄",
        title: "Windows Updates / System Performance",
        subPrompts: [
            {
                text: "My computer is running slow",
                keywords: [
                    "slow",
                    "performance",
                    "laggy",
                    "freezing"
                ]
            },
            {
                text: "Windows updates are failing",
                keywords: [
                    "updates",
                    "windows update",
                    "failed"
                ]
            },
            {
                text: "System is not responding",
                keywords: [
                    "not responding",
                    "frozen",
                    "crash"
                ]
            }
        ]
    }
];
}),
"[project]/src/app/api/chat/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/mongodb.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$ITIssue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/models/ITIssue.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prompts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/prompts.ts [app-route] (ecmascript)");
;
;
;
;
async function POST(req) {
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$mongodb$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["connectDB"])();
        const { message, context = [] } = await req.json();
        // Remove the initial greeting condition since it's handled by the store
        if (context.length === 1) {
            // Find matching solutions for the selected category
            const solutions = await findSolutionsForCategory(message);
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: `Here are some solutions for ${message}:`,
                solutions
            });
        }
        // Find matching prompt category based on message
        const matchingCategory = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$prompts$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["SUPPORT_PROMPTS"].find((category)=>category.subPrompts.some((subPrompt)=>subPrompt.keywords.some((keyword)=>message.toLowerCase().includes(keyword.toLowerCase()))));
        // Server-side mongoose query with category filter
        const query = matchingCategory ? {
            $and: [
                {
                    $text: {
                        $search: message
                    }
                },
                {
                    category: matchingCategory.title
                }
            ]
        } : {
            $text: {
                $search: message
            }
        };
        const solutions = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$models$2f$ITIssue$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["ITIssue"].find(query, {
            score: {
                $meta: "textScore"
            }
        }).sort({
            score: {
                $meta: "textScore"
            }
        }).limit(3).lean();
        if (!solutions.length) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                message: matchingCategory ? `I understand you're having an issue with ${matchingCategory.title.toLowerCase()}. Would you like to create a support ticket?` : "I couldn't find an exact match. Would you like to create a support ticket?",
                solutions: []
            });
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: matchingCategory ? `I understand you're having an issue with ${matchingCategory.title.toLowerCase()}. Here are some possible solutions:` : "I found some possible solutions:",
            solutions: solutions.map((solution)=>({
                    ...solution,
                    id: solution._id.toString()
                }))
        });
    } catch (error) {
        console.error("Chat API Error:", error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            message: "An error occurred while processing your request."
        }, {
            status: 500
        });
    }
}
async function findSolutionsForCategory(category) {
    // Implement your logic to find solutions based on the category
    // This is a placeholder function
    return [];
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__767362bf._.js.map