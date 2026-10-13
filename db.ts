import "dotenv/config";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let connected = false;
let pendingWrite: Promise<void> = Promise.resolve();

export async function connectDatabase(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    console.info("[DB] DATABASE_URL is not configured");
    return false;
  }

  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    connected = true;
    console.info("[DB] PostgreSQL connection established");
    return true;
  } catch (error) {
    connected = false;
    console.error("[DB] PostgreSQL connection failed", error);
    throw new Error("DATABASE_URL is configured but PostgreSQL is unavailable", { cause: error });
  }
}

export function isDatabaseAvailable(): boolean {
  return connected;
}

export async function getStateFromDatabase(): Promise<Record<string, unknown> | null> {
  if (!connected) return null;
  const snapshot = await prisma.appStateSnapshot.findUnique({ where: { id: "main" } });
  if (snapshot?.data && typeof snapshot.data === "object" && !Array.isArray(snapshot.data)) {
    return snapshot.data as Record<string, unknown>;
  }

  const [
    users, courses, enrollments, messages, certificates, logs, invites,
    customRoles, mediaLibrary, bankAccounts, withdrawalRequests,
    assignmentSubmissions, webinarPosts, quizAttempts, learningPaths, events,
    subscriptions, certTemplates, exams, examAttempts, payments,
    certDownloadHistory, cmsRow, themeRow,
  ] = await Promise.all([
    prisma.appUser.findMany(),
    prisma.appCourse.findMany(),
    prisma.appEnrollment.findMany(),
    prisma.appMessage.findMany(),
    prisma.appCertificate.findMany(),
    prisma.appLog.findMany(),
    prisma.appInvite.findMany(),
    prisma.appCustomRole.findMany(),
    prisma.appMediaItem.findMany(),
    prisma.appBankAccount.findMany(),
    prisma.appWithdrawalRequest.findMany(),
    prisma.appAssignmentSubmission.findMany(),
    prisma.appWebinarPost.findMany(),
    prisma.appQuizAttempt.findMany(),
    prisma.appLearningPath.findMany(),
    prisma.appEvent.findMany(),
    prisma.appSubscription.findMany(),
    prisma.appCertTemplate.findMany(),
    prisma.appExam.findMany(),
    prisma.appExamAttempt.findMany(),
    prisma.appPayment.findMany(),
    prisma.appCertDownloadHistory.findMany(),
    prisma.appCmsContent.findUnique({ where: { id: "main" } }),
    prisma.appThemeSetting.findUnique({ where: { id: "main" } }),
  ]);
  const cmsContent = cmsRow
    ? (Array.isArray(cmsRow.pages) ? { pages: cmsRow.pages } : cmsRow.pages)
    : null;
  const loadedState: Record<string, unknown> = {
    users, courses, enrollments, messages, certificates, logs, invites,
    customRoles, mediaLibrary, bankAccounts, withdrawalRequests,
    assignmentSubmissions, webinarPosts, quizAttempts, learningPaths, events,
    subscriptions, certTemplates, exams, examAttempts, payments,
    certDownloadHistory, cmsContent,
    themeSettings: themeRow?.data ?? null,
  };
  if (cmsContent && typeof cmsContent === "object" && !Array.isArray(cmsContent) && "siteNotice" in cmsContent) {
    loadedState.siteNotice = cmsContent.siteNotice ?? null;
  }

  const hasExistingData = Object.values(loadedState).some(value =>
    Array.isArray(value) ? value.length > 0 : value !== null,
  );
  return hasExistingData ? loadedState : null;
}

export function saveStateToDatabase(state: object): Promise<void> {
  if (!connected) return Promise.resolve();

  const snapshot = JSON.parse(JSON.stringify(state)) as Prisma.InputJsonValue;
  const write = pendingWrite.then(async () => {
    await prisma.appStateSnapshot.upsert({
      where: { id: "main" },
      create: { id: "main", data: snapshot },
      update: { data: snapshot },
    });
  });
  pendingWrite = write.catch(() => {});
  return write;
}

export async function disconnectDatabase(): Promise<void> {
  await pendingWrite;
  await prisma.$disconnect();
}
