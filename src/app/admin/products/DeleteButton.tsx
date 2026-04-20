'use client';

import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteProduct } from './actions';

export default function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const shouldDelete = confirm(`确定要永久删除产品“${name}”吗？此操作不可撤销。`);
    if (!shouldDelete) return;

    setIsDeleting(true);
    const result = await deleteProduct(id);

    if (!result.success) {
      alert(result.error ?? '删除失败，请稍后重试。');
      setIsDeleting(false);
      return;
    }

    window.location.reload();
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-bmw-silver hover:text-bmw-red transition-colors disabled:opacity-50"
      title="删除产品"
    >
      {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
