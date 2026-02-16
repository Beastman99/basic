import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { fullName, email } = await req.json();
    if (!email) return NextResponse.json({ ok:false, error:"Email required" }, { status:400 });

    const apiKey = process.env.MAILCHIMP_API_KEY!;
    const dc = process.env.MAILCHIMP_SERVER_PREFIX!;
    const listId = process.env.MAILCHIMP_LIST_ID!;
    const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Basic auth is most reliable with Mailchimp
        Authorization: "Basic " + Buffer.from(`anystring:${apiKey}`).toString("base64"),
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",            // <<— no double opt-in
        merge_fields: { FNAME: fullName || "" },
      }),
    });

    const data = await res.json();
    if (!res.ok && data?.title !== "Member Exists") {
      return NextResponse.json({ ok:false, error:data?.detail || "Mailchimp error" }, { status:res.status });
    }

    return NextResponse.json({ ok:true, message:"You’re on the list 🎉" }, { status:201 });
  } catch {
    return NextResponse.json({ ok:false, error:"Server error" }, { status:500 });
  }
}
