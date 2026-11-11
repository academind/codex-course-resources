import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { readFileSync } from "node:fs";
import path from "node:path";
import { betterAuth } from "better-auth";

const baseURL = "http://localhost:3000";
const password = "correct-horse-battery-staple";

let database: Database;
let auth: ReturnType<typeof betterAuth>;

function request(route: string, body?: Record<string, unknown>, cookie?: string) {
  return auth.handler(
    new Request(`${baseURL}/api/auth/${route}`, {
      method: body ? "POST" : "GET",
      headers: {
        ...(body ? { "content-type": "application/json" } : {}),
        ...(cookie ? { cookie } : {}),
        origin: baseURL,
      },
      body: body ? JSON.stringify(body) : undefined,
    }),
  );
}

function sessionCookie(response: Response) {
  const value = response.headers.get("set-cookie");
  expect(value).toBeTruthy();
  return value!.split(";", 1)[0];
}

beforeEach(() => {
  database = new Database(":memory:");
  database.run("PRAGMA foreign_keys = ON");
  database.exec(readFileSync(path.join(process.cwd(), "migrations/0001_init.up.sql"), "utf8"));
  auth = betterAuth({
    database,
    baseURL,
    secret: "test-secret-that-is-long-enough-for-better-auth",
    emailAndPassword: { enabled: true, autoSignIn: true },
  });
});

afterEach(() => {
  database.close();
});

describe("Better Auth with the TinyNotes schema", () => {
  test("registers a user, creates a credential account, and returns a session", async () => {
    const response = await request("sign-up/email", {
      name: "Alex Morgan",
      email: "alex@example.com",
      password,
    });

    expect(response.status).toBe(200);
    const cookie = sessionCookie(response);
    expect(database.query("SELECT count(*) AS count FROM user").get()).toEqual({ count: 1 });
    expect(database.query("SELECT count(*) AS count FROM account").get()).toEqual({ count: 1 });
    expect(database.query("SELECT count(*) AS count FROM session").get()).toEqual({ count: 1 });

    const sessionResponse = await request("get-session", undefined, cookie);
    expect(sessionResponse.status).toBe(200);
    expect((await sessionResponse.json()).user.email).toBe("alex@example.com");
  });

  test("rejects duplicate registration and invalid credentials", async () => {
    const registration = {
      name: "Alex Morgan",
      email: "alex@example.com",
      password,
    };
    expect((await request("sign-up/email", registration)).status).toBe(200);
    expect((await request("sign-up/email", registration)).status).toBeGreaterThanOrEqual(400);
    expect(
      (
        await request("sign-in/email", {
          email: registration.email,
          password: "incorrect-password",
        })
      ).status,
    ).toBeGreaterThanOrEqual(400);
  });

  test("signs in an existing user and invalidates the session on logout", async () => {
    await request("sign-up/email", {
      name: "Alex Morgan",
      email: "alex@example.com",
      password,
    });
    const loginResponse = await request("sign-in/email", {
      email: "alex@example.com",
      password,
    });
    expect(loginResponse.status).toBe(200);
    const cookie = sessionCookie(loginResponse);

    const logoutResponse = await request("sign-out", {}, cookie);
    expect(logoutResponse.status).toBe(200);

    const sessionResponse = await request("get-session", undefined, cookie);
    expect(await sessionResponse.json()).toBeNull();
  });
});
