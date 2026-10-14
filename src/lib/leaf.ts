import { environment, showToast, Toast } from "@raycast/api";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { LeafClient, LeafError, pipePath, returnUrl } from "./rpc";

let client: LeafClient | undefined;

/** The command's connection to Leaf Calendar, made on first use. */
export function leaf(): LeafClient {
  if (!client) {
    client = new LeafClient({
      path: pipePath(os.userInfo().username),
      hello: {
        client: "Raycast",
        icon: readFileSync(path.join(environment.assetsPath, "hello-icon.png")).toString("base64"),
        returnUrl: returnUrl(
          environment.ownerOrAuthorName,
          environment.extensionName,
          environment.commandName,
          environment.commandMode,
        ),
      },
    });
  }

  return client;
}

// What To Tell The Person For Each Error Code
const ERRORS: Record<string, { title: string; message: string }> = {
  not_running: {
    title: "Leaf Calendar isn't reachable",
    message: "Open Leaf Calendar, then turn on Settings › Connected apps › Allow other apps to connect.",
  },
  not_approved: {
    title: "Raycast isn't allowed to connect",
    message: "Choose Allow when Leaf Calendar asks. If you removed Raycast, try again to be asked.",
  },
  not_signed_in: { title: "No Google account", message: "Sign in to Google in Leaf Calendar first." },
  not_connected: { title: "No scheduling provider", message: "Connect Cal.com in Leaf Calendar's settings first." },
  no_meeting: { title: "No meeting to join", message: "Nothing coming up has a meeting link." },
  read_only: { title: "Can't change that", message: "You don't have permission to edit it." },
  not_found: { title: "Not found", message: "It may have moved or been deleted. Refresh and try again." },
  unavailable: { title: "Cal.com couldn't be reached", message: "Try again later." },
  timeout: { title: "Leaf Calendar didn't answer", message: "Make sure Leaf Calendar is running, then try again." },
  disconnected: { title: "Lost the connection to Leaf Calendar", message: "Try again." },
};

/** A title and message for an error, friendly for Leaf Calendar's codes. */
export function describeError(error: unknown): { title: string; message: string } {
  if (error instanceof LeafError && ERRORS[error.code]) {
    return ERRORS[error.code];
  }

  return { title: "Something went wrong", message: error instanceof Error ? error.message : String(error) };
}

export async function showLeafError(error: unknown): Promise<void> {
  await showToast({ style: Toast.Style.Failure, ...describeError(error) });
}
