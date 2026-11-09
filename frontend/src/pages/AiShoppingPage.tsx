import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import {
  Bot,
  Send,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  ArrowRight,
  ArrowRightLeft,
  DollarSign,
  Layers,
  Search,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProductCard } from '../components/common/ProductCard';
import { ProductDetailModal } from '../components/common/ProductDetailModal';
import { ComparisonModal } from '../components/common/ComparisonModal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { aiService, ChatResponseData } from '../services/aiService';
import { productService } from '../services/productService';
import {
  ChatMessage,
  Product,
  ProductRecommendation,
  ShoppingRequirements,
  ComparisonMatrix,
  AgentActivityStep,
} from '../types';

export const AiShoppingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { cart, itemCount } = useCart();
  const { budget } = useAuth();

  // Active session and message state
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>('Ready');

  // Right Panel State: Recommendations & Requirements
  const [requirements, setRequirements] = useState<ShoppingRequirements | null>(null);
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [currentActivities, setCurrentActivities] = useState<AgentActivityStep[]>([]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const [comparisonMatrix, setComparisonMatrix] = useState<ComparisonMatrix | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Mobile active tab ('chat' | 'results')
  const [mobileTab, setMobileTab] = useState<'chat' | 'results'>('chat');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentActivities]);

  // Initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome_1',
          role: 'assistant',
          content:
            "Hi! I'm **PayPilot**, your personal AI shopping assistant.\n\nTell me what you're looking for, your budget, and any preferred features. I will search our verified 160-product catalog, check your budget limit, and prepare your order for PayPal checkout.",
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    // If query prompt was passed via URL (e.g. from dashboard suggestions)
    const initialPrompt = searchParams.get('prompt');
    if (initialPrompt && messages.length <= 1) {
      handleSendMessage(initialPrompt);
    }
  }, [searchParams]);

  // Execute user message
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isSending) return;

    setInputValue('');
    setIsSending(true);
    setAgentStatus('Analyzing requirements...');

    // Append user message immediately
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res: ChatResponseData = await aiService.sendMessage(text, sessionId);

      if (res.sessionId) setSessionId(res.sessionId);
      if (res.requirements) setRequirements(res.requirements);
      if (res.recommendations && res.recommendations.length > 0) {
        setRecommendations(res.recommendations);
      }
      if (res.activitySteps) {
        setCurrentActivities(res.activitySteps);
      }

      // Append assistant response
      const assistantMsg: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        recommendations: res.recommendations,
        activitySteps: res.activitySteps,
        toolCalls: res.toolCalls,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMsg]);
      setAgentStatus('Ready');

      // On mobile, switch to results view if recommendations exist
      if (window.innerWidth < 1024 && res.recommendations?.length > 0) {
        setMobileTab('results');
      }
    } catch (err: any) {
      console.error('AI Shopping Assistant error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: 'assistant',
          content: `⚠️ Your shopping assistant encountered a temporary issue: ${err.message || 'Please try again.'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setAgentStatus('Ready');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearSession = () => {
    setSessionId(undefined);
    setRecommendations([]);
    setRequirements(null);
    setCurrentActivities([]);
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content:
          "Session cleared. What would you like to search for today? Feel free to specify your requirements and maximum budget.",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleToggleCompare = async (product: Product) => {
    let next: string[];
    if (comparingIds.includes(product.id)) {
      next = comparingIds.filter(id => id !== product.id);
    } else {
      if (comparingIds.length >= 4) {
        alert('You can compare up to 4 products simultaneously.');
        return;
      }
      next = [...comparingIds, product.id];
    }
    setComparingIds(next);

    if (next.length >= 2) {
      const matrix = await productService.compareProducts(next);
      setComparisonMatrix(matrix);
    } else {
      setComparisonMatrix(null);
    }
  };

  // Quick suggested prompts
  const suggestedPrompts = [
    'Find wireless headphones under $60 with active noise cancellation and long battery life',
    'Find a programming laptop under $1,200 with 16GB RAM and fast SSD',
    'Compare smartphones under $500 with good cameras',
    'Find a smartwatch with heart rate & GPS under $150',
  ];

  // Budget calculations for the live right panel meter
  const budgetLimit = budget?.budget_limit || 500;
  const cartSubtotal = cart?.total || 0;
  const isExceeding = cartSubtotal > budgetLimit;
  const budgetUsedPercent = Math.min(100, Math.round((cartSubtotal / budgetLimit) * 100));

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Top Banner: Split-Screen Status & Mobile Tabs */}
      <div className="bg-white px-4 py-2.5 rounded-t-card border border-slate-200 border-b-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">PayPilot AI Shopping Agent</span>
          </div>
          <Badge variant="emerald" size="sm" className="hidden sm:inline-flex">
            {agentStatus}
          </Badge>
        </div>

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setMobileTab('chat')}
            className={`px-3 py-1 rounded-md transition-colors ${
              mobileTab === 'chat' ? 'bg-white shadow text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            Chat ({messages.length})
          </button>
          <button
            onClick={() => setMobileTab('results')}
            className={`px-3 py-1 rounded-md transition-colors ${
              mobileTab === 'results' ? 'bg-white shadow text-emerald-800 font-bold' : 'text-slate-600'
            }`}
          >
            Matches ({recommendations.length})
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500">
          <span>Catalog: <strong>160 items</strong></span>
          <span>•</span>
          <span>Budget Limit: <strong>${budgetLimit.toFixed(2)}</strong></span>
          <button
            onClick={handleClearSession}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-700 ml-2"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Split-Screen Main Area: 60% Left, 40% Right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 bg-white rounded-b-card border border-slate-200 overflow-hidden shadow-subtle min-h-0">
        {/* ========================================================= */}
        {/* LEFT PANEL (~60%): AI Shopping Conversation */}
        {/* ========================================================= */}
        <div
          className={`lg:col-span-7 flex flex-col border-r border-slate-200 h-full overflow-hidden ${
            mobileTab === 'chat' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/50">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-card p-3.5 leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-emerald-700 text-white font-medium rounded-br-sm'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-sm'
                  }`}
                >
                  {/* Markdown formatted content */}
                  <div className="whitespace-pre-line space-y-2">
                    {msg.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="break-words">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* Backend Tool Execution Activity Steps (genuine transparency) */}
                  {msg.activitySteps && msg.activitySteps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Backend Agent Operations:
                      </span>
                      {msg.activitySteps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-1.5 text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                          <span>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Preview pills if recommendation attached */}
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block w-full">
                        Curated Recommendations:
                      </span>
                      {msg.recommendations.map(rec => (
                        <button
                          key={rec.product.id}
                          onClick={() => {
                            setSelectedProduct(rec.product);
                            setIsDetailOpen(true);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:border-emerald-500 hover:text-emerald-700 transition-colors flex items-center gap-1"
                        >
                          <span>{rec.product.name.slice(0, 22)}...</span>
                          <span className="text-emerald-700 font-bold">${rec.product.price}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* In-Progress Activity Indicator */}
            {isSending && (
              <div className="flex gap-3 text-xs sm:text-sm">
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-card p-3.5 shadow-sm max-w-[85%] text-slate-700">
                  <div className="flex items-center gap-2 font-semibold text-emerald-800 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                    <span>PayPilot is searching catalog & evaluating budget...</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Extracting requirements & budget
                    </p>
                    <p className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Scoring 160+ products against your specifications...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompts */}
          {messages.length <= 3 && (
            <div className="px-4 py-2 bg-slate-50/90 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
              <span className="font-bold text-slate-400 uppercase text-[10px] flex-shrink-0">
                Try:
              </span>
              {suggestedPrompts.map(p => (
                <button
                  key={p}
                  onClick={() => handleSendMessage(p)}
                  className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-800 whitespace-nowrap transition-colors flex-shrink-0 shadow-xs"
                >
                  "{p.slice(0, 32)}..."
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask PayPilot (e.g. Find wireless headphones under $60 with ANC)..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                disabled={isSending}
                className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50/50"
              />
              <Button
                type="submit"
                size="md"
                isLoading={isSending}
                disabled={!inputValue.trim() || isSending}
                icon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </form>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT PANEL (~40%): Live Recommendations & Budget Meter */}
        {/* ========================================================= */}
        <div
          className={`lg:col-span-5 flex flex-col h-full overflow-hidden bg-slate-50/30 ${
            mobileTab === 'results' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Right Header: Requirement Summary & Budget Guard */}
          <div className="p-4 bg-white border-b border-slate-200 space-y-3">
            {/* Requirement Summary Badges */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-emerald-700" />
                Active Shopping Criteria
              </span>
              {comparingIds.length >= 2 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCompareOpen(true)}
                  icon={<ArrowRightLeft className="w-3.5 h-3.5 text-emerald-700" />}
                >
                  Compare ({comparingIds.length})
                </Button>
              )}
            </div>

            {requirements ? (
              <div className="flex flex-wrap gap-1.5 text-xs">
                {requirements.category && (
                  <Badge variant="emerald" size="sm">
                    Category: {requirements.category}
                  </Badge>
                )}
                {requirements.budget && (
                  <Badge variant="blue" size="sm">
                    Target Budget: ${requirements.budget} {requirements.currency}
                  </Badge>
                )}
                {requirements.preferences?.map(p => (
                  <Badge key={p} variant="gray" size="sm">
                    {p}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                State your request in chat to extract specifications and budget constraints.
              </p>
            )}

            {/* Real-time Budget Guard Indicator */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-600 font-medium">Cart Total vs Limit:</span>
                <span className={`font-bold ${isExceeding ? 'text-rose-600' : 'text-emerald-700'}`}>
                  ${cartSubtotal.toFixed(2)} / ${budgetLimit.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isExceeding ? 'bg-rose-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${budgetUsedPercent}%` }}
                />
              </div>
              {isExceeding && (
                <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Cart exceeds authorized limit. Adjust cart before checkout.
                </p>
              )}
            </div>
          </div>

          {/* Recommendations Card List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {recommendations.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold">Top Curated Recommendations</span>
                  <span>{recommendations.length} items ranked</span>
                </div>

                {recommendations.map(rec => (
                  <ProductCard
                    key={rec.product.id}
                    product={rec.product}
                    recommendation={rec}
                    onViewDetails={p => {
                      setSelectedProduct(p);
                      setIsDetailOpen(true);
                    }}
                    onCompare={handleToggleCompare}
                    isComparing={comparingIds.includes(rec.product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                  <Bot className="w-6 h-6 text-slate-400" />
                </div>
                <h4 className="text-sm font-bold text-slate-700">No active recommendations yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Type a shopping request on the left. The AI agent will extract your budget, match specs,
                  and display curated cards here.
                </p>
                <NavLink to="/browse" className="mt-4">
                  <Button variant="outline" size="sm" icon={<Layers className="w-3.5 h-3.5" />}>
                    Or Browse Full Catalog (160 items)
                  </Button>
                </NavLink>
              </div>
            )}
          </div>

          {/* Sticky Bottom Cart Checkout Drawer */}
          {itemCount > 0 && (
            <div className="p-4 bg-white border-t border-slate-200 shadow-elevated flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 block">Cart Total ({itemCount} item{itemCount > 1 ? 's' : ''})</span>
                <span className="text-base font-extrabold text-slate-900">
                  ${cartSubtotal.toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2">
                <NavLink to="/cart">
                  <Button
                    size="sm"
                    variant="primary"
                    icon={<ShoppingBag className="w-4 h-4" />}
                  >
                    Review Cart & Checkout
                  </Button>
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full Product Specifications Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAskInAiChat={p => {
          setIsDetailOpen(false);
          handleSendMessage(`Tell me all specifications and details about the ${p.name}`);
        }}
      />

      {/* Comparison Modal */}
      <ComparisonModal
        comparison={comparisonMatrix}
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onRemoveProduct={pid => {
          const next = comparingIds.filter(id => id !== pid);
          setComparingIds(next);
          if (next.length >= 2) {
            productService.compareProducts(next).then(setComparisonMatrix);
          } else {
            setIsCompareOpen(false);
          }
        }}
      />
    </div>
  );
};
