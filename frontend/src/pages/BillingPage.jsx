import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Check, Download, Clock } from 'lucide-react';

const BillingPage = () => {
  const navigate = useNavigate();

  const invoices = [
    { id: 'INV-2024-001', date: 'Dec 01, 2024', amount: '$29.00', status: 'Paid' },
    { id: 'INV-2024-002', date: 'Nov 01, 2024', amount: '$29.00', status: 'Paid' },
    { id: 'INV-2024-003', date: 'Oct 01, 2024', amount: '$29.00', status: 'Paid' },
  ];

  return (
    <div className="min-h-screen relative flex flex-col text-foreground overflow-x-hidden">
      {/* Background Image */}
      <div 
          className="fixed inset-0 z-0"
          style={{
              backgroundImage: 'url("/static/background1.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
          }}
      >
          <div className="absolute inset-0 bg-[#0D0D0C]/80 backdrop-blur-[4px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 h-20 flex items-center">
            <div className="container mx-auto px-6">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[#F7F4EF]/70 hover:text-[#F7F4EF] transition-colors bg-[#F7F4EF]/5 hover:bg-[#F7F4EF]/10 px-4 py-2 rounded-full border border-[#F7F4EF]/10 backdrop-blur-md text-sm font-medium">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>
            </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                <h1 className="font-serif text-[clamp(32px,4vw,42px)] font-normal text-[#F7F4EF] mb-10 tracking-tight">Billing & Plans</h1>
                
                <div className="space-y-8">
                    {/* Current Plan */}
                    <div className="bg-gradient-to-br from-[#0D0D0C]/80 to-[#0D0D0C] backdrop-blur-xl border border-[#F7F4EF]/20 rounded-[28px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="text-[13px] font-medium text-[#F7F4EF]/60 uppercase tracking-widest mb-2">Current Plan</div>
                                <h2 className="font-serif text-3xl font-medium text-[#F7F4EF] mb-3 tracking-tight">Pro Plan</h2>
                                <p className="text-[15px] font-light text-[#F7F4EF]/70 max-w-md leading-relaxed">
                                    You have access to advanced AI analysis, unlimited uploads, and priority support.
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="font-serif text-4xl font-medium text-[#F7F4EF] tracking-[-0.02em]">$29<span className="text-xl text-[#F7F4EF]/50 font-normal">/mo</span></div>
                                <div className="text-[13px] font-light text-[#F7F4EF]/50 mt-2">Next billing: Jan 01, 2025</div>
                            </div>
                        </div>

                        <div className="mt-10 pt-8 border-t border-[#F7F4EF]/10 flex flex-wrap gap-4">
                            <button className="px-6 py-2.5 bg-[#F7F4EF] text-[#0D0D0C] font-medium rounded-xl hover:bg-gray-200 transition-colors shadow-lg shadow-[#F7F4EF]/5">
                                Upgrade Plan
                            </button>
                            <button className="px-6 py-2.5 bg-[#F7F4EF]/5 text-[#F7F4EF] font-medium rounded-xl hover:bg-[#F7F4EF]/10 transition-colors border border-[#F7F4EF]/10 shadow-sm">
                                Cancel Subscription
                            </button>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-[#0D0D0C]/60 backdrop-blur-xl border border-[#F7F4EF]/10 rounded-[24px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
                        <h2 className="font-serif text-2xl font-medium text-[#F7F4EF] tracking-[-0.01em] mb-8">Payment Method</h2>
                        <div className="flex items-center justify-between p-5 bg-[#0D0D0C]/50 border border-[#F7F4EF]/10 rounded-xl shadow-inner">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-9 bg-[#F7F4EF]/10 rounded flex items-center justify-center border border-[#F7F4EF]/10 backdrop-blur-sm">
                                    <div className="w-7 h-4 bg-[#F7F4EF]/90 rounded-[2px]"></div>
                                </div>
                                <div>
                                    <div className="text-[15px] font-medium text-[#F7F4EF] tracking-wide mb-0.5">Visa ending in 4242</div>
                                    <div className="text-[13px] font-light text-[#F7F4EF]/60">Expires 12/2028</div>
                                </div>
                            </div>
                            <button className="text-[13px] text-[#F7F4EF]/70 hover:text-[#F7F4EF] font-medium transition-colors border border-[#F7F4EF]/10 bg-[#F7F4EF]/5 hover:bg-[#F7F4EF]/10 px-4 py-2 rounded-lg">
                                Edit
                            </button>
                        </div>
                    </div>

                    {/* Invoice History */}
                    <div className="bg-[#0D0D0C]/60 backdrop-blur-xl border border-[#F7F4EF]/10 rounded-[24px] p-8 md:p-10 shadow-[0_24px_60px_rgba(0,0,0,0.4)]">
                        <h2 className="font-serif text-2xl font-medium text-[#F7F4EF] tracking-[-0.01em] mb-8">Invoice History</h2>
                        <div className="space-y-2">
                            {invoices.map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-5 hover:bg-[#F7F4EF]/5 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-[#F7F4EF]/10">
                                    <div className="flex items-center gap-5">
                                        <div className="p-2.5 rounded-full bg-green/20 text-green-2 shadow-sm">
                                            <Check className="w-4 h-4 text-green-2" />
                                        </div>
                                        <div>
                                            <div className="text-[15px] font-medium text-[#F7F4EF] tracking-wide mb-0.5">{invoice.date}</div>
                                            <div className="text-[13px] font-light text-[#F7F4EF]/50">{invoice.id}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8">
                                        <span className="text-[15px] font-medium text-[#F7F4EF]">{invoice.amount}</span>
                                        <button className="p-2 text-[#F7F4EF]/40 hover:text-[#F7F4EF] transition-colors rounded-lg hover:bg-[#F7F4EF]/5">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default BillingPage;