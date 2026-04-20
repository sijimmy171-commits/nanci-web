'use client';

import { Trash2 } from 'lucide-react';
import { deleteProductDocumentAction } from './actions';

export default function DeleteProductDocumentButton({ id, title }: { id: string; title: string }) {
  return (
    <button
      type="button"
      className="p-2 text-bmw-silver hover:text-bmw-red transition-colors"
      title={`删除 ${title}`}
      onClick={async () => {
        const confirmed = window.confirm(`确定删除资料「${title}」吗？`);
        if (!confirmed) return;
        await deleteProductDocumentAction(id);
        window.location.reload();
      }}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
