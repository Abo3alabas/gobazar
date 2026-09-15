import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { translations } from '../../utils/translations';
import { X, Plus, Image, Sparkles } from 'lucide-react';
import { Product } from '../../types';

interface AddProductModalProps {
  storeId: string;
  onClose: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({ storeId, onClose }) => {
  const { addNewProduct, lang, isRtl } = useApp();
  const t = translations[lang];

  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('shawarma');
  const [calories, setCalories] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameAr || !price) return;

    addNewProduct({
      storeId,
      nameAr,
      nameEn: nameEn || nameAr,
      descriptionAr,
      descriptionEn: descriptionEn || descriptionAr,
      price: parseFloat(price) || 20,
      image,
      category,
      calories: calories ? parseInt(calories) : undefined,
      isAvailable: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <h3 className="font-black text-base text-stone-900">
            {t.merchantApp.addNewItem}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full text-stone-400 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isRtl ? 'اسم الصنف (بالعربية)*' : 'Item Name (Arabic)*'}
              </label>
              <input
                type="text"
                required
                value={nameAr}
                onChange={e => setNameAr(e.target.value)}
                placeholder="مثال: وجبة كباب دجاج رويال"
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isRtl ? 'الاسم بالإنجليزية' : 'Item Name (English)'}
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                placeholder="e.g. Royal Chicken Kebab Meal"
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isRtl ? 'السعر (ر.س)*' : 'Price (SAR)*'}
              </label>
              <input
                type="number"
                step="0.5"
                required
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="35"
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {isRtl ? 'السعرات الحرارية' : 'Calories (kcal)'}
              </label>
              <input
                type="number"
                value={calories}
                onChange={e => setCalories(e.target.value)}
                placeholder="650"
                className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isRtl ? 'وصف الصنف والمكونات' : 'Description & Ingredients'}
            </label>
            <textarea
              rows={2}
              value={descriptionAr}
              onChange={e => setDescriptionAr(e.target.value)}
              placeholder="وصف تفصيلي يوضح المكونات وطريقة التقديم..."
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {isRtl ? 'رابط صورة الوجبة' : 'Image URL'}
            </label>
            <input
              type="url"
              value={image}
              onChange={e => setImage(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50"
            >
              {isRtl ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'إضافة الصنف للقائمة' : 'Add to Catalog'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
