/* START OF MODIFIED FILE script.js */
// --- Polyfills and Helper Functions ---
if (typeof btoa === 'undefined') {
    global.btoa = function (str) { return Buffer.from(str, 'binary').toString('base64'); };
}
if (typeof atob === 'undefined') {
    global.atob = function (b64Encoded) { return Buffer.from(b64Encoded, 'base64').toString('binary'); };
}
function randomChoice(arr) {
    if (!arr || arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
}
function range(start, end) {
    return Array.from({ length: end - start }, (_, i) => start + i);
}

// --- Constants ---
const vocab = `
安静 安全 安稳 安详 暗黑 昂贵 饱满 奔放 必要 便宜
缤纷 博大 灿烂 常见 畅快 超凡 沉稳 成熟 诚恳 诚实
橙黄 持久 炽热 充分 充实 充足 崇高 出色 纯白 纯粹
纯洁 纯净 纯真 淳朴 慈祥 刺激 聪明 璀璨 大胆 大方
单纯 低调 顶级 动听 端正 端庄 多彩 繁华 繁荣 方便
芳香 放心 绯红 丰富 丰满 丰盛 风趣 富有 富裕 甘甜
高大 高贵 高级 高尚 高兴 高雅 关键 光滑 果断 憨厚
罕见 豪华 豪迈 豪爽 好奇 浩瀚 合理 合适 和蔼 和谐
华丽 欢快 欢乐 诙谐 辉煌 活泼 活跃 火爆 火热 机灵
机智 积极 激动 激情 坚定 坚固 坚决 坚强 简洁 简约
健康 杰出 洁净 金黄 谨慎 经典 惊喜 惊讶 精彩 精巧
精确 精细 精致 绝妙 开朗 开心 慷慨 可靠 可口 刻苦
酷炫 快活 快乐 烂漫 浪漫 乐观 冷静 理性 理智 励志
廉洁 凉爽 辽阔 灵活 灵敏 灵巧 流畅 流利 流行 鎏金
麻利 满意 曼妙 茂盛 美观 美丽 美满 美妙 美味 朦胧
梦幻 苗条 敏感 敏锐 明亮 明智 耐心 耐用 宁静 浓密
浓郁 暖和 蓬勃 漂亮 平淡 平凡 平和 平静 朴素 普通
齐整 奇妙 奇特 奇异 谦逊 强大 强壮 亲密 亲切 勤奋
勤快 勤劳 轻快 轻巧 轻柔 轻盈 清澈 清楚 清纯 清淡
清爽 清晰 清新 清醒 热忱 热烈 热门 热闹 热情 热心
仁慈 容易 柔和 柔软 如意 儒雅 洒脱 闪烁 闪耀 善良
深奥 深沉 深情 神奇 神圣 慎重 生动 湿润 时髦 时尚
适当 舒畅 舒服 舒适 帅气 顺利 斯文 素雅 坦率 桃红
尊贵 特殊 体面 体贴 天青 天真 甜美 甜蜜 通俗 通透
透明 完美 顽强 旺盛 蔚蓝 温和 温暖 温柔 温婉 温馨
温驯 稳定 乌黑 细腻 细心 细致
`.trim().split(/\s+/);
const vocabDict = new Map(vocab.map((word, idx) => [word, idx]));
const url_group1_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const url_group2_chars = [".", "/", "-", "_", " ", ".com", "www.", ".cn", ".org", ".net"];
const url_group3_chars = ["%", "#", "@", ".xyz", ".top", ".club", ".info", ".cc", ".tv", ".me"];
const id_group1_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const id_group2_chars = ["-", "_", ".", "#", "+"];
const abc_group1_chars = [" "];
const abc_group2_chars = ["e", "t", "a", "o", "i", "n", "s", "h", "r", "l", "E", "T", "A", "O", "I", "N", "S", "H", "R", "L"];
const abc_group3_chars = ["b", "c", "d", "f", "g", "j", "k", "m", "p", "q", "u", "v", "w", "x", "y", "z", "B", "C", "D", "F", "G", "J", "K", "M", "P", "Q", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const abc_group4_chars = [".", ",", "?", "!", "-", "_", ":", "@", "#", "/"];
const abc_group5_chars = ['"', "'", ";", "$", "%", "&", "+", "=", "(", ")", "<", ">", "[", "]", "{", "}", "\\", "|", "~", "^", "*", "`"];
const CHINESE_UNICODE_START = 0x4e00;
const CHINESE_UNICODE_END = 0x9fff;
const CHINESE_HEX_FIRST_CHARS = Array.from({ length: 0xa0 - 0x4e }, (_, i) => (0x4e + i).toString(16).padStart(2, '0'));

// --- REMOVED DEFAULT_API_KEYS ---
// const DEFAULT_API_KEYS = { ... }; // Removed

// --- Provider Config (REMOVED default_key) ---
const PROVIDER_CONFIG = {
    "Grok-3": { provider: "XAI", base_url: "https://api.x.ai/v1", model_param: "grok-3" /* REMOVED default_key */ },
    "Doubao-1.5-pro-256k": { provider: "火山引擎", base_url: "https://ark.cn-beijing.volces.com/api/v3", model_param: "doubao-1-5-pro-256k-250115" /* REMOVED default_key */ },
    "Deepseek-v3.0": { provider: "硅基流动", base_url: "https://api.siliconflow.cn/v1", model_param: "deepseek-ai/DeepSeek-V3" /* REMOVED default_key */ },
    "private": { provider: "private" }
};
const PRIVATE_PROVIDER_CONFIG = {
    "DeepSeek.com": { base_url: "https://api.deepseek.com", models: { "Deepseek-v3.0": "deepseek-chat", "Deepseek-vR1": "deepseek-reasoner" } },
    "火山引擎": { base_url: "https://ark.cn-beijing.volces.com/api/v3", models: { "Doubao-1.5-pro-32k": "doubao-1-5-pro-32k-250115", "Doubao-1.5-pro-256k": "doubao-1-5-pro-256k-250115" } },
    "硅基流动": { base_url: "https://api.siliconflow.cn/v1", models: { "Deepseek-v3.0": "deepseek-ai/DeepSeek-V3", "Deepseek-vR1": "deepseek-ai/DeepSeek-R1" } },
    "阿里百练": { base_url: "https://dashscope.aliyuncs.com/compatible-mode/v1", models: { "Deepseek-v3.0": "deepseek-v3", "Deepseek-vR1": "deepseek-r1" } },
    "NVIDIA": { base_url: "https://integrate.api.nvidia.com/v1", models: { "Deepseek-vR1": "deepseek-ai/deepseek-r1" } },
    "Grok x.com": { base_url: "https://api.x.ai/v1", models: { "Grok-3-mini": "grok-3-mini-latest", "Grok-3": "grok-3-latest" } }
};
const url_allowed_single_special = new Set([...url_group2_chars, ...url_group3_chars].filter(c => c.length === 1));
const url_allowed_chars_set = new Set([...url_group1_chars, ...url_allowed_single_special]);

// --- SUPABASE SETUP (Unchanged) ---
const SUPABASE_URL = 'https://gfdxqztbvtuohqwtpduz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZHhxenRidnR1b2hxd3RwZHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1NjM0MzUsImV4cCI6MjA2MTEzOTQzNX0.yanY3QonTT5FzHNwGC6oK_lYP7O4H8Q70dPL3mZZglE';
let supabase = null;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log("Supabase client initialized.");
    } else {
        console.error("Supabase client library not loaded.");
    }
} catch (error) {
    console.error("Error initializing Supabase client:", error);
}
// --- Supabase Logging Function (Unchanged) ---
async function logOperationToSupabase(logData) { /* ... unchanged ... */
    if (!supabase) { return; }
    const dataToInsert = {
        status: logData.status,
        user_input: logData.userInput,
        theme: logData.theme || null,
        generated_text: logData.generatedText || null,
        mode: logData.mode,
        subtype: logData.subtype || null,
        model_used: logData.modelUsed || null,
        error_message: logData.errorMessage || null
    };
    try {
        const { error } = await supabase.from('operation_logs').insert([dataToInsert]);
        if (error) { console.error('Error logging to Supabase:', error); }
    } catch (error) { console.error('Exception during Supabase logging:', error); }
}

