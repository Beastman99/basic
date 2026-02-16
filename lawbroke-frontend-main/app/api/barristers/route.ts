import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const summary = searchParams.get("summary") || "";
  const overrideField = searchParams.get("field") || "";
  const postcode = searchParams.get("postcode") || "";
  const state = searchParams.get("state") || "NSW";

  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  const inferredField = overrideField || "";

  const res = await fetch(
    `${apiBase}/api/barristers?field=${encodeURIComponent(
      inferredField
    )}&summary=${encodeURIComponent(summary)}&state=${state}&postcode=${postcode}`
  );

  const rawBarristers = await res.json();

  const withScore = rawBarristers.map((b: any) => {
    let parsedScore = 0;
    try {
      const scores = JSON.parse(b.reasoning_score_by_field || "{}");
      parsedScore = scores[inferredField] ?? 0;
    } catch {
      parsedScore = 0;
    }
    return { ...b, parsedScore };
  });

  const sorted = withScore.sort((a, b) => b.parsedScore - a.parsedScore);

  return NextResponse.json(sorted);
}
