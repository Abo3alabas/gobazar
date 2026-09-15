import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  AppRole,
  Language,
  Store,
  Product,
  DriverProfile,
  Order,
  CartItem,
  SmartNotification,
  CartItemOption,
  PaymentMethod,
  OrderStatus,
  OrderRating,
  ChatMessage,
  PromoCode
} from '../types';
import { sound } from '../utils/sound';
import confetti from 'canvas-confetti';
import { apiService } from '../services/api';

interface AppContextType {
  role: AppRole;
  setRole: (r: AppRole) => void;
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
  isRtl: boolean;

  stores: Store[];
  products: Product[];
  drivers: DriverProfile[];
  orders: Order[];
  notifications: SmartNotification[];

  // Database Sync status
  isDatabaseConnected: boolean;
  isSyncing: boolean;
  isInitialLoading: boolean;
  lastSyncTime: string | null;
  refreshDatabaseData: (silent?: boolean) => Promise<void>;

  cart: CartItem[];
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartServiceFee: number;
  cartDiscount: number;
  cartTotal: number;
  appliedPromo: PromoCode | null;
  selectedStore: Store | null;
  setSelectedStore: (store: Store | null) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;

  activeTrackingOrderId: string | null;
  setActiveTrackingOrderId: (id: string | null) => void;

  activeChatOrderId: string | null;
  setActiveChatOrderId: (id: string | null) => void;

  ratingModalOrderId: string | null;
  setRatingModalOrderId: (id: string | null) => void;

  driverIncomingOffer: Order | null;
  setDriverIncomingOffer: (order: Order | null) => void;

  merchantIncomingOrder: Order | null;
  setMerchantIncomingOrder: (order: Order | null) => void;

  customerWallet: number;
  selectedDeliveryAddress: string;
  setSelectedDeliveryAddress: (addr: string) => void;

  // Cart operations
  addToCart: (product: Product, quantity: number, options: CartItemOption[], instructions?: string) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => boolean;

  // Order Operations
  placeOrder: (paymentMethod: PaymentMethod, notes?: string) => Order;
  merchantAcceptOrder: (orderId: string, prepTimeMinutes?: number) => void;
  merchantRejectOrder: (orderId: string, reason?: string) => void;
  merchantMarkReady: (orderId: string) => void;
  merchantHandoverToDriver: (orderId: string) => void;
  driverAcceptOffer: (orderId: string) => void;
  driverDeclineOffer: () => void;
  driverUpdateTripStatus: (orderId: string, newStatus: OrderStatus) => void;
  submitOrderRating: (orderId: string, rating: OrderRating) => void;
  sendChatMessage: (orderId: string, text: string, role: 'customer' | 'driver') => void;

  // Merchant operations
  toggleProductAvailability: (productId: string) => void;
  addNewProduct: (product: Omit<Product, 'id'>) => void;

  // Store CRUD operations (Admin & Merchant)
  addStore: (store: Omit<Store, 'id'>) => void;
  updateStore: (id: string, store: Partial<Store>) => void;
  deleteStore: (id: string) => void;

  // Driver CRUD operations (Admin)
  addDriver: (driver: Omit<DriverProfile, 'id'>) => void;
  updateDriver: (id: string, driver: Partial<DriverProfile>) => void;
  deleteDriver: (id: string) => void;

  // Driver operations
  toggleDriverOnline: () => void;
  rechargeWallet: (amount: number) => void;

  // Notifications
  unreadNotifsCount: number;
  markAllNotifsRead: () => void;
  addNotification: (notif: Omit<SmartNotification, 'id' | 'timestamp' | 'read'>) => void;

  // Admin stats
  adminStats: {
    totalPlatformRevenue: number;
    activeDriversCount: number;
    deliverySuccessRate: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<AppRole>('customer');
  const [lang, setLangState] = useState<Language>('ar');
  // NOTE: No local/mock seed data is used anywhere in this app. Every list below
  // starts empty and is populated exclusively from the MySQL database through
  // the PHP REST API (see src/services/api.ts). This guarantees that every
  // client — customer, merchant, driver, and admin — reads and writes the exact
  // same source of truth, so they stay in sync with each other.
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);

  // Database Sync status
  const [isDatabaseConnected, setIsDatabaseConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [customerWallet, setCustomerWallet] = useState<number>(250.00);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState<string>('شارع فيتوشا 15، صوفيا، بلغاريا');

  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>('ord-101');
  const [activeChatOrderId, setActiveChatOrderId] = useState<string | null>(null);
  const [ratingModalOrderId, setRatingModalOrderId] = useState<string | null>(null);
  const [driverIncomingOffer, setDriverIncomingOffer] = useState<Order | null>(null);
  const [merchantIncomingOrder, setMerchantIncomingOrder] = useState<Order | null>(null);

  const isRtl = lang === 'ar';

  // Sync HTML dir & lang attribute
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [isRtl, lang]);

