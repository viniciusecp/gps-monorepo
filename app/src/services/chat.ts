const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export interface ChatSSEEvent {
  event: "token" | "tool_call" | "error" | "done";
  data: string;
}

export class ChatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatError";
  }
}

function parseSSEBuffer(
  buffer: string,
  parseIndex: number,
): { events: ChatSSEEvent[]; newIndex: number } {
  const events: ChatSSEEvent[] = [];
  const raw = buffer.slice(parseIndex);
  const parts = raw.split("\n\n");
  const incomplete = !raw.endsWith("\n\n") ? parts.pop() || "" : "";
  const newIndex = buffer.length - incomplete.length;

  for (const part of parts) {
    const lines = part.split("\n");
    let eventType = "";
    let eventData = "";

    for (const line of lines) {
      if (line.startsWith("event: ")) {
        eventType = line.slice(7).trim();
      } else if (line.startsWith("data: ")) {
        eventData = line.slice(6).trim();
      }
    }

    if (eventType && eventData !== undefined) {
      try {
        const parsed = JSON.parse(eventData);
        events.push({ event: eventType as ChatSSEEvent["event"], data: parsed });
      } catch {
        events.push({ event: eventType as ChatSSEEvent["event"], data: eventData });
      }
    }
  }

  return { events, newIndex };
}

export async function* streamChat(
  message: string,
  accessToken: string,
): AsyncGenerator<ChatSSEEvent> {
  const url = `${BASE_URL}/api/chat`;

  let abort = false;
  let error: Error | null = null;
  let parseIndex = 0;

  const pending: ChatSSEEvent[] = [];
  let resolvePending: (() => void) | null = null;

  function pushEvents(events: ChatSSEEvent[]) {
    if (events.length === 0) return;
    pending.push(...events);
    resolvePending?.();
    resolvePending = null;
  }

  const xhr = new XMLHttpRequest();
  xhr.open("POST", url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
  xhr.responseType = "text";

  xhr.onprogress = () => {
    const { events, newIndex } = parseSSEBuffer(xhr.responseText, parseIndex);
    parseIndex = newIndex;
    pushEvents(events);
  };

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
      if (xhr.status === 401) {
        error = new ChatError("Token expirado");
        xhr.abort();
        resolvePending?.();
        return;
      }
      if (xhr.status >= 400) {
        error = new ChatError(`Erro HTTP ${xhr.status}`);
        xhr.abort();
        resolvePending?.();
        return;
      }
    }
    if (xhr.readyState === XMLHttpRequest.DONE) {
      const { events, newIndex } = parseSSEBuffer(xhr.responseText, parseIndex);
      parseIndex = newIndex;
      pushEvents(events);
      abort = true;
      resolvePending?.();
    }
  };

  xhr.onerror = () => {
    error = new ChatError("Erro de conexão");
    resolvePending?.();
  };

  xhr.send(JSON.stringify({ message }));

  while (true) {
    if (error) throw error;

    while (pending.length > 0) {
      yield pending.shift()!;
    }

    if (abort) break;

    await new Promise<void>((resolve) => {
      resolvePending = resolve;
    });
  }
}
