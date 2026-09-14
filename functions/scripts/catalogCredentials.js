"use strict";

const path = require("node:path");

const PROJECT_ID = "techminds-63e30";
const DATABASE_ID = "default";
const LOGIN_COMMAND = "npx -y firebase-tools@latest login --reauth";
const PROJECT_ROOT = path.resolve(__dirname, "../..");

function assertImportTarget(target, env = process.env) {
  if (target.projectId !== PROJECT_ID || target.databaseId !== DATABASE_ID) {
    throw new Error(`Import is restricted to ${PROJECT_ID}, database ${DATABASE_ID}.`);
  }
  if (env.FIRESTORE_EMULATOR_HOST) {
    throw new Error("Unset FIRESTORE_EMULATOR_HOST before using the catalog importer. No writes performed.");
  }
}

async function prepareCredentials({env = process.env, loadCli = require} = {}) {
  // Respect an explicitly configured credential; never silently switch identities.
  if (env.GOOGLE_APPLICATION_CREDENTIALS) {
    return "explicit Application Default Credentials";
  }

  let auth;
  let credentials;
  try {
    // Internal CLI bridge, pinned in the root package.json. This is the same
    // bridge Firebase uses to supply ADC to local Functions processes.
    auth = loadCli("firebase-tools/lib/auth");
    credentials = loadCli("firebase-tools/lib/defaultCredentials");
  } catch {
    throw new Error("Firebase CLI credential support is unavailable. Run npm install from the project root.");
  }
  const account = auth.getProjectDefaultAccount(PROJECT_ROOT);
  if (!account || !account.tokens || !account.tokens.refresh_token) {
    throw new Error(`No Firebase CLI login is available. Run: ${LOGIN_COMMAND}`);
  }

  const configRoot = process.platform === "win32" ? env.APPDATA :
    (env.HOME && path.join(env.HOME, ".config"));
  if (!configRoot) {
    throw new Error("Cannot locate your user Firebase configuration directory.");
  }
  const relative = path.relative(PROJECT_ROOT, path.resolve(configRoot));
  if (!relative || (!relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative))) {
    throw new Error("Firebase credentials must be stored outside the repository. Check your user configuration directory.");
  }

  let credentialPath;
  try {
    credentialPath = await credentials.getCredentialPathAsync(account);
  } catch {
    // Never print credential objects or raw OAuth errors.
    throw new Error("Could not prepare local Firebase credentials. Check access to your user Firebase configuration directory.");
  }
  if (!credentialPath) {
    throw new Error(`Firebase CLI credentials are unavailable. Run: ${LOGIN_COMMAND}`);
  }
  // Process-only setting. No .env file, repository credential, or global change.
  env.GOOGLE_APPLICATION_CREDENTIALS = credentialPath;
  return "Firebase CLI login";
}

function authenticationError() {
  return new Error(
    `Could not authenticate the content importer. Run: ${LOGIN_COMMAND}. ` +
    "If GOOGLE_APPLICATION_CREDENTIALS is set, verify that file or unset the variable to use Firebase CLI login. No import was started.",
  );
}

module.exports = {assertImportTarget, prepareCredentials, authenticationError};