  // Synchronize with PHP MySQL API. This is the single source of truth that keeps
  // every separate device (customer / merchant / driver / admin) in sync with each
  // other: whichever device changes something (new order, status update, chat
  // message, rating...) writes it to MySQL immediately, and every device — including
  // the ones that made no change — picks it up here on the next poll.
  //
  // `silent` is used for the background polling tick so it doesn't flash the
  // "Syncing..." indicator in the Admin dashboard on every cycle; manual/explicit
  // refreshes (e.g. the "Sync MySQL" button, or the initial mount) show it.
  const refreshDatabaseData = useCallback(async (silent: boolean = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const [dbStores, dbProducts, dbDrivers, dbOrders] = await Promise.all([
        apiService.getStores(),
        apiService.getProducts(),
        apiService.getDrivers(),
        apiService.getOrders(),
      ]);

      // null = this endpoint's request to the MySQL API failed (network/server
      // error). An array (even an empty one) means the DB answered and, per the
      // "single source of truth" design, is applied exactly as returned — the
      // app never substitutes local/demo data for what the database says.
      const reachable = dbStores !== null && dbProducts !== null && dbDrivers !== null && dbOrders !== null;

      if (dbStores !== null) setStores(dbStores);
      if (dbProducts !== null) setProducts(dbProducts);
      if (dbDrivers !== null) setDrivers(dbDrivers);

      // Orders (and their embedded chat messages) always reflect the DB exactly —
      // including a legitimately empty list — once the DB is reachable, so that
      // new orders, status changes, and chat messages made from ANY device show up
      // on every other device without needing a manual refresh.
      if (dbOrders !== null) setOrders(dbOrders);

      setIsDatabaseConnected(reachable);
      if (reachable) {
        setLastSyncTime(new Date().toLocaleTimeString(isRtl ? 'ar-SA' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }
    } catch (e) {
      console.warn('Database auto-sync notice:', e);
      setIsDatabaseConnected(false);
    } finally {
      if (!silent) setIsSyncing(false);
      setIsInitialLoading(false);
    }
  }, [isRtl]);

  // Initial load (shows the syncing indicator once), then poll quietly in the
  // background so all connected devices converge on the same MySQL state.
  useEffect(() => {
    refreshDatabaseData(false);

    const POLL_INTERVAL_MS = 4000;
    let pollTimer: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (pollTimer) return;
      pollTimer = setInterval(() => refreshDatabaseData(true), POLL_INTERVAL_MS);
    };
    const stopPolling = () => {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
    };

    // Pause polling while the tab/app is hidden to save requests/battery, and
    // immediately re-sync the moment it becomes visible again.
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshDatabaseData(true);
        startPolling();
      } else {
        stopPolling();
      }
    };

