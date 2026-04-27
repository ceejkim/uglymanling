import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type BarberSubmission = {
  id: string;
  userId: string;
  authorLabel: string;
  barberName: string;
  barbershop: string;
  status: "pending";
  createdAt: string;
};

type BarberSubmissionStore = {
  submissions: BarberSubmission[];
};

const STORE_PATH = path.join(process.cwd(), "data", "barber-submissions.json");

const emptyStore: BarberSubmissionStore = {
  submissions: []
};

async function ensureStoreFile() {
  await mkdir(path.dirname(STORE_PATH), { recursive: true });

  try {
    await readFile(STORE_PATH, "utf8");
  } catch {
    await writeFile(STORE_PATH, JSON.stringify(emptyStore, null, 2));
  }
}

export async function readBarberSubmissionStore() {
  await ensureStoreFile();

  const content = await readFile(STORE_PATH, "utf8");
  const parsed = JSON.parse(content) as BarberSubmissionStore;

  return {
    submissions: parsed.submissions ?? []
  } satisfies BarberSubmissionStore;
}

export async function writeBarberSubmissionStore(store: BarberSubmissionStore) {
  await ensureStoreFile();
  await writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}
