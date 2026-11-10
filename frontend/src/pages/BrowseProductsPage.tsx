import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  RotateCcw,
  Star,
  Check,
  X,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProductCard } from '../components/common/ProductCard';
import { ProductDetailModal } from '../components/common/ProductDetailModal';
import { ComparisonModal } from '../components/common/ComparisonModal';
import { productService } from '../services/productService';
import { Product, ComparisonMatrix } from '../types';
import { useSettings } from '../context/SettingsContext';
import {
  formatMoney,
  convertFromUSD,
  convertToUSD,
  getCurrencySymbol,
} from '../utils/currency';

export const BrowseProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currency } = useSettings();

  // Catalog state
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState('all');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Currency-aware price slider state
  // Default max USD is 2500
  const maxUsdCap = 2500;
  const initialMaxInCurr = Math.round(convertFromUSD(maxUsdCap, currency));
  const [maxPriceInCurr, setMaxPriceInCurr] = useState<number>(initialMaxInCurr);

  // Metadata
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategoriesMap, setSubcategoriesMap] = useState<Record<string, string[]>>({});
  const [brands, setBrands] = useState<string[]>([]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const [comparisonMatrix, setComparisonMatrix] = useState<ComparisonMatrix | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Load categories, subcategories, & brands initially
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catData, brs] = await Promise.all([
          productService.getCategoriesWithSubcategories(),
          productService.getBrands(),
        ]);
        setCategories(catData.categories);
        setSubcategoriesMap(catData.subcategories);
        setBrands(brs);
      } catch (e) {
        console.error('Failed to load metadata:', e);
      }
    }
    loadMeta();
  }, []);

  // Update slider ceiling when user switches currency
  useEffect(() => {
    const updatedMax = Math.round(convertFromUSD(maxUsdCap, currency));
    setMaxPriceInCurr(updatedMax);
  }, [currency]);

  // Dynamically load brands when category changes
  useEffect(() => {
    async function updateBrands() {
      try {
        const brs = await productService.getBrands(selectedCategory);
        setBrands(brs);
        // Clear brands that are no longer in the list
        setSelectedBrands(prev => prev.filter(b => brs.includes(b)));
      } catch (e) {
        console.error('Failed to refresh brands:', e);
      }
    }
    updateBrands();
  }, [selectedCategory]);

  // Calculate available subcategories for selected category
  const availableSubcategories = useMemo(() => {
    if (selectedCategory === 'all') {
      const allSubs = new Set<string>();
      Object.values(subcategoriesMap).forEach(list => list.forEach(s => allSubs.add(s)));
      return Array.from(allSubs);
    }
    return subcategoriesMap[selectedCategory] || [];
  }, [selectedCategory, subcategoriesMap]);

  // Fetch products with debounced input and server-side filtering
  useEffect(() => {
    let isCancelled = false;

    async function fetchCatalog() {
      try {
        setIsLoading(true);
        setHasError(false);

        // Convert user currency slider to USD for backend query
        const maxPriceUSD = maxPriceInCurr < Math.round(convertFromUSD(maxUsdCap, currency))
          ? convertToUSD(maxPriceInCurr, currency)
          : undefined;

        const res = await productService.getProducts({
          q: searchTerm.trim() || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
          brand: selectedBrands.length > 0 ? selectedBrands : undefined,
          maxPrice: maxPriceUSD,
          rating: minRating > 0 ? minRating : undefined,
          inStockOnly: inStockOnly ? true : undefined,
          sort: sortBy,
          page,
          limit: 16,
        });

        if (!isCancelled) {
          setProducts(res.products);
          setTotal(res.total);
          setTotalPages(res.totalPages);
        }
      } catch (e) {
        console.error('Failed to query catalog:', e);
        if (!isCancelled) {
          setHasError(true);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    const timer = setTimeout(() => {
      fetchCatalog();
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    searchTerm,
    selectedCategory,
    selectedSubcategory,
    selectedBrands,
    maxPriceInCurr,
    minRating,
    inStockOnly,
    sortBy,
    page,
    currency,
  ]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedBrands([]);
    setMinRating(0);
    setInStockOnly(false);
    setMaxPriceInCurr(Math.round(convertFromUSD(maxUsdCap, currency)));
    setSortBy('relevance');
    setPage(1);
  };

  const handleToggleBrand = (brandName: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
    );
    setPage(1);
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

  const handleAskAiToCompare = () => {
    if (comparingIds.length < 2) return;
    const prodNames = products
      .filter(p => comparingIds.includes(p.id))
      .map(p => p.name)
      .join(' vs ');
    navigate(`/ai-shopping?prompt=${encodeURIComponent(`Compare these products and recommend the best value: ${prodNames}`)}`);
  };

  const maxSliderLimitInCurr = Math.round(convertFromUSD(maxUsdCap, currency));
  const isPriceFiltered = maxPriceInCurr < maxSliderLimitInCurr;

  // Active filter count
  const activeFiltersCount =
    (selectedCategory !== 'all' ? 1 : 0) +
    (selectedSubcategory !== 'all' ? 1 : 0) +
    selectedBrands.length +
    (isPriceFiltered ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* 1. Header & AI Quick Action */}
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Browse Products</h1>
            <Badge variant="emerald" size="sm" className="font-bold">
              {total} Verified Items
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time SQLite catalog across 12 categories. Filter by brand, subcategory, rating, and price in {currency}.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {comparingIds.length >= 2 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCompareOpen(true)}
                icon={<ArrowRightLeft className="w-3.5 h-3.5 text-emerald-700" />}
              >
                Compare ({comparingIds.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAskAiToCompare}
                icon={<Sparkles className="w-3.5 h-3.5 text-emerald-700" />}
                className="hidden sm:inline-flex"
              >
                Ask AI to Compare
              </Button>
            </>
          )}

          <Button
            size="sm"
            onClick={() => navigate('/ai-shopping')}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Ask AI to Shop For Me
          </Button>
        </div>
      </div>

      {/* 2. Comprehensive Filter Console */}
      <div className="bg-white p-5 rounded-card border border-slate-200 shadow-subtle space-y-4">
        {/* Row 1: Search, Category, Subcategory, Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, brand, description, tags..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 text-slate-900 font-medium placeholder:text-slate-400"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setSelectedSubcategory('all');
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-semibold text-slate-800 cursor-pointer"
            >
              <option value="all">All 12 Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedSubcategory}
              onChange={e => {
                setSelectedSubcategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-medium text-slate-800 cursor-pointer"
            >
              <option value="all">All Subcategories</option>
              {availableSubcategories.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={e => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-semibold text-slate-800 cursor-pointer"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="newest">Newest Added</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Row 2: Price Slider, Rating, In-Stock, Brands */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center text-xs">
          {/* Price Range Slider in Active Currency */}
          <div className="md:col-span-4 space-y-1">
            <div className="flex items-center justify-between text-slate-700">
              <span className="font-semibold text-slate-600">Max Price:</span>
              <span className="font-bold text-emerald-800">
                {isPriceFiltered ? formatMoney(convertToUSD(maxPriceInCurr, currency), currency) : `Any Price (${getCurrencySymbol(currency)}${maxSliderLimitInCurr.toLocaleString()}+)`}
              </span>
            </div>
            <input
              type="range"
              min={Math.round(convertFromUSD(10, currency))}
              max={maxSliderLimitInCurr}
              step={Math.round(convertFromUSD(10, currency)) || 1}
              value={maxPriceInCurr}
              onChange={e => {
                setMaxPriceInCurr(Number(e.target.value));
                setPage(1);
              }}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Rating Filter Buttons */}
          <div className="md:col-span-4 flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-slate-600 mr-1">Rating:</span>
            {[0, 4.0, 4.5].map(r => (
              <button
                key={r}
                onClick={() => {
                  setMinRating(r);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md border text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                  minRating === r
                    ? 'bg-emerald-700 text-white border-emerald-700'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {r === 0 ? (
                  'All'
                ) : (
                  <>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{r}+</span>
                  </>
                )}
              </button>
            ))}
          </div>

          {/* In Stock Only Checkbox */}
          <div className="md:col-span-2 flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={e => {
                  setInStockOnly(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 accent-emerald-600"
              />
              <span>In-stock only</span>
            </label>
          </div>

          {/* Reset Action */}
          <div className="md:col-span-2 flex justify-end">
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear all ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>

        {/* Multi-Select Brand Chips */}
        {brands.length > 0 && (
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-slate-500 text-[11px] uppercase tracking-wider shrink-0">
              Popular Brands:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {brands.slice(0, 14).map(b => {
                const isSelected = selectedBrands.includes(b);
                return (
                  <button
                    key={b}
                    onClick={() => handleToggleBrand(b)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-emerald-600" />}
                    <span>{b}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
            <span className="text-[11px] font-semibold text-slate-500">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedSubcategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                Subcategory: {selectedSubcategory}
                <button onClick={() => setSelectedSubcategory('all')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedBrands.map(b => (
              <span
                key={b}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800"
              >
                Brand: {b}
                <button onClick={() => handleToggleBrand(b)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {isPriceFiltered && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                Under {formatMoney(convertToUSD(maxPriceInCurr, currency), currency)}
                <button onClick={() => setMaxPriceInCurr(maxSliderLimitInCurr)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                Rating: {minRating}+ ★
                <button onClick={() => setMinRating(0)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                In Stock Only
                <button onClick={() => setInStockOnly(false)}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                Keyword: "{searchTerm}"
                <button onClick={() => setSearchTerm('')}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Product Cards Grid with Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="bg-white rounded-card border border-slate-200 p-4 space-y-3 animate-pulse"
            >
              <div className="aspect-[4/3] bg-slate-200 rounded-lg" />
              <div className="h-3 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                <div className="h-5 bg-slate-200 rounded w-1/3" />
                <div className="h-8 bg-slate-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : hasError ? (
        <div className="bg-white p-12 rounded-card border border-rose-200 text-center">
          <Layers className="w-10 h-10 text-rose-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">Unable to load catalog products</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            The server database connection experienced a momentary interruption. Please click retry.
          </p>
          <Button size="sm" onClick={() => setPage(p => p)} className="mt-4">
            Retry Search
          </Button>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onViewDetails={prod => {
                setSelectedProduct(prod);
                setIsDetailOpen(true);
              }}
              onCompare={handleToggleCompare}
              isComparing={comparingIds.includes(p.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-card border border-slate-200 text-center">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No products match your filters</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No items matched your combination of category, price, brand, or rating. Try adjusting or clearing your active filters.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-4 font-semibold">
            Clear all filters
          </Button>
        </div>
      )}

      {/* 4. Pagination Bar */}
      {totalPages > 1 && (
        <div className="bg-white px-5 py-3 rounded-card border border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total products)
          </span>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => {
                setPage(p => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              icon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <span className="px-2 font-bold text-slate-700">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => {
                setPage(p => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Full Product Specifications Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onAskInAiChat={p => {
          setIsDetailOpen(false);
          navigate(`/ai-shopping?prompt=${encodeURIComponent(`Tell me about the ${p.name}`)}`);
        }}
      />

      {/* Comparison Matrix Modal */}
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
