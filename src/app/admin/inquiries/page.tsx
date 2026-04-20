import React from 'react';
import Link from 'next/link';
import { MessageSquare, Mail, Clock, Building, Package, Phone, Eye, Reply, Inbox } from 'lucide-react';
import { listInquiries, getInquiryStatusCounts, isInquiryStatus, type InquiryStatus } from '@/lib/inquiries';
import { updateInquiryStatusAction } from './actions';

const statusCopy: Record<InquiryStatus, { label: string; badge: string; card: string; icon: typeof Inbox }> = {
  PENDING: {
    label: '待处理',
    badge: 'bg-bmw-red/10 text-bmw-red',
    card: 'bg-bmw-red/5 text-bmw-red border-bmw-red/10',
    icon: Inbox,
  },
  READ: {
    label: '已查看',
    badge: 'bg-amber-100 text-amber-700',
    card: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Eye,
  },
  REPLIED: {
    label: '已回复',
    badge: 'bg-green-100 text-green-700',
    card: 'bg-green-50 text-green-700 border-green-200',
    icon: Reply,
  },
};

function getActiveFilter(value: string | string[] | undefined): InquiryStatus | 'ALL' {
  const normalized = Array.isArray(value) ? value[0] : value;
  return isInquiryStatus(normalized) ? normalized : 'ALL';
}

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const activeFilter = getActiveFilter(query.status);
  const [inquiries, counts] = await Promise.all([listInquiries(), getInquiryStatusCounts()]);

  const filteredInquiries =
    activeFilter === 'ALL' ? inquiries : inquiries.filter((inquiry) => inquiry.status === activeFilter);

  const filters: Array<{ key: 'ALL' | InquiryStatus; label: string; count: number }> = [
    { key: 'ALL', label: '全部', count: counts.total },
    { key: 'PENDING', label: statusCopy.PENDING.label, count: counts.PENDING },
    { key: 'READ', label: statusCopy.READ.label, count: counts.READ },
    { key: 'REPLIED', label: statusCopy.REPLIED.label, count: counts.REPLIED },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-bmw-black tracking-tight">询盘消息中心</h1>
        <p className="text-gray-500 mt-2 font-light">实时查看来自全球客户的咨询消息，便于销售团队及时跟进。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;
          const visual = filter.key === 'ALL' ? null : statusCopy[filter.key];
          const href = filter.key === 'ALL' ? '/admin/inquiries' : `/admin/inquiries?status=${filter.key}`;
          const Icon = visual?.icon ?? MessageSquare;

          return (
            <Link
              key={filter.key}
              href={href}
              className={`border p-5 transition-colors ${
                isActive
                  ? visual
                    ? visual.card
                    : 'bg-bmw-black text-white border-bmw-black'
                  : 'bg-white border-gray-200 text-bmw-black hover:border-bmw-black'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className="w-5 h-5" />
                <span className="text-2xl font-black">{filter.count}</span>
              </div>
              <div className="mt-4 text-xs font-bold uppercase tracking-[0.2em]">{filter.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredInquiries.length === 0 ? (
          <div className="bg-white border border-gray-200 py-32 flex flex-col items-center justify-center space-y-4">
            <MessageSquare className="w-12 h-12 text-gray-200" />
            <p className="text-gray-400 font-light italic text-sm uppercase tracking-widest">当前筛选条件下暂无客户消息</p>
          </div>
        ) : (
          filteredInquiries.map((inquiry) => {
            const status = isInquiryStatus(inquiry.status) ? inquiry.status : 'PENDING';
            const visual = statusCopy[status];
            const markReadAction = updateInquiryStatusAction.bind(null, inquiry.id);
            const markRepliedAction = updateInquiryStatusAction.bind(null, inquiry.id);

            return (
              <div key={inquiry.id} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
                  <div className="p-6 lg:w-[28%] bg-gray-50/50">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-bmw-blue text-white flex items-center justify-center font-bold">
                        {inquiry.clientName.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-bmw-black">{inquiry.clientName}</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center mt-0.5">
                          <Clock className="w-3 h-3 mr-1" /> {new Date(inquiry.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center text-xs text-gray-600 group-hover:text-bmw-blue transition-colors break-all">
                        <Mail className="w-3.5 h-3.5 mr-2 shrink-0" /> {inquiry.clientEmail}
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center text-xs text-gray-600">
                          <Phone className="w-3.5 h-3.5 mr-2 shrink-0" /> {inquiry.phone}
                        </div>
                      )}
                      {inquiry.companyName && (
                        <div className="flex items-center text-xs text-gray-600">
                          <Building className="w-3.5 h-3.5 mr-2 shrink-0" /> {inquiry.companyName}
                        </div>
                      )}
                      <div className="flex items-center text-xs text-bmw-black font-bold">
                        <Package className="w-3.5 h-3.5 mr-2 text-bmw-blue shrink-0" /> {inquiry.productType}
                      </div>
                    </div>
                  </div>

                  <div className="p-8 flex-1">
                    <div className="text-xs font-bold text-bmw-silver uppercase tracking-[0.2em] mb-3 select-none">Message Content //</div>
                    <p className="text-sm text-gray-700 leading-relaxed font-light whitespace-pre-wrap">{inquiry.message}</p>
                  </div>

                  <div className="p-6 lg:w-52 flex flex-col justify-between bg-gray-50/30 gap-6">
                    <div>
                      <span className={`inline-flex text-[10px] font-black px-2 py-1 uppercase tracking-widest ${visual.badge}`}>
                        {visual.label}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <form action={markReadAction}>
                        <input type="hidden" name="status" value="READ" />
                        <button
                          type="submit"
                          disabled={status === 'READ'}
                          className="w-full text-[10px] font-bold text-bmw-silver hover:text-bmw-black uppercase tracking-widest flex items-center justify-center gap-2 border border-gray-200 py-3 bg-white hover:border-bmw-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Eye className="w-3.5 h-3.5" /> 标记已查看
                        </button>
                      </form>

                      <form action={markRepliedAction}>
                        <input type="hidden" name="status" value="REPLIED" />
                        <button
                          type="submit"
                          disabled={status === 'REPLIED'}
                          className="w-full text-[10px] font-bold text-green-700 uppercase tracking-widest flex items-center justify-center gap-2 border border-green-200 py-3 bg-green-50 hover:border-green-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Reply className="w-3.5 h-3.5" /> 标记已回复
                        </button>
                      </form>

                      {status !== 'PENDING' && (
                        <form action={markReadAction}>
                          <input type="hidden" name="status" value="PENDING" />
                          <button
                            type="submit"
                            className="w-full text-[10px] font-bold text-bmw-red uppercase tracking-widest flex items-center justify-center gap-2 border border-bmw-red/20 py-3 bg-bmw-red/5 hover:border-bmw-red transition-colors"
                          >
                            <Inbox className="w-3.5 h-3.5" /> 重新设为待处理
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
