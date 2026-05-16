import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `তুমি একজন বিশেষজ্ঞ বাংলা ব্যাকরণ শিক্ষক। তোমাকে web search ব্যবহার করে নির্ভরযোগ্য বাংলা ব্যাকরণ তথ্য খুঁজে সঠিক উত্তর দিতে হবে।

নির্ভরযোগ্য সূত্র:
- বাংলা একাডেমি আধুনিক বাংলা অভিধান
- NCTB HSC বাংলা ব্যাকরণ ও নির্মিতি
- মুনীর চৌধুরী — বাংলা ভাষার ব্যাকরণ
- ড. হায়াৎ মামুদ — ব্যাকরণ বাংলা ভাষার

নিয়ম:
- শুধু সরাসরি উত্তর দাও, কোনো ব্যাখ্যা নয়
- পরীক্ষার খাতায় লেখার মতো সংক্ষিপ্ত হবে

Format:
উচ্চারণ: প্রমিত উচ্চারণ লেখো
পদ/শব্দশ্রেণি: পদের নাম। বাক্য হলে প্রতিটি শব্দ আলাদা লাইনে
প্রকৃতি-প্রত্যয়: √ + প্রত্যয় = শব্দ। মৌলিক হলে: মৌলিক শব্দ
সমাস: সমাসের নাম + ব্যাসবাক্য। না হলে: সমাসবদ্ধ পদ নয়
কারক ও বিভক্তি: [পদ] — [কারক], [বিভক্তি] (আলাদা লাইনে)
বাক্য বিশ্লেষণ: গঠন / অর্থ / উদ্দেশ্য ও বিধেয়
বানান শুদ্ধি: শুদ্ধ অথবা অশুদ্ধ → শুদ্ধ রূপ

শুধু JSON দাও:
{"results":[{"item":"বিষয়","answer":"উত্তর","source":"সূত্রের নাম"}]}`;

export async function POST(req) {
  try {
    const { word, labels } = await req.json();
    if (!word || !labels) {
      return Response.json({ error: "word and labels required" }, { status: 400 });
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content: `শব্দ/বাক্য: "${word}"\nনিচের বিষয়গুলোর উত্তর দাও: ${labels}\n\nপ্রথমে web search করো তারপর সঠিক JSON উত্তর দাও।`
      }],
    });

    const textBlocks = (response.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("");

    const jsonMatch = textBlocks.replace(/```json|```/gi, "").trim().match(/\{[\s\S]*"results"[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "Could not parse response" }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return Response.json(parsed);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
