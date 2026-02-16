import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  const rules: Record<string, string[]> = {
    "Criminal Law": [
      "parole", "assault", "arrest", "charged", "police", "crime",
      "homicide", "murder", "stolen", "stabbing", "violence", "fight"
    ],
    "Family Law": [
      "custody", "divorce", "separation", "child", "kids", "family", "partner",
      "adoption", "parenting", "spouse", "ex-wife", "ex-husband"
    ],
    "Administrative Law": [
      "visa", "immigration", "tribunal", "merits review", "centrelink",
      "delegate", "minister", "disability support", "NDIS", "gov decision"
    ],
    "Employment Law": [
      "fired", "terminated", "unfair dismissal", "harassment", "wages",
      "pay", "job", "workplace", "resigned", "redundancy", "bullying"
    ],
  };

  const lower = text.toLowerCase();
  let bestMatch = "General Law";

  for (const [field, keywords] of Object.entries(rules)) {
    for (const k of keywords) {
      if (lower.includes(k) || lower.match(new RegExp(`\\b${k}\\b`, "i"))) {
        bestMatch = field;
        break;
      }
    }
    if (bestMatch !== "General Law") break;
  }

  return Response.json({ field: bestMatch });
}
