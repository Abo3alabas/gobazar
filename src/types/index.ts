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