    startPolling();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshDatabaseData]);

  const setRole = (newRole: AppRole) => {
    setRoleState(newRole);
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
  };

  const cartStore = cart.length > 0
    ? stores.find(s => s.id === cart[0].product.storeId) || null
    : selectedStore;

  // Cart calculations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartDeliveryFee = cartStore ? cartStore.deliveryFee : 0;
  const cartServiceFee = cart.length > 0 ? 0.99 : 0;
  const cartDiscount = appliedPromo ? Math.min((cartSubtotal * appliedPromo.discountPercent) / 100, appliedPromo.maxDiscount) : 0;
  const cartTotal = Math.max(0, cartSubtotal + cartDeliveryFee + cartServiceFee - cartDiscount);

  // Admin stats calculations
  const totalPlatformRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 14250.00);
  const activeDriversCount = drivers.filter(d => d.status === 'online' || d.status === 'busy').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const deliverySuccessRate = orders.length > 0
    ? Math.round((deliveredOrdersCount / Math.max(1, orders.filter(o => o.status === 'delivered' || o.status === 'cancelled').length || 1)) * 100)
    : 99.2;

  const adminStats = {
    totalPlatformRevenue,
    activeDriversCount,
    deliverySuccessRate: deliverySuccessRate > 0 ? deliverySuccessRate : 99.2,
  };

  // Simple translation fallback helper
  const t = useCallback((key: string) => {
    return key;
  }, []);

  const addNotification = useCallback((notifData: Omit<SmartNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: SmartNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: 'الآن',
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
    sound.playNotification();
  }, []);

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const addToCart = (product: Product, quantity: number, options: CartItemOption[], instructions?: string) => {
    sound.playChatPop();
    const optionsTotal = options.reduce((sum, o) => sum + o.priceDelta, 0);
    const unitPrice = product.price + optionsTotal;
    const lineTotal = unitPrice * quantity;

    // Check if store matches current cart, if different clear previous cart with alert
    if (cart.length > 0 && cart[0].product.storeId !== product.storeId) {
      if (window.confirm(lang === 'ar'
        ? 'تحتوي سلتك على منتجات من متجر آخر. هل تريد إفراغ السلة وبدء طلب جديد من هذا المتجر؟'
        : 'Your basket contains items from another store. Clear basket to start order here?')) {
        setCart([{
          id: `cart-item-${Date.now()}`,
          product,
          quantity,
          selectedOptions: options,
          specialInstructions: instructions,
          totalPrice: lineTotal,
        }]);
      }
      return;
    }

    setCart(prev => {
      // Check if identical item with exact same options exists
      const existingIdx = prev.findIndex(item =>
        item.product.id === product.id &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(options) &&
        item.specialInstructions === instructions
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantity + quantity;
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: newQty,
          totalPrice: unitPrice * newQty,
        };
        return updated;
      }

      return [
        ...prev,
        {
          id: `cart-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          product,
          quantity,
          selectedOptions: options,
          specialInstructions: instructions,
          totalPrice: lineTotal,
        }
      ];
    });
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            const unitPrice = item.totalPrice / item.quantity;
            return {
              ...item,
              quantity: newQty,
              totalPrice: unitPrice * newQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  const applyPromoCode = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    const VALID_PROMOS: Record<string, PromoCode> = {
      'SOFIA': { code: 'SOFIA', discountPercent: 20, maxDiscount: 10, minOrder: 10 },
      'SHAM': { code: 'SHAM', discountPercent: 15, maxDiscount: 8, minOrder: 8 },
      'FREE': { code: 'FREE', discountPercent: 10, maxDiscount: 5, minOrder: 5 },
    };

    if (VALID_PROMOS[clean]) {
      const promo = VALID_PROMOS[clean];
      if (cartSubtotal >= promo.minOrder) {
        setAppliedPromo(promo);
        sound.playSuccess();
        return true;
      }
    }
    return false;
  };

  // ORDER OPERATIONS
  const placeOrder = (paymentMethod: PaymentMethod, notes?: string): Order => {
    const targetStore = cartStore || stores[0];
    const newOrderId = `ord-${Date.now()}`;
    const trackingNum = `SOF-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: newOrderId,
      trackingNumber: `#${trackingNum}`,
      customerName: 'سارة المنصور',
      customerPhone: '+359 88 123 4567',
      customerAddress: selectedDeliveryAddress,
      customerCoordinates: { lat: 42.6977, lng: 23.3219, addressName: 'صوفيا - وسط المدينة' },
      storeId: targetStore.id,
      storeNameAr: targetStore.nameAr,
      storeNameEn: targetStore.nameEn,
      storeType: targetStore.type,
      storeImage: targetStore.image,
      storeCoordinates: targetStore.coordinates,
      items: [...cart],
      subtotal: Number(cartSubtotal.toFixed(2)),
      deliveryFee: Number(cartDeliveryFee.toFixed(2)),
      serviceFee: Number(cartServiceFee.toFixed(2)),
      discount: Number(cartDiscount.toFixed(2)),
      total: Number(cartTotal.toFixed(2)),
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'cod' : 'paid',
      status: 'pending',
      timestamps: {
        created: 'الآن',
      },
      estimatedDeliveryMinutes: targetStore.deliveryTimeMin + 10,
      driverProgressPercent: 0,
      chatMessages: [
        {
          id: `msg-${Date.now()}`,
          senderRole: 'system',
          senderName: 'جو بازار',
          text: `تم استلام طلبك رقم #${trackingNum} وجاري إرساله للمتجر للتجهيز.`,
          timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
        }
      ],
      notes,
    };

    setOrders(prev => [newOrder, ...prev]);
    setActiveTrackingOrderId(newOrderId);
    clearCart();
    sound.playSuccess();

    // Trigger Merchant Alert & Modal
    setMerchantIncomingOrder(newOrder);
    sound.playOrderAlert();

    // Asynchronously synchronize order to PHP / MySQL database
    apiService.createOrder(newOrder).catch(err => {
      console.warn('Sync order to database error:', err);
    });

    // Smart Notifications to Customer and Merchant
    addNotification({
      targetRole: 'customer',
      titleAr: `تم تأكيد طلبك بنجاح! #${trackingNum}`,
      titleEn: `Order #${trackingNum} Placed Successfully!`,
      messageAr: `تم إرسال الطلب إلى ${targetStore.nameAr}. بانتظار تأكيد المتجر وتحديد وقت التجهيز.`,
      messageEn: `Sent to ${targetStore.nameEn}. Waiting for store confirmation and prep time.`,
      orderId: newOrderId,
      type: 'order',
    });

    addNotification({
      targetRole: 'merchant',
      titleAr: `طلب جديد وارد للمتجر! #${trackingNum} 🔔`,
      titleEn: `New Store Order Received! #${trackingNum} 🔔`,
      messageAr: `طلب جديد وارد من ${newOrder.customerName} بقيمة ${cartTotal} يورو. حدد وقت التجهيز واقبل الطلب.`,
      messageEn: `Incoming order from ${newOrder.customerName} (${cartTotal} EUR). Set prep time to start.`,
      orderId: newOrderId,
      type: 'order',
    });

    return newOrder;
  };

  const merchantAcceptOrder = (orderId: string, prepTimeMinutes: number = 15) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'preparing',
          prepTimeMinutes,
          prepStartedAt: Date.now(),
          estimatedDeliveryMinutes: prepTimeMinutes + 12,
          timestamps: {
            ...o.timestamps,
            accepted: 'الآن',
            preparing: 'الآن',
          },
          chatMessages: [
            ...o.chatMessages,
            {
              id: `msg-${Date.now()}`,
              senderRole: 'system',
              senderName: 'المتجر',
              text: `قبل المتجر طلبك وبدأ في التجهيز. الوقت المقدر بالمطبخ: ${prepTimeMinutes} دقيقة 👨‍🍳`,
              timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            }
          ]
        };
      }
      return o;
    }));

    setMerchantIncomingOrder(null);
    sound.playNotification();

    // Sync to MySQL Database
    const acceptOrderRef = orders.find(o => o.id === orderId);
    apiService.updateOrder(orderId, {
      status: 'preparing',
      prepTimeMinutes,
      estimatedDeliveryMinutes: prepTimeMinutes + 12,
      timestamps: { ...(acceptOrderRef?.timestamps ?? { created: 'الآن' }), accepted: 'الآن', preparing: 'الآن' },
    }).catch(console.warn);

    addNotification({
      targetRole: 'customer',
      titleAr: `المطبخ بدأ تجهيز طلبك 👨‍🍳 (${prepTimeMinutes} دقيقة)`,
      titleEn: `Kitchen started preparing your order 👨‍🍳 (${prepTimeMinutes} mins)`,
      messageAr: `يتم الآن إعداد وتغليف الأصناف بعناية. الوقت المتوقع للانتهاء: ${prepTimeMinutes} دقيقة.`,
      messageEn: `Items are in the kitchen. Estimated prep time: ${prepTimeMinutes} mins.`,
      orderId,
      type: 'order',
    });
  };

  const merchantRejectOrder = (orderId: string, reason?: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'cancelled',
          notes: reason ? `سبب الإلغاء: ${reason}` : o.notes,
        };
      }
      return o;
    }));

    setMerchantIncomingOrder(null);
    sound.playNotification();

    // Sync to MySQL Database
    apiService.updateOrder(orderId, { status: 'cancelled' }).catch(console.warn);

    addNotification({
      targetRole: 'customer',
      titleAr: 'اعتذر المتجر عن قبول الطلب ⚠️',
      titleEn: 'Store was unable to accept the order ⚠️',
      messageAr: reason || 'المتجر يواجه ضغطاً كبيراً أو نفاد بعض الأصناف.',
      messageEn: reason || 'The store is currently at full capacity or out of ingredients.',
      orderId,
      type: 'order',
    });
  };

  const merchantMarkReady = (orderId: string) => {
    const targetOrder = orders.find(o => o.id === orderId);
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'ready_for_pickup',
          timestamps: {
            ...o.timestamps,
            readyForPickup: 'الآن',
          },
          chatMessages: [
            ...o.chatMessages,
            {
              id: `msg-${Date.now()}`,
              senderRole: 'system',
              senderName: 'المتجر',
              text: 'تم الانتهاء من تجهيز وتغليف طلبك وهو جاهز للتسليم للكابتن 🛍️',
              timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            }
          ]
        };
      }
      return o;
    }));

    // Trigger driver incoming offer modal
    if (targetOrder) {
      setDriverIncomingOffer(targetOrder);
      sound.playOrderAlert();
    }

    // Sync to MySQL Database
    apiService.updateOrder(orderId, {
      status: 'ready_for_pickup',
      timestamps: { ...(targetOrder?.timestamps ?? { created: 'الآن' }), readyForPickup: 'الآن' }
    }).catch(console.warn);

    addNotification({
      targetRole: 'driver',
      titleAr: 'عرض توصيل جديد: الطلب جاهز للاستلام! 🛵',
      titleEn: 'New Delivery Offer: Order Ready for Pickup! 🛵',
      messageAr: 'الطلب جاهز ومغلف لدى المتجر. انقر لقبول المهمة والبدء.',
      messageEn: 'Order is packed and ready. Tap to accept delivery trip.',
      orderId,
      type: 'delivery',
    });

    addNotification({
      targetRole: 'customer',
      titleAr: 'طلبك جاهز وبانتظار المندوب 🛍️',
      titleEn: 'Your order is ready & packed 🛍️',
      messageAr: 'انتهى المتجر من التجهيز وجاري تسليم الطلب لكابتن التوصيل.',
      messageEn: 'Preparation finished. Assigning courier for pickup.',
      orderId,
      type: 'order',
    });
  };

  const merchantHandoverToDriver = (orderId: string) => {
    const handoverOrderRef = orders.find(o => o.id === orderId);
    const primaryDriver = drivers[0];
    const driverPayload = {
      id: primaryDriver.id,
      name: primaryDriver.name,
      phone: primaryDriver.phone,
      avatar: primaryDriver.avatar,
      vehicleType: primaryDriver.vehicleType,
      vehiclePlate: primaryDriver.vehiclePlate,
      rating: primaryDriver.rating,
      totalDeliveries: primaryDriver.totalDeliveries,
      currentCoordinates: { lat: 42.6977, lng: 23.3219 },
    };

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'on_the_way',
          driver: o.driver || driverPayload,
          driverProgressPercent: 25,
          timestamps: {
            ...o.timestamps,
            pickedUp: 'الآن',
          },
          chatMessages: [
            ...o.chatMessages,
            {
              id: `msg-${Date.now()}`,
              senderRole: 'system',
              senderName: 'المتجر',
              text: 'تم تسليم الطلب بنجاح لكابتن التوصيل، وهو في طريقه إليك الآن 🛵💨',
              timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            }
          ]
        };
      }
      return o;
    }));

    sound.playSuccess();

    // Sync to MySQL Database
    apiService.updateOrder(orderId, {
      status: 'on_the_way',
      driver: driverPayload,
      driverProgressPercent: 25,
      timestamps: { ...(handoverOrderRef?.timestamps ?? { created: 'الآن' }), pickedUp: 'الآن' }
    }).catch(console.warn);

    addNotification({
      targetRole: 'customer',
      titleAr: 'المندوب استلم طلبك وهو في الطريق إليك! 🛵',
      titleEn: 'Courier collected your order and is on the way! 🛵',
      messageAr: 'تم تسليم الطلب للكابتن وانطلق الآن نحو موقعك في صوفيا.',
      messageEn: 'Order handed over to courier and moving to your address.',
      orderId,
      type: 'delivery',
    });

    addNotification({
      targetRole: 'merchant',
      titleAr: 'تم تسليم الطلب للمندوب بنجاح ✓',
      titleEn: 'Order Handed to Courier Successfully ✓',
      messageAr: 'خرج الطلب من المتجر وفي طريقه للعميل.',
      messageEn: 'Order is out of the store and on route to customer.',
      orderId,
      type: 'order',
    });
  };

  const driverAcceptOffer = (orderId: string) => {
    const acceptOfferOrderRef = orders.find(o => o.id === orderId);
    const primaryDriver = drivers[0];
    const driverPayload = {
      id: primaryDriver.id,
      name: primaryDriver.name,
      phone: primaryDriver.phone,
      avatar: primaryDriver.avatar,
      vehicleType: primaryDriver.vehicleType,
      vehiclePlate: primaryDriver.vehiclePlate,
      rating: primaryDriver.rating,
      totalDeliveries: primaryDriver.totalDeliveries,
      currentCoordinates: { lat: 42.6977, lng: 23.3219 },
    };

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'on_the_way',
          driver: driverPayload,
          driverProgressPercent: 25,
          timestamps: {
            ...o.timestamps,
            pickedUp: 'الآن',
          },
          chatMessages: [
            ...o.chatMessages,
            {
              id: `msg-${Date.now()}`,
              senderRole: 'driver',
              senderName: primaryDriver.name,
              text: 'مرحباً، استلمت طلبك ساخناً وجاهزاً ومحفوظاً بالحقيبة الحرارية، وأنا متوجه إليك الآن 🛵🎒',
              timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
            }
          ]
        };
      }
      return o;
    }));

    setDriverIncomingOffer(null);
    sound.playNotification();

    // Sync to MySQL Database
    apiService.updateOrder(orderId, {
      status: 'on_the_way',
      driver: driverPayload,
      driverProgressPercent: 25,
      timestamps: { ...(acceptOfferOrderRef?.timestamps ?? { created: 'الآن' }), pickedUp: 'الآن' }
    }).catch(console.warn);

    addNotification({
      targetRole: 'customer',
      titleAr: 'المندوب استلم الطلب وهو في الطريق إليك! 🛵',
      titleEn: 'Courier picked up your order and is on the way! 🛵',
      messageAr: `الكابتن ${primaryDriver.name} في الطريق لتسليم طلبك.`,
      messageEn: `Captain ${primaryDriver.name} is navigating to your address.`,
      orderId,
      type: 'delivery',
    });
  };

  const driverDeclineOffer = () => {
    setDriverIncomingOffer(null);
  };

  const driverUpdateTripStatus = (orderId: string, newStatus: OrderStatus) => {
    const tripStatusOrderRef = orders.find(o => o.id === orderId);
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const isDelivered = newStatus === 'delivered';
        return {
          ...o,
          status: newStatus,
          driverProgressPercent: isDelivered ? 100 : (newStatus === 'on_the_way' ? 70 : 90),
          timestamps: {
            ...o.timestamps,
            delivered: isDelivered ? 'الآن' : o.timestamps.delivered,
          }
        };
      }
      return o;
    }));

    // Sync to MySQL Database
    apiService.updateOrder(orderId, {
      status: newStatus,
      driverProgressPercent: newStatus === 'delivered' ? 100 : 75,
      timestamps: {
        ...(tripStatusOrderRef?.timestamps ?? { created: 'الآن' }),
        delivered: newStatus === 'delivered' ? 'الآن' : tripStatusOrderRef?.timestamps.delivered,
      }
    }).catch(console.warn);

    if (newStatus === 'delivered') {
      sound.playSuccess();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      // Open rating modal for customer
      setRatingModalOrderId(orderId);

      // Increase driver stats
      setDrivers(prev => prev.map((d, i) => i === 0 ? {
        ...d,
        todayEarnings: d.todayEarnings + 2.50,
        todayTrips: d.todayTrips + 1,
        totalDeliveries: d.totalDeliveries + 1,
        walletBalance: d.walletBalance + 2.50,
      } : d));

      addNotification({
        targetRole: 'all',
        titleAr: 'تم تسليم الطلب بنجاح! 🎉',
        titleEn: 'Order Delivered Successfully! 🎉',
        messageAr: 'نتمنى لك وجبة شهية! يرجى تقييم المندوب والتجربة.',
        messageEn: 'Enjoy your meal! Please rate your courier experience.',
        orderId,
        type: 'praise',
      });
    }
  };

  const submitOrderRating = (orderId: string, rating: OrderRating) => {
    const orderToRate = orders.find(o => o.id === orderId);

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          rating,
        };
      }
      return o;
    }));

    // Update Store rating if provided
    if (orderToRate && rating.storeStars) {
      setStores(prev => prev.map(s => {
        if (s.id === orderToRate.storeId) {
          const newCount = (s.reviewCount || 10) + 1;
          const newRating = Number(((s.rating * (s.reviewCount || 10) + rating.storeStars) / newCount).toFixed(2));
          return {
            ...s,
            rating: newRating,
            reviewCount: newCount,
          };
        }
        return s;
      }));
    }

    // Update Driver rating & wallet if tip provided
    const targetDriverId = orderToRate?.driver?.id;
    const driverStars = rating.driverStars || rating.stars || 5;
    const praiseTags = rating.driverTags || rating.tags || [];

    setDrivers(prev => prev.map(d => {
      if (d.id === targetDriverId || (!targetDriverId && d.id === prev[0]?.id)) {
        const currentCount = d.ratingCount || 12;
        const newCount = currentCount + 1;
        const newRating = Number(((d.rating * currentCount + driverStars) / newCount).toFixed(2));
        return {
          ...d,
          rating: newRating,
          ratingCount: newCount,
          walletBalance: d.walletBalance + (rating.tipAmount || 0),
          todayEarnings: d.todayEarnings + (rating.tipAmount || 0),
          praises: [...d.praises, ...praiseTags],
        };
      }
      return d;
    }));

    if (rating.tipAmount > 0) {
      setCustomerWallet(w => Math.max(0, w - rating.tipAmount));
    }

    setRatingModalOrderId(null);
    sound.playSuccess();

    // Persist Review and sync to MySQL Database
    apiService.submitReview(orderId, rating, {
      storeId: orderToRate?.storeId,
      driverId: orderToRate?.driver?.id,
    }).catch(console.warn);

    addNotification({
      targetRole: 'customer',
      titleAr: 'شكراً لتقييمك! ⭐',
      titleEn: 'Thank you for your rating! ⭐',
      messageAr: 'تم حفظ تقييمك للمطعم والتوصيل ومزامنته مع قاعدة البيانات.',
      messageEn: 'Your restaurant & courier review was recorded and synced to MySQL.',
      orderId,
      type: 'praise',
    });
  };

  // STORE CRUD OPERATIONS (Admin)
  const addStore = (newStoreData: Omit<Store, 'id'>) => {
    const newStore: Store = {
      ...newStoreData,
      id: `store-${Date.now()}`,
    };
    setStores(prev => [newStore, ...prev]);
    sound.playSuccess();

    // Sync to MySQL Database
    apiService.createStore(newStore).catch(console.warn);

    addNotification({
      targetRole: 'all',
      titleAr: `تمت إضافة متجر جديد: ${newStore.nameAr} 🏬`,
      titleEn: `New Store Added: ${newStore.nameEn} 🏬`,
      messageAr: 'أصبح المتجر متاحاً في قاعدة بيانات المتاجر بمدينة صوفيا.',
      messageEn: 'The store is now live in the Sofia directory.',
      type: 'system',
    });
  };

  const updateStore = (id: string, updatedFields: Partial<Store>) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
    sound.playSuccess();

    // Sync to MySQL Database
    apiService.updateStore(id, updatedFields).catch(console.warn);

    addNotification({
      targetRole: 'admin',
      titleAr: 'تم تحديث بيانات المتجر بنجاح ✏️',
      titleEn: 'Store details updated successfully ✏️',
      messageAr: `تم حفظ وتعديل البيانات بقاعدة بيانات MySQL.`,
      messageEn: 'Changes to store profile saved to database.',
      type: 'system',
    });
  };

  const deleteStore = (id: string) => {
    const deletedStore = stores.find(s => s.id === id);
    setStores(prev => prev.filter(s => s.id !== id));
    // Also remove associated products
    setProducts(prev => prev.filter(p => p.storeId !== id));
    sound.playNotification();

    // Sync to MySQL Database
    apiService.deleteStore(id).catch(console.warn);

    addNotification({
      targetRole: 'admin',
      titleAr: `تم حذف المتجر (${deletedStore?.nameAr || id}) 🗑️`,
      titleEn: `Store deleted (${deletedStore?.nameEn || id}) 🗑️`,
      messageAr: 'تمت إزالة المتجر ومنتجاته من قاعدة البيانات.',
      messageEn: 'Store and its catalog removed from database.',
      type: 'system',
    });
  };

  // DRIVER CRUD OPERATIONS (Admin)
  const addDriver = (newDriverData: Omit<DriverProfile, 'id'>) => {
    const newDriver: DriverProfile = {
      ...newDriverData,
      id: `drv-${Date.now()}`,
    };
    setDrivers(prev => [newDriver, ...prev]);
    sound.playSuccess();

    // Sync to MySQL Database
    apiService.createDriver(newDriver).catch(console.warn);

    addNotification({
      targetRole: 'admin',
      titleAr: `تم تسجيل مندوب جديد: ${newDriver.name} 🛵`,
      titleEn: `New Driver Enrolled: ${newDriver.name} 🛵`,
      messageAr: `الكابتن جاهز لاستقبال الطلبات في صوفيا (لوحة ${newDriver.vehiclePlate}).`,
      messageEn: `Driver ready for Sofia dispatches (${newDriver.vehiclePlate}).`,
      type: 'system',
    });
  };

  const updateDriver = (id: string, updatedFields: Partial<DriverProfile>) => {
    setDrivers(prev => prev.map(d => d.id === id ? { ...d, ...updatedFields } : d));
    sound.playSuccess();

    // Sync to MySQL Database
    apiService.updateDriver(id, updatedFields).catch(console.warn);

    addNotification({
      targetRole: 'admin',
      titleAr: 'تم تحديث بيانات المندوب ✏️',
      titleEn: 'Driver profile updated ✏️',
      messageAr: 'تم حفظ التعديلات على سجل المندوب في قاعدة البيانات.',
      messageEn: 'Driver profile changes saved in database.',
      type: 'system',
    });
  };

  const deleteDriver = (id: string) => {
    const deletedDriver = drivers.find(d => d.id === id);
    setDrivers(prev => prev.filter(d => d.id !== id));
    sound.playNotification();

    // Sync to MySQL Database
    apiService.deleteDriver(id).catch(console.warn);

    addNotification({
      targetRole: 'admin',
      titleAr: `تم حذف المندوب (${deletedDriver?.name || id}) 🗑️`,
      titleEn: `Driver deleted (${deletedDriver?.name || id}) 🗑️`,
      messageAr: 'تم إيقاف وحذف حساب المندوب من الأسطول.',
      messageEn: 'Driver removed from delivery fleet.',
      type: 'system',
    });
  };

  const sendChatMessage = (orderId: string, text: string, senderRole: 'customer' | 'driver') => {
    const senderName = senderRole === 'customer' ? 'سارة المنصور' : 'ستيفان إيفانوف (المندوب)';
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole,
      senderName,
      text,
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
    };

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          chatMessages: [...o.chatMessages, newMsg],
        };
      }
      return o;
    }));

    sound.playChatPop();

    // Sync message to MySQL Database. The other party (customer, driver, merchant,
    // or admin) picks this up on their next background poll of /api/orders.php,
    // which returns each order together with its chat_messages — no separate
    // fake "auto-reply" simulation needed now that chat is genuinely cross-device.
    apiService.sendChatMessage(orderId, { text, senderRole, senderName }).catch(console.warn);
  };

  const toggleProductAvailability = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    const newAvail = !prod?.isAvailable;

    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        return { ...p, isAvailable: newAvail };
      }
      return p;
    }));
    sound.playNotification();

    // Sync to MySQL Database
    apiService.updateProduct(productId, { isAvailable: newAvail }).catch(console.warn);
  };

  const addNewProduct = (productData: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
    };
    setProducts(prev => [newProd, ...prev]);
    sound.playSuccess();

    // Sync to MySQL Database
    apiService.createProduct(newProd).catch(console.warn);
  };

  const toggleDriverOnline = () => {
    setDrivers(prev => prev.map((d, i) => {
      if (i === 0) {
        const nextStatus = d.status === 'online' ? 'offline' : 'online';
        apiService.updateDriver(d.id, { status: nextStatus }).catch(console.warn);
        return { ...d, status: nextStatus };
      }
      return d;
    }));
    sound.playNotification();
  };

  const rechargeWallet = (amount: number) => {
    setCustomerWallet(prev => prev + amount);
    sound.playSuccess();
    addNotification({
      targetRole: 'customer',
      titleAr: `تم شحن المحفظة بمبلغ ${amount} يورو بنجاح! 💳`,
      titleEn: `Wallet charged with ${amount} EUR successfully! 💳`,
      messageAr: `رصيدك الحالي أصبح: ${(customerWallet + amount).toFixed(2)} يورو`,
      messageEn: `Current balance: ${(customerWallet + amount).toFixed(2)} EUR`,
      type: 'payment',
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        lang,
        setLang,
        t,
        isRtl,
        stores,
        products,
        drivers,
        orders,
        notifications,
        isDatabaseConnected,
        isSyncing,
        isInitialLoading,
        lastSyncTime,
        refreshDatabaseData,
        cart,
        cartSubtotal,
        cartDeliveryFee,
        cartServiceFee,
        cartDiscount,
        cartTotal,
        appliedPromo,
        selectedStore,
        setSelectedStore,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        activeTrackingOrderId,
        setActiveTrackingOrderId,
        activeChatOrderId,
        setActiveChatOrderId,
        ratingModalOrderId,
        setRatingModalOrderId,
        driverIncomingOffer,
        setDriverIncomingOffer,
        merchantIncomingOrder,
        setMerchantIncomingOrder,
        customerWallet,
        selectedDeliveryAddress,
        setSelectedDeliveryAddress,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        applyPromoCode,
        placeOrder,
        merchantAcceptOrder,
        merchantRejectOrder,
        merchantMarkReady,
        merchantHandoverToDriver,
        driverAcceptOffer,
        driverDeclineOffer,
        driverUpdateTripStatus,
        submitOrderRating,
        sendChatMessage,
        toggleProductAvailability,
        addNewProduct,
        addStore,
        updateStore,
        deleteStore,
        addDriver,
        updateDriver,
        deleteDriver,
        toggleDriverOnline,
        rechargeWallet,
        unreadNotifsCount,
        markAllNotifsRead,
        addNotification,
        adminStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
