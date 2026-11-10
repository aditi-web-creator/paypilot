import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, NavLink, useNavigate } from 'react-router-dom';
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
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Compass,
  Laptop,
  Headphones,
  Watch,
  Coffee,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProductCard } from '../components/common/ProductCard';
import { ProductDetailModal } from '../components/common/ProductDetailModal';
import { ComparisonModal } from '../components/common/ComparisonModal';
import { MarkdownText } from '../components/common/MarkdownText';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
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
import {
  formatMoney,
  formatMoneySpoken,
  getCurrencySymbol,
  convertFromUSD,
} from '../utils/currency';

export const AiShoppingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cart, itemCount, refreshCart } = useCart();
  const { fullName, currency, monthlyLimitUSD } = useSettings();

  // Active session and message state
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string>('Ready');
  const [catalogCount, setCatalogCount] = useState<number>(384);

  // Voice Assistant State
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);

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

  // Load real catalog count initially
  useEffect(() => {
    async function loadCatalogCount() {
      try {
        const count = await productService.getTotalCount();
        setCatalogCount(count);
      } catch {
        setCatalogCount(384);
      }
    }
    loadCatalogCount();
  }, []);

  // Initialize Web Speech API SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currency === 'INR' ? 'en-IN' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputValue(transcript);

        // Check Safety Rule: saying "checkout" opens Review Cart screen only
        const lower = transcript.toLowerCase();
        if (
          lower.includes('checkout') ||
          lower.includes('check out') ||
          lower.includes('go to cart') ||
          lower.includes('review cart')
        ) {
          recognition.stop();
          setIsListening(false);
          speakSummary(
            'Navigating to your shopping cart for manual review. Per PayPilot safety rules, payments cannot be finalized by voice and require your explicit authorization.'
          );
          navigate('/cart');
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition initialization failed:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [currency, navigate]);

  // Initial personalized welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome_1',
          role: 'assistant',
          content: `Hi **${fullName}**! I'm **PayPilot**, your personal AI shopping assistant.\n\nTell me what you're looking for, your budget in **${currency}**, and any preferred features. I will search our verified **${catalogCount}-item** database, verify your monthly budget limit (**${formatMoney(monthlyLimitUSD, currency)}**), and prepare your order for PayPal Sandbox checkout.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    // Handle prompt passed via URL params
    const initialPrompt = searchParams.get('prompt');
    if (initialPrompt && messages.length <= 1) {
      handleSendMessage(initialPrompt);
    }
  }, [searchParams, fullName, currency, catalogCount, monthlyLimitUSD]);

  // Voice toggle: Start or stop listening
  const handleToggleVoice = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Could not start recognition:', err);
      }
    }
  };

  // Text to Speech playback with spoken currency names
  const speakSummary = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    // Strip markdown formatting symbols for clean speech
    const clean = text
      .replace(/[*#_`]/g, '')
      .replace(/•/g, '')
      .replace(/\$([0-9,.]+)/g, '$1 dollars')
      .replace(/₹([0-9,.]+)/g, '$1 rupees')
      .slice(0, 250);

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = currency === 'INR' ? 'en-IN' : 'en-US';
    utterance.rate = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleToggleTts = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setTtsEnabled(false);
    } else {
      setTtsEnabled(true);
      const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
      if (lastAssistantMsg) {
        speakSummary(lastAssistantMsg.content);
      }
    }
  };

  // Execute user message with backend agent
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isSending) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setInputValue('');
    setIsSending(true);
    setAgentStatus('Searching database...');

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res: ChatResponseData = await aiService.sendMessage(text, sessionId, {
        userName: fullName,
        currency,
        monthlyLimitUSD,
      });

      if (res.sessionId) setSessionId(res.sessionId);
      if (res.requirements) setRequirements(res.requirements);
      if (res.recommendations && res.recommendations.length > 0) {
        setRecommendations(res.recommendations);
      }
      if (res.activitySteps) {
        setCurrentActivities(res.activitySteps);
      }

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
      await refreshCart();

      // Read summary aloud if TTS enabled
      if (ttsEnabled) {
        speakSummary(res.reply);
      }

      // On mobile view, switch tab to matches
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
          content: `⚠️ Your shopping assistant encountered an error: ${err.message || 'Please try again.'}`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setAgentStatus('Ready');
    } finally {
      setIsSending(false);
    }
  };

  const handleClearSession = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSessionId(undefined);
    setRecommendations([]);
    setRequirements(null);
    setCurrentActivities([]);
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        role: 'assistant',
        content: `Hi **${fullName}**! Session refreshed. What would you like to buy today? State your criteria or maximum budget in **${currency}**.`,
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

  // 4 Clickable Starter Cards with Converted Currency Amounts
  const starterCards = [
    {
      title: 'Wireless ANC Headphones',
      icon: Headphones,
      budgetUSD: 60,
      description: 'Active noise cancellation & 30-hour battery',
      query: `Find wireless headphones under ${formatMoney(60, currency)} with active noise cancellation and long battery life`,
    },
    {
      title: 'Pro Coding Laptop',
      icon: Laptop,
      budgetUSD: 1200,
      description: '16GB RAM, fast NVMe SSD & long battery',
      query: `Find a programming laptop under ${formatMoney(1200, currency)} with 16GB RAM and fast SSD`,
    },
    {
      title: 'GPS Sports Smartwatch',
      icon: Watch,
      budgetUSD: 150,
      description: 'Heart rate monitor, step tracking & 5ATM waterproof',
      query: `Find a sports smartwatch under ${formatMoney(150, currency)} with heart rate sensor and GPS`,
    },
    {
      title: 'Espresso Coffee Machine',
      icon: Coffee,
      budgetUSD: 200,
      description: '15-bar Italian pressure pump & milk frother',
      query: `Find an espresso coffee maker under ${formatMoney(200, currency)} with stainless steel build`,
    },
  ];

  // Quick Suggestion Chips (responsive wrap)
  const quickChips = [
    `Running shoes under ${formatMoney(80, currency)}`,
    `Gaming headset with microphone`,
    `Ergonomic mechanical keyboard`,
    `Waterproof travel backpack under ${formatMoney(100, currency)}`,
    `Hydrating vitamin C serum under ${formatMoney(35, currency)}`,
  ];

  // Budget calculations for live right-panel meter
  const cartSubtotal = cart?.total || 0;
  const isExceeding = cartSubtotal > monthlyLimitUSD;
  const budgetUsedPercent = Math.min(100, Math.round((cartSubtotal / monthlyLimitUSD) * 100));

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* Top Banner: Split-Screen Status, Voice Controls & Mobile Tabs */}
      <div className="bg-white px-4 py-2.5 rounded-t-card border border-slate-200 border-b-0 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800">PayPilot AI Shopping Agent</span>
          </div>
          <Badge variant="emerald" size="sm" className="hidden sm:inline-flex font-bold">
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

        {/* Live Catalog Metadata & Audio Controls */}
        <div className="hidden lg:flex items-center gap-3 text-xs text-slate-500">
          <span>
            Catalog: <strong>{catalogCount} items</strong>
          </span>
          <span>•</span>
          <span>
            Monthly Limit: <strong>{formatMoney(monthlyLimitUSD, currency)}</strong>
          </span>

          {/* Speaker Audio Readout Toggle */}
          <button
            onClick={handleToggleTts}
            className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 ${
              isSpeaking || ttsEnabled
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                : 'border-slate-200 text-slate-500 hover:text-slate-800'
            }`}
            title={isSpeaking ? 'Stop voice summary' : 'Read assistant replies aloud'}
          >
            {isSpeaking ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            ) : (
              <VolumeX className="w-3.5 h-3.5" />
            )}
            <span className="text-[11px]">{isSpeaking ? 'Speaking' : 'Voice'}</span>
          </button>

          <button
            onClick={handleClearSession}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-700 ml-1"
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
                  <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
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
                  {/* Clean Markdown Rendering (handles **bold**, lists, headings) */}
                  {msg.role === 'assistant' ? (
                    <MarkdownText content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-line break-words">{msg.content}</p>
                  )}

                  {/* Backend Tool Execution Activity Steps */}
                  {msg.activitySteps && msg.activitySteps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Agent Database Operations:
                      </span>
                      {msg.activitySteps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-1.5 text-slate-600">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Recommendation pills */}
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
                          className="px-2.5 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 hover:border-emerald-500 hover:text-emerald-700 transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <span>{rec.product.name.slice(0, 22)}...</span>
                          <span className="text-emerald-700 font-bold">
                            {formatMoney(rec.product.priceUSD || rec.product.price, currency)}
                          </span>
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
                <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-slate-200 rounded-card p-3.5 shadow-sm max-w-[85%] text-slate-700">
                  <div className="flex items-center gap-2 font-semibold text-emerald-800 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
                    <span>PayPilot is searching the SQLite database & checking budget...</span>
                  </div>
                  <div className="space-y-1 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Extracting criteria in {currency}
                    </p>
                    <p className="flex items-center gap-1.5 text-emerald-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Querying {catalogCount} products & matching specs...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 4 Clickable Starter Cards shown when chat is fresh */}
            {messages.length <= 1 && (
              <div className="my-4 pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Popular AI Shopping Searches (in {currency}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {starterCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(card.query)}
                        className="p-3 text-left bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 rounded-xl transition-all shadow-xs group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-200 transition-colors">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                              {card.title}
                            </span>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-700">
                            &lt; {formatMoney(card.budgetUSD, currency)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{card.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Responsive Suggestion Chips */}
          <div className="px-4 py-2 bg-slate-50/95 border-t border-slate-200/60 flex items-center gap-1.5 overflow-x-auto text-xs no-scrollbar flex-nowrap">
            <span className="font-bold text-slate-400 uppercase text-[10px] shrink-0">Suggestions:</span>
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(`Find ${chip}`)}
                className="px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-800 whitespace-nowrap transition-colors shrink-0 shadow-xs text-[11px]"
              >
                "{chip}"
              </button>
            ))}
          </div>

          {/* Chat Input Bar with Web Speech Voice Recognition Button */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
            {isListening && (
              <div className="mb-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                <span className="font-semibold">Listening to voice input... Speak now!</span>
                <span className="text-[11px] text-slate-500 ml-auto">(Say "checkout" to review cart)</span>
              </div>
            )}

            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              {/* Mic Button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                title={isListening ? 'Stop listening' : 'Speak to AI Assistant'}
                className={`p-2.5 rounded-lg border transition-all ${
                  isListening
                    ? 'bg-rose-500 border-rose-600 text-white animate-pulse shadow-md ring-2 ring-rose-200'
                    : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <input
                type="text"
                placeholder="Ask PayPilot to find anything..."
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                disabled={isSending}
                className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-slate-50/50"
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
          {/* Right Header: Active Criteria & Live Budget Guard */}
          <div className="p-4 bg-white border-b border-slate-200 space-y-3">
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
                    Target Budget: {requirements.currency === 'INR' ? '₹' : requirements.currency === 'EUR' ? '€' : requirements.currency === 'GBP' ? '£' : '$'}
                    {requirements.budget.toLocaleString()} {requirements.currency}
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
                  {formatMoney(cartSubtotal, currency)} / {formatMoney(monthlyLimitUSD, currency)}
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
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
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
                  <span className="font-semibold text-slate-800">Top Curated Recommendations</span>
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
                  Type or speak a shopping request on the left. PayPilot will query the SQLite database, evaluate your budget, and display curated cards here.
                </p>
                <NavLink to="/browse" className="mt-4">
                  <Button variant="outline" size="sm" icon={<Layers className="w-3.5 h-3.5" />}>
                    Browse Full Catalog ({catalogCount} items)
                  </Button>
                </NavLink>
              </div>
            )}
          </div>

          {/* Sticky Bottom Cart Checkout Drawer */}
          {itemCount > 0 && (
            <div className="p-4 bg-white border-t border-slate-200 shadow-elevated flex items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 block">
                  Cart Total ({itemCount} item{itemCount > 1 ? 's' : ''})
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  {formatMoney(cartSubtotal, currency)}
                </span>
              </div>

              <div className="flex gap-2">
                <NavLink to="/cart">
                  <Button size="sm" variant="primary" icon={<ShoppingBag className="w-4 h-4" />}>
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
