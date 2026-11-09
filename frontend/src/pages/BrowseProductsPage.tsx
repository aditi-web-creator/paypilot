import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ProductCard } from '../components/common/ProductCard';
import { ProductDetailModal } from '../components/common/ProductDetailModal';
import { ComparisonModal } from '../components/common/ComparisonModal';
import { productService } from '../services/productService';
import { Product, ComparisonMatrix } from '../types';

export const BrowseProductsPage: React.FC = () => {
  const navigate = useNavigate();

  // Catalog state
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState('relevance');

  // Metadata
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [comparingIds, setComparingIds] = useState<string[]>([]);
  const [comparisonMatrix, setComparisonMatrix] = useState<ComparisonMatrix | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Load categories & brands initially
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, brs] = await Promise.all([
          productService.getCategories(),
          productService.getBrands(),
        ]);
        setCategories(cats);
        setBrands(brs);
      } catch (e) {
        console.error('Failed to load metadata:', e);
      }
    }
    loadMeta();
  }, []);

  // Fetch products whenever filters change
  useEffect(() => {
    async function fetchCatalog() {
      try {
        setIsLoading(true);
        const res = await productService.getProducts({
          q: searchTerm,
          category: selectedCategory,
          brand: selectedBrand,
          minPrice,
          maxPrice,
          sort: sortBy,
          page,
          limit: 16,
        });

        setProducts(res.products);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      } catch (e) {
        console.error('Failed to query catalog:', e);
      } finally {
        setIsLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchCatalog();
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedBrand, minPrice, maxPrice, sortBy, page]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSortBy('relevance');
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

  return (
    <div className="space-y-6">
      {/* 1. Header & Quick AI Jump */}
      <div className="bg-white p-6 rounded-card border border-slate-200 shadow-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-slate-900">Explore Catalog</span>
            <Badge variant="emerald" size="sm">
              {total} Verified Products
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse our full 160+ item catalog across 10 categories. Filter by specifications, price, or ask
            the AI assistant about any product.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {comparingIds.length >= 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCompareOpen(true)}
              icon={<ArrowRightLeft className="w-3.5 h-3.5 text-emerald-700" />}
            >
              Compare ({comparingIds.length})
            </Button>
          )}

          <Button
            size="sm"
            onClick={() => navigate('/ai-shopping')}
            icon={<Sparkles className="w-3.5 h-3.5" />}
          >
            Ask AI to Find For Me
          </Button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-card border border-slate-200 shadow-subtle space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name, brand, or feature..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-medium text-slate-700"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedBrand}
              onChange={e => {
                setSelectedBrand(e.target.value);
                setPage(1);
              }}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-medium text-slate-700"
            >
              <option value="all">All Brands</option>
              {brands.map(b => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 font-medium text-slate-700"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
              <option value="name_asc">Name: A to Z</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="md:col-span-1 flex items-center">
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="w-full py-2 px-2 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 flex items-center justify-center text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 no-scrollbar text-xs">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setPage(1);
            }}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-semibold ${
              selectedCategory === 'all'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({total})
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors font-medium ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Product Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500 text-xs">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto mb-2" />
          <span>Loading verified catalog products...</span>
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
            Try adjusting your search query, selecting a different category, or clearing the price constraints.
          </p>
          <Button variant="outline" size="sm" onClick={handleResetFilters} className="mt-4">
            Reset All Filters
          </Button>
        </div>
      )}

      {/* 4. Pagination Bar */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 rounded-card border border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total products)
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              icon={<ChevronLeft className="w-3.5 h-3.5" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
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
