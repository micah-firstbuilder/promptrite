"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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

  async function postExample(text: string, parentId?: number | null): Promise<ExampleItem | null> {
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
      body: JSON.stringify({ challenge_id: numericId, content: trimmed, opt_in: true, parent_id: parentId ?? undefined }),
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
    <section className="mt-8 rounded-xl border border-border bg-card">
      <div className="border-border border-b px-5 py-4">
        <h2 className="font-semibold text-lg">Peer Examples</h2>
        <p className="text-muted-foreground text-sm">Anonymized passing prompts and solutions</p>
      </div>

      <div className="space-y-5 p-5">
        {error && (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="example-content" className="mb-2 block text-sm font-medium">
            Share your prompt/solution
          </label>
          <textarea
            id="example-content"
            className="w-full min-h-[100px] rounded-md border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the prompt or solution that helped you pass..."
          />
          <div className="mt-3 flex items-center justify-between">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={optIn}
                onChange={(e) => setOptIn(e.target.checked)}
              />
              <span>Share my content anonymously</span>
            </label>
            <Button
              type="button"
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
                  key={root.id}
                  item={root}
                  submit={async (text) => {
                    const ex = await postExample(text, root.id);
                    if (ex) setExamples((prev) => [...prev, ex]);
                  }}
                  onFlag={(id) => optimisticFlag(id)}
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

function ThreadItem({ item, submit, onFlag }: { item: ExampleItem & { replies?: ExampleItem[] }; submit: (text: string) => Promise<void>; onFlag: (id: number) => Promise<void>; }) {
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
          <p className="text-xs text-muted-foreground">Anonymous • {new Date(item.created_at).toLocaleString()}</p>
          <p className="mt-1 whitespace-pre-wrap text-sm">{item.content}</p>
          <div className="mt-2 flex items-center gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(!open)}>
              {open ? "Cancel" : "Reply"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onFlag(item.id)}>
              Report
            </Button>
          </div>
          {open && (
            <div className="mt-2">
              <label htmlFor={`reply-${item.id}`} className="sr-only">Reply</label>
              <textarea id={`reply-${item.id}`} className="w-full rounded-md border border-border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply..." />
              <div className="mt-2 text-right">
                <Button
                  type="button"
                  disabled={submittingReply}
                  onClick={async () => {
                    const text = reply.trim();
                    if (text.length < 10) { toast.error("Please enter at least 10 characters."); return; }
                    try {
                      setSubmittingReply(true);
                      await submit(text);
                      setReply("");
                      setOpen(false);
                    } finally {
                      setSubmittingReply(false);
                    }
                  }}
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
                  <li key={r.id} className="rounded-md border border-border p-2">
                    <p className="text-xs text-muted-foreground">Anonymous • {new Date(r.created_at).toLocaleString()}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">{r.content}</p>
                    <div className="mt-2">
                      <Button type="button" variant="outline" onClick={() => onFlag(r.id)}>
                        Report
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
              {hiddenCount > 0 && (
                <div className="mt-2">
                  <Button type="button" variant="outline" onClick={() => setShowAll(!showAll)}>
                    {showAll ? "Hide replies" : `Show ${hiddenCount} more repl${hiddenCount === 1 ? "y" : "ies"}`}
                  </Button>
                </div>
              )}
              {hiddenCount === 0 && replies.length > 2 && (
                <div className="mt-2">
                  <Button type="button" variant="outline" onClick={() => setShowAll(false)}>
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


