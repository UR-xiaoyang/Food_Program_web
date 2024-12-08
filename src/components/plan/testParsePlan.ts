// testParsePlan.ts

import { parsePlan, Plan } from './planParser';

const planString = `@plan[
    !title = "计划";
    !time = "2024-12-01";
    !具体内容 = [计划内容1,计划内容2,计划内容3];
    !id = 12345;
]nalp@`;

try {
    const plan: Plan = parsePlan(planString);
    console.log("解析成功:", JSON.stringify(plan, null, 2));
} catch (error: any) {
    console.error("Plan 解析失败:", error.message);
}
