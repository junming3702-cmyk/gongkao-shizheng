import { suggestions } from "../../../db/schema";
import { getDb } from "../../../db";

const allowedTypes = new Set(["资料补充", "内容纠错", "功能建议", "其他要求"]);

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      type?: string;
      title?: string;
      content?: string;
      sourceUrl?: string;
      contact?: string;
      website?: string;
    };

    if (payload.website) {
      return Response.json({ ok: true }, { status: 201 });
    }

    const type = payload.type?.trim() ?? "";
    const title = payload.title?.trim() ?? "";
    const content = payload.content?.trim() ?? "";
    const sourceUrl = payload.sourceUrl?.trim() ?? "";
    const contact = payload.contact?.trim() ?? "";

    if (!allowedTypes.has(type) || title.length < 2 || content.length < 5) {
      return Response.json({ error: "请完整填写建议类型、标题和内容。" }, { status: 400 });
    }

    if (title.length > 120 || content.length > 3000 || sourceUrl.length > 500 || contact.length > 200) {
      return Response.json({ error: "提交内容过长，请适当精简后重试。" }, { status: 400 });
    }

    const db = getDb();
    await db.insert(suggestions).values({ type, title, content, sourceUrl, contact });
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "提交失败";
    return Response.json({ error: message }, { status: 500 });
  }
}
