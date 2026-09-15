export type AppRole = 'customer' | 'driver' | 'merchant' | 'admin';
export type Language = 'ar' | 'en';
export type StoreCategoryType = 'restaurant' | 'grocery';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  addressName?: string;
}

export interface StoreCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  type: StoreCategoryType;
}

export interface ProductOption {
  id: string;
  nameAr: string;
  nameEn: string;
  priceDelta: number;
}

export interface ProductOptionGroup {
  id: string;
  titleAr: string;
  titleEn: string;
  required: boolean;
  maxSelect?: number;
  options: ProductOption[];
}

export interface Product {
  id: string;
  storeId: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  calories?: number;
  isAvailable: boolean;
  unitAr?: string; // e.g. "لكل 1 كجم" or "للصحن"
  unitEn?: string;
  optionGroups?: ProductOptionGroup[];
}

export interface Store {
  id: string;
  nameAr: string;
  nameEn: string;
  type: StoreCategoryType;
  cuisineOrCategoryAr: string;
  cuisineOrCategoryEn: string;
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  minOrder: number;
  image: string;
  banner: string;
  addressAr: string;
  addressEn: string;
  coordinates: LocationCoordinates;
  isOpen: boolean;
  isFeatured?: boolean;
  discountBadge?: string;
  tagsAr: string[];
  tagsEn: string[];
}

export interface CartItemOption {
  groupId: string;
  groupTitle: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique cart line id
  product: Product;
  quantity: number;
  selectedOptions: CartItemOption[];
  specialInstructions?: string;
  totalPrice: number;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'driver_assigned'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'card' | 'apple_pay' | 'mada' | 'wallet' | 'cash';
export type PaymentStatus = 'paid' | 'pending' | 'cod';

export interface ChatMessage {
  id: string;
  senderRole: 'customer' | 'driver' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  isQuickReply?: boolean;
  isAudio?: boolean;
  audioDuration?: string;
}

export interface OrderRating {
  // Driver & Delivery rating
  driverStars: number;
  driverSpeedRating?: number;
  driverPoliteness?: number;
  driverTags: string[];
  tipAmount: number;
  driverComment?: string;

  // Store & Restaurant / Food rating
  storeStars: number;
  storeFoodQuality?: number;
  storePackaging?: number;
  storeTags: string[];
  storeComment?: string;

