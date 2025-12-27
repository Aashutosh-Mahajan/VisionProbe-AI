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
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 h-20 flex items-center">
            <div className="container mx-auto px-6">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Dashboard</span>
                </button>
            </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8 tracking-tight">Billing & Plans</h1>
                
                <div className="space-y-6">
                    {/* Current Plan */}
                    <div className="bg-gradient-to-br from-indigo-600/90 to-purple-600/90 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div>
                                <div className="text-indigo-200 font-medium mb-1">Current Plan</div>
                                <h2 className="text-3xl font-bold text-white mb-2">Pro Plan</h2>
                                <p className="text-indigo-100/80 max-w-md">
                                    You have access to advanced AI analysis, unlimited uploads, and priority support.
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">$29<span className="text-lg text-indigo-200 font-normal">/mo</span></div>
                                <div className="text-sm text-indigo-200 mt-1">Next billing: Jan 01, 2025</div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10 flex flex-wrap gap-4">
                            <button className="px-5 py-2.5 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                                Upgrade Plan
                            </button>
                            <button className="px-5 py-2.5 bg-indigo-800/50 text-white font-medium rounded-xl hover:bg-indigo-800/70 transition-colors border border-indigo-400/30">
                                Cancel Subscription
                            </button>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-white mb-6">Payment Method</h2>
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center border border-white/10">
                                    <div className="w-6 h-4 bg-white/80 rounded-sm"></div>
                                </div>
                                <div>
                                    <div className="text-white font-medium">Visa ending in 4242</div>
                                    <div className="text-xs text-white/50">Expires 12/2028</div>
                                </div>
                            </div>
                            <button className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                                Edit
                            </button>
                        </div>
                    </div>

                    {/* Invoice History */}
                    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
                        <h2 className="text-lg font-semibold text-white mb-6">Invoice History</h2>
                        <div className="space-y-1">
                            {invoices.map((invoice) => (
                                <div key={invoice.id} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-400">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-white font-medium">{invoice.date}</div>
                                            <div className="text-xs text-white/50">{invoice.id}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-white font-medium">{invoice.amount}</span>
                                        <button className="p-2 text-white/40 hover:text-white transition-colors">
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