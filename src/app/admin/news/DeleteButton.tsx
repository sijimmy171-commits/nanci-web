'use client';

import React, { useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { removeNewsArticle } from './actions';

export default function DeleteNewsButton({ id, title }: { id: string; title: string }) {
  const [pending, setPending] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`确定要删除新闻“${title}”吗？`)) return;
    setPending(true);
    await removeNewsArticle(id);
    window.location.reload();
  };

  return (
    <button onClick={handleDelete} disabled={pending} className="p-2 text-bmw-silver hover:text-bmw-red transition-colors disabled:opacity-50" title="删除新闻">
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
