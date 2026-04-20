'use client';

import React, { useState } from 'react';
import { Download, FileText, X } from 'lucide-react';
import Link from 'next/link';
type ProductDocument = {
  id: string;
  title: string;
  summary: string;
  fileUrl: string;
};

type Copy = {
  eyebrow: string;
  title: string;
  description: string;
  button: string;
  modalTitle: string;
  modalDescription: string;
  download: string;
  empty: string;
};

export default function ProductDocumentsSection({
  documents,
  copy,
}: {
  documents: ProductDocument[];
  copy: Copy;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div id="documents" className="max-w-7xl mx-auto px-4 pb-20 scroll-mt-32">
        <div className="border border-gray-200 bg-white p-10 md:p-14 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-2xl">
            <p className="text-bmw-blue text-xs font-bold tracking-[0.3em] uppercase mb-3">{copy.eyebrow}</p>
            <h3 className="text-3xl font-light text-bmw-black mb-4">{copy.title}</h3>
            <p className="text-gray-500 leading-8">{copy.description}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center bg-bmw-black text-white px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-bmw-blue transition-colors"
          >
            <Download className="w-4 h-4 mr-3" />
            {copy.button}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm px-4 py-8 overflow-y-auto" onClick={() => setOpen(false)}>
          <div className="max-w-4xl mx-auto bg-white shadow-2xl border border-gray-200" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-6 p-8 border-b border-gray-100">
              <div>
                <p className="text-bmw-blue text-xs font-bold tracking-[0.3em] uppercase mb-3">{copy.eyebrow}</p>
                <h4 className="text-3xl font-light text-bmw-black">{copy.modalTitle}</h4>
                <p className="mt-4 text-gray-500 leading-7 max-w-2xl">{copy.modalDescription}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="p-2 text-gray-400 hover:text-bmw-black transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8">
              {documents.length === 0 ? (
                <div className="border border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-400">{copy.empty}</div>
              ) : (
                <div className="space-y-4">
                  {documents.map((document, index) => (
                    <div key={document.id} className="border border-gray-200 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 border border-gray-200 bg-bmw-lightgray flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-bmw-silver" />
                        </div>
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-bmw-blue mb-2">{String(index + 1).padStart(2, '0')}</div>
                          <h5 className="text-xl font-semibold text-bmw-black">{document.title}</h5>
                          <p className="mt-2 text-gray-500 leading-7">{document.summary}</p>
                        </div>
                      </div>
                      <Link
                        href={document.fileUrl}
                        target="_blank"
                        className="inline-flex items-center justify-center border border-bmw-black text-bmw-black px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-bmw-black hover:text-white transition-colors shrink-0"
                      >
                        <Download className="w-4 h-4 mr-3" />
                        {copy.download}
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
