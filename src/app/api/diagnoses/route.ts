import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUser, apiError, apiOk } from "@/lib/request";
import { DiagnosisStatus } from "@prisma/client";

// POST /api/diagnoses — farmer submits photo for AI diagnosis
export async function POST(request: NextRequest) {
  const user = getRequestUser(request);
  if (!user) return apiError("UNAUTHORIZED", 401);

  const formData = await request.formData().catch(() => null);
  if (!formData) return apiError("INVALID_FORM_DATA", 400);

  const cropType = formData.get("cropType") as string | null;
  const imageUrls: string[] = [];

  // Handle file uploads (placeholder — real impl: upload to GCS/S3)
  const files = formData.getAll("images") as File[];
  if (!files.length) return apiError("NO_IMAGES", 400);

  // Save actual files to public/uploads
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  
  // Ensure directory exists
  await fs.mkdir(uploadDir, { recursive: true });

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const name = `${Date.now()}_${file.name.replace(/[^a-z0-9.]/gi, "_")}`;
    const filePath = path.join(uploadDir, name);
    
    await fs.writeFile(filePath, buffer);
    imageUrls.push(`/uploads/${name}`);
  }

  const diagnosis = await prisma.plantDiagnosis.create({
    data: {
      userId: user.id,
      cropType,
      imageUrls,
      status: DiagnosisStatus.PROCESSING,
    },
  });

  // Fire-and-forget AI analysis (non-blocking)
  runAiDiagnosis(diagnosis.id, imageUrls, cropType ?? undefined).catch(
    (err) => console.error("[AI Diagnosis Error]", err)
  );

  return apiOk({ id: diagnosis.id, status: "PROCESSING" }, 202);
}

// GET /api/diagnoses — farmer sees own diagnoses
export async function GET(request: NextRequest) {
  const user = getRequestUser(request);
  if (!user) return apiError("UNAUTHORIZED", 401);

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = 10;

  const [total, diagnoses] = await Promise.all([
    prisma.plantDiagnosis.count({ where: { userId: user.id } }),
    prisma.plantDiagnosis.findMany({
      where: { userId: user.id },
      include: {
        suggestions: {
          include: { product: { select: { name: true, imageUrls: true, slug: true } } },
          orderBy: { rank: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return apiOk({ data: diagnoses, total, page, limit });
}

// ─── AI Runner ────────────────────────────────────────────────────────────────

async function runAiDiagnosis(
  diagnosisId: string,
  imageUrls: string[],
  cropType?: string
) {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL ?? "gemini-1.5-flash" });

  const prompt = `Bạn là chuyên gia nông nghiệp. Hãy phân tích hình ảnh cây trồng${cropType ? ` (loại: ${cropType})` : ""} và:
1. Xác định bệnh/vấn đề (nếu có)
2. Đánh giá mức độ nghiêm trọng (nhẹ/trung bình/nặng)
3. Đề xuất hướng xử lý
4. Trả về JSON với format: { "disease": string, "severity": "mild"|"moderate"|"severe", "summary": string, "confidence": number (0-1), "keywords": string[] }`;

  try {
    // Build parts with actual image data
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const parts: any[] = [{ text: prompt }];

    for (const url of imageUrls) {
      const filePath = path.join(process.cwd(), "public", url);
      const data = await fs.readFile(filePath);
      parts.push({
        inlineData: {
          data: data.toString("base64"),
          mimeType: "image/jpeg" // assume jpeg for simplicity, or detect from ext
        }
      });
    }

    const result = await model.generateContent(parts);
    const text = result.response.text();

    // Parse JSON from AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { summary: text, confidence: 0.5 };

    // Find matching products by keywords
    const keywords: string[] = parsed.keywords ?? [];
    const suggestedProducts = keywords.length
      ? await prisma.product.findMany({
          where: {
            isActive: true,
            tags: { hasSome: keywords },
          },
          take: 5,
          orderBy: { createdAt: "desc" },
        })
      : [];

    await prisma.plantDiagnosis.update({
      where: { id: diagnosisId },
      data: {
        rawAiResponse: parsed,
        summary: parsed.summary,
        confidence: parsed.confidence,
        status: DiagnosisStatus.DONE,
        suggestions: {
          create: suggestedProducts.map((p: any, i: number) => ({
            productId: p.id,
            reason: `Phù hợp với triệu chứng: ${parsed.disease ?? "không xác định"}`,
            rank: i + 1,
          })),
        },
      },
    });
  } catch (err) {
    await prisma.plantDiagnosis.update({
      where: { id: diagnosisId },
      data: { status: DiagnosisStatus.FAILED },
    });
    throw err;
  }
}
