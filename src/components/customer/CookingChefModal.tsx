import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { apiService } from '../../services/api';
import { CookingRecipe, RecipeIngredient, RecipeStep } from '../../types';
import { sound } from '../../utils/sound';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  X,
  ChefHat,
  Clock,
  Gauge,
  Users,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Timer,
  Play,
  Pause,
  RotateCcw,
  Check,
  Camera,
  Upload,
  Plus,
  Minus,
  UtensilsCrossed,
  Layers,
  AlertCircle,
  PartyPopper
} from 'lucide-react';

interface CookingChefModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'dish_name' | 'dish_image' | 'ingredients' | 'fridge_image';
  initialDishName?: string;
}

export const CookingChefModal: React.FC<CookingChefModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'dish_name',
  initialDishName = '',
}) => {
  const { lang, isRtl, addToCart, setIsCartOpen, stores, products } = useApp();
  const t = translations[lang];

  // Workflow phases: 'input' -> 'recipe' -> 'cooking' -> 'completed'
  const [phase, setPhase] = useState<'input' | 'recipe' | 'cooking' | 'completed'>('input');
  const [inputMode, setInputMode] = useState<'dish_name' | 'dish_image' | 'ingredients' | 'fridge_image'>(initialMode);

  // Input states
  const [dishNameInput, setDishNameInput] = useState(initialDishName);
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([
    'صدر دجاج',
    'جبنة',
    'طماطم',
    'بصل',
  ]);
  const [newIngredientText, setNewIngredientText] = useState('');
  const [servingsCount, setServingsCount] = useState(4);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);

  // Loading & Recipe State
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [recipe, setRecipe] = useState<CookingRecipe | null>(null);
  const [addedMissingSuccess, setAddedMissingSuccess] = useState(false);

  // Cooking Mode State (Step-by-step)
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset or preset when opened
  useEffect(() => {
    if (isOpen) {
      if (initialDishName && !recipe) {
        setDishNameInput(initialDishName);
        fetchRecipe('dish_name', initialDishName);
      }
    } else {
      setIsTimerRunning(false);
    }
  }, [isOpen, initialDishName]);

  // Interactive Countdown Timer
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsRemaining !== null && timerSecondsRemaining > 0) {
      interval = setInterval(() => {
        setTimerSecondsRemaining((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerRunning(false);
            sound.playBellRing();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsRemaining]);

  if (!isOpen) return null;

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Recipe fetcher
  const fetchRecipe = async (
    mode: 'dish_name' | 'dish_image' | 'ingredients' | 'fridge_image',
    overrideName?: string
  ) => {
    setIsLoadingRecipe(true);
    setAddedMissingSuccess(false);

    try {
      const res = await apiService.generateCookingRecipe({
        mode,
        dishName: overrideName !== undefined ? overrideName : dishNameInput,
        ingredientsList: mode === 'ingredients' || mode === 'fridge_image' ? selectedIngredients : [],
        imageBase64: uploadedImagePreview || undefined,
        servings: servingsCount,
        lang,
      });

      if (res) {
        setRecipe(res);
        setPhase('recipe');
        setCurrentStepIndex(0);
        sound.playSuccess();
      }
    } catch (err) {
      console.error('Error fetching recipe:', err);
    } finally {
      setIsLoadingRecipe(false);
    }
  };

  // Toggle single ingredient availability
  const toggleIngredientAvailability = (ingId: string) => {
    if (!recipe) return;
    setRecipe({
      ...recipe,
      ingredients: recipe.ingredients.map((item) =>
        item.id === ingId ? { ...item, isAvailable: !item.isAvailable } : item
      ),
    });
  };

  // Missing items calculation
  const missingIngredients = recipe ? recipe.ingredients.filter((i) => !i.isAvailable) : [];
  const missingTotalCost = missingIngredients.reduce(
    (sum, i) => sum + (i.supermarketPrice || 2.5),
    0
  );

  // Add all missing ingredients to cart
  const handleOrderMissingIngredients = () => {
    if (!recipe || missingIngredients.length === 0) return;

    const supermarketStore = stores.find((s) => s.id === 'st-4') || stores[0];

    missingIngredients.forEach((ing) => {
      // Find matching product
      let matchedProd = products.find((p) => p.id === ing.matchedProductId);
      if (!matchedProd) {
        matchedProd = products.find(
          (p) =>
            p.storeId === supermarketStore.id &&
            (p.nameAr.includes(ing.nameAr) || ing.nameAr.includes(p.nameAr))
        );
      }
      if (!matchedProd) {
        matchedProd = products.find((p) => p.storeId === supermarketStore.id) || products[0];
      }

      if (matchedProd) {
        addToCart(matchedProd, 1, [], `مكون لوصفة: ${recipe.dishNameAr}`);
      }
    });

    sound.playSuccess();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    setAddedMissingSuccess(true);
  };

  // Start Interactive Cooking Mode
  const startCookingMode = () => {
    if (!recipe || recipe.steps.length === 0) return;
    setPhase('cooking');
    setCurrentStepIndex(0);
    const firstStepTimer = recipe.steps[0]?.timerMinutes;
    if (firstStepTimer) {
      setTimerSecondsRemaining(firstStepTimer * 60);
      setIsTimerRunning(false);
    } else {
      setTimerSecondsRemaining(null);
    }
  };

  // Next Step handler
  const handleNextStep = () => {
    if (!recipe) return;
    sound.playChatPop();
    if (currentStepIndex + 1 < recipe.steps.length) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      const nextTimer = recipe.steps[nextIdx]?.timerMinutes;
      if (nextTimer) {
        setTimerSecondsRemaining(nextTimer * 60);
        setIsTimerRunning(false);
      } else {
        setTimerSecondsRemaining(null);
      }
    } else {
      // Completed all steps!
      setPhase('completed');
      sound.playSuccess();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
  };

  const handlePrevStep = () => {
    if (!recipe || currentStepIndex === 0) return;
    const prevIdx = currentStepIndex - 1;
    setCurrentStepIndex(prevIdx);
    const prevTimer = recipe.steps[prevIdx]?.timerMinutes;
    if (prevTimer) {
      setTimerSecondsRemaining(prevTimer * 60);
      setIsTimerRunning(false);
    } else {
      setTimerSecondsRemaining(null);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-xl h-[92vh] max-h-[780px] rounded-3xl shadow-2xl overflow-hidden border border-stone-100 flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-4 shrink-0 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-stone-950 flex items-center justify-center font-black shadow-md">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black leading-tight">
                  {isRtl ? 'شيف ومساعد الطبخ الذكي' : 'AI Cooking Chef & Recipes'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-black border border-amber-400/30">
                  {isRtl ? 'طلب النواقص فوري' : 'Live Grocery Sync'}
                </span>
              </div>
              <p className="text-[10px] text-emerald-200 mt-0.5">
                {isRtl
                  ? 'اختر وصفتك، افحص النواقص واطلبها فوراً، ثم اطبخ خطوة بخطوة'
                  : 'Choose recipe, order missing ingredients, cook step-by-step'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {phase !== 'input' && (
              <button
                onClick={() => setPhase('input')}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isRtl ? 'وصفة أخرى' : 'New Dish'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-50/50 space-y-4">
          
          {/* ========================================================================= */}
          {/* PHASE 1: INPUT MODES (4 Start Methods) */}
          {/* ========================================================================= */}
          {phase === 'input' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-900 text-xs font-medium leading-relaxed">
                <span className="font-bold block mb-1">
                  {isRtl ? '🎯 كيف تفضل البدء اليوم؟' : 'How would you like to start?'}
                </span>
                {isRtl
                  ? 'يمكنك كتابة اسم الأكلة، أو رفع صورتها، أو إدخال ما يتوفر في ثلاجتك وسيقوم المساعد بتجهيز الوصفة والمكونات الناقصة فوراً.'
                  : 'Type a dish name, upload a photo, list your fridge items or photograph your shelves.'}
              </div>

              {/* 4 Tabs Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-stone-200/70 rounded-2xl">
                <button
                  onClick={() => setInputMode('dish_name')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    inputMode === 'dish_name'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>✍️</span>
                  <span>{isRtl ? 'اسم الأكلة' : 'Dish Name'}</span>
                </button>

                <button
                  onClick={() => setInputMode('dish_image')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    inputMode === 'dish_image'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>📷</span>
                  <span>{isRtl ? 'صورة طبق' : 'Dish Photo'}</span>
                </button>

                <button
                  onClick={() => setInputMode('ingredients')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    inputMode === 'ingredients'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>🥬</span>
                  <span>{isRtl ? 'مكونات متوفرة' : 'Ingredients'}</span>
                </button>

                <button
                  onClick={() => setInputMode('fridge_image')}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    inputMode === 'fridge_image'
                      ? 'bg-white text-emerald-800 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>📸</span>
                  <span>{isRtl ? 'صورة الثلاجة' : 'Fridge Scan'}</span>
                </button>
              </div>

              {/* Servings Counter Selector */}
              <div className="p-3 bg-white rounded-2xl border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-stone-700 text-xs font-bold">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>{isRtl ? 'عدد الأشخاص المقترح:' : 'Number of Servings:'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setServingsCount((prev) => Math.max(1, prev - 1))}
                    className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-black cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-black text-emerald-800 min-w-[24px] text-center">
                    {servingsCount}
                  </span>
                  <button
                    onClick={() => setServingsCount((prev) => Math.min(12, prev + 1))}
                    className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-black cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* METHOD 1: WRITE DISH NAME */}
              {inputMode === 'dish_name' && (
                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
                  <label className="text-xs font-bold text-stone-800 block">
                    {isRtl ? 'اكتب اسم الوجبة أو الطبق:' : 'Write Dish Name:'}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={dishNameInput}
                      onChange={(e) => setDishNameInput(e.target.value)}
                      placeholder={isRtl ? 'مثال: باستا ألفريدو، كبسة، بيتزا، مقلوبة...' : 'e.g. Pasta Alfredo, Kabsa, Pizza, Maqluba...'}
                      className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      onClick={() => fetchRecipe('dish_name')}
                      disabled={!dishNameInput.trim() || isLoadingRecipe}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shrink-0"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isRtl ? 'عرض الوصفة' : 'Get Recipe'}</span>
                    </button>
                  </div>

                  {/* Quick Examples Chips */}
                  <div className="pt-2">
                    <span className="text-[10px] text-stone-400 font-bold block mb-2">
                      {isRtl ? '💡 أطباق شائعة جاهزة للتجربة الفورية:' : 'Quick Popular Dishes:'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { ar: 'باستا ألفريدو', en: 'Pasta Alfredo', icon: '🍝' },
                        { ar: 'كبسة دجاج', en: 'Chicken Kabsa', icon: '🍗' },
                        { ar: 'بيتزا مارغريتا', en: 'Pizza Margherita', icon: '🍕' },
                        { ar: 'مقلوبة دجاج بالباذنجان', en: 'Chicken Maqluba', icon: '🍲' },
                      ].map((dish, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setDishNameInput(dish.ar);
                            fetchRecipe('dish_name', dish.ar);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-emerald-50 hover:border-emerald-300 border border-stone-200 text-stone-800 text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>{dish.icon}</span>
                          <span>{lang === 'ar' ? dish.ar : dish.en}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 2: UPLOAD DISH PHOTO */}
              {inputMode === 'dish_image' && (
                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
                  <div className="text-start">
                    <h4 className="text-xs font-bold text-stone-800">
                      {isRtl ? '📷 رفع أو التقاط صورة للطبق:' : 'Upload or Snap Dish Photo:'}
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      {isRtl
                        ? 'يقوم الذكاء الاصطناعي بتحليل صورة الطبق والتعرف عليه واستخراج مقاديره.'
                        : 'AI will analyze your photo, detect the recipe, and identify required ingredients.'}
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {uploadedImagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-stone-200 max-h-56">
                      <img
                        src={uploadedImagePreview}
                        alt="Uploaded dish"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => setUploadedImagePreview(null)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-emerald-50/40 hover:bg-emerald-50/80 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-emerald-900">
                        {isRtl ? 'انقر لرفع صورة الطبق أو التقاطها' : 'Click to upload or take a photo'}
                      </span>
                      <span className="text-[10px] text-stone-500">PNG, JPG, WebP</span>
                    </div>
                  )}

                  {/* Sample Presets for quick visual demo */}
                  <div>
                    <span className="text-[10px] text-stone-400 font-bold block mb-1.5">
                      {isRtl ? 'أو اختر نموذجاً جاهزاً للتحليل الفوري:' : 'Or choose sample dish to analyze:'}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => {
                          setDishNameInput('باستا ألفريدو بالكريمة');
                          fetchRecipe('dish_image', 'باستا ألفريدو');
                        }}
                        className="p-1.5 rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50 text-start cursor-pointer transition-all"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=300&auto=format&fit=crop&q=80"
                          alt="Pasta"
                          className="w-full h-14 object-cover rounded-lg mb-1"
                        />
                        <span className="text-[10px] font-bold text-stone-800 block truncate">باستا ألفريدو</span>
                      </button>

                      <button
                        onClick={() => {
                          setDishNameInput('كبسة دجاج شرقية');
                          fetchRecipe('dish_image', 'كبسة دجاج');
                        }}
                        className="p-1.5 rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50 text-start cursor-pointer transition-all"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1544025162-d76694265947?w=300&auto=format&fit=crop&q=80"
                          alt="Kabsa"
                          className="w-full h-14 object-cover rounded-lg mb-1"
                        />
                        <span className="text-[10px] font-bold text-stone-800 block truncate">كبسة دجاج</span>
                      </button>

                      <button
                        onClick={() => {
                          setDishNameInput('بيتزا مارغريتا');
                          fetchRecipe('dish_image', 'بيتزا مارغريتا');
                        }}
                        className="p-1.5 rounded-xl border border-stone-200 hover:border-emerald-500 bg-stone-50 text-start cursor-pointer transition-all"
                      >
                        <img
                          src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop&q=80"
                          alt="Pizza"
                          className="w-full h-14 object-cover rounded-lg mb-1"
                        />
                        <span className="text-[10px] font-bold text-stone-800 block truncate">بيتزا مارغريتا</span>
                      </button>
                    </div>
                  </div>

                  {uploadedImagePreview && (
                    <button
                      onClick={() => fetchRecipe('dish_image')}
                      disabled={isLoadingRecipe}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isRtl ? 'تحليل صورة الطبق واستخراج الوصفة' : 'Analyze Dish Photo'}</span>
                    </button>
                  )}
                </div>
              )}

              {/* METHOD 3: INGREDIENTS LIST */}
              {inputMode === 'ingredients' && (
                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
                  <div className="text-start">
                    <h4 className="text-xs font-bold text-stone-800">
                      {isRtl ? '🥬 اكتب المكونات الموجودة لديك:' : 'List Your Available Ingredients:'}
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      {isRtl
                        ? 'مثال: صدر دجاج، جبنة، طماطم، بصل. وسنقترح الطبق الأفضل ونكمل النواقص!'
                        : 'e.g. Chicken breast, cheese, tomatoes, onions. We will suggest a meal & supply the rest!'}
                    </p>
                  </div>

                  {/* Add ingredient input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newIngredientText}
                      onChange={(e) => setNewIngredientText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newIngredientText.trim()) {
                          setSelectedIngredients((prev) => [...prev, newIngredientText.trim()]);
                          setNewIngredientText('');
                        }
                      }}
                      placeholder={isRtl ? 'أدخل مكوناً واضغط إضافة (مثل: ثوم، مكرونة...)' : 'Type ingredient and add...'}
                      className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-900 focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      onClick={() => {
                        if (newIngredientText.trim()) {
                          setSelectedIngredients((prev) => [...prev, newIngredientText.trim()]);
                          setNewIngredientText('');
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                    >
                      {isRtl ? 'إضافة +' : 'Add +'}
                    </button>
                  </div>

                  {/* Current Ingredients Chips */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-stone-400 font-bold block">
                      {isRtl ? 'المكونات المحددة لديك حالياً:' : 'Your Selected Ingredients:'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {selectedIngredients.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-1.5"
                        >
                          <span>✓ {item}</span>
                          <button
                            onClick={() =>
                              setSelectedIngredients((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="text-stone-400 hover:text-red-500 text-xs cursor-pointer font-black"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => fetchRecipe('ingredients')}
                    disabled={selectedIngredients.length === 0 || isLoadingRecipe}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{isRtl ? 'ابتكار وصفة بهذه المكونات 👨‍🍳' : 'Craft Recipe With These Ingredients'}</span>
                  </button>
                </div>
              )}

              {/* METHOD 4: FRIDGE CAMERA SCAN */}
              {inputMode === 'fridge_image' && (
                <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3">
                  <div className="text-start">
                    <h4 className="text-xs font-bold text-stone-800">
                      {isRtl ? '📸 تصوير محتويات الثلاجة:' : 'Scan Fridge Contents:'}
                    </h4>
                    <p className="text-[10px] text-stone-500 mt-0.5">
                      {isRtl
                        ? 'التقط صورة لثلاجتك وسيتعرف الذكاء الاصطناعي على المواد المتاحة ويقترح الطبق المثالي.'
                        : 'Take a photo of your fridge shelves and AI will identify all available foods.'}
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {uploadedImagePreview ? (
                    <div className="relative rounded-2xl overflow-hidden border border-stone-200">
                      <img
                        src={uploadedImagePreview}
                        alt="Fridge scan"
                        className="w-full h-48 object-cover"
                      />
                      <button
                        onClick={() => setUploadedImagePreview(null)}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 bg-teal-50/40 hover:bg-teal-50/80 transition-all cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-teal-900">
                        {isRtl ? 'انقر لتصوير الثلاجة الآن' : 'Snap Fridge Contents Now'}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {isRtl ? 'التعرف التلقائي الذكي على المكونات' : 'Smart multi-ingredient detection'}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSelectedIngredients(['صدر دجاج', 'جبنة موزاريلا', 'طماطم', 'بصل']);
                      fetchRecipe('fridge_image', 'باستا ألفريدو أو كبسة');
                    }}
                    disabled={isLoadingRecipe}
                    className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>{isRtl ? 'تحليل الثلاجة واقتراح الطبق الأشهى ✨' : 'Analyze Fridge & Suggest Meal'}</span>
                  </button>
                </div>
              )}

              {/* Loading State Overlay */}
              {isLoadingRecipe && (
                <div className="p-6 rounded-2xl bg-white border border-emerald-200 text-center space-y-3 shadow-sm animate-pulse">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 animate-spin-slow" />
                  </div>
                  <h4 className="text-sm font-black text-stone-900">
                    {isRtl ? 'جاري تجهيز الوصفة ومطابقة المكونات بالسوبرماركت...' : 'Preparing recipe & matching supermarket stock...'}
                  </h4>
                  <p className="text-xs text-stone-500">
                    {isRtl
                      ? 'الذكاء الاصطناعي يحلل الخطوات، يحسب التكلفة التقريبية، ويحدد النواقص المطلوبة.'
                      : 'AI is optimizing cooking time, estimated cost, and missing ingredients.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 2: RECIPE VIEW & INGREDIENT CHECKLIST (After selecting recipe) */}
          {/* ========================================================================= */}
          {phase === 'recipe' && recipe && (
            <div className="space-y-4 animate-fade-in">
              {/* Dish Hero Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-lg border border-stone-200 bg-stone-900 text-white">
                <img
                  src={recipe.image}
                  alt={recipe.dishNameAr}
                  className="w-full h-44 object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent p-4 flex flex-col justify-end">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                      {isRtl ? 'وصفة شيف معتمدة' : 'Chef Certified'}
                    </span>
                    <span className="text-xs font-black text-amber-300">
                      {recipe.approximateCost.toFixed(2)} € {isRtl ? 'تكلفة تقريبية' : 'approx cost'}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white leading-tight mt-1">
                    {lang === 'ar' ? recipe.dishNameAr : recipe.dishNameEn}
                  </h3>
                  <p className="text-[11px] text-stone-200 font-medium line-clamp-2 mt-0.5">
                    {lang === 'ar' ? recipe.descriptionAr : recipe.descriptionEn}
                  </p>
                </div>
              </div>

              {/* 4 Required Meta Indicators */}
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-center shadow-2xs">
                  <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                  <span className="text-[10px] text-stone-400 font-bold block">
                    {isRtl ? 'وقت الطبخ' : 'Time'}
                  </span>
                  <span className="text-xs font-black text-stone-900">
                    {recipe.cookingTimeMinutes} {isRtl ? 'دقيقة' : 'min'}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-center shadow-2xs">
                  <Gauge className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                  <span className="text-[10px] text-stone-400 font-bold block">
                    {isRtl ? 'الصعوبة' : 'Difficulty'}
                  </span>
                  <span className="text-xs font-black text-stone-900">
                    {lang === 'ar' ? recipe.difficultyAr : recipe.difficultyEn}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-center shadow-2xs">
                  <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <span className="text-[10px] text-stone-400 font-bold block">
                    {isRtl ? 'الأشخاص' : 'Servings'}
                  </span>
                  <span className="text-xs font-black text-stone-900">
                    {recipe.servings} {isRtl ? 'أشخاص' : 'people'}
                  </span>
                </div>

                <div className="p-2.5 rounded-2xl bg-white border border-stone-200 text-center shadow-2xs">
                  <UtensilsCrossed className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                  <span className="text-[10px] text-stone-400 font-bold block">
                    {isRtl ? 'المكونات' : 'Items'}
                  </span>
                  <span className="text-xs font-black text-stone-900">
                    {recipe.ingredients.length} {isRtl ? 'أصناف' : 'items'}
                  </span>
                </div>
              </div>

              {/* INGREDIENT CHECKLIST (Exact format requested by user) */}
              <div className="p-4 bg-white rounded-3xl border border-stone-200 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="text-start">
                    <h4 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                      <span>{isRtl ? 'المكونات والمقادير المطلوبة:' : 'Required Ingredients:'}</span>
                    </h4>
                    <p className="text-[10px] text-stone-400">
                      {isRtl
                        ? 'انقر على أي مكون لتغيير حالته بين متوفر (✅) وناقص (❌)'
                        : 'Tap any item to toggle between available (✅) and missing (❌)'}
                    </p>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-stone-100 text-[10px] font-bold text-stone-700">
                    {missingIngredients.length} {isRtl ? 'ناقص' : 'missing'} / {recipe.ingredients.length}
                  </span>
                </div>

                {/* List items */}
                <div className="divide-y divide-stone-100">
                  {recipe.ingredients.map((ing) => (
                    <div
                      key={ing.id}
                      onClick={() => toggleIngredientAvailability(ing.id)}
                      className={`py-2.5 px-2 rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer select-none hover:bg-stone-50 ${
                        ing.isAvailable ? 'opacity-90' : 'bg-red-50/40 border border-red-100/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-transform ${
                            ing.isAvailable
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-red-100 text-red-600 animate-pulse'
                          }`}
                        >
                          {ing.isAvailable ? '✅' : '❌'}
                        </div>

                        <div className="min-w-0">
                          <span
                            className={`text-xs font-bold block truncate ${
                              ing.isAvailable ? 'text-stone-800' : 'text-red-950 font-black'
                            }`}
                          >
                            {lang === 'ar' ? ing.nameAr : ing.nameEn}
                          </span>
                          <span className="text-[10px] text-stone-400 block">
                            {ing.amount}
                          </span>
                        </div>
                      </div>

                      {/* Supermarket price & status badge */}
                      <div className="flex items-center gap-2 shrink-0">
                        {!ing.isAvailable ? (
                          <div className="text-end">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-100 text-red-800 text-[10px] font-black">
                              <span>{isRtl ? 'ناقص' : 'Missing'}</span>
                              <span>• {ing.supermarketPrice?.toFixed(2)} €</span>
                            </span>
                            <span className="text-[9px] text-stone-400 block mt-0.5">
                              {isRtl ? 'من سوبرماركت بلقان' : 'From Billa'}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            {isRtl ? 'متوفر بمطبخي' : 'In Kitchen'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SMART ACTION BUTTON 1: ORDER MISSING INGREDIENTS */}
              {missingIngredients.length > 0 ? (
                <div className="p-3.5 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 shadow-md space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black flex items-center gap-1.5">
                      <ShoppingBag className="w-4 h-4" />
                      <span>
                        {isRtl
                          ? `لديك ${missingIngredients.length} مكونات ناقصة لتحضير هذا الطبق!`
                          : `You have ${missingIngredients.length} missing ingredients!`}
                      </span>
                    </span>
                    <span className="text-xs font-black bg-stone-950/10 px-2 py-0.5 rounded-md">
                      {missingTotalCost.toFixed(2)} €
                    </span>
                  </div>

                  <p className="text-[11px] text-amber-950 font-medium">
                    {isRtl
                      ? 'يتم طلبها من أقرب سوبر ماركت (Billa Balkan) وتوصيلها خلال 20 دقيقة، مع إمكانية تعديل الكميات في السلة.'
                      : 'Ordered from nearest supermarket & delivered fast. Adjust amounts in cart anytime.'}
                  </p>

                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={handleOrderMissingIngredients}
                      className="flex-1 py-3 px-4 rounded-2xl bg-stone-950 hover:bg-stone-900 text-white text-xs font-black shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-300" />
                      <span>
                        {isRtl
                          ? `🛒 اطلب المكونات الناقصة (${missingIngredients.length} أصناف - ${missingTotalCost.toFixed(2)} €)`
                          : `🛒 Order Missing Items (${missingIngredients.length} items - ${missingTotalCost.toFixed(2)} €)`}
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>
                    {isRtl
                      ? 'رائع جداً! جميع المكونات متوفرة لديك الآن وجاهزة للطبخ!'
                      : 'Awesome! All ingredients are available in your kitchen!'}
                  </span>
                </div>
              )}

              {/* Banner if items were just added */}
              {addedMissingSuccess && (
                <div className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-between gap-2 shadow-md animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>
                      {isRtl
                        ? 'تمت إضافة المكونات الناقصة إلى سلتك بنجاح!'
                        : 'Missing items added to your cart!'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="px-2.5 py-1 rounded-xl bg-white text-emerald-900 text-[11px] font-black cursor-pointer shadow-xs"
                  >
                    {isRtl ? 'عرض السلة 🛒' : 'View Cart'}
                  </button>
                </div>
              )}

              {/* SMART ACTION BUTTON 2: START INTERACTIVE COOKING MODE */}
              <button
                onClick={startCookingMode}
                className="w-full py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ChefHat className="w-4 h-4 text-amber-300" />
                <span>
                  {isRtl
                    ? '👨‍🍳 ابدأ وضع الطبخ التفاعلي (خطوة بخطوة)'
                    : '👨‍🍳 Start Interactive Step-by-Step Cooking'}
                </span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 3: INTERACTIVE COOKING MODE (One Step At A Time) */}
          {/* ========================================================================= */}
          {phase === 'cooking' && recipe && (
            <div className="space-y-4 animate-fade-in">
              {/* Progress Header */}
              <div className="p-3.5 bg-white rounded-3xl border border-stone-200 space-y-2 shadow-xs">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-emerald-800 flex items-center gap-1.5">
                    <ChefHat className="w-4 h-4" />
                    <span>{lang === 'ar' ? recipe.dishNameAr : recipe.dishNameEn}</span>
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px]">
                    {isRtl
                      ? `الخطوة ${currentStepIndex + 1} من ${recipe.steps.length}`
                      : `Step ${currentStepIndex + 1} of ${recipe.steps.length}`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300 rounded-full"
                    style={{
                      width: `${((currentStepIndex + 1) / recipe.steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* SINGLE STEP DISPLAY (ONE AT A TIME) */}
              {(() => {
                const currentStep = recipe.steps[currentStepIndex];
                if (!currentStep) return null;

                return (
                  <div className="p-5 rounded-3xl bg-white border border-stone-200 shadow-md space-y-4 text-start">
                    <div className="flex items-center justify-between">
                      <span className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center text-sm font-black shadow-sm">
                        {currentStep.stepNumber}
                      </span>
                      {currentStep.timerMinutes && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black">
                          <Timer className="w-3.5 h-3.5" />
                          <span>{currentStep.timerMinutes} {isRtl ? 'دقائق' : 'mins'}</span>
                        </div>
                      )}
                    </div>

                    {/* Step Instruction */}
                    <p className="text-sm font-black text-stone-900 leading-relaxed">
                      {lang === 'ar' ? currentStep.instructionAr : currentStep.instructionEn}
                    </p>

                    {/* Optional Chef Tip */}
                    {currentStep.tipAr && (
                      <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-relaxed flex items-start gap-2">
                        <span className="text-base">💡</span>
                        <div>
                          <span className="font-black block">{isRtl ? 'نصيحة الشيف:' : 'Chef Tip:'}</span>
                          <span className="font-medium">{lang === 'ar' ? currentStep.tipAr : currentStep.tipEn}</span>
                        </div>
                      </div>
                    )}

                    {/* Step Timer Control (if step has timer) */}
                    {timerSecondsRemaining !== null && (
                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Timer className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-black text-stone-800 font-mono text-base">
                            {formatTimer(timerSecondsRemaining)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setIsTimerRunning(!isTimerRunning)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 shadow-2xs ${
                              isTimerRunning
                                ? 'bg-amber-500 text-stone-950'
                                : 'bg-emerald-600 text-white'
                            }`}
                          >
                            {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{isTimerRunning ? (isRtl ? 'إيقاف' : 'Pause') : (isRtl ? 'بدء المؤقت' : 'Start')}</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsTimerRunning(false);
                              if (currentStep.timerMinutes) {
                                setTimerSecondsRemaining(currentStep.timerMinutes * 60);
                              }
                            }}
                            className="p-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 transition-all cursor-pointer"
                            title={isRtl ? 'إعادة ضبط' : 'Reset'}
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Navigation Buttons: Done / Next */}
                    <div className="pt-2 flex items-center gap-2">
                      {currentStepIndex > 0 && (
                        <button
                          onClick={handlePrevStep}
                          className="px-3.5 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        >
                          {isRtl ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                          <span>{isRtl ? 'السابق' : 'Previous'}</span>
                        </button>
                      )}

                      <button
                        onClick={handleNextStep}
                        className="flex-1 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {currentStepIndex + 1 < recipe.steps.length
                            ? isRtl
                              ? 'اضغط تم ✅ (الخطوة التالية)'
                              : 'Done ✅ (Next Step)'
                            : isRtl
                            ? 'إنهاء الطبخ ✅ (تم بالكامل)'
                            : 'Finish Cooking ✅ (Completed)'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE 4: COMPLETED COOKING CELEBRATION */}
          {/* ========================================================================= */}
          {phase === 'completed' && recipe && (
            <div className="p-6 bg-white rounded-3xl border border-stone-200 shadow-lg text-center space-y-4 animate-fade-in my-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-3xl shadow-inner">
                🎉
              </div>

              <div>
                <h3 className="text-lg font-black text-stone-950">
                  {isRtl ? 'ألف صحة وعافية!' : 'Bon Appétit!'}
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  {isRtl
                    ? `أنجزت تحضير ${recipe.dishNameAr} بنجاح كشيف حقيقي! طبقك جاهز الآن للتقديم والاستمتاع بأطيب مذاق.`
                    : `You successfully prepared ${recipe.dishNameEn}! Your meal is ready to be served.`}
                </p>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-[11px] text-emerald-800 font-bold">
                {isRtl
                  ? '✨ هل ترغب بتجربة وصفة جديدة أو طلب حلويات من شركائنا في صوفيا؟'
                  : '✨ Would you like to cook another dish or order dessert from our Sofia partners?'}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setPhase('input');
                    setRecipe(null);
                  }}
                  className="flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-black transition-all cursor-pointer"
                >
                  {isRtl ? 'طبخ وجبة أخرى 👨‍🍳' : 'Cook Another Meal'}
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black transition-all cursor-pointer shadow-md"
                >
                  {isRtl ? 'إغلاق المساعد' : 'Done & Close'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
