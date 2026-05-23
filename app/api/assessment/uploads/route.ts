import { NextResponse } from "next/server";
import { getAssessmentSession } from "@/lib/assessment/server";
import { assessmentQuestionsById } from "@/lib/assessment/questions";
import { getSupabaseAdminClient, upsertSupabaseRow } from "@/lib/supabase";

const uploadBucket = "assessment-images";
const maxFileSize = 8 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "image/heic",
  "image/heif",
  "image/jpeg",
  "image/png",
  "image/webp"
]);

type AssessmentImageUploadRow = {
  file_name: string;
  file_size: number;
  id: string;
  image_slot: string;
  mime_type: string;
  question_id: string;
  session_id: string;
  storage_bucket: string;
  storage_path: string;
};

function cleanFileName(fileName: string) {
  return fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const imageSlot = String(formData.get("imageSlot") ?? "");
    const questionId = String(formData.get("questionId") ?? "");
    const resumeToken = String(formData.get("resumeToken") ?? "");
    const sessionId = String(formData.get("sessionId") ?? "");

    if (!(file instanceof File) || !imageSlot || !questionId || !resumeToken || !sessionId) {
      return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 });
    }

    if (!allowedMimeTypes.has(file.type)) {
      return NextResponse.json({ error: "Please upload a PNG, JPG, WebP, HEIC, or HEIF image." }, { status: 400 });
    }

    if (file.size > maxFileSize) {
      return NextResponse.json({ error: "Please keep each image under 8 MB." }, { status: 400 });
    }

    const session = await getAssessmentSession(sessionId);

    if (!session || session.resume_token !== resumeToken) {
      return NextResponse.json({ error: "Unknown assessment session." }, { status: 404 });
    }

    const question = assessmentQuestionsById[questionId];

    if (!question || question.input !== "upload" || !question.uploadSlots?.some((slot) => slot.id === imageSlot)) {
      return NextResponse.json({ error: "Upload slot is not available for this question." }, { status: 400 });
    }

    const uploadId = crypto.randomUUID();
    const safeName = cleanFileName(file.name) || `${imageSlot}.jpg`;
    const storagePath = `${sessionId}/${questionId}/${imageSlot}-${uploadId}-${safeName}`;
    const client = getSupabaseAdminClient();
    const { error: uploadError } = await client.storage
      .from(uploadBucket)
      .upload(storagePath, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const [row] = await upsertSupabaseRow<AssessmentImageUploadRow>({
      table: "assessment_image_uploads",
      values: {
        file_name: file.name,
        file_size: file.size,
        id: uploadId,
        image_slot: imageSlot,
        mime_type: file.type,
        question_id: questionId,
        session_id: sessionId,
        storage_bucket: uploadBucket,
        storage_path: storagePath
      }
    });

    return NextResponse.json({
      asset: {
        fileName: row?.file_name ?? file.name,
        fileSize: row?.file_size ?? file.size,
        id: row?.id ?? uploadId,
        imageSlot: row?.image_slot ?? imageSlot,
        mimeType: row?.mime_type ?? file.type,
        storageBucket: row?.storage_bucket ?? uploadBucket,
        storagePath: row?.storage_path ?? storagePath
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Image upload failed." },
      { status: 500 }
    );
  }
}
