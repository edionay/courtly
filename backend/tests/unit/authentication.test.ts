import type { Request } from "express";
import jwt from "jsonwebtoken";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createExpressAuthentication, type AuthenticatedUserRepository } from "../../src/auth/authentication";
import type { AuthenticatedUser } from "../../src/auth/userIdentity";

const secret = "courtly-unit-test-secret-at-least-32-characters";
const user: AuthenticatedUser = {
  id: "00000000-0000-4000-8000-000000000011",
  name: "Alex Morgan",
  role: "user",
};

describe("express authentication adapter", () => {
  beforeEach(() => vi.stubEnv("JWT_SECRET", secret));
  afterEach(() => vi.unstubAllEnvs());

  it("loads the current identity and role from the repository", async () => {
    const findById = vi.fn(async () => user);
    const authenticate = createExpressAuthentication({ findById });
    const token = jwt.sign({ sub: user.id, role: "admin" }, secret, { algorithm: "HS256", expiresIn: "1h" });

    await expect(authenticate(requestWithToken(token), "jwt")).resolves.toEqual(user);
    expect(findById).toHaveBeenCalledWith(user.id);
  });

  it("rejects a valid token when its user no longer exists", async () => {
    const repository: AuthenticatedUserRepository = { findById: async () => null };
    const authenticate = createExpressAuthentication(repository);
    const token = jwt.sign({ sub: user.id }, secret, { algorithm: "HS256", expiresIn: "1h" });

    await expect(authenticate(requestWithToken(token), "jwt")).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHENTICATED",
    });
  });

  it("rejects a token with an empty subject before looking up a user", async () => {
    const findById = vi.fn(async () => user);
    const authenticate = createExpressAuthentication({ findById });
    const token = jwt.sign({ sub: "" }, secret, { algorithm: "HS256", expiresIn: "1h" });

    await expect(authenticate(requestWithToken(token), "jwt")).rejects.toMatchObject({
      status: 401,
      code: "UNAUTHENTICATED",
    });
    expect(findById).not.toHaveBeenCalled();
  });

  it("uses the repository role to enforce administrator scope", async () => {
    const repository: AuthenticatedUserRepository = { findById: async () => user };
    const authenticate = createExpressAuthentication(repository);
    const token = jwt.sign({ sub: user.id, role: "admin" }, secret, { algorithm: "HS256", expiresIn: "1h" });

    await expect(authenticate(requestWithToken(token), "jwt", ["admin"])).rejects.toMatchObject({
      status: 403,
      code: "FORBIDDEN",
    });
  });
});

function requestWithToken(token: string): Request {
  return { header: () => `Bearer ${token}` } as Request;
}
