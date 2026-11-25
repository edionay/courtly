import { readFile } from "node:fs/promises";

const datasetCount = process.env.DATASET_COUNT ?? "12000";
const baseUrl = process.env.BASE_URL ?? "http://127.0.0.1:3121";

if (!["1000", "12000"].includes(datasetCount)) {
  throw new Error("DATASET_COUNT must be 1000 or 12000");
}

const manifest = JSON.parse(
  await readFile(new URL(`./manifests/${datasetCount}.json`, import.meta.url), "utf8"),
);

async function requestJson(path, { method = "GET", token, body } = {}) {
  const headers = { Accept: "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  const response = await fetch(new URL(path, baseUrl), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const responseText = await response.text();
  let responseBody;

  try {
    responseBody = JSON.parse(responseText);
  } catch {
    throw new Error(`${method} ${path} returned invalid JSON with status ${response.status}`);
  }

  return {
    status: response.status,
    body: responseBody,
    bodyBytes: Buffer.byteLength(responseText, "utf8"),
  };
}

async function login(email, password, expectedRole) {
  if (!email || !password) throw new Error(`${expectedRole} credentials are required`);

  const result = await requestJson("/api/auth/login", {
    method: "POST",
    body: { email, password },
  });
  if (result.status !== 200 || !result.body.accessToken || result.body.user?.role !== expectedRole) {
    throw new Error(`${expectedRole} login validation failed with status ${result.status}`);
  }

  return result.body.accessToken;
}

function assertResponse(name, result, isValid) {
  if (result.status !== 200 || !isValid(result.body)) {
    throw new Error(`${name} response validation failed with status ${result.status}`);
  }
  return { name, status: result.status, responseBodyBytesUtf8: result.bodyBytes };
}

function getSlotCounts(body) {
  return body.days.flatMap((day) => day.slots).reduce((counts, slot) => {
    counts[slot.status] = (counts[slot.status] ?? 0) + 1;
    return counts;
  }, {});
}

const userToken = await login(process.env.USER_EMAIL, process.env.USER_PASSWORD, "user");
const adminToken = await login(process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD, "admin");
const courtId = encodeURIComponent(manifest.busyAvailability.courtId);
const weekStart = encodeURIComponent(manifest.busyAvailability.weekStart);
const busyDate = encodeURIComponent(manifest.busyReportDate);
const emptyDate = encodeURIComponent(manifest.emptyReportDate);

const availability = await requestJson(
  `/api/courts/${courtId}/availability?weekStart=${weekStart}`,
  { token: userToken },
);
const busyReport = await requestJson(
  `/api/reports/daily-bookings?date=${busyDate}`,
  { token: adminToken },
);
const emptyReport = await requestJson(
  `/api/reports/daily-bookings?date=${emptyDate}`,
  { token: adminToken },
);

const results = [
  {
    ...assertResponse("weekly_availability", availability, (body) =>
    body.courtId === manifest.busyAvailability.courtId &&
    body.weekStart === manifest.busyAvailability.weekStart &&
    body.days?.length === 7,
    ),
    slotCountsByStatus: getSlotCounts(availability.body),
  },
  assertResponse("busy_daily_report", busyReport, (body) =>
    body.date === manifest.busyReportDate &&
    body.bookings?.length === manifest.busyDayBookingCount,
  ),
  assertResponse("empty_daily_report", emptyReport, (body) =>
    body.date === manifest.emptyReportDate &&
    body.bookings?.length === manifest.emptyDayBookingCount,
  ),
];

process.stdout.write(`${JSON.stringify({ datasetCount: Number(datasetCount), results }, null, 2)}\n`);
