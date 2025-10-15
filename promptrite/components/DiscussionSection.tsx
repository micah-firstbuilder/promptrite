"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface DiscussionSectionProps {
  challengeId: string;
}

type ExampleItem = {
  id: number;
  content: string;
  created_at: string;
  parent_id?: number | null;
};

export function DiscussionSection({ challengeId }: DiscussionSectionProps) {
  const numericId = useMemo(() => Number(challengeId), [challengeId]);
  const [examples, setExamples] = useState<ExampleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submittingMain, setSubmittingMain] = useState(false);
  const [content, setContent] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/examples?challenge_id=${numericId}`);
      if (!res.ok) throw new Error("Failed to load examples");
      const data = await res.json();
      setExamples(data.examples ?? []);
    } catch (e) {
      setError("Could not load examples");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(numericId)) return;
    load();
  }, [numericId]);

  async function postExample(
    text: string,
    parentId?: number | null
  ): Promise<ExampleItem | null> {
    if (!optIn && parentId == null) return null;
    const trimmed = text.trim();
    if (trimmed.length < 10) {
      toast.error("Please enter at least 10 characters.");
      return null;
    }
    setError(null);
    const res = await fetch("/api/examples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challenge_id: numericId,
        content: trimmed,
        opt_in: true,
        parent_id: parentId ?? undefined,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const msg = data?.error ?? "Failed to submit";
      if (res.status === 401) {
        toast.error("Please sign in to share examples.");
        return null;
      }
      toast.error(typeof msg === "string" ? msg : "Failed to submit");
      throw new Error(msg);
    }
    const created = await res.json().catch(() => ({}));
    const newItem: ExampleItem = {
      id: created?.id,
      content: trimmed,
      created_at: new Date().toISOString(),
      parent_id: parentId ?? null,
    };
    return newItem;
  }

  async function optimisticFlag(id: number) {
    // Optimistically remove item
    setExamples((prev) => prev.filter((e) => e.id !== id));
    try {
      await fetch("/api/examples", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "flag" }),
      });
    } catch {
      // If it fails, reload to reconcile
      load();
    }
  }

  function buildThreads(items: ExampleItem[]) {
    const byId = new Map<number, ExampleItem & { replies: ExampleItem[] }>();
    const roots: (ExampleItem & { replies: ExampleItem[] })[] = [];
    for (const it of items) byId.set(it.id, { ...it, replies: [] });
    for (const it of items) {
      const node = byId.get(it.id)!;
      if (it.parent_id) {
        const parent = byId.get(it.parent_id);
        if (parent) parent.replies.push(node);
        else roots.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  const threads = buildThreads(examples);

  return (
    <section className="h-[85vh] min-h-0 overflow-hidden rounded-xl border border-border bg-card pb-0 lg:h-full">
      <div className="flex-none border-border border-b px-5 py-4">
        <h2 className="font-semibold text-lg">Peer Examples</h2>
        <p className="text-muted-foreground text-sm">
          Anonymized passing prompts and solutions
        </p>
      </div>

      <div className="h-full min-h-0 space-y-5 overflow-y-auto p-5 pb-30">
        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm">
            {error}
          </div>
        )}

        <div>
          <label
            className="mb-2 block font-medium text-sm"
            htmlFor="example-content"
          >
            Share your prompt/solution
          </label>
          <textarea
            className="min-h-[100px] w-full rounded-md border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            id="example-content"
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the prompt or solution that helped you pass..."
            value={content}
          />
          <div className="mt-3 flex items-center justify-between">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input
                checked={optIn}
                onChange={(e) => setOptIn(e.target.checked)}
                type="checkbox"
              />
              <span>Share my content anonymously</span>
            </label>
            <Button
              disabled={!optIn || submittingMain || !content.trim()}
              onClick={async () => {
                try {
                  setSubmittingMain(true);
                  const ex = await postExample(content);
                  if (ex) {
                    setExamples((prev) => [ex, ...prev]);
                    setContent("");
                    setOptIn(false);
                  }
                } catch {
                  // handled in postExample
                } finally {
                  setSubmittingMain(false);
                }
              }}
              type="button"
            >
              {submittingMain ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-medium">Recent examples</h3>
          {loading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : examples.length === 0 ? (
            <p className="text-muted-foreground text-sm">No examples yet.</p>
          ) : (
            <ul className="space-y-4">
              {threads.map((root) => (
                <ThreadItem
                  item={root}
                  key={root.id}
                  onFlag={(id) => optimisticFlag(id)}
                  submit={async (text) => {
                    const ex = await postExample(text, root.id);
                    if (ex) setExamples((prev) => [...prev, ex]);
                  }}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default DiscussionSection;

function ThreadItem({
  item,
  submit,
  onFlag,
}: {
  item: ExampleItem & { replies?: ExampleItem[] };
  submit: (text: string) => Promise<void>;
  onFlag: (id: number) => Promise<void>;
}) {
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const replies = item.replies ?? [];
  const visible = showAll ? replies : replies.slice(0, 2);
  const hiddenCount = Math.max(0, replies.length - visible.length);
  return (
    <li className="rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-muted-foreground text-xs">
            Anonymous • {new Date(item.created_at).toLocaleString()}
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{item.content}</p>
          <div className="mt-2 flex items-center gap-2">
            <Button
              onClick={() => setOpen(!open)}
              type="button"
              variant="outline"
            >
              {open ? "Cancel" : "Reply"}
            </Button>
            <Button
              onClick={() => onFlag(item.id)}
              type="button"
              variant="outline"
            >
              Report
            </Button>
          </div>
          {open && (
            <div className="mt-2">
              <label className="sr-only" htmlFor={`reply-${item.id}`}>
                Reply
              </label>
              <textarea
                className="w-full rounded-md border border-border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                id={`reply-${item.id}`}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a reply..."
                value={reply}
              />
              <div className="mt-2 text-right">
                <Button
                  disabled={submittingReply}
                  onClick={async () => {
                    const text = reply.trim();
                    if (text.length < 10) {
                      toast.error("Please enter at least 10 characters.");
                      return;
                    }
                    try {
                      setSubmittingReply(true);
                      await submit(text);
                      setReply("");
                      setOpen(false);
                    } finally {
                      setSubmittingReply(false);
                    }
                  }}
                  type="button"
                >
                  {submittingReply ? "Posting..." : "Post reply"}
                </Button>
              </div>
            </div>
          )}
          {replies.length > 0 && (
            <div className="mt-3">
              <ul className="space-y-3 border-l pl-3">
                {visible.map((r) => (
                  <li
                    className="rounded-md border border-border p-2"
                    key={r.id}
                  >
                    <p className="text-muted-foreground text-xs">
                      Anonymous • {new Date(r.created_at).toLocaleString()}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {r.content}
                    </p>
                    <div className="mt-2">
                      <Button
                        onClick={() => onFlag(r.id)}
                        type="button"
                        variant="outline"
                      >
                        Report
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              {hiddenCount > 0 && (
                <div className="mt-2">
                  <Button
                    onClick={() => setShowAll(!showAll)}
                    type="button"
                    variant="outline"
                  >
                    {showAll
                      ? "Hide replies"
                      : `Show ${hiddenCount} more repl${hiddenCount === 1 ? "y" : "ies"}`}
                  </Button>
                </div>
              )}
              {hiddenCount === 0 && replies.length > 2 && (
                <div className="mt-2">
                  <Button
                    onClick={() => setShowAll(false)}
                    type="button"
                    variant="outline"
                  >
                    Collapse replies
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
