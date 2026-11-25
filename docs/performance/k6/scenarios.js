import http from "k6/http";
import { check, group } from "k6";
import { Trend } from "k6/metrics";

const baseUrl = __ENV.BASE_URL ?? "http://backend:3000";
const datasetCount = __ENV.DATASET_COUNT ?? "12000";
const manifest = JSON.parse(open(`/manifests/${datasetCount}.json`));
const warmupRequests = Number(__ENV.WARMUP_REQUESTS ?? 10);
const measuredRequests = Number(__ENV.MEASURED_REQUESTS ?? 100);
const requestTimeout = "30s";
const expectedBusyBookings = Number(__ENV.EXPECTED_BUSY_BOOKINGS ?? manifest.busyDayBookingCount);
const measuredLatency = {
  weekly_availability: new Trend("weekly_availability_duration", true),
  busy_daily_report: new Trend("busy_daily_report_duration", true),
  empty_daily_report: new Trend("empty_daily_report_duration", true),
};

if (!Number.isInteger(warmupRequests) || warmupRequests < 0) {
  throw new Error("WARMUP_REQUESTS must be a non-negative integer");
}
if (!Number.isInteger(measuredRequests) || measuredRequests < 1) {
  throw new Error("MEASURED_REQUESTS must be a positive integer");
}
if (!["1000", "12000"].includes(datasetCount) || manifest.bookingCount !== Number(datasetCount)) {
  throw new Error("DATASET_COUNT must match an available performance manifest");
}

export const options = {
  summaryTrendStats: ["med", "p(95)"],
  scenarios: {
    performanceQueries: {
      executor: "shared-iterations",
      vus: 1,
      iterations: 1,
    },
  },
  thresholds: {
    checks: ["rate==1"],
  },
};

function login(email, password, expectedRole) {
  if (!email || !password) throw new Error(`${expectedRole} credentials are required`);
  const response = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({ email, password }), {
    headers: { "Content-Type": "application/json" },
    timeout: requestTimeout,
    tags: { phase: "setup", endpoint: "authentication", role: expectedRole },
  });
  let body;
  try {
    body = response.json();
  } catch {
    throw new Error(`${expectedRole} authentication returned invalid JSON with status ${response.status}`);
  }
  if (response.status !== 200 || !body?.accessToken || body.user?.role !== expectedRole) {
    throw new Error(`${expectedRole} authentication failed role or token validation with status ${response.status}`);
  }
  return body.accessToken;
}

export function setup() {
  return {
    userToken: login(__ENV.USER_EMAIL, __ENV.USER_PASSWORD, "user"),
    adminToken: login(__ENV.ADMIN_EMAIL, __ENV.ADMIN_PASSWORD, "admin"),
  };
}

function getJson(path, token, tags) {
  const response = http.get(`${baseUrl}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: requestTimeout,
    tags,
  });
  let body;
  try {
    body = response.json();
  } catch {
    body = null;
  }
  return { response, body };
}

function measureEndpoint(name, path, token, validateResponse) {
  group(name, () => {
    for (let index = 0; index < warmupRequests; index += 1) {
      const { response, body } = getJson(path, token, { endpoint: name, phase: "warmup" });
      check(response, { [`${name} warmup returns a valid response`]: (result) => result.status === 200 && validateResponse(body) });
    }
    for (let index = 0; index < measuredRequests; index += 1) {
      const { response, body } = getJson(path, token, { endpoint: name, phase: "measured" });
      measuredLatency[name].add(response.timings.duration, { endpoint: name, phase: "measured" });
      check(response, { [`${name} returns a valid response`]: (result) => result.status === 200 && validateResponse(body) });
    }
  });
}

function validateAvailability(body) {
  if (!hasExpectedAvailabilityWeek(body)) return false;
  const anchorDay = body.days.find((day) => day.date === manifest.busyReportDate);
  if (!hasExpectedSlots(anchorDay)) return false;

  const bookedSlots = countSlotsWithStatus(anchorDay.slots, "booked");
  const availableSlots = countSlotsWithStatus(anchorDay.slots, "available");
  return bookedSlots > 0 && availableSlots > 0 && anchorDay.slots.every(hasSlotPresentation);
}

function hasExpectedAvailabilityWeek(body) {
  return body?.courtId === manifest.busyAvailability.courtId &&
    body.weekStart === manifest.busyAvailability.weekStart &&
    Array.isArray(body.days) && body.days.length === 7;
}

function hasExpectedSlots(day) {
  return day && Array.isArray(day.slots) && day.slots.length === 15;
}

function countSlotsWithStatus(slots, status) {
  return slots.filter((slot) => slot.status === status).length;
}

function hasSlotPresentation(slot) {
  return ["available", "booked", "past"].includes(slot.status) &&
    Boolean(slot.display?.startsAt) &&
    Boolean(slot.display?.endsAt);
}

function isFormattedPrice(value) {
  return typeof value === "string" && /^\$\d+\.\d{2}$/.test(value);
}

function isDailyBooking(booking) {
  return Boolean(booking.court?.id && booking.user?.name) &&
    ["confirmed", "cancelled"].includes(booking.status) &&
    Boolean(booking.display?.startsAt) &&
    Boolean(booking.display?.endsAt) &&
    isFormattedPrice(booking.display?.totalPrice);
}

function validateBusyReport(body) {
  if (body?.date !== manifest.busyReportDate) return false;
  if (!body.display?.date || !isFormattedPrice(body.display.expectedRevenue)) return false;
  if (!Array.isArray(body.bookings) || body.bookings.length !== expectedBusyBookings) return false;
  return body.bookings.every(isDailyBooking);
}

function validateEmptyReport(body) {
  return body?.date === manifest.emptyReportDate &&
    Boolean(body.display?.date) &&
    body.display.expectedRevenue === "$0.00" &&
    Array.isArray(body.bookings) &&
    body.bookings.length === manifest.emptyDayBookingCount;
}

export default function (tokens) {
  const courtId = encodeURIComponent(manifest.busyAvailability.courtId);
  const weekStart = encodeURIComponent(manifest.busyAvailability.weekStart);
  measureEndpoint("weekly_availability", `/api/courts/${courtId}/availability?weekStart=${weekStart}`, tokens.userToken, validateAvailability);
  measureEndpoint("busy_daily_report", `/api/reports/daily-bookings?date=${encodeURIComponent(manifest.busyReportDate)}`, tokens.adminToken, validateBusyReport);
  measureEndpoint("empty_daily_report", `/api/reports/daily-bookings?date=${encodeURIComponent(manifest.emptyReportDate)}`, tokens.adminToken, validateEmptyReport);
}

export function handleSummary(data) {
  delete data.setup_data;
  const summaryJson = `${JSON.stringify(data, null, 2)}\n`;
  const summaryPath = __ENV.K6_SUMMARY_PATH;

  if (!summaryPath) return { stdout: summaryJson };
  return { [summaryPath]: summaryJson };
}
