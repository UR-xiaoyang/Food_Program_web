// src/components/planParser.ts

export interface Plan {
    title: string;
    time: string;
    content: string[];
    id: string;
}

export function parsePlan(planString: string): Plan {
    console.log("开始解析计划字符串:", planString);

    // 检查计划字符串是否以 @plan[ 开头并以 ]nalp@ 结尾
    if (!planString.startsWith('@plan[') || !planString.endsWith(']nalp@')) {
        throw new Error('计划格式不正确，必须以 @plan[ 开头并以 ]nalp@ 结尾');
    }

    // 移除 @plan[ 和 ]nalp@
    const content = planString.slice(6, -6).trim();
    console.log("移除 @plan[ 和 ]nalp@ 后的内容:", content);

    // 解析字段
    const title = extractField(content, '!title = "', '";', '标题');
    const time = extractField(content, '!time = "', '";', '执行时间');
    const id = extractField(content, '!id = ', ';', '计划ID');
    const contentArray = extractArray(content, '!具体内容 = [', '];', '具体内容');

    console.log("解析出的标题:", title);
    console.log("解析出的执行时间:", time);
    console.log("解析出的计划ID:", id);
    console.log("解析出的具体内容:", contentArray);

    return {
        title,
        time,
        content: contentArray,
        id,
    };
}

/**
 * 提取字段值的辅助函数
 */
function extractField(content: string, startMarker: string, endMarker: string, fieldName: string): string {
    const startIdx = content.indexOf(startMarker);
    if (startIdx === -1) {
        throw new Error(`缺少 ${fieldName} 字段的 ${startMarker}`);
    }
    const valueStart = startIdx + startMarker.length;
    const valueEnd = content.indexOf(endMarker, valueStart);
    if (valueEnd === -1) {
        throw new Error(`无法找到 ${fieldName} 字段的结束标记 ${endMarker}`);
    }
    return content.substring(valueStart, valueEnd).trim();
}

/**
 * 提取数组字段的辅助函数
 */
function extractArray(content: string, startMarker: string, endMarker: string, fieldName: string): string[] {
    const startIdx = content.indexOf(startMarker);
    if (startIdx === -1) {
        throw new Error(`缺少 ${fieldName} 字段的 ${startMarker}`);
    }
    const arrayStart = startIdx + startMarker.length;
    const arrayEnd = content.indexOf(endMarker, arrayStart);
    if (arrayEnd === -1) {
        throw new Error(`无法找到 ${fieldName} 字段的结束标记 ${endMarker}`);
    }
    const arrayContent = content.substring(arrayStart, arrayEnd).trim();
    console.log(`解析出的 ${fieldName} 内容:`, arrayContent);

    // 分割数组项，假设每个内容项之间用逗号分隔，且内容中没有嵌套的逗号
    if (!arrayContent) {
        return [];
    }
    return arrayContent.split(',').map(item => item.trim());
}