// --- Encoding/Decoding Logic (Core functions - unchanged) ---
function url_char_to_vocab_index(ch) { /* ... unchanged ... */
    let i = url_group1_chars.indexOf(ch); if (i !== -1) return [i, i + 62, i + 124].filter(idx => idx < vocab.length);
    i = url_group2_chars.indexOf(ch); if (i !== -1) { const start = 186 + i * 5; return range(start, start + 5).filter(idx => idx < vocab.length); }
    i = url_group3_chars.indexOf(ch); if (i !== -1) { const start = 236 + i * 2; return range(start, start + 2).filter(idx => idx < vocab.length); } return [];
}
function id_char_to_vocab_index(ch) { /* ... unchanged ... */
    let i = id_group1_chars.indexOf(ch); if (i !== -1) return [i, i + 62, i + 124].filter(idx => idx < vocab.length);
    i = id_group2_chars.indexOf(ch); if (i !== -1) { const start = 186 + i * 14; return range(start, start + 14).filter(idx => idx < vocab.length); } return [];
}
function abc_char_to_vocab_index(ch) { /* ... unchanged ... */
    if (ch === ' ') return range(0, 8); let i = abc_group2_chars.indexOf(ch); if (i !== -1) { const start = 8 + i * 4; return range(start, start + 4).filter(idx => idx < vocab.length); }
    i = abc_group3_chars.indexOf(ch); if (i !== -1) { const start = 88 + i * 3; return range(start, start + 3).filter(idx => idx < vocab.length); }
    i = abc_group4_chars.indexOf(ch); if (i !== -1) { const start = 214 + i * 2; return range(start, start + 2).filter(idx => idx < vocab.length); }
    i = abc_group5_chars.indexOf(ch); if (i !== -1) { const vocab_index = 234 + i; return vocab_index < vocab.length ? [vocab_index] : []; } return [];
}
function chinese_to_words(text) { /* ... unchanged ... */
    if (text.length > 10) throw new Error("文本长度超过限制，最多支持10个字符。"); let result_words = [];
    for (const char of text) { const charCode = char.charCodeAt(0); if (!(charCode >= CHINESE_UNICODE_START && charCode <= CHINESE_UNICODE_END)) continue;
        const hexCode = charCode.toString(16).padStart(4, '0'); const firstHex = hexCode.substring(0, 2); const secondHex = hexCode.substring(2, 4);
        const firstHexIndex = CHINESE_HEX_FIRST_CHARS.indexOf(firstHex); if (firstHexIndex !== -1) { const firstIndices = [firstHexIndex, firstHexIndex + 82, firstHexIndex + 164]; const validIndices = firstIndices.filter(idx => idx < vocab.length); if (validIndices.length > 0) result_words.push(vocab[randomChoice(validIndices)]); }
        const secondIndex = parseInt(secondHex, 16); if (secondIndex < vocab.length) result_words.push(vocab[secondIndex]); }
    return result_words.map((w, i) => `${i + 1}. ${w}`).join(' ');
}
function magnet_to_words(magnet) { /* ... unchanged ... */
    let hexStr = ""; if (magnet.startsWith("magnet:?xt=urn:btih:")) hexStr = magnet.split("urn:btih:")[1].toUpperCase(); else if (magnet.startsWith("0x")) hexStr = magnet.substring(2).toUpperCase(); else throw new Error("输入的暗语格式不支持转换");
    if (!/^[0-9A-F]{40}$/.test(hexStr)) throw new Error("磁力或地址格式无效 (需要40个十六进制字符)"); const pairs = hexStr.match(/.{1,2}/g) || []; const indices = pairs.map(pair => parseInt(pair, 16)); const valid_words = indices.map(idx => idx < vocab.length ? vocab[idx] : null).filter(w => w !== null);
    return valid_words.map((word, i) => `${i + 1}. ${word}`).join(' ');
}
function url_to_words(url) { /* ... unchanged ... */
    let remainder = ""; let prefix = ""; if (url.startsWith("https://t.me/")) { prefix = "https://t.me/"; remainder = url.substring(prefix.length); } else if (url.startsWith("https://")) { prefix = "https://"; remainder = url.substring(prefix.length); } else throw new Error("输入的链接前缀不支持。");
    const result_words = []; let i = 0; const sortedSpecialChars = [...url_group2_chars, ...url_group3_chars].sort((a, b) => b.length - a.length);
    while (i < remainder.length) { let matched = false; for (const specialChar of sortedSpecialChars) { if (remainder.substring(i, i + specialChar.length).toLowerCase() === specialChar.toLowerCase()) { const candidates = url_char_to_vocab_index(specialChar); if (candidates.length > 0) { const chosenIndex = randomChoice(candidates); if (chosenIndex < vocab.length) result_words.push(vocab[chosenIndex]); } i += specialChar.length; matched = true; break; } } if (matched) continue;
        const ch = remainder[i]; const candidates = url_char_to_vocab_index(ch); if (candidates.length > 0) { const chosenIndex = randomChoice(candidates); if (chosenIndex < vocab.length) result_words.push(vocab[chosenIndex]); } else console.warn(`Unsupported URL character skipped: ${ch}`); i++; }
    return result_words.map((w, i) => `${i + 1}. ${w}`).join(' ');
}
function id_to_words(id_str) { /* ... unchanged ... */
    if (!id_str.startsWith("@")) throw new Error("输入的ID前缀不支持，必须以@开头。"); const remainder = id_str.substring(1); if (remainder.length > 30) throw new Error("ID长度超过限制，最多支持30个字符。");
    const validChars = new Set([...id_group1_chars, ...id_group2_chars]); for (const ch of remainder) if (!validChars.has(ch)) throw new Error(`ID包含不支持的字符: ${ch}`);
    const result_words = []; for (const ch of remainder) { const candidates = id_char_to_vocab_index(ch); if (candidates.length > 0) { const chosenIndex = randomChoice(candidates); if (chosenIndex < vocab.length) result_words.push(vocab[chosenIndex]); } }
    return result_words.map((w, i) => `${i + 1}. ${w}`).join(' ');
}
function abc_to_words(text) { /* ... unchanged ... */
    if (text.length > 30) throw new Error("文本长度超过限制，最多支持30个字符。"); for (const ch of text) { const code = ch.charCodeAt(0); if (!(code >= 32 && code <= 126)) throw new Error(`文本包含不支持的字符: ${ch}，仅支持Unicode 32-126范围内的字符。`); }
    const result_words = []; for (const ch of text) { const candidates = abc_char_to_vocab_index(ch); if (candidates.length > 0) { const chosenIndex = randomChoice(candidates); if (chosenIndex < vocab.length) result_words.push(vocab[chosenIndex]); } }
    return result_words.map((w, i) => `${i + 1}. ${w}`).join(' ');
}
function findWordPositions(text) { /* ... unchanged ... */
    const wordPositions = []; const escapedVocab = vocab.map(word => word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')); const regex = new RegExp(`(${escapedVocab.join('|')})`, 'g'); let match;
    while ((match = regex.exec(text)) !== null) wordPositions.push({ index: match.index, word: match[1] }); wordPositions.sort((a, b) => a.index - b.index); return wordPositions;
}
function words_to_magnet(text, prefix) { /* ... unchanged ... */
    const wordPositions = findWordPositions(text); const hex_pairs = wordPositions.map(({ word }) => { const idx = vocabDict.get(word); return idx !== undefined ? idx.toString(16).padStart(2, '0').toUpperCase() : ''; }).filter(hex => hex !== ''); const hex_string = hex_pairs.join('');
    if (prefix === "magnet:?xt=urn:btih:") return `${prefix}${hex_string}`; else if (prefix === "0x") return `${prefix}${hex_string}`; else { console.warn("Unexpected prefix in words_to_magnet:", prefix); return `magnet:?xt=urn:btih:${hex_string}`; }
}
function words_to_url(text, prefix) { /* ... unchanged ... */
    const wordPositions = findWordPositions(text); let reconstructed = ""; for (const { word } of wordPositions) { const idx = vocabDict.get(word); if (idx === undefined) continue; let ch = "";
        if (idx >= 0 && idx < 62) ch = url_group1_chars[idx]; else if (idx >= 62 && idx < 124) ch = url_group1_chars[idx - 62]; else if (idx >= 124 && idx < 186) ch = url_group1_chars[idx - 124];
        else if (idx >= 186 && idx < 236) { const offset = idx - 186; const groupIndex = Math.floor(offset / 5); if (groupIndex < url_group2_chars.length) ch = url_group2_chars[groupIndex]; }
        else if (idx >= 236 && idx < 256) { const offset = idx - 236; const groupIndex = Math.floor(offset / 2); if (groupIndex < url_group3_chars.length) ch = url_group3_chars[groupIndex]; } reconstructed += ch; }
    return prefix + reconstructed;
}
function words_to_id(text, prefix = "@") { /* ... unchanged ... */
    const wordPositions = findWordPositions(text); let reconstructed = ""; for (const { word } of wordPositions) { const idx = vocabDict.get(word); if (idx === undefined) continue; let ch = "";
        if (idx >= 0 && idx < 62) ch = id_group1_chars[idx]; else if (idx >= 62 && idx < 124) ch = id_group1_chars[idx - 62]; else if (idx >= 124 && idx < 186) ch = id_group1_chars[idx - 124];
        else if (idx >= 186 && idx < 256) { const offset = idx - 186; const groupIndex = Math.floor(offset / 14); if (groupIndex < id_group2_chars.length) ch = id_group2_chars[groupIndex]; } reconstructed += ch; }
    return prefix + reconstructed;
}
function words_to_abc(text) { /* ... unchanged ... */
    const wordPositions = findWordPositions(text); let reconstructed = ""; for (const { word } of wordPositions) { const idx = vocabDict.get(word); if (idx === undefined) continue; let ch = "";
        if (idx >= 0 && idx <= 7) ch = " "; else if (idx >= 8 && idx <= 87) { const letter_idx = Math.floor((idx - 8) / 4); if (letter_idx < abc_group2_chars.length) ch = abc_group2_chars[letter_idx]; }
        else if (idx >= 88 && idx <= 213) { const char_idx = Math.floor((idx - 88) / 3); if (char_idx < abc_group3_chars.length) ch = abc_group3_chars[char_idx]; }
        else if (idx >= 214 && idx <= 233) { const symbol_idx = Math.floor((idx - 214) / 2); if (symbol_idx < abc_group4_chars.length) ch = abc_group4_chars[symbol_idx]; }
        else if (idx >= 234 && idx < 234 + abc_group5_chars.length) { const symbol_idx = idx - 234; if (symbol_idx < abc_group5_chars.length) ch = abc_group5_chars[symbol_idx]; } reconstructed += ch; }
    return reconstructed;
}
function words_to_chinese(text) { /* ... unchanged ... */
    const wordPositions = findWordPositions(text); let reconstructed = ""; let i = 0; while (i < wordPositions.length - 1) { const firstWord = wordPositions[i].word; const secondWord = wordPositions[i + 1].word; const firstIdx = vocabDict.get(firstWord); const secondIdx = vocabDict.get(secondWord);
        if (firstIdx !== undefined && secondIdx !== undefined) { const hexFirstIndex = firstIdx % 82; if (hexFirstIndex < CHINESE_HEX_FIRST_CHARS.length) { const hexFirst = CHINESE_HEX_FIRST_CHARS[hexFirstIndex]; const hexSecond = secondIdx.toString(16).padStart(2, '0'); const hexCode = hexFirst + hexSecond; try { const charCode = parseInt(hexCode, 16); if (charCode >= CHINESE_UNICODE_START && charCode <= CHINESE_UNICODE_END) reconstructed += String.fromCharCode(charCode); } catch (e) { console.error(`Failed to convert hex ${hexCode} to char`, e); } } } i += 2; }
    return reconstructed;
}

// --- AI Interaction & Prompt Generation (Unchanged) ---
function print_vocab_list(word_list) { /* ... unchanged ... */
    let formatted_text = ""; for (let i = 0; i < word_list.length; i += 10) formatted_text += word_list.slice(i, i + 10).join(' ') + '\n'; return formatted_text.trim();
}
function get_forbidden_words(must_use_words_text) { /* ... unchanged ... */
    const allowed_words = (must_use_words_text.match(/\d+\.\s*([^\s]+)/g) || []).map(match => match.replace(/\d+\.\s*/, '')); const allowedSet = new Set(allowed_words); const forbidden_words = vocab.filter(word => !allowedSet.has(word)); return print_vocab_list(forbidden_words);
}
function count_punctuations(text) { /* ... unchanged ... */
    const matches = text.match(/[，。！]/g); return matches ? matches.length : 0;
}
function extract_first_seven_punctuations(text) { /* ... unchanged ... */
    const punctuations = (text.match(/[，。！]/g) || []).slice(0, 7); return punctuations.join('');
}
function clean_generated_text(text) { /* ... unchanged ... */
    let cleaned = text.replace(/<think>.*?<\/think>/gs, ''); cleaned = cleaned.replace(/\*/g, ''); cleaned = cleaned.replace(/^\d+\.\s*/gm, ''); return cleaned.trim();
}
function replace_punctuations(text, new_punctuations_str) { /* ... unchanged ... */
    const textChars = text.split(''); const newPunctuations = new_punctuations_str.split(''); let replacementIndex = 0; let i = 0; let lastWasPunc = false;
    while (i < textChars.length && replacementIndex < newPunctuations.length) { if (['，', '。', '！'].includes(textChars[i])) { if (!lastWasPunc) { textChars[i] = newPunctuations[replacementIndex]; replacementIndex++; lastWasPunc = true; } else { textChars.splice(i, 1); i--; } } else { lastWasPunc = false; } i++; }
    while(i < textChars.length) { if (['，', '。', '！'].includes(textChars[i]) && lastWasPunc) { textChars.splice(i, 1); i--; } else { lastWasPunc = ['，', '。', '！'].includes(textChars[i]); } i++; } return textChars.join('');
}
function current_ask_ai_text(must_use_words, theme_text = "美好生活") { /* ... unchanged ... */
    if (!must_use_words || typeof must_use_words !== 'string') throw new Error("must_use_words 参数不能为空且必须是字符串类型"); const forbidden_words_list = get_forbidden_words(must_use_words); const required_word_count = (must_use_words.match(/\d+\./g) || []).length; let extra_condition = ""; if (required_word_count < 7) extra_condition = '\n四、"，" 也可视为一句话，短文不得少于七句话。'; const finalTheme = theme_text && theme_text.trim() !== "" ? theme_text.trim() : "美好生活";
    return `\n你的任务是严格按照以下要求生成一段短文：\n一、这段短文主题为“${finalTheme}”，语言流畅、自然、简短。\n二、必须使用以下词汇，必须严格按照词汇前面的编号依次出现在短文中，不得跳跃、调序、缺失、重复，除非词汇本来就有重复的：\n<required>\n${must_use_words}\n</required>\n三、绝对禁止使用以下词汇（这些词汇绝对不能出现在短文里）：\n<banned>\n${forbidden_words_list}\n</banned>${extra_condition}\n仅返回短文内容，不要包含任何额外解释或说明。\n`.trim();
}

// --- MODIFIED ask_ai for Streaming (Unchanged function itself) ---
async function ask_ai(apiKey, prompt, baseUrl, model, onChunkReceived, onComplete, onError) { /* ... unchanged ... */
    const effectiveBaseUrl = baseUrl || "https://api.siliconflow.cn/v1";
    const effectiveModel = model || "deepseek-ai/DeepSeek-V3";
    console.log("Sending streaming request to:", effectiveBaseUrl);
    console.log("Using model:", effectiveModel);

    try {
        const response = await fetch(effectiveBaseUrl + (effectiveBaseUrl.endsWith('/') ? '' : '/') + 'chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify({
                model: effectiveModel,
                messages: [{ role: "user", content: prompt }],
                stream: true
            })
        });

        if (!response.ok) {
            let errorBody = "No details provided";
            try { const errorJson = await response.json(); if (errorJson.error && errorJson.error.message) { errorBody = errorJson.error.message; } else { errorBody = JSON.stringify(errorJson); } } catch (e) { try { errorBody = await response.text(); } catch (textErr) { errorBody = "Failed to read error details."; } }
            throw new Error(`API request failed: ${response.status} ${response.statusText}. Details: ${errorBody}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        while (true) {
            const { done, value } = await reader.read();
            if (done) { console.log("Stream finished."); break; }
            buffer += decoder.decode(value, { stream: true });
            let lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const dataStr = line.substring(6).trim();
                    if (dataStr === "[DONE]") { console.log("Received [DONE] marker."); continue; }
                    try {
                        const data = JSON.parse(dataStr);
                        if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                            const chunk = data.choices[0].delta.content;
                            if (chunk) { onChunkReceived(chunk); }
                        }
                    } catch (e) { console.warn("Failed to parse stream data JSON:", e, "Data:", dataStr); }
                }
            }
        }
        if (buffer.trim().length > 0) {
             console.log("Processing final buffer content:", buffer);
             if (buffer.startsWith("data: ")) {
                 const dataStr = buffer.substring(6).trim();
                 if (dataStr !== "[DONE]") {
                      try {
                          const data = JSON.parse(dataStr);
                           if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                               const chunk = data.choices[0].delta.content;
                               if (chunk) onChunkReceived(chunk);
                           }
                      } catch(e) { console.warn("Failed to parse final buffer JSON:", e, "Data:", dataStr); }
                 }
             }
        }
        onComplete();
    } catch (error) {
        console.error("API stream request failed:", error);
        const displayError = error.message.includes("Details:") ? error.message.split("Details:")[1].trim() : error.message;
        onError(`API 请求失败: ${displayError}`);
    }
}

// --- UI Interaction & Event Listeners ---

// DOM Elements (Unchanged)
const userInput = document.getElementById('userInput'); /* ... other elements ... */
const userApiKeyInput = document.getElementById('userApiKey');
const providerSelectionContainer = document.getElementById('providerSelection');
const modelSelectionPrivateContainer = document.getElementById('modelSelectionPrivate');
const outputSection = document.getElementById('outputSection');
const loadingIndicator = document.getElementById('loadingIndicator');
const outputContentWrapper = document.querySelector('.output-content-wrapper');
const outputText = document.getElementById('outputText');
const toastElement = document.getElementById('toast');
const toastIcon = document.getElementById('toastIcon');
const toastMessage = document.getElementById('toastMessage');
const copyButton = document.getElementById('copyButton');
const currentTypeIcon = document.getElementById('currentTypeIcon');
const typeIconStore = document.getElementById('typeIconStore');
const topicSelector = document.querySelector('.topic-selector');
const topicInput = document.getElementById('topicInput');
const topicIcon = document.getElementById('icon-action-topic');
const topicOptionContainer = document.querySelector('.topic-option');
const modelSelector = document.querySelector('.ai-model-selector');
const currentModelIcon = document.getElementById('icon-action-model');
const modelOptionsContainer = document.querySelector('.model-options');
const goIcon = document.getElementById('icon-action-go');
const apiKeyIcon = document.getElementById('icon-action-apikey');
const apiKeyModal = document.getElementById('apiKeyModal');
const modalBackdrop = document.getElementById('modalBackdrop');

// State Variables
let currentMode = null;
let currentSubtype = null;
let toastTimeout = null;
let selectedModel = 'Grok-3';
let selectedProvider = null;
let selectedPrivateModel = null;
let currentApiKey = '';
let fetchedDefaultKeys = null; // --- NEW: Store fetched default keys ---
let defaultKeysLoading = false; // --- NEW: Flag for key loading state ---


// --- Helper Functions (Unchanged) ---
function showToast(message, icon = 'ℹ️', duration = 3000) { /* ... unchanged ... */
    if (toastTimeout) clearTimeout(toastTimeout); toastMessage.textContent = message; toastIcon.textContent = icon; toastElement.classList.remove('hidden'); void toastElement.offsetWidth; toastTimeout = setTimeout(() => { toastElement.classList.add('hidden'); }, duration);
}
function showLoading(isStreaming = false) { /* ... unchanged ... */
    outputSection.classList.remove('hidden'); goIcon.setAttribute('disabled', true); userInput.disabled = true; outputText.style.color = 'var(--text-color)';
    if (isStreaming) { loadingIndicator.classList.add('hidden'); outputContentWrapper.classList.remove('hidden'); outputText.textContent = ''; copyButton.disabled = true; }
    else { loadingIndicator.classList.remove('hidden'); outputContentWrapper.classList.add('hidden'); outputText.textContent = ''; }
}
function hideLoading() { /* ... unchanged ... */
    loadingIndicator.classList.add('hidden');
     if (currentMode || outputText.textContent) { goIcon.removeAttribute('disabled'); determineModeAndUpdateIcon(userInput.value); }
     else { goIcon.setAttribute('disabled', true); goIcon.dataset.tooltip = "执行 (请先输入有效内容)"; }
    userInput.disabled = false;
}
function displayOutput(text, isError = false) { /* ... unchanged ... */
    outputText.textContent = text; outputText.style.color = isError ? 'var(--destructive-color)' : 'var(--text-color)'; outputSection.classList.remove('hidden'); outputContentWrapper.classList.remove('hidden'); copyButton.disabled = false;
}
function displayError(message) { /* ... unchanged ... */
    displayOutput(`错误：${message}`, true); showToast(message, '😅'); outputContentWrapper.classList.remove('hidden');
}
function validate_url_text(text, max_tokens = 30) { /* ... unchanged ... */
     if (text.length > max_tokens) return false; let i = 0; const sortedSpecialChars = [...url_group2_chars, ...url_group3_chars].sort((a, b) => b.length - a.length); while (i < text.length) { let matchedSpecial = false; for (const special of sortedSpecialChars) { if (text.substring(i, i + special.length).toLowerCase() === special.toLowerCase()) { i += special.length; matchedSpecial = true; break; } } if (matchedSpecial) continue; if (!url_allowed_chars_set.has(text[i])) return false; i++; } return true;
}

// --- Mode Determination & Icon Update (Unchanged) ---
function determineModeAndUpdateIcon(input) { /* ... unchanged ... */
    const trimmedInput = input.trim(); let determinedMode = null; let determinedSubtype = null; let iconDataType = 'text';
    currentTypeIcon.classList.remove('active'); const puncCount = count_punctuations(trimmedInput);
    if (puncCount >= 7) { determinedMode = "decode"; determinedSubtype = null; iconDataType = 'decode'; }
    else if (trimmedInput.startsWith("magnet:?xt=urn:btih:")) { const hexPart = trimmedInput.substring("magnet:?xt=urn:btih:".length); if (/^[0-9a-fA-F]{40}$/.test(hexPart)) { determinedMode = "embed"; determinedSubtype = "magnet"; iconDataType = 'magnet'; } else { showToast("磁力链接格式无效", '😅'); } }
    else if (trimmedInput.startsWith("0x")) { const address = trimmedInput.substring(2); if (/^[0-9a-fA-F]{40}$/.test(address)) { determinedMode = "embed"; determinedSubtype = "wallet"; iconDataType = 'wallet'; } else { showToast("钱包地址格式无效", '😅'); } }
    else if (trimmedInput.startsWith("https://t.me/")) { const rest = trimmedInput.substring("https://t.me/".length); if (rest.length > 0 && validate_url_text(rest, 30)) { determinedMode = "embed"; determinedSubtype = "telegram"; iconDataType = 'telegram'; } else if (rest.length > 0) { showToast("Telegram 链接内容无效或过长", '😅'); } }
    else if (trimmedInput.startsWith("https://")) { const rest = trimmedInput.substring("https://".length); if (rest.length > 0 && validate_url_text(rest, 30)) { determinedMode = "embed"; determinedSubtype = "url"; iconDataType = 'url'; } else if (rest.length > 0) { showToast("网址内容无效或过长", '😅'); } }
    else if (trimmedInput.startsWith("@")) { const idBody = trimmedInput.substring(1); if (idBody.length > 0 && idBody.length <= 30) { const validChars = new Set([...id_group1_chars, ...id_group2_chars]); let isValid = true; for (const ch of idBody) if (!validChars.has(ch)) { isValid = false; showToast(`ID 包含不支持的字符: ${ch}`, '😅'); break; } if (isValid) { determinedMode = "embed"; determinedSubtype = "id"; iconDataType = 'id'; } } else if (idBody.length > 30) { showToast("ID 长度不能超过 30 个字符", '😅'); } }
    else if (trimmedInput.length > 0) { if (/^[\u4e00-\u9fff]+$/.test(trimmedInput)) { if (trimmedInput.length <= 10) { determinedMode = "embed"; determinedSubtype = "chinese"; iconDataType = 'chinese'; } else { showToast("中文文本长度不能超过 10 个汉字", '😅'); } } else if (/^[\x20-\x7E]+$/.test(trimmedInput)) { if (trimmedInput.length <= 30) { determinedMode = "embed"; determinedSubtype = "ascii"; iconDataType = 'ascii'; } else { showToast("英文/符号文本长度不能超过 30 个字符", '😅'); } } else { showToast("输入格式无法识别或包含不支持的字符", '😅'); } }

    const iconData = typeIconStore.querySelector(`img[data-type="${iconDataType}"]`);
    if (iconData) { currentTypeIcon.src = iconData.src; currentTypeIcon.alt = iconData.alt; currentTypeIcon.dataset.tooltip = iconData.dataset.tooltip || "当前检测类型"; currentTypeIcon.dataset.currentType = iconDataType; if (determinedMode) { currentTypeIcon.classList.add('active'); } }
    else { console.warn("Icon data missing for type:", iconDataType); const defaultIconData = typeIconStore.querySelector(`img[data-type="text"]`); if (defaultIconData) { currentTypeIcon.src = defaultIconData.src; currentTypeIcon.alt = defaultIconData.alt; currentTypeIcon.dataset.tooltip = defaultIconData.dataset.tooltip || "当前检测类型"; currentTypeIcon.dataset.currentType = 'text'; } }

    currentMode = determinedMode; currentSubtype = determinedSubtype;
    if (currentMode && !userInput.disabled) { goIcon.removeAttribute('disabled'); goIcon.dataset.tooltip = currentMode === 'embed' ? `执行植入 (${currentSubtype}) (回车)` : "执行提取 (回车)"; }
    else if (!userInput.disabled) { goIcon.setAttribute('disabled', true); goIcon.dataset.tooltip = "执行 (请先输入有效内容)"; }
}

// --- Event Handlers (Unchanged) ---
userInput.addEventListener('input', () => { /* ... unchanged ... */
    determineModeAndUpdateIcon(userInput.value); outputSection.classList.add('hidden'); outputContentWrapper.classList.add('hidden'); outputText.textContent = ''; outputText.style.color = 'var(--text-color)';
});
userInput.addEventListener('keydown', (event) => { /* ... unchanged ... */
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); if (!goIcon.hasAttribute('disabled')) { goIcon.click(); } else { if (userInput.disabled) { showToast("请等待当前操作完成", "⏳"); } else { showToast("请先输入有效的内容", "🤔"); } } }
});
topicIcon.addEventListener('click', (event) => { /* ... unchanged ... */
    event.stopPropagation(); topicSelector.classList.toggle('open'); if (topicSelector.classList.contains('open')) { topicInput.focus(); modelSelector.classList.remove('open'); }
});
currentModelIcon.addEventListener('click', (event) => { /* ... unchanged ... */
    event.stopPropagation(); modelSelector.classList.toggle('open'); if (modelSelector.classList.contains('open')) { topicSelector.classList.remove('open'); }
});
document.addEventListener('click', (event) => { /* ... unchanged ... */
    if (!modelSelector.contains(event.target) && !modelOptionsContainer.contains(event.target)) { modelSelector.classList.remove('open'); }
    if (!topicSelector.contains(event.target) && !topicOptionContainer.contains(event.target)) { topicSelector.classList.remove('open'); }
});
modelOptionsContainer.addEventListener('click', (event) => { /* ... unchanged ... */
    const clickedIcon = event.target.closest('.model-option-icon');
    if (clickedIcon) {
        const newModel = clickedIcon.dataset.model; const optionTooltip = clickedIcon.dataset.tooltip || clickedIcon.alt;
        if (newModel === 'private') { openApiKeyModal(); }
        else { selectedModel = newModel; currentModelIcon.src = clickedIcon.src; currentModelIcon.alt = clickedIcon.alt; currentModelIcon.dataset.tooltip = `模型: ${optionTooltip}`; currentModelIcon.dataset.model = newModel; showToast(`已选择模型: ${newModel}`, '🤖'); }
        modelSelector.classList.remove('open');
    }
});
goIcon.addEventListener('click', () => { /* ... unchanged ... */
    if (goIcon.hasAttribute('disabled')) return;
    if (!currentMode) { showToast("无法确定操作模式，请检查输入内容", '🤔'); return; }
    if (currentMode === 'embed') handleEmbed();
    else if (currentMode === 'decode') handleDecode();
});
copyButton.addEventListener('click', () => { /* ... unchanged ... */
    const textToCopy = outputText.textContent; if (!textToCopy) { showToast("没有内容可复制", '🤷'); return; }
    navigator.clipboard.writeText(textToCopy).then(() => { showToast("内容已复制！", '📋'); }).catch(err => { console.error('Failed to copy: ', err); showToast("复制失败！", '😥'); });
});

// --- API Key Modal Logic (Unchanged) ---
function openApiKeyModal() { /* ... unchanged ... */
    populateProviderRadios(); loadApiKeySettings(); apiKeyModal.classList.remove('hidden'); modalBackdrop.classList.remove('hidden');
}
window.closeApiKeyModal = function() { /* ... unchanged ... */
    apiKeyModal.classList.add('hidden'); modalBackdrop.classList.add('hidden');
}
window.saveApiKeySettings = function() { /* ... unchanged ... */
    const key = userApiKeyInput.value.trim(); const providerRadio = providerSelectionContainer.querySelector('input[name="providerChoice"]:checked'); const modelRadio = modelSelectionPrivateContainer.querySelector('input[name="privateModelChoice"]:checked');
    if (!key || !providerRadio || !modelRadio) { showToast("请填写 API 密钥并选择服务商和模型", '⚠️'); return; }
    const provider = providerRadio.value; const model = modelRadio.value;
    localStorage.setItem('aiAnhaoApiKey', key); localStorage.setItem('aiAnhaoSelectedProvider', provider); localStorage.setItem('aiAnhaoSelectedPrivateModel', model);
    selectedModel = 'private'; selectedProvider = provider; selectedPrivateModel = model; currentApiKey = key;
    const apiKeyOptionIcon = document.getElementById('icon-action-apikey'); if (apiKeyOptionIcon) { currentModelIcon.src = apiKeyOptionIcon.src; currentModelIcon.alt = "私人 API"; currentModelIcon.dataset.tooltip = `模型: 私人 (${provider} - ${model})`; currentModelIcon.dataset.model = 'private'; }
    showToast("API 密钥设置已保存", '💾'); closeApiKeyModal();
}
function populateProviderRadios() { /* ... unchanged ... */
    providerSelectionContainer.innerHTML = ''; let isFirst = true; const savedProvider = localStorage.getItem('aiAnhaoSelectedProvider');
    for (const providerName in PRIVATE_PROVIDER_CONFIG) { const label = document.createElement('label'); const input = document.createElement('input'); input.type = 'radio'; input.name = 'providerChoice'; input.value = providerName; if (savedProvider === providerName) { input.checked = true; isFirst = false; } else if (isFirst && !savedProvider) { input.checked = true; isFirst = false; } input.addEventListener('change', () => populatePrivateModelRadios(providerName)); label.appendChild(input); label.appendChild(document.createTextNode(` ${providerName}`)); providerSelectionContainer.appendChild(label); }
    const initiallyCheckedProvider = providerSelectionContainer.querySelector('input[name="providerChoice"]:checked'); if (initiallyCheckedProvider) populatePrivateModelRadios(initiallyCheckedProvider.value);
}
function populatePrivateModelRadios(providerName = null) { /* ... unchanged ... */
    modelSelectionPrivateContainer.innerHTML = ''; let targetProviderName = providerName; if (!targetProviderName) { const selectedProviderRadio = providerSelectionContainer.querySelector('input[name="providerChoice"]:checked'); if (!selectedProviderRadio) return; targetProviderName = selectedProviderRadio.value; }
    const config = PRIVATE_PROVIDER_CONFIG[targetProviderName]; const savedModel = localStorage.getItem('aiAnhaoSelectedPrivateModel'); const savedProvider = localStorage.getItem('aiAnhaoSelectedProvider');
    if (config && config.models) { let isFirst = true; let modelToCheck = null; for (const modelName in config.models) { const label = document.createElement('label'); const input = document.createElement('input'); input.type = 'radio'; input.name = 'privateModelChoice'; input.value = modelName; if (savedProvider === targetProviderName && savedModel === modelName) { modelToCheck = input; isFirst = false; } else if (isFirst && !(savedProvider === targetProviderName && savedModel)) { modelToCheck = input; isFirst = false; } label.appendChild(input); label.appendChild(document.createTextNode(` ${modelName}`)); modelSelectionPrivateContainer.appendChild(label); } if (modelToCheck) { modelToCheck.checked = true; } else if (modelSelectionPrivateContainer.querySelector('input[type="radio"]')) { modelSelectionPrivateContainer.querySelector('input[type="radio"]').checked = true; } }
}
function loadApiKeySettings() { /* ... unchanged ... */
    const savedKey = localStorage.getItem('aiAnhaoApiKey'); if (savedKey) { userApiKeyInput.value = savedKey; currentApiKey = savedKey; }
}


// --- NEW: Function to Fetch Default API Keys ---
async function fetchDefaultApiKeys() {
    if (fetchedDefaultKeys || defaultKeysLoading) {
        // Already fetched or currently fetching
        return fetchedDefaultKeys;
    }

    console.log("Fetching default API keys...");
    defaultKeysLoading = true;
    // Optionally disable Go button here if needed immediately
    // goIcon.setAttribute('disabled', true);

    try {
        const response = await fetch('/api/keys'); // Fetch from our Cloudflare Function
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
            throw new Error(`Failed to fetch keys: ${response.status} ${response.statusText}. ${errorData.error || ''}`);
        }
        fetchedDefaultKeys = await response.json();
        console.log("Default API keys fetched successfully.");
        showToast("公共模型已就绪", "✅", 2000); // Short confirmation
        return fetchedDefaultKeys;
    } catch (error) {
        console.error("Error fetching default API keys:", error);
        showToast("获取公共模型配置失败，公共模型暂不可用", '⚠️');
        fetchedDefaultKeys = {}; // Set to empty object to prevent retries, indicates failure
        // Ensure Go button is disabled if it relies on these keys and they failed
        determineModeAndUpdateIcon(userInput.value); // Re-evaluate Go button state
        return null;
    } finally {
        defaultKeysLoading = false;
        // Re-enable Go button conditionally if needed after fetch attempt
        // determineModeAndUpdateIcon(userInput.value); // Re-evaluate Go button state
    }
}


// --- MODIFIED Main Action Logic (handleEmbed) ---
async function handleEmbed() {
    const input = userInput.value.trim();
    if (!currentMode || currentMode !== 'embed' || !currentSubtype) {
        showToast("输入内容无法识别为可植入类型", '😅');
        return;
    }
    const theme = topicInput.value.trim() || "无主题";
    let apiKey = "";
    let baseUrl = null;
    let modelParam = null;
    let effectiveModelName = selectedModel;

    // Determine API Key, Base URL, and Model Parameter
    if (selectedModel === 'private') {
        // --- Private key logic (Unchanged) ---
        const savedKey = localStorage.getItem('aiAnhaoApiKey');
        const savedProvider = localStorage.getItem('aiAnhaoSelectedProvider');
        const savedPrivateModel = localStorage.getItem('aiAnhaoSelectedPrivateModel');
        if (!savedKey || !savedProvider || !savedPrivateModel) {
            showToast("请先设置并保存您的私人 API 密钥", '🔑');
            openApiKeyModal();
            return;
        }
        apiKey = savedKey;
        const providerConfig = PRIVATE_PROVIDER_CONFIG[savedProvider];
        if (providerConfig && providerConfig.models && providerConfig.models[savedPrivateModel]) {
            baseUrl = providerConfig.base_url;
            modelParam = providerConfig.models[savedPrivateModel];
            effectiveModelName = `${savedProvider} - ${savedPrivateModel}`;
        } else {
            showToast("无法找到保存的私人模型配置", "⚙️");
            return;
        }
    } else {
        // --- Public key logic (MODIFIED) ---
        const config = PROVIDER_CONFIG[selectedModel];
        if (!config) {
            showToast("无法找到所选模型的配置", "⚙️");
            return;
        }

        // --- NEW: Get key from fetched keys ---
        if (!fetchedDefaultKeys) {
            // Keys haven't been fetched yet or fetch failed
            showToast("公共模型配置正在加载或加载失败，请稍后再试", "⏳");
            // Optionally try fetching again now?
            // await fetchDefaultApiKeys();
            // if (!fetchedDefaultKeys || !fetchedDefaultKeys[config.provider]) { return; }
             return; // Prevent execution if keys aren't ready
        }
        apiKey = fetchedDefaultKeys[config.provider];
        // --- END NEW ---

        baseUrl = config.base_url;
        modelParam = config.model_param;
        effectiveModelName = selectedModel;

        if (!apiKey) {
            // This indicates the backend function didn't return the expected key
            showToast(`模型 ${selectedModel} 的 API 密钥配置缺失或无效，请检查后端设置`, '⚠️');
            return;
        }
    }

    // --- Rest of handleEmbed (Streaming logic - Unchanged) ---
    showLoading(true);
    let must_use_words = "";
    let expected_punctuation = "";
    let accumulatedText = "";
    let operation_status = 'fail';
    let error_message = null;
    let final_output_text = null;

    try {
        switch (currentSubtype) {
            case 'magnet': must_use_words = magnet_to_words(input); expected_punctuation = "，，，，，，，"; break;
            case 'wallet': must_use_words = magnet_to_words(input); expected_punctuation = "，，，，，，。"; break;
            case 'url': must_use_words = url_to_words(input); expected_punctuation = "，，，，，，！"; break;
            case 'telegram': must_use_words = url_to_words(input); expected_punctuation = "，，，，，。，"; break;
            case 'id': must_use_words = id_to_words(input); expected_punctuation = "，，，，，。。"; break;
            case 'ascii': must_use_words = abc_to_words(input); expected_punctuation = "，，，，，。！"; break;
            case 'chinese': must_use_words = chinese_to_words(input); expected_punctuation = "，，，，，！，"; break;
            default: throw new Error("未知的植入子类型");
        }

        const handleChunk = (chunk) => { accumulatedText += chunk; outputText.textContent = accumulatedText; };

        const handleComplete = () => {
            console.log("Stream Complete. Accumulated Text:", accumulatedText);
            try {
                const cleaned_text = clean_generated_text(accumulatedText); accumulatedText = cleaned_text; let validation_error = null;
                if (count_punctuations(cleaned_text) < 7) { validation_error = "生成的短文标点符号不足 7 个。"; }
                else {
                    let redecoded_output = "";
                    try {
                        switch (currentSubtype) {
                            case 'magnet': redecoded_output = words_to_magnet(cleaned_text, "magnet:?xt=urn:btih:"); break;
                            case 'wallet': redecoded_output = words_to_magnet(cleaned_text, "0x"); break;
                            case 'url': redecoded_output = words_to_url(cleaned_text, "https://"); break;
                            case 'telegram': redecoded_output = words_to_url(cleaned_text, "https://t.me/"); break;
                            case 'id': redecoded_output = words_to_id(cleaned_text, "@"); break;
                            case 'ascii': redecoded_output = words_to_abc(cleaned_text); break;
                            case 'chinese': redecoded_output = words_to_chinese(cleaned_text); break;
                        }
                        const compareOriginal = (currentSubtype === 'magnet' || currentSubtype === 'wallet') ? input.toLowerCase() : input;
                        const compareRedecoded = (currentSubtype === 'magnet' || currentSubtype === 'wallet') ? redecoded_output.toLowerCase() : redecoded_output;
                        if (compareRedecoded !== compareOriginal) { console.log("Validation Fail - Original:", compareOriginal); console.log("Validation Fail - Redecoded:", compareRedecoded); validation_error = "AI 生成的短文不符合要求（无法恢复原文）。"; }
                    } catch (decodeError) { console.error("Validation decode error:", decodeError); validation_error = "验证解码过程中出错。"; }
                }
                if (validation_error) {
                    error_message = `验证失败: ${validation_error}\n请填写合适的短文主题或者选择合适的 AI 模型再试一次。\n\n原始 AI 输出:\n${cleaned_text}`;
                    displayError(error_message); showToast(`植入失败: ${validation_error}`, '😞'); final_output_text = cleaned_text; operation_status = 'fail';
                } else {
                    final_output_text = replace_punctuations(cleaned_text, expected_punctuation); displayOutput(final_output_text); showToast("暗语植入成功!", '🎉'); operation_status = 'success';
                }
            } catch(completionError) {
                 console.error("Error during completion processing:", completionError); error_message = completionError.message || "完成处理时发生错误"; displayError(error_message); final_output_text = accumulatedText; operation_status = 'fail';
            } finally {
                hideLoading(); copyButton.disabled = false;
                logOperationToSupabase({ status: operation_status, userInput: input, theme: theme, generatedText: final_output_text, mode: 'embed', subtype: currentSubtype, modelUsed: effectiveModelName, errorMessage: error_message });
            }
        };
        const handleError = (err) => {
            console.error("Stream Error Callback:", err); error_message = err || "处理过程中发生未知流错误"; displayError(error_message); final_output_text = accumulatedText; operation_status = 'fail'; hideLoading(); copyButton.disabled = false;
            logOperationToSupabase({ status: operation_status, userInput: input, theme: theme, generatedText: final_output_text, mode: 'embed', subtype: currentSubtype, modelUsed: effectiveModelName, errorMessage: error_message });
        };
        const prompt = current_ask_ai_text(must_use_words, theme);
        await ask_ai(apiKey, prompt, baseUrl, modelParam, handleChunk, handleComplete, handleError);

    } catch (error) {
        console.error("Pre-stream Embed error:", error); error_message = error.message || "处理过程中发生未知错误"; displayError(error_message); hideLoading(); copyButton.disabled = false; final_output_text = null; operation_status = 'fail';
        logOperationToSupabase({ status: operation_status, userInput: input, theme: theme, generatedText: final_output_text, mode: 'embed', subtype: currentSubtype, modelUsed: effectiveModelName, errorMessage: error_message });
    }
}

// --- handleDecode (Unchanged) ---
function handleDecode() { /* ... unchanged ... */
    const input = userInput.value.trim(); if (!currentMode || currentMode !== 'decode') { showToast("输入内容无法识别为可提取类型", '😅'); return; }
    showLoading(false); let decoded = null; let operation_status = 'fail'; let error_message = null; let prefixType = "";
    setTimeout(() => {
        try {
            const first_seven = extract_first_seven_punctuations(input);
            switch (first_seven) {
                case "，，，，，，，": prefixType = 'magnet'; break; case "，，，，，，。": prefixType = 'wallet'; break; case "，，，，，，！": prefixType = 'url'; break;
                case "，，，，，。，": prefixType = 'telegram'; break; case "，，，，，。。": prefixType = 'id'; break; case "，，，，，。！": prefixType = 'abc'; break;
                case "，，，，，！，": prefixType = 'chinese'; break; default: error_message = "无法识别的暗语标记（标点符号格式不匹配）"; break;
            }
            if (!error_message) {
                try {
                    switch (prefixType) {
                        case 'magnet': decoded = words_to_magnet(input, "magnet:?xt=urn:btih:"); break; case 'wallet': decoded = words_to_magnet(input, "0x"); break;
                        case 'url': decoded = words_to_url(input, "https://"); break; case 'telegram': decoded = words_to_url(input, "https://t.me/"); break;
                        case 'id': decoded = words_to_id(input, "@"); break; case 'abc': decoded = words_to_abc(input); break; case 'chinese': decoded = words_to_chinese(input); break;
                    }
                } catch (decodeError) { console.error("Decode execution error:", decodeError); error_message = `提取过程中出错: ${decodeError.message}`; decoded = null; }
            }
            if (error_message) { displayError(error_message); }
            else if (decoded === null || (decoded === "" && prefixType !== 'abc' && prefixType !== 'chinese')) {
                 const wordsFound = findWordPositions(input).length > 0; if (wordsFound) { error_message = "无法从文本中提取有效内容。可能词汇顺序错误或不完整。"; } else { error_message = "文本中未找到可识别的暗语词汇。"; } displayError(error_message); decoded = null;
            } else { displayOutput(decoded); showToast("暗语提取成功!", '🎉'); operation_status = 'success'; }
        } catch (e) { console.error("Decode error:", e); error_message = e.message || "提取过程中发生未知错误"; displayError(error_message); decoded = null;
        } finally {
            hideLoading(); copyButton.disabled = (operation_status !== 'success');
            logOperationToSupabase({ status: operation_status, userInput: input, theme: null, generatedText: decoded, mode: 'decode', subtype: prefixType || null, modelUsed: null, errorMessage: error_message });
        }
    }, 10);
}

// --- Topic Input Listener (Unchanged) ---
document.getElementById('topicInput').addEventListener('input', function() { /* ... unchanged ... */
    if (this.value.length > 10) { this.value = this.value.substring(0, 10); showToast('话题最多只能输入10个字符', '⚠️'); }
});

// --- PWA Service Worker Registration (Unchanged) ---
if ('serviceWorker' in navigator) { /* ... unchanged ... */
  window.addEventListener('load', () => { navigator.serviceWorker.register('./service-worker.js').then(reg => console.log('SW registered.', reg.scope)).catch(err => console.log('SW reg failed:', err)); });
}

// --- MODIFIED Initial UI Setup ---
function initializeApp() {
    console.log("Initializing App...");
    loadApiKeySettings(); // Load private API key value first

    // --- NEW: Fetch default keys on load ---
    fetchDefaultApiKeys(); // Start fetching keys asynchronously

    populateProviderRadios(); // Populate providers for private key modal

    // Restore selected model visual state and tooltip (Unchanged logic)
    const savedApiKey = localStorage.getItem('aiAnhaoApiKey');
    const savedProvider = localStorage.getItem('aiAnhaoSelectedProvider');
    const savedPrivateModel = localStorage.getItem('aiAnhaoSelectedPrivateModel');

    if (savedApiKey && savedProvider && savedPrivateModel) {
        const apiKeyOptionIcon = document.getElementById('icon-action-apikey');
        if (apiKeyOptionIcon) {
            selectedModel = 'private'; currentModelIcon.src = apiKeyOptionIcon.src; currentModelIcon.alt = "私人 API"; currentModelIcon.dataset.tooltip = `模型: 私人 (${savedProvider} - ${savedPrivateModel})`; currentModelIcon.dataset.model = 'private'; console.log("Restored Private API model state.");
        }
    } else {
         const defaultPublicModel = 'Grok-3'; const defaultModelOption = modelOptionsContainer.querySelector(`[data-model="${defaultPublicModel}"]`);
         if(defaultModelOption) {
             currentModelIcon.src = defaultModelOption.src; currentModelIcon.alt = defaultModelOption.alt; currentModelIcon.dataset.tooltip = `模型: ${defaultModelOption.dataset.tooltip || defaultModelOption.alt}`; currentModelIcon.dataset.model = defaultModelOption.dataset.model; selectedModel = defaultModelOption.dataset.model; console.log("Set default public model state.");
         } else { console.error("Default public model icon not found in store!"); currentModelIcon.dataset.tooltip = "选择 AI 模型"; }
    }

    determineModeAndUpdateIcon(userInput.value);

    console.log("Modern UI Initialized.");
}

document.addEventListener('DOMContentLoaded', initializeApp);
/* END OF MODIFIED FILE script.js */