  // Compatibility & General
  stars?: number;
  speedRating?: number;
  orderAccuracy?: number;
  tags?: string[];
  comment?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  trackingNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCoordinates: LocationCoordinates;
  storeId: string;
  storeNameAr: string;
  storeNameEn: string;
  storeType: StoreCategoryType;
  storeImage: string;
  storeCoordinates: LocationCoordinates;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  driver?: {
    id: string;
    name: string;
    phone: string;
    avatar: string;
    vehicleType: 'scooter' | 'car' | 'bicycle';
    vehiclePlate: string;
    rating: number;
    totalDeliveries: number;
    currentCoordinates: LocationCoordinates;
  };
  timestamps: {
    created: string;
    accepted?: string;
    preparing?: string;
    readyForPickup?: string;
    pickedUp?: string;
    delivered?: string;
  };
  estimatedDeliveryMinutes: number;
  driverProgressPercent: number; // 0 to 100 for live animation
  chatMessages: ChatMessage[];
  rating?: OrderRating;
  prepTimeMinutes?: number;
  prepStartedAt?: number;
  notes?: string;
}

export interface DriverProfile {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  vehicleType: 'scooter' | 'car' | 'bicycle';
  vehiclePlate: string;
  rating: number;
  ratingCount: number;
  totalDeliveries: number;
  acceptanceRate: number;
  walletBalance: number;
  todayEarnings: number;
  todayTrips: number;
  currentOrderId?: string;
  coordinates: LocationCoordinates;
  praises: string[];
}

export interface SmartNotification {
  id: string;
  targetRole: AppRole | 'all';
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  orderId?: string;
  type: 'order' | 'delivery' | 'chat' | 'payment' | 'system' | 'praise';
  read: boolean;
  timestamp: string;
}

export interface PromoCode {
  code: string;
  discountPercent: number;
  maxDiscount: number;
  minOrder: number;
}

export interface GroupOrderMember {
  id: string;
  name: string;
  phone?: string;
  items: CartItem[];
  subtotal: number;
  deliveryShare: number;
  isHost?: boolean;
  paid?: boolean;
}

export interface GroupOrderSession {
  id: string;
  code: string;
  hostName: string;
  hostPhone: string;
  hostAddress: string;
  radiusKm: number; // 1 km radius
  storeId: string;
  storeNameAr: string;
  storeNameEn: string;
  status: 'open' | 'locked' | 'ordered';
  members: GroupOrderMember[];
  deliveryFee: number;
  total: number;
  expiresAt: string;
}

export interface AIConciergeRecommendation {
  title: string;
  summary: string;
  reason: string;
  recommendedItem: {
    productId: string;
    productName: string;
    storeId: string;
    storeName: string;
    price: number;
    deliveryFee: number;
    totalPrice: number;
    deliveryTimeMin: number;
    calories?: number;
    image: string;
  };
  alternativeItem?: {
    productName: string;
    storeName: string;
    priceDiff: string;
    reason: string;
  };
  confidenceScore: number;
}

export interface SmartWalkInPickup {
  orderId: string;
  pickupCode: string;
  readyInMinutes: number;
  savedMinutes: number; // e.g. 18 mins
  storeAddress: string;
  canQuickModifyUntil: number; // timestamp for 60s grace window
}

export interface FoodGiftCard {
  id: string;
  senderName: string;
  recipientName: string;
  recipientPhone: string;
  amount: number;
  message: string;
  voucherCode: string;
  theme: 'birthday' | 'thank_you' | 'love' | 'friendship';
  claimed: boolean;
  createdAt: string;
}

export interface LunchCalendarDay {
  dayNumber: number;
  date: string;
  dishName: string;
  storeName: string;
  image: string;
  category: string;
  calories: number;
}

export interface LunchSubscription {
  id: string;
  planName: string;
  totalDays: number;
  remainingDays: number;
  dailyPrice: number;
  totalPrice: number;
  preferredTime: string;
  deliveryAddress: string;
  todayMeal: {
    date: string;
    dishName: string;
    storeName: string;
    image: string;
    calories: number;
    status: 'pending_approval' | 'approved' | 'dispatched' | 'swapped';
  };
  calendar: LunchCalendarDay[];
}

export interface PremiumTableBooking {
  id: string;
  storeId: string;
  storeName: string;
  customerName: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  guestsCount: number;
  seatingArea: 'terrace' | 'vip_lounge' | 'romantic_corner' | 'panoramic';
  preOrderItems?: CartItem[];
  bookingCode: string;
  status: 'confirmed' | 'seated' | 'completed';
}

// 13. SMART COOKING & RECIPES
export interface RecipeIngredient {
  id: string;
  nameAr: string;
  nameEn: string;
  amount: string;
  isAvailable: boolean; // toggleable by user (✅ or ❌)
  matchedProductId?: string; // supermarket product ID
  supermarketPrice?: number;
  supermarketProductNameAr?: string;
  supermarketProductNameEn?: string;
  supermarketProductImage?: string;
}

export interface RecipeStep {
  stepNumber: number;
  instructionAr: string;
  instructionEn: string;
  timerMinutes?: number;
  tipAr?: string;
  tipEn?: string;
}

export interface CookingRecipe {
  id: string;
  dishNameAr: string;
  dishNameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  cookingTimeMinutes: number;
  difficultyAr: 'سهل' | 'متوسط' | 'شيف';
  difficultyEn: 'Easy' | 'Medium' | 'Chef';
  servings: number;
  approximateCost: number; // in Euros
  image: string;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}
