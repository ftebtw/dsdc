"use client";

import { useState } from "react";
import { renamePrivateSessionGroup } from "./actions";

export default function PrivateGroupRename({
  groupId,
  name,
  description,
  redirectTo,
}: {
  groupId: string;
  name: string;
  description: string | null;
  redirectTo: string;
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <div className="flex items-start gap-2">
        <div>
          <h3 className="font-semibold text-navy-800 dark:text-white">{name}</h3>
          {description ? (
            <p className="text-sm text-charcoal/70 dark:text-navy-300 mt-1">{description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-0.5 rounded border border-warm-300 dark:border-navy-600 px-2 py-0.5 text-xs font-semibold text-navy-700 hover:bg-warm-100 dark:text-navy-100 dark:hover:bg-navy-800"
        >
          Rename
        </button>
      </div>
    );
  }

  return (
    <form action={renamePrivateSessionGroup} className="space-y-2">
      <input type="hidden" name="id" value={groupId} />
      <input type="hidden" name="redirect_to" value={redirectTo} />
      <input
        name="name"
        defaultValue={name}
        required
        autoFocus
        placeholder="Group name"
        className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
      />
      <textarea
        name="description"
        defaultValue={description ?? ""}
        rows={2}
        placeholder="Description (optional)"
        className="w-full rounded-lg border border-warm-300 dark:border-navy-600 bg-white dark:bg-navy-800 px-3 py-2 text-sm"
      />
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="rounded-md bg-navy-800 px-3 py-1.5 text-sm font-semibold text-white"
        >
          Save name
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-warm-300 dark:border-navy-600 px-3 py-1.5 text-sm"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
