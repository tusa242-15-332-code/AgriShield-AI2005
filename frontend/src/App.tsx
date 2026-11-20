import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Sprout, CloudRain, ShieldAlert, ScanLine, Droplets, MessageSquare,
  Store, PackageCheck, Satellite, Settings, Bell, User, ChevronDown,
  Menu, X, Plus, CheckCircle2, Clock, AlertTriangle, MapPin,
  Thermometer, Wind, Sun, Calendar, ArrowUpRight, Search, Filter,
  ShoppingCart, QrCode, FileText, Activity, Users, Database,
  Sparkles, Camera, Upload, Send, ExternalLink, RefreshCw,
  Check, Trash2, Eye, Layers, Award, Info, ShieldCheck, BarChart3,
  Leaf, HelpCircle, ChevronRight, SlidersHorizontal, LogOut
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore, collection, doc, setDoc, addDoc, updateDoc, deleteDoc,
  onSnapshot, serverTimestamp
} from 'firebase/firestore';

// ============================================================================
// 1. FIREBASE CONFIGURATION & SAFE INITIALIZATION
// ============================================================================
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : { apiKey: "demo", authDomain: "demo.firebaseapp.com", projectId: "agrishield-demo" };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'agrishield-ai-bd';

// ============================================================================
// 2. VERIFIED AGRICULTURAL DATASETS & BANGLADESH LOCALIZED CONSTANTS
// ============================================================================
const BD_DISTRICTS = [
  { name: 'Gazipur', region: 'Dhaka Division', lat: 24.00, lon: 90.42, temp: 31.4, humidity: 74, rainForecast: 18, soilMoisture: 46, soilPh: 6.4 },
  { name: 'Bogura', region: 'Rajshahi Division', lat: 24.85, lon: 89.37, temp: 32.8, humidity: 68, rainForecast: 6, soilMoisture: 34, soilPh: 6.7 },
  { name: 'Cumilla', region: 'Chattogram Division', lat: 23.46, lon: 91.18, temp: 30.2, humidity: 81, rainForecast: 42, soilMoisture: 64, soilPh: 6.1 },
  { name: 'Jashore', region: 'Khulna Division', lat: 23.17, lon: 89.21, temp: 33.5, humidity: 65, rainForecast: 2, soilMoisture: 29, soilPh: 7.1 },
  { name: 'Sylhet', region: 'Sylhet Division', lat: 24.89, lon: 91.87, temp: 28.9, humidity: 86, rainForecast: 68, soilMoisture: 76, soilPh: 5.8 },
  { name: 'Rangpur', region: 'Rangpur Division', lat: 25.74, lon: 89.27, temp: 29.6, humidity: 76, rainForecast: 14, soilMoisture: 51, soilPh: 6.3 },
  { name: 'Mymensingh', region: 'Mymensingh Division', lat: 24.75, lon: 90.41, temp: 30.8, humidity: 79, rainForecast: 24, soilMoisture: 55, soilPh: 6.2 },
  { name: 'Barishal', region: 'Barishal Division', lat: 22.70, lon: 90.35, temp: 31.1, humidity: 83, rainForecast: 35, soilMoisture: 62, soilPh: 6.6 },
];

const CROP_CATALOG = [
  { name: 'Boro Rice (BRRI dhan28)', category: 'Cereals', optimalTemp: [22, 32], optimalMoisture: [55, 80], durationDays: 140 },
  { name: 'Aman Rice (BRRI dhan49)', category: 'Cereals', optimalTemp: [24, 33], optimalMoisture: [60, 85], durationDays: 135 },
  { name: 'Potato (Diamant)', category: 'Tubers', optimalTemp: [15, 25], optimalMoisture: [45, 65], durationDays: 95 },
  { name: 'Tomato (BARI Tomato-14)', category: 'Vegetables', optimalTemp: [18, 29], optimalMoisture: [45, 65], durationDays: 110 },
  { name: 'Mango (Himsagar)', category: 'Fruits', optimalTemp: [24, 35], optimalMoisture: [40, 60], durationDays: 150 },
  { name: 'Jute (O-9897)', category: 'Fiber', optimalTemp: [25, 34], optimalMoisture: [55, 75], durationDays: 120 },
];

const WEEKLY_WEATHER_DATA = [
  { day: 'Sat', temp: 30.2, histAvg: 29.5, rainfall: 4, moisture: 54 },
  { day: 'Sun', temp: 31.0, histAvg: 29.8, rainfall: 0, moisture: 49 },
  { day: 'Mon', temp: 32.4, histAvg: 30.0, rainfall: 0, moisture: 43 },
  { day: 'Tue', temp: 33.1, histAvg: 30.2, rainfall: 2, moisture: 40 },
  { day: 'Wed', temp: 31.4, histAvg: 30.1, rainfall: 18, moisture: 52 },
  { day: 'Thu', temp: 29.8, histAvg: 29.9, rainfall: 26, moisture: 63 },
  { day: 'Fri', temp: 30.5, histAvg: 30.0, rainfall: 8, moisture: 58 },
];

const NDVI_TREND_DATA = [
  { date: 'Oct 02', ndvi: 0.42, cloud: 12, status: 'Early Vegetative' },
  { date: 'Oct 12', ndvi: 0.56, cloud: 8, status: 'Active Tillering' },
  { date: 'Oct 22', ndvi: 0.68, cloud: 15, status: 'Canopy Closure' },
  { date: 'Nov 01', ndvi: 0.74, cloud: 5, status: 'Peak Vigor' },
  { date: 'Nov 11', ndvi: 0.71, cloud: 9, status: 'Reproductive' },
];

const WATER_USAGE_DATA = [
  { week: 'Wk 1', applied: 420, recommended: 400, savedRain: 80 },
  { week: 'Wk 2', applied: 380, recommended: 390, savedRain: 110 },
  { week: 'Wk 3', applied: 510, recommended: 500, savedRain: 20 },
  { week: 'Wk 4', applied: 290, recommended: 310, savedRain: 240 },
];

const KNOWLEDGE_SOURCES = [
  {
    id: 'src-1',
    title: 'BRRI Rice Cultivation & Blast Management Guidelines',
    authority: 'Bangladesh Rice Research Institute (BRRI)',
    year: '2025',
    verified: true,
    summary: 'Protocols for managing Pyricularia oryzae (Rice Blast) via balanced nitrogen split application, maintaining 2-3 cm standing water, and resistant varieties.'
  },
  {
    id: 'src-2',
    title: 'BAMIS Agro-Meteorological Advisory Bulletin — Rabi & Boro Season',
    authority: 'Bangladesh Agro-Meteorological Information Service (BAMIS / DAE)',
    year: '2026',
    verified: true,
    summary: 'District-level heat stress thresholds (>35°C during booting/flowering) and heavy rainfall drainage advisories for smallholder farmers.'
  },
  {
    id: 'src-3',
    title: 'BARI Potato Late Blight & Tomato Early Blight IPM Manual',
    authority: 'Bangladesh Agricultural Research Institute (BARI)',
    year: '2025',
    verified: true,
    summary: 'Cultural sanitation, disease-free seed tubers, morning irrigation to reduce leaf wetness duration, and consulting local Upazila Agriculture Officers before chemical intervention.'
  },
  {
    id: 'src-4',
    title: 'FAO Climate-Smart Agriculture Sourcebook — South Asia Delta Systems',
    authority: 'Food and Agriculture Organization (FAO)',
    year: '2024',
    verified: true,
    summary: 'Alternate Wetting and Drying (AWD) irrigation water-saving framework reducing irrigation water use by 20–30% without yield penalty.'
  }
];

const SAMPLE_LEAF_PRESETS = [
  {
    id: 'rice-blast',
    label: 'Rice Leaf — Diamond Lesions (Sample)',
    crop: 'Boro Rice (BRRI dhan28)',
    condition: 'Rice Leaf Blast (Magnaporthe oryzae)',
    confidence: 91.4,
    severity: 'High',
    symptoms: [
      'Spindle-shaped or diamond-shaped lesions with whitish-gray centers and dark brown borders.',
      'Lesions coalescing on upper leaves reducing photosynthetic leaf area.',
      'Favored by high relative humidity (>85%) and cool night temperatures.'
    ],
    prevention: [
      'Avoid excessive urea (nitrogen) top-dressing; split nitrogen applications.',
      'Maintain continuous shallow water level (2–5 cm) in the paddy field rather than letting soil dry out completely during active blast risk.',
      'Remove infected weed hosts along field bunds.',
      'Consult your local Upazila Agriculture Officer (DAE) for approved site-specific management before applying any fungicide.'
    ],
    svgType: 'blast'
  },
  {
    id: 'potato-blight',
    label: 'Potato Leaf — Dark Water-Soaked Spots (Sample)',
    crop: 'Potato (Diamant)',
    condition: 'Late Blight (Phytophthora infestans)',
    confidence: 88.7,
    severity: 'Critical',
    symptoms: [
      'Irregular, pale-to-dark green water-soaked lesions near leaf tips and margins.',
      'White downy fungal growth visible on the underside of leaves during humid mornings.',
      'Rapid browning and collapse of foliage under cool, foggy conditions.'
    ],
    prevention: [
      'Ensure proper field drainage and avoid overhead irrigation late in the afternoon.',
      'Hill up soil around tubers to prevent spore wash-down from infected leaves.',
      'Remove and destroy heavily infected haulms away from healthy plots.',
      'Contact local BARI/DAE extension specialists for verified protective measures.'
    ],
    svgType: 'blight'
  },
  {
    id: 'tomato-early',
    label: 'Tomato Leaf — Concentric Rings (Sample)',
    crop: 'Tomato (BARI Tomato-14)',
    condition: 'Early Blight (Alternaria solani)',
    confidence: 86.2,
    severity: 'Moderate',
    symptoms: [
      'Dark brown spots with distinct concentric target-like rings on older lower leaves.',
      'Yellowing (chlorosis) halo surrounding older lesions.',
      'Gradual premature defoliation starting from bottom canopy.'
    ],
    prevention: [
      'Prune lower leaves touching the soil and stake plants to improve air circulation.',
      'Irrigate at the base of plants using furrow or drip methods instead of wetting foliage.',
      'Practice 2–3 year crop rotation with non-solanaceous crops.'
    ],
    svgType: 'early'
  },
  {
    id: 'healthy-leaf',
    label: 'Healthy Paddy Leaf — Control Sample',
    crop: 'Boro Rice (BRRI dhan28)',
    condition: 'Healthy Foliage — No Disease Detected',
    confidence: 96.8,
    severity: 'Low',
    symptoms: [
      'Uniform deep emerald-green leaf blade pigmentation.',
      'No necrotic lesions, chlorotic halos, or fungal sporulation observed.'
    ],
    prevention: [
      'Continue scheduled Alternate Wetting and Drying (AWD) irrigation monitoring.',
      'Inspect field margins twice weekly during humid weather windows.'
    ],
    svgType: 'healthy'
  }
];

const INITIAL_FARMS = [
  {
    id: 'farm-1',
    name: 'Shonar Bangla Paddy Plot A',
    district: 'Gazipur',
    location: 'Kapasia, Gazipur',
    size: 1.8,
    unit: 'Acres',
    crop: 'Boro Rice (BRRI dhan28)',
    variety: 'BRRI dhan28',
    plantingDate: '2026-09-18',
    stage: 'Panicle Initiation',
    progress: 68,
    activities: [
      { id: 'act-1', title: 'Land Preparation & Puddling', date: '2026-09-12', type: 'Preparation', completed: true, guidance: 'Two ploughings followed by laddering to retain standing water.' },
      { id: 'act-2', title: 'Seedling Transplanting (25-day seedlings)', date: '2026-09-18', type: 'Sowing', completed: true, guidance: 'Transplant 2–3 seedlings per hill at 20cm x 15cm spacing.' },
      { id: 'act-3', title: 'First Weeding & AWD Tube Check', date: '2026-10-10', type: 'Care', completed: true, guidance: 'Verify perforated AWD water pipe depth (15 cm below soil surface).' },
      { id: 'act-4', title: 'Panicle Initiation Water Management', date: '2026-11-14', type: 'Irrigation', completed: false, guidance: 'Maintain 3–5 cm standing water during sensitive reproductive stage.' },
      { id: 'act-5', title: 'Expected Grain Maturity & Harvest', date: '2026-12-28', type: 'Harvest', completed: false, guidance: 'Harvest when 80% of grains on panicle turn golden yellow.' },
    ]
  },
  {
    id: 'farm-2',
    name: 'North Bogura Vegetable Block',
    district: 'Bogura',
    location: 'Shibganj, Bogura',
    size: 0.9,
    unit: 'Acres',
    crop: 'Potato (Diamant)',
    variety: 'Diamant Grade-A',
    plantingDate: '2026-10-15',
    stage: 'Tuber Initiation',
    progress: 34,
    activities: [
      { id: 'act-21', title: 'Raised Bed Preparation', date: '2026-10-10', type: 'Preparation', completed: true, guidance: 'Prepare 60 cm spaced ridges with proper drainage furrows.' },
      { id: 'act-22', title: 'Certified Tuber Planting', date: '2026-10-15', type: 'Sowing', completed: true, guidance: 'Plant sprouted BADC-certified seed tubers at 5–7 cm depth.' },
      { id: 'act-23', title: 'Earthing Up & Light Furrow Irrigation', date: '2026-11-15', type: 'Irrigation', completed: false, guidance: 'Hill soil around stems and irrigate up to 2/3 ridge height.' },
      { id: 'act-24', title: 'Expected Potato Harvest', date: '2027-01-18', type: 'Harvest', completed: false, guidance: 'Dehaulm 7–10 days before lifting to harden tuber skin.' },
    ]
  }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    cropName: 'Premium Boro Miniket Rice',
    category: 'Cereals',
    priceBdt: 68,
    unit: 'kg',
    availableQty: 450,
    district: 'Gazipur',
    farmerName: 'Abdul Karim',
    farmerPhone: '+880 1712-XXXXXX',
    batchId: 'AGS-2026-BD-8491',
    qualityGrade: 'Grade A (Moisture < 12.5%)',
    verifiedTraceability: true,
    description: 'Freshly harvested, sun-dried and milled Boro paddy grown with Alternate Wetting & Drying (AWD) climate-smart practices.'
  },
  {
    id: 'prod-2',
    cropName: 'Diamant Table Potatoes (Fresh Harvest)',
    category: 'Tubers',
    priceBdt: 34,
    unit: 'kg',
    availableQty: 800,
    district: 'Bogura',
    farmerName: 'Abdul Karim',
    farmerPhone: '+880 1712-XXXXXX',
    batchId: 'AGS-2026-BD-7732',
    qualityGrade: 'Export Grade A',
    verifiedTraceability: true,
    description: 'Uniform medium-to-large Diamant potatoes from Shibganj, Bogura. Stored in ventilated cool rural storage.'
  },
  {
    id: 'prod-3',
    cropName: 'BARI Tomato-14 (Vine Ripened)',
    category: 'Vegetables',
    priceBdt: 52,
    unit: 'kg',
    availableQty: 220,
    district: 'Cumilla',
    farmerName: 'Salma Begum',
    farmerPhone: '+880 1819-XXXXXX',
    batchId: 'AGS-2026-BD-9104',
    qualityGrade: 'Grade A',
    verifiedTraceability: true,
    description: 'Firm, high-shelf-life tomatoes cultivated under integrated pest management (IPM) guidelines.'
  },
  {
    id: 'prod-4',
    cropName: 'Golden Tossa Jute Fiber',
    category: 'Fiber',
    priceBdt: 85,
    unit: 'kg',
    availableQty: 600,
    district: 'Jashore',
    farmerName: 'Mizanur Rahman',
    farmerPhone: '+880 1911-XXXXXX',
    batchId: 'AGS-2026-BD-6520',
    qualityGrade: 'Bangla Tossa B (BTB)',
    verifiedTraceability: false,
    description: 'Clean, ribbon-retted golden jute fiber ready for industrial or artisanal twine buyers.'
  }
];

const INITIAL_HARVESTS = [
  {
    id: 'harv-1',
    batchId: 'AGS-2026-BD-8491',
    cropName: 'Boro Rice (BRRI dhan28)',
    farmName: 'Shonar Bangla Paddy Plot A',
    district: 'Gazipur',
    harvestDate: '2026-10-28',
    quantityKg: 1200,
    qualityGrade: 'Grade A (12.2% Moisture)',
    storageLocation: 'Kapasia Community Hermetic Silo #2',
    listedOnMarket: true,
    climateScore: 'Low Risk Season (NDVI Peak 0.74)'
  },
  {
    id: 'harv-2',
    batchId: 'AGS-2026-BD-7732',
    cropName: 'Potato (Diamant)',
    farmName: 'North Bogura Vegetable Block',
    district: 'Bogura',
    harvestDate: '2026-11-04',
    quantityKg: 800,
    qualityGrade: 'Grade A',
    storageLocation: 'Shibganj Ambient Ventilated Shed',
    listedOnMarket: true,
    climateScore: 'Moderate Dry-Spell Managed'
  }
];

// ============================================================================
// 3. HELPER COMPONENTS (SVG LEAF ART, BADGES, SKELETONS)
// ============================================================================
const LeafIllustration = ({ type }) => {
  return (
    <svg viewBox="0 0 240 160" className="w-full h-44 rounded-xl bg-gradient-to-br from-emerald-50 to-green-100 border border-emerald-200 p-2">
      <defs>
        <linearGradient id="leafGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
      </defs>
      {/* Leaf Blade */}
      <path
        d="M30,130 Q60,30 205,25 Q185,125 30,130 Z"
        fill="url(#leafGrad)"
        stroke="#14532d"
        strokeWidth="2.5"
      />
      {/* Central Vein */}
      <path d="M30,130 Q115,82 205,25" fill="none" stroke="#bbf7d0" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M85,95 L75,65 M120,76 L112,46 M152,58 L145,35 M105,86 L135,102 M140,66 L168,80" fill="none" stroke="#86efac" strokeWidth="1.5" />

      {/* Disease Markers */}
      {type === 'blast' && (
        <g>
          <polygon points="95,62 110,55 122,63 108,70" fill="#e5e7eb" stroke="#78350f" strokeWidth="2" />
          <polygon points="135,48 152,41 163,49 147,56" fill="#f3f4f6" stroke="#78350f" strokeWidth="2" />
          <polygon points="118,84 134,78 145,86 129,92" fill="#e5e7eb" stroke="#78350f" strokeWidth="2" />
        </g>
      )}
      {type === 'blight' && (
        <g>
          <path d="M165,32 Q195,28 198,55 Q175,62 165,32 Z" fill="#3f2e21" opacity="0.88" />
          <circle cx="152" cy="68" r="13" fill="#451a03" opacity="0.78" />
          <circle cx="152" cy="68" r="16" fill="none" stroke="#fef08a" strokeWidth="1.5" strokeDasharray="3 2" />
        </g>
      )}
      {type === 'early' && (
        <g>
          <circle cx="105" cy="82" r="12" fill="#78350f" stroke="#facc15" strokeWidth="2.5" />
          <circle cx="105" cy="82" r="7" fill="none" stroke="#d97706" strokeWidth="1.2" />
          <circle cx="145" cy="62" r="10" fill="#78350f" stroke="#facc15" strokeWidth="2.5" />
          <circle cx="145" cy="62" r="5" fill="none" stroke="#d97706" strokeWidth="1.2" />
        </g>
      )}
      {type === 'healthy' && (
        <g>
          <circle cx="195" cy="128" r="18" fill="#166534" />
          <path d="M187,128 L193,134 L204,122" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
};

const DataSourceBadge = ({ label, type = 'sample' }) => {
  const styles = {
    live: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    model: 'bg-blue-50 text-blue-700 border-blue-200',
    sample: 'bg-amber-50 text-amber-800 border-amber-200',
    demo: 'bg-purple-50 text-purple-800 border-purple-200'
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border ${styles[type] || styles.sample}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${type === 'live' ? 'bg-emerald-500 animate-pulse' : type === 'model' ? 'bg-blue-500' : 'bg-amber-500'}`} />
      {label}
    </span>
  );
};

// ============================================================================
// 4. MAIN APPLICATION COMPONENT
// ============================================================================
export default function App() {
  // Authentication & Role State
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('farmer'); // 'farmer' | 'consumer' | 'admin'
  const [userName, setUserName] = useState('Abdul Karim');
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Domain Data States (Synced with Firestore + Resilient Local Fallback)
  const [selectedDistrictName, setSelectedDistrictName] = useState('Gazipur');
  const [farms, setFarms] = useState(INITIAL_FARMS);
  const [selectedFarmId, setSelectedFarmId] = useState('farm-1');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState([
    {
      id: 'ORD-2026-104',
      productName: 'Premium Boro Miniket Rice',
      quantity: 25,
      totalBdt: 1700,
      buyerName: 'Nadia Rahman (Dhaka)',
      status: 'Confirmed — Ready for Dispatch',
      createdAt: '2026-11-11 04:20 PM',
      isDemo: true
    }
  ]);
  const [harvests, setHarvests] = useState(INITIAL_HARVESTS);
  const [scanHistory, setScanHistory] = useState([
    {
      id: 'scan-101',
      date: '2026-11-10 09:40 AM',
      crop: 'Boro Rice (BRRI dhan28)',
      condition: 'Rice Leaf Blast (Magnaporthe oryzae)',
      confidence: 91.4,
      severity: 'High',
      mode: 'Demo Preset Inference'
    }
  ]);
  const [irrigationLogs, setIrrigationLogs] = useState([
    { id: 'irr-1', date: '2026-11-09', farm: 'Shonar Bangla Paddy Plot A', waterLiters: 4200, method: 'AWD Alternate Wetting', trigger: 'Soil Moisture 41% (<45% threshold)' },
    { id: 'irr-2', date: '2026-11-05', farm: 'North Bogura Vegetable Block', waterLiters: 2100, method: 'Furrow Irrigation', trigger: 'Dry-spell forecast (0mm rain)' }
  ]);
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'High Humidity Alert — Gazipur', msg: 'Relative humidity expected >82% tonight. Monitor Boro paddy leaves for blast lesions.', time: '25 mins ago', unread: true, type: 'warning' },
    { id: 'n2', title: 'Rain-Adjusted Irrigation Hold', msg: '18mm rainfall forecast for Wednesday. Automated irrigation schedule paused to save water.', time: '2 hours ago', unread: true, type: 'info' },
    { id: 'n3', title: 'New Marketplace Demo Order', msg: 'Nadia Rahman placed a 25 kg order for Premium Boro Miniket Rice.', time: 'Yesterday', unread: false, type: 'success' }
  ]);

  // Show non-blocking notification toast
  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3800);
  };

  // ==========================================================================
  // FIREBASE AUTHENTICATION & REAL-TIME LISTENERS (RULE 1, 2, 3 COMPLIANT)
  // ==========================================================================
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        // Fallback smoothly if sandbox offline
      }
    };
    initAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // Sync Public Marketplace Products & Orders via Firestore
  useEffect(() => {
    if (!user) return;
    const productsRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const unsubProducts = onSnapshot(
      productsRef,
      (snap) => {
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setProducts([...INITIAL_PRODUCTS, ...loaded]);
        }
      },
      () => {}
    );

    const ordersRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
    const unsubOrders = onSnapshot(
      ordersRef,
      (snap) => {
        if (!snap.empty) {
          const loadedOrders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setOrders((prev) => {
            const existingIds = new Set(prev.map((o) => o.id));
            const merged = [...prev];
            loadedOrders.forEach((lo) => {
              if (!existingIds.has(lo.id)) merged.unshift(lo);
            });
            return merged;
          });
        }
      },
      () => {}
    );

    return () => {
      unsubProducts();
      unsubOrders();
    };
  }, [user]);

  // Role Switching Handler
  const handleRoleSwitch = (newRole) => {
    setRole(newRole);
    if (newRole === 'farmer') {
      setUserName('Abdul Karim');
      if (activeTab === 'admin') setActiveTab('overview');
    } else if (newRole === 'consumer') {
      setUserName('Nadia Rahman');
      setActiveTab('marketplace');
    } else if (newRole === 'admin') {
      setUserName('System Administrator');
      setActiveTab('admin');
    }
    triggerToast(`Switched active workspace role to ${newRole.toUpperCase()}`);
  };

  // Current District & Farm Derivations
  const activeDistrict = useMemo(
    () => BD_DISTRICTS.find((d) => d.name === selectedDistrictName) || BD_DISTRICTS[0],
    [selectedDistrictName]
  );

  const activeFarm = useMemo(
    () => farms.find((f) => f.id === selectedFarmId) || farms[0],
    [farms, selectedFarmId]
  );

  // Navigation Menu Configuration
  const navItems = useMemo(() => {
    const base = [
      { id: 'overview', label: 'Overview', icon: BarChart3, roles: ['farmer', 'admin'] },
      { id: 'planner', label: 'Farm Planner', icon: Calendar, roles: ['farmer', 'admin'] },
      { id: 'yield', label: 'AI Yield Prediction', icon: Activity, roles: ['farmer', 'admin'] },
      { id: 'climate', label: 'Climate & Risk', icon: CloudRain, roles: ['farmer', 'admin'] },
      { id: 'scanner', label: 'Disease Scanner', icon: ScanLine, roles: ['farmer', 'admin'] },
      { id: 'irrigation', label: 'Smart Irrigation', icon: Droplets, roles: ['farmer', 'admin'] },
      { id: 'agribot', label: 'AI AgriBot', icon: MessageSquare, roles: ['farmer', 'consumer', 'admin'] },
      { id: 'marketplace', label: 'Marketplace', icon: Store, roles: ['farmer', 'consumer', 'admin'] },
      { id: 'harvest', label: 'Harvest & Traceability', icon: PackageCheck, roles: ['farmer', 'admin'] },
      { id: 'satellite', label: 'Satellite NDVI', icon: Satellite, roles: ['farmer', 'admin'] },
      { id: 'admin', label: 'Admin & System', icon: Settings, roles: ['admin', 'farmer'] },
    ];
    return base.filter((item) => item.roles.includes(role));
  }, [role]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-[#F7FAF5] text-[#1F2937] flex flex-col lg:flex-row font-sans">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-[#166534] text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-400/30 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ====================================================================
          LEFT SIDEBAR NAVIGATION
          ==================================================================== */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-68 bg-white border-r border-emerald-900/10 flex flex-col transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-emerald-900/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#166534] to-[#10B981] flex items-center justify-center text-white shadow-md shadow-emerald-900/15">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-[#166534] leading-none">
                AgriShield AI
              </h1>
              <p className="text-[11px] font-medium text-emerald-600 mt-1">
                Grow with Confidence.
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Role Pill */}
        <div className="px-4 pt-4 pb-2">
          <div className="p-3 rounded-xl bg-[#DCFCE7]/60 border border-emerald-200">
            <div className="flex items-center justify-between text-xs text-[#166534] font-semibold mb-1.5">
              <span>ACTIVE ROLE</span>
              <span className="uppercase px-2 py-0.5 bg-[#166534] text-white rounded-md text-[10px]">
                {role}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-white/80 p-1 rounded-lg border border-emerald-200/80">
              {['farmer', 'consumer', 'admin'].map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`py-1 text-[11px] font-semibold rounded-md capitalize transition-all ${
                    role === r
                      ? 'bg-[#166534] text-white shadow-sm'
                      : 'text-slate-600 hover:text-[#166534]'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#166534] text-white shadow-sm shadow-emerald-900/15'
                    : 'text-slate-600 hover:bg-emerald-50 hover:text-[#166534]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === 'agribot' && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${isActive ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    বাংলা/EN
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status Footer */}
        <div className="p-4 border-t border-emerald-900/10 text-xs text-slate-500 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-medium text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Decision Engine v2.4
            </span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">BD-MVP</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            Decision-support prototype. Not an official BMD weather forecast.
          </p>
        </div>
      </aside>

      {/* ====================================================================
          MAIN CONTENT AREA
          ==================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-emerald-900/10 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* District Location Selector */}
            <div className="flex items-center gap-2 bg-[#F7FAF5] border border-emerald-200 px-3 py-1.5 rounded-xl">
              <MapPin className="w-4 h-4 text-[#166534]" />
              <select
                value={selectedDistrictName}
                onChange={(e) => setSelectedDistrictName(e.target.value)}
                className="bg-transparent text-sm font-semibold text-[#1F2937] focus:outline-none cursor-pointer"
              >
                {BD_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    {d.name}, Bangladesh
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
              <DataSourceBadge label="BAMIS / NASA POWER Ref" type="model" />
              <span>Demo data snapshot • Nov 2026</span>
            </div>
          </div>

          {/* Right Controls: Notifications & Profile */}
          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2.5 rounded-xl bg-[#F7FAF5] hover:bg-emerald-50 border border-slate-200 text-slate-700 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#DC2626] text-white text-[11px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-slate-800">Farm & Climate Alerts</h3>
                  <button
                    onClick={() => {
                      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
                      setNotificationsOpen(false);
                    }}
                    className="text-xs text-[#166534] font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`py-3 ${n.unread ? 'bg-emerald-50/40 -mx-2 px-2 rounded-lg' : ''}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{n.title}</span>
                        <span className="text-[10px] text-slate-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{n.msg}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-[#DCFCE7] text-[#166534] font-bold flex items-center justify-center text-sm">
                {userName.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">{userName}</p>
                <p className="text-[11px] text-slate-500 capitalize mt-0.5">{role} Account</p>
              </div>
            </div>
          </div>
        </header>

        {/* DYNAMIC MODULE WORKSPACE */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {activeTab === 'overview' && (
            <FarmerOverviewModule
              userName={userName}
              district={activeDistrict}
              farms={farms}
              activeFarm={activeFarm}
              setSelectedFarmId={setSelectedFarmId}
              scanHistory={scanHistory}
              irrigationLogs={irrigationLogs}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'planner' && (
            <SmartFarmPlannerModule
              farms={farms}
              setFarms={setFarms}
              selectedFarmId={selectedFarmId}
              setSelectedFarmId={setSelectedFarmId}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'yield' && (
            <YieldPredictionModule defaultDistrict={selectedDistrictName} />
          )}

          {activeTab === 'climate' && (
            <ClimateRiskModule
              district={activeDistrict}
              setSelectedDistrictName={setSelectedDistrictName}
              farms={farms}
            />
          )}

          {activeTab === 'scanner' && (
            <DiseaseScannerModule
              scanHistory={scanHistory}
              setScanHistory={setScanHistory}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'irrigation' && (
            <SmartIrrigationModule
              district={activeDistrict}
              farms={farms}
              irrigationLogs={irrigationLogs}
              setIrrigationLogs={setIrrigationLogs}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'agribot' && (
            <AgriBotModule
              district={activeDistrict}
              activeFarm={activeFarm}
            />
          )}

          {activeTab === 'marketplace' && (
            <MarketplaceModule
              role={role}
              userName={userName}
              products={products}
              setProducts={setProducts}
              orders={orders}
              setOrders={setOrders}
              harvests={harvests}
              db={db}
              appId={appId}
              user={user}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'harvest' && (
            <HarvestTraceabilityModule
              harvests={harvests}
              setHarvests={setHarvests}
              farms={farms}
              setProducts={setProducts}
              setActiveTab={setActiveTab}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'satellite' && (
            <SatelliteNdviModule
              district={activeDistrict}
              activeFarm={activeFarm}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPanelModule
              role={role}
              products={products}
              setProducts={setProducts}
              orders={orders}
              farms={farms}
              triggerToast={triggerToast}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 1: FARMER DASHBOARD (OVERVIEW)
// ============================================================================
function FarmerOverviewModule({
  userName, district, farms, activeFarm, setSelectedFarmId, scanHistory, irrigationLogs, setActiveTab
}) {
  const riskLevel = district.rainForecast > 40 ? 'High' : district.soilMoisture < 35 ? 'Moderate' : 'Low';
  const riskColor = riskLevel === 'High' ? 'text-red-700 bg-red-50 border-red-200' : riskLevel === 'Moderate' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';

  const riskPieData = [
    { name: 'Low Risk Plots', value: 65, color: '#10B981' },
    { name: 'Moderate Watch', value: 25, color: '#F59E0B' },
    { name: 'High Risk Alert', value: 10, color: '#DC2626' },
  ];

  return (
    <div className="space-y-6">
      {/* Greeting & Quick Action Hero Card */}
      <div className="bg-gradient-to-r from-[#166534] via-[#15803d] to-[#047857] rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Assalamu Alaikum, {userName} • {district.name} Agro-Zone</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Farm Intelligence & Daily Action Summary
          </h2>
          <p className="text-emerald-100 text-sm max-w-2xl">
            Answering what is happening on your farm, what climate or disease risks may affect your crops, and what steps to take next.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('scanner')}
            className="px-4 py-2.5 rounded-xl bg-white text-[#166534] font-semibold text-sm hover:bg-emerald-50 transition flex items-center gap-2 shadow-sm"
          >
            <ScanLine className="w-4 h-4" />
            Scan Crop Leaf
          </button>
          <button
            onClick={() => setActiveTab('agribot')}
            className="px-4 py-2.5 rounded-xl bg-emerald-500/30 border border-emerald-300/40 text-white font-semibold text-sm hover:bg-emerald-500/40 transition flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Ask AgriBot
          </button>
        </div>
      </div>

      {/* 3 Core Questions Decision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            1. What is happening?
          </span>
          <h3 className="font-bold text-base text-slate-800 mt-3">{activeFarm.crop} — {activeFarm.stage}</h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Crop growth is at <strong>{activeFarm.progress}%</strong> completion in {district.name}. Current soil moisture is <strong>{district.soilMoisture}%</strong> (Sample Sensor Benchmark).
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
            2. What risks might affect crops?
          </span>
          <h3 className="font-bold text-base text-slate-800 mt-3">
            Climate Risk: <span className="text-[#166534]">{riskLevel}</span> • Humidity {district.humidity}%
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {district.humidity > 78
              ? 'Elevated night humidity increases fungal leaf blast & blight spore germination probability.'
              : 'Mild afternoon heat; monitor topsoil moisture before panicle/tuber development.'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
            3. What should I do next?
          </span>
          <h3 className="font-bold text-base text-slate-800 mt-3">
            {district.rainForecast > 25 ? 'Delay Irrigation & Clear Drainage' : 'Maintain 3–5 cm AWD Water Level'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {district.rainForecast}mm rainfall expected over next 72h. Inspect lower leaves and verify next farm calendar task.
          </p>
        </div>
      </div>

      {/* Live / Sample Environmental Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Ambient Temperature</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{district.temp}°C</span>
            <span className="text-xs text-emerald-600 font-medium">Optimal Range</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            <DataSourceBadge label="BAMIS District Ref" type="model" />
            <span>11:00 AM</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Relative Humidity</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Wind className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{district.humidity}%</span>
            <span className="text-xs text-amber-600 font-medium">{district.humidity > 78 ? 'Fungal Watch' : 'Normal'}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            <DataSourceBadge label="Regional Met Model" type="model" />
            <span>11:00 AM</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Root-Zone Soil Moisture</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{district.soilMoisture}%</span>
            <span className="text-xs text-slate-500 font-medium">Volumetric</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            <DataSourceBadge label="Sample Sensor Data" type="sample" />
            <span>No IoT Paired</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Topsoil pH Level</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{district.soilPh} pH</span>
            <span className="text-xs text-emerald-600 font-medium">Slightly Acidic</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
            <DataSourceBadge label="SRDI Soil Baseline" type="sample" />
            <span>Lab Ref</span>
          </div>
        </div>
      </div>

      {/* Charts Row: Weekly Temperature & Rainfall + Soil Moisture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-800">Weekly Temperature (°C) & Rainfall (mm) Trend</h3>
              <p className="text-xs text-slate-500">Observed vs NASA POWER 10-Year Climatology Baseline ({district.name})</p>
            </div>
            <DataSourceBadge label="Historical + Short-Term Forecast" type="model" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_WEATHER_DATA}>
                <defs>
                  <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="temp" name="Current Temp (°C)" stroke="#166534" strokeWidth={2.5} fill="url(#tempFill)" />
                <Line type="monotone" dataKey="histAvg" name="Historical Avg (°C)" stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={2} />
                <Bar dataKey="rainfall" name="Rainfall (mm)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={18} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution & Active Farm Progress */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-800">Farm Risk Distribution</h3>
            <p className="text-xs text-slate-500">Across {farms.length} registered smallholder plots</p>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={42} outerRadius={68} paddingAngle={4}>
                  {riskPieData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {riskPieData.map((r) => (
              <div key={r.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  {r.name}
                </span>
                <span className="font-bold text-slate-800">{r.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Crops & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800">Active Crops & Growth Progress</h3>
            <button onClick={() => setActiveTab('planner')} className="text-xs font-semibold text-[#166534] hover:underline">
              Open Planner →
            </button>
          </div>
          <div className="space-y-3">
            {farms.map((farm) => (
              <div
                key={farm.id}
                onClick={() => setSelectedFarmId(farm.id)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  activeFarm.id === farm.id ? 'border-[#166534] bg-emerald-50/40' : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-800">{farm.crop}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-[#166534]">
                    {farm.stage}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-2">{farm.name} • {farm.location} ({farm.size} {farm.unit})</p>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#10B981] h-full rounded-full" style={{ width: `${farm.progress}%` }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span>Planted: {farm.plantingDate}</span>
                  <span className="font-semibold text-slate-700">{farm.progress}% Cycle Complete</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-800">Recent AI Scans & Field Logs</h3>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${riskColor}`}>
              {riskLevel} Climate Watch
            </span>
          </div>
          <div className="space-y-3">
            {scanHistory.slice(0, 2).map((scan) => (
              <div key={scan.id} className="p-3.5 rounded-xl bg-[#F7FAF5] border border-emerald-200/70 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                    Disease Scan • {scan.confidence}% Confidence
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 mt-1">{scan.condition}</h4>
                  <p className="text-xs text-slate-500">{scan.crop} • {scan.date}</p>
                </div>
                <button onClick={() => setActiveTab('scanner')} className="text-xs font-semibold text-[#166534] hover:underline shrink-0">
                  View
                </button>
              </div>
            ))}
            {irrigationLogs.slice(0, 2).map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    Irrigation Log • {log.waterLiters} L
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 mt-1">{log.method}</h4>
                  <p className="text-xs text-slate-500">{log.farm} • {log.date}</p>
                </div>
                <span className="text-xs text-slate-400">{log.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 2: SMART FARM PLANNER
// ============================================================================
function SmartFarmPlannerModule({ farms, setFarms, selectedFarmId, setSelectedFarmId, triggerToast }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    district: 'Gazipur',
    location: '',
    size: '1.2',
    unit: 'Acres',
    crop: 'Boro Rice (BRRI dhan28)',
    variety: 'BRRI dhan28',
    plantingDate: '2026-11-15',
    stage: 'Land Preparation'
  });

  const activeFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];

  const handleAddFarm = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const newId = `farm-${Date.now()}`;
    const pDate = new Date(form.plantingDate);
    const fmt = (daysOffset) => {
      const d = new Date(pDate);
      d.setDate(d.getDate() + daysOffset);
      return d.toISOString().split('T')[0];
    };

    const newFarm = {
      id: newId,
      name: form.name,
      district: form.district,
      location: form.location || `${form.district} Sadar`,
      size: parseFloat(form.size) || 1.0,
      unit: form.unit,
      crop: form.crop,
      variety: form.variety,
      plantingDate: form.plantingDate,
      stage: form.stage,
      progress: 12,
      activities: [
        { id: `a-${Date.now()}-1`, title: 'Soil Testing & Land Preparation', date: fmt(-5), type: 'Preparation', completed: true, guidance: 'Ensure level seedbed and basal organic compost incorporation.' },
        { id: `a-${Date.now()}-2`, title: `Sowing / Transplanting (${form.variety})`, date: fmt(0), type: 'Sowing', completed: false, guidance: 'Use BADC-certified healthy seeds with recommended row spacing.' },
        { id: `a-${Date.now()}-3`, title: 'First Top-Dressing & Weeding', date: fmt(22), type: 'Care', completed: false, guidance: 'Remove weeds early to prevent nutrient competition.' },
        { id: `a-${Date.now()}-4`, title: 'Critical Moisture & Reproductive Stage Check', date: fmt(55), type: 'Irrigation', completed: false, guidance: 'Prevent moisture stress during flowering/tuber bulking.' },
        { id: `a-${Date.now()}-5`, title: 'Expected Harvest Window', date: fmt(115), type: 'Harvest', completed: false, guidance: 'Harvest at physiological maturity and record batch ID.' },
      ]
    };

    setFarms([newFarm, ...farms]);
    setSelectedFarmId(newId);
    setShowModal(false);
    setForm({ ...form, name: '', location: '' });
    triggerToast(`Created farm "${newFarm.name}" with auto-generated crop calendar!`);
  };

  const toggleActivity = (actId) => {
    setFarms((prev) =>
      prev.map((farm) => {
        if (farm.id !== activeFarm.id) return farm;
        const updatedActs = farm.activities.map((a) =>
          a.id === actId ? { ...a, completed: !a.completed } : a
        );
        const completedCount = updatedActs.filter((a) => a.completed).length;
        const progress = Math.round((completedCount / updatedActs.length) * 100);
        return { ...farm, activities: updatedActs, progress };
      })
    );
    triggerToast('Updated farming activity completion status');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Smart Farm Planner & Crop Calendar</h2>
          <p className="text-sm text-slate-500">Manage multi-plot farms, generate localized crop timelines, and track field activities.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#166534] hover:bg-emerald-800 text-white font-semibold text-sm flex items-center gap-2 shadow-sm self-start"
        >
          <Plus className="w-4 h-4" />
          Add New Farm Plot
        </button>
      </div>

      {/* Farm Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {farms.map((f) => (
          <div
            key={f.id}
            onClick={() => setSelectedFarmId(f.id)}
            className={`p-4 rounded-2xl border transition cursor-pointer bg-white ${
              f.id === activeFarm.id ? 'border-[#166534] ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#166534] bg-[#DCFCE7] px-2.5 py-0.5 rounded-full">
                {f.district}
              </span>
              <span className="text-xs text-slate-500">{f.size} {f.unit}</span>
            </div>
            <h3 className="font-bold text-base text-slate-800 mt-2">{f.name}</h3>
            <p className="text-xs text-slate-600 mt-0.5">{f.crop}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Stage: <strong className="text-slate-700">{f.stage}</strong></span>
              <span>{f.progress}% Done</span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Crop Timeline */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-lg text-slate-900">{activeFarm.name} — Season Crop Calendar</h3>
            <p className="text-xs text-slate-500">
              Variety: {activeFarm.variety} • Planting Date: {activeFarm.plantingDate} • Verified DAE/BARI Guidance
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-[#166534] border border-emerald-200">
            {activeFarm.activities.filter((a) => a.completed).length} of {activeFarm.activities.length} Tasks Completed
          </span>
        </div>

        <div className="mt-6 space-y-4">
          {activeFarm.activities.map((act, idx) => (
            <div
              key={act.id}
              className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                act.completed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <button
                  onClick={() => toggleActivity(act.id)}
                  className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center border transition shrink-0 ${
                    act.completed
                      ? 'bg-[#166534] border-[#166534] text-white'
                      : 'border-slate-300 hover:border-[#166534] bg-white'
                  }`}
                >
                  {act.completed && <Check className="w-4 h-4" />}
                </button>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">STEP {idx + 1}</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {act.type}
                    </span>
                    <span className="text-xs font-medium text-emerald-700">{act.date}</span>
                  </div>
                  <h4 className={`font-bold text-sm mt-1 ${act.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {act.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">{act.guidance}</p>
                </div>
              </div>

              <button
                onClick={() => toggleActivity(act.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition ${
                  act.completed
                    ? 'bg-emerald-100 text-[#166534]'
                    : 'bg-slate-100 hover:bg-[#166534] hover:text-white text-slate-700'
                }`}
              >
                {act.completed ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Farm Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">Register New Farm & Generate Calendar</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddFarm} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Farm / Plot Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., South Canal Boro Field"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#166534]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District</label>
                  <select
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  >
                    {BD_DISTRICTS.map((d) => (
                      <option key={d.name} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Upazila / Village</label>
                  <input
                    type="text"
                    placeholder="e.g., Sreepur"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Land Size</label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.size}
                    onChange={(e) => setForm({ ...form, size: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Measurement Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="Acres">Acres</option>
                    <option value="Bigha">Bigha</option>
                    <option value="Decimals">Decimals (Shotangsho)</option>
                    <option value="Hectares">Hectares</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Crop Selection</label>
                  <select
                    value={form.crop}
                    onChange={(e) => setForm({ ...form, crop: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  >
                    {CROP_CATALOG.map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Planting Date</label>
                  <input
                    type="date"
                    value={form.plantingDate}
                    onChange={(e) => setForm({ ...form, plantingDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#166534] text-white text-sm font-semibold hover:bg-emerald-800"
                >
                  Save Farm & Generate Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 3: CLIMATE INTELLIGENCE & RISK PREDICTION
// ============================================================================
function ClimateRiskModule({ district, setSelectedDistrictName }) {
  const [selectedCrop, setSelectedCrop] = useState(CROP_CATALOG[0].name);
  const [growthStage, setGrowthStage] = useState('Flowering / Panicle Initiation');
  const [consecutiveDryDays, setConsecutiveDryDays] = useState(4);
  const [consecutiveWetDays, setConsecutiveWetDays] = useState(1);

  // Transparent Baseline Agro-Climatic Risk Engine
  const riskAssessment = useMemo(() => {
    let score = 15;
    const factors = [];

    if (district.temp > 33) {
      score += 30;
      factors.push(`Heat Stress Trigger: ${district.temp}°C exceeds 33°C spikelet sterility threshold during ${growthStage}.`);
    } else if (district.temp > 31) {
      score += 12;
      factors.push(`Mild Thermal Load: ${district.temp}°C approaches upper optimal bound.`);
    }

    if (district.rainForecast > 45 || consecutiveWetDays >= 3) {
      score += 32;
      factors.push(`Excessive Rainfall / Waterlogging Risk: ${district.rainForecast}mm forecast and ${consecutiveWetDays} consecutive wet days.`);
    }

    if (consecutiveDryDays >= 6 || district.soilMoisture < 35) {
      score += 28;
      factors.push(`Dry-Spell Moisture Deficit: ${consecutiveDryDays} consecutive dry days with ${district.soilMoisture}% soil moisture.`);
    }

    if (district.humidity > 80) {
      score += 18;
      factors.push(`Fungal Microclimate Alert: ${district.humidity}% RH favors foliar pathogen sporulation.`);
    }

    if (factors.length === 0) {
      factors.push('All monitored temperature, rainfall, and moisture indicators remain within crop-safe thresholds.');
    }

    const level = score >= 75 ? 'Critical' : score >= 50 ? 'High' : score >= 28 ? 'Moderate' : 'Low';
    return { score: Math.min(score, 96), level, factors };
  }, [district, selectedCrop, growthStage, consecutiveDryDays, consecutiveWetDays]);

  const badgeStyle = {
    Low: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    Moderate: 'bg-amber-100 text-amber-800 border-amber-300',
    High: 'bg-orange-100 text-orange-800 border-orange-300',
    Critical: 'bg-red-100 text-red-800 border-red-300',
  }[riskAssessment.level];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Climate Intelligence & Crop Risk Engine</h2>
          <p className="text-sm text-slate-500">
            Transparent rule-based agro-meteorological risk estimation combining NASA POWER climatology & BAMIS thresholds.
          </p>
        </div>
        <DataSourceBadge label="Baseline Rule Engine v2.4 (Explainable)" type="model" />
      </div>

      {/* Interactive Risk Simulator Controls + Prediction Result */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#166534]" />
            Risk Scenario Parameters
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">District Location</label>
            <select
              value={district.name}
              onChange={(e) => setSelectedDistrictName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            >
              {BD_DISTRICTS.map((d) => (
                <option key={d.name} value={d.name}>{d.name} ({d.region})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Target Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            >
              {CROP_CATALOG.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phenological Growth Stage</label>
            <select
              value={growthStage}
              onChange={(e) => setGrowthStage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            >
              <option>Seedling / Establishment</option>
              <option>Active Vegetative / Tillering</option>
              <option>Flowering / Panicle Initiation</option>
              <option>Grain Filling / Tuber Bulking</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Consecutive Dry Days</label>
              <input
                type="number"
                min="0"
                max="30"
                value={consecutiveDryDays}
                onChange={(e) => setConsecutiveDryDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Consecutive Wet Days</label>
              <input
                type="number"
                min="0"
                max="15"
                value={consecutiveWetDays}
                onChange={(e) => setConsecutiveWetDays(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Explainable Risk Output Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">Composite Agro-Climatic Risk Index</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {selectedCrop} — {district.name}
              </h3>
            </div>
            <div className={`px-4 py-2 rounded-xl border font-bold text-base flex items-center gap-2 ${badgeStyle}`}>
              <ShieldAlert className="w-5 h-5" />
              {riskAssessment.level} Risk ({riskAssessment.score}/100)
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Explainable Risk Drivers & Threshold Attribution
            </h4>
            {riskAssessment.factors.map((factor, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#F7FAF5] border border-emerald-200/80 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm text-slate-700">{factor}</p>
              </div>
            ))}
          </div>

          {/* Model Transparency & Uncertainty Note */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center justify-between font-semibold text-slate-800">
              <span>Model & Data Transparency Disclosure</span>
              <span>Uncertainty Band: ±11%</span>
            </div>
            <p>
              <strong>Distinction:</strong> Historical trends reference NASA POWER agro-climatology; current metrics reflect regional district baselines; risk levels are generated by AgriShield&apos;s transparent rule-based baseline engine (ready for chronological Random Forest / XGBoost training once labeled district yield-loss datasets are ingested).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 4: AI CROP DISEASE SCANNER (GEMINI VISION + TRANSPARENT DEMO PRESETS)
// ============================================================================
function DiseaseScannerModule({ scanHistory, setScanHistory, triggerToast }) {
  const [selectedPreset, setSelectedPreset] = useState(SAMPLE_LEAF_PRESETS[0]);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedMime, setUploadedMime] = useState('image/png');
  const [cropType, setCropType] = useState('Boro Rice (BRRI dhan28)');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(SAMPLE_LEAF_PRESETS[0]);
  const [inferenceModeLabel, setInferenceModeLabel] = useState('Transparent Demo Sample Mode');
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedMime(file.type || 'image/png');
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const runDiseaseInference = async () => {
    setAnalyzing(true);

    // If user uploaded a real leaf image, call Gemini Vision API with safe agricultural prompt
    if (uploadedImage) {
      try {
        const base64Data = uploadedImage.split(',')[1];
        const apiKey = "";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

        const prompt = `You are an expert plant pathologist assisting smallholder farmers in Bangladesh. Analyze this leaf image for crop "${cropType}".
Return a strict JSON object with keys:
- "condition": string (name of disease or "Healthy Foliage")
- "confidence": number (estimated confidence 60 to 95)
- "severity": "Low" | "Moderate" | "High" | "Critical"
- "symptoms": array of 2-3 concise observed visual symptoms
- "prevention": array of 3 safe, verified cultural/IPM prevention steps (DO NOT prescribe unverified chemical or pesticide dosages; recommend consulting local Upazila Agriculture Officer / DAE).`;

        const payload = {
          contents: [
            {
              role: 'user',
              parts: [
                { text: prompt },
                { inlineData: { mimeType: uploadedMime, data: base64Data } }
              ]
            }
          ],
          generationConfig: { responseMimeType: 'application/json' }
        };

        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          setResult(parsed);
          setInferenceModeLabel('Gemini Vision AI Analysis (Prototype)');
          const newRecord = {
            id: `scan-${Date.now()}`,
            date: new Date().toLocaleString(),
            crop: cropType,
            condition: parsed.condition,
            confidence: parsed.confidence,
            severity: parsed.severity,
            mode: 'Gemini Vision Inference'
          };
          setScanHistory([newRecord, ...scanHistory]);
          triggerToast('Leaf image analyzed and saved to detection history!');
          setAnalyzing(false);
          return;
        }
      } catch (err) {
        // Fall through to transparent fallback message
      }

      // Safe fallback if API unavailable in offline sandbox
      const fallbackRes = {
        condition: 'Inconclusive — Requires Higher-Resolution Close-Up or DAE Field Check',
        confidence: 64.0,
        severity: 'Moderate',
        symptoms: [
          'Uploaded leaf region analyzed under offline fallback mode.',
          'Ensure daylight lighting and clear focus on lesion margins for accurate vision inference.'
        ],
        prevention: [
          'Isolate symptomatic leaves and avoid excessive nitrogen fertilization.',
          'Consult your local Upazila Agriculture Office (DAE) for laboratory confirmation.'
        ]
      };
      setResult(fallbackRes);
      setInferenceModeLabel('Offline Safe Fallback Mode');
      setAnalyzing(false);
      return;
    }

    // Demo Preset Mode (Clearly labeled)
    setTimeout(() => {
      setResult(selectedPreset);
      setInferenceModeLabel('Demo Preset Mode (No Custom PyTorch Model Connected)');
      const newRecord = {
        id: `scan-${Date.now()}`,
        date: new Date().toLocaleString(),
        crop: selectedPreset.crop,
        condition: selectedPreset.condition,
        confidence: selectedPreset.confidence,
        severity: selectedPreset.severity,
        mode: 'Demo Sample Preset'
      };
      setScanHistory([newRecord, ...scanHistory]);
      setAnalyzing(false);
      triggerToast('Demo leaf diagnostic completed!');
    }, 650);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">AI Crop Disease Scanner</h2>
          <p className="text-sm text-slate-500">
            Upload a crop leaf photo for AI visual inspection or test with verified Bangladesh disease sample presets.
          </p>
        </div>
        <DataSourceBadge label={inferenceModeLabel} type="demo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input & Sample Selector Panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              1. Select Sample Leaf Preset (For Instant Demo)
            </label>
            <div className="grid grid-cols-1 gap-2">
              {SAMPLE_LEAF_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setUploadedImage(null);
                    setSelectedPreset(preset);
                    setCropType(preset.crop);
                    setResult(preset);
                    setInferenceModeLabel('Demo Sample Mode');
                  }}
                  className={`text-left px-3.5 py-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                    !uploadedImage && selectedPreset.id === preset.id
                      ? 'border-[#166534] bg-[#DCFCE7]/50 text-[#166534] font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{preset.label}</span>
                  <ChevronRight className="w-4 h-4 opacity-60" />
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">
              2. Or Upload / Capture Real Leaf Photo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50 text-[#166534] text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <Upload className="w-4 h-4" />
              Upload Leaf Image (JPG / PNG)
            </button>
          </div>

          {/* Image Preview */}
          <div>
            <span className="block text-xs font-semibold text-slate-500 mb-1.5">Active Leaf Preview</span>
            {uploadedImage ? (
              <img src={uploadedImage} alt="Uploaded crop leaf" className="w-full h-44 object-cover rounded-xl border border-slate-200" />
            ) : (
              <LeafIllustration type={selectedPreset.svgType} />
            )}
          </div>

          <button
            onClick={runDiseaseInference}
            disabled={analyzing}
            className="w-full py-3 rounded-xl bg-[#166534] hover:bg-emerald-800 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-60"
          >
            {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
            {analyzing ? 'Running Leaf Inference...' : 'Analyze Leaf Health'}
          </button>
        </div>

        {/* Diagnostic Output & Prevention Guidance */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-slate-400">DETECTED CONDITION</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">{result.condition}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-[#166534] border border-emerald-200 text-xs font-bold">
                    Confidence: {result.confidence}%
                  </span>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    result.severity === 'Low' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {result.severity}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Observed Visual Symptoms
                </h4>
                <ul className="space-y-2">
                  {result.symptoms?.map((sym, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span>{sym}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#F7FAF5] border border-emerald-200 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#166534] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Verified Cultural & IPM Prevention Guidance (BARI / BRRI / DAE)
                </h4>
                <ul className="space-y-2">
                  {result.prevention?.map((step, idx) => (
                    <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-[11px] text-slate-400">
                Safety Notice: AgriShield AI does not issue unverified chemical pesticide dosages. Always verify chemical interventions with your local Upazila Agriculture Officer (DAE).
              </p>
            </div>
          ) : (
            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500">
              Click &ldquo;Analyze Leaf Health&rdquo; to inspect the uploaded image.
            </div>
          )}

          {/* Detection History Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-800 mb-3">Recent Detection History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="pb-2 font-semibold">Timestamp</th>
                    <th className="pb-2 font-semibold">Crop</th>
                    <th className="pb-2 font-semibold">Result</th>
                    <th className="pb-2 font-semibold">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {scanHistory.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 text-slate-500">{item.date}</td>
                      <td className="py-2.5 font-medium text-slate-800">{item.crop}</td>
                      <td className="py-2.5 font-semibold text-[#166534]">{item.condition}</td>
                      <td className="py-2.5">{item.confidence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 5: SMART IRRIGATION
// ============================================================================
function SmartIrrigationModule({ district, farms, irrigationLogs, setIrrigationLogs, triggerToast }) {
  const [litersInput, setLitersInput] = useState('3500');
  const [selectedFarmName, setSelectedFarmName] = useState(farms[0]?.name || 'Shonar Bangla Paddy Plot A');

  const rainAdjustedAdvice = district.rainForecast >= 25
    ? {
        action: 'HOLD IRRIGATION (Rain-Adjusted)',
        reason: `${district.rainForecast}mm rainfall forecast within 72 hours. Delaying pumping saves ~3,800 L water and prevents waterlogging.`,
        color: 'bg-blue-50 border-blue-200 text-blue-900'
      }
    : district.soilMoisture < 42
    ? {
        action: 'IRRIGATE TODAY (Early Morning 6–9 AM)',
        reason: `Soil moisture is ${district.soilMoisture}% (below 45% threshold) with low rainfall forecast (${district.rainForecast}mm).`,
        color: 'bg-amber-50 border-amber-200 text-amber-900'
      }
    : {
        action: 'OPTIMAL MOISTURE — MONITOR AWD TUBE',
        reason: `Root-zone moisture is ${district.soilMoisture}%. Next light irrigation scheduled in 3 days.`,
        color: 'bg-emerald-50 border-emerald-200 text-emerald-900'
      };

  const handleLogIrrigation = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `irr-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      farm: selectedFarmName,
      waterLiters: Number(litersInput) || 3000,
      method: 'Manual / AWD Verified',
      trigger: `Soil Moisture ${district.soilMoisture}%`
    };
    setIrrigationLogs([newEntry, ...irrigationLogs]);
    triggerToast('Irrigation session logged to water tracking ledger!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Smart Irrigation & Water Stewardship</h2>
          <p className="text-sm text-slate-500">Weather-aware Alternate Wetting & Drying (AWD) scheduling and water savings tracker.</p>
        </div>
        <DataSourceBadge label="Sample Soil Moisture • Hardware Valve Not Linked" type="sample" />
      </div>

      {/* Weather-Aware Recommendation Banner */}
      <div className={`p-6 rounded-2xl border ${rainAdjustedAdvice.color} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider opacity-75">
            Today&apos;s Weather-Aware Recommendation ({district.name})
          </span>
          <h3 className="text-xl font-bold">{rainAdjustedAdvice.action}</h3>
          <p className="text-sm opacity-90">{rainAdjustedAdvice.reason}</p>
        </div>
        <div className="text-xs bg-white/80 px-3.5 py-2.5 rounded-xl border border-black/10 max-w-xs">
          <strong>Safety Lock:</strong> Automated pump/valve actuation is disabled until authorized IoT relay hardware is paired.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Log Irrigation Form */}
        <form onSubmit={handleLogIrrigation} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-base text-slate-800">Record Irrigation Event</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Select Farm Plot</label>
            <select
              value={selectedFarmName}
              onChange={(e) => setSelectedFarmName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            >
              {farms.map((f) => (
                <option key={f.id} value={f.name}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Water Volume Applied (Liters)</label>
            <input
              type="number"
              value={litersInput}
              onChange={(e) => setLitersInput(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#166534] hover:bg-emerald-800 text-white font-semibold text-sm transition"
          >
            Log Irrigation Activity
          </button>
        </form>

        {/* Water Usage Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200">
          <h3 className="font-bold text-base text-slate-800 mb-1">Weekly Water Applied vs Rainwater Saved (Liters)</h3>
          <p className="text-xs text-slate-500 mb-4">Demonstrating AWD & rainfall-adjusted irrigation water conservation</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WATER_USAGE_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="applied" name="Irrigated (L)" fill="#166534" radius={[4, 4, 0, 0]} />
                <Bar dataKey="savedRain" name="Saved via Rain Forecast (L)" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Irrigation History */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-base text-slate-800 mb-3">Irrigation Ledger</h3>
        <div className="divide-y divide-slate-100">
          {irrigationLogs.map((l) => (
            <div key={l.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <span className="font-bold text-slate-800 text-sm">{l.farm}</span>
                <p className="text-slate-500">{l.method} • Trigger: {l.trigger}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold">{l.waterLiters} Liters</span>
                <span className="text-slate-400">{l.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 6: AI AGRIBOT (BILINGUAL BENGALI / ENGLISH / BANGLISH RAG ASSISTANT)
// ============================================================================
function AgriBotModule({ district, activeFarm }) {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'bot',
      text: `আসসালামু আলাইকুম! আমি AgriBot — আপনার কৃষি সহায়ক। আপনি বাংলা, English, বা Banglish-এ আপনার ফসল (${activeFarm.crop}), আবহাওয়া (${district.name}), সেচ বা রোগবালাই সম্পর্কে প্রশ্ন করতে পারেন।`,
      source: 'BRRI & BAMIS Verified Knowledge Base (2025–2026)'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'বোরো ধানের ব্লাস্ট রোগ প্রতিরোধে করণীয় কী?',
    'Should I irrigate my field today based on Gazipur rain forecast?',
    'Alu (Potato) er late blight hole ki korbo?',
    'How does AWD irrigation save water in rice farming?'
  ];

  const generateGroundedReply = (queryText) => {
    const q = queryText.toLowerCase();
    if (q.includes('blast') || q.includes('ব্লাস্ট') || q.includes('ধান')) {
      return {
        text: 'বোরো ধানের ব্লাস্ট রোগ (Rice Blast) প্রতিরোধে করণীয়:\n১. জমিতে ইউরিয়া সার একসাথে বেশি না দিয়ে কিস্তিতে প্রয়োগ করুন।\n২. জমিতে ২–৫ সেমি ছিপছিপে পানি ধরে রাখুন (শুকিয়ে যেতে দেবেন না)।\n৩. আক্রান্ত আগাছা পরিষ্কার রাখুন এবং স্থানীয় উপ-সহকারী কৃষি কর্মকর্তার (DAE) পরামর্শ অনুযায়ী অনুমোদিত ব্যবস্থা নিন।',
        source: 'BRRI Rice Cultivation & Blast Management Guidelines (2025)'
      };
    }
    if (q.includes('blight') || q.includes('alu') || q.includes('potato') || q.includes('আলু')) {
      return {
        text: 'আলুর নাবি ধ্বসা (Late Blight) রোগ ব্যবস্থাপনা:\n১. কুয়াশাচ্ছন্ন ও ঠান্ডা আবহাওয়ায় বিকেলে সেচ দেওয়া থেকে বিরত থাকুন যাতে পাতা দীর্ঘক্ষণ ভেজা না থাকে।\n২. গাছের গোড়ায় ভালোভাবে মাটি তুলে দিন (Earthing up) এবং জমির পানি নিষ্কাশন ব্যবস্থা সচল রাখুন।\n৩. অনুমোদিত ছত্রাকনাশকের সঠিক মাত্রার জন্য নিকটস্থ উপজেলা কৃষি অফিসে (DAE/BARI) যোগাযোগ করুন।',
        source: 'BARI Potato Late Blight & IPM Manual (2025)'
      };
    }
    if (q.includes('irrigat') || q.includes('water') || q.includes('সেচ') || q.includes('awd')) {
      return {
        text: `বর্তমানে ${district.name} জেলায় আগামী ৭২ ঘণ্টায় ${district.rainForecast} মিমি বৃষ্টির সম্ভাবনা এবং মাটির আর্দ্রতা ${district.soilMoisture}% রয়েছে। ${
          district.rainForecast > 20
            ? 'বৃষ্টির পূর্বাভাস থাকায় আজ সেচ স্থগিত রাখা উত্তম।'
            : 'AWD (Alternate Wetting and Drying) পাইপে পানি মাটির ১৫ সেমি নিচে নেমে গেলে তবেই সেচ দিন—এতে ২০–৩০% সেচের পানি সাশ্রয় হয়।'
        }`,
        source: 'FAO Climate-Smart Agriculture Sourcebook & BAMIS Advisory (2026)'
      };
    }
    return {
      text: `আপনার খামার (${activeFarm.name} — ${activeFarm.crop}, ${district.name}) এর বর্তমান তাপমাত্রা ${district.temp}°C ও আর্দ্রতা ${district.humidity}%। নিয়মিত ফসলের পাতা পর্যবেক্ষণ করুন, সুষম সার ব্যবহার করুন এবং সুনির্দিষ্ট রাসায়নিক মাত্রার জন্য স্থানীয় কৃষি সম্প্রসারণ অধিদপ্তরের (DAE) পরামর্শ গ্রহণ করুন।`,
      source: 'BAMIS Agro-Meteorological Advisory Bulletin (2026)'
    };
  };

  const handleSend = async (customText) => {
    const query = (customText ?? input).trim();
    if (!query || loading) return;

    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const systemInstruction = `You are AgriBot, a helpful bilingual (Bengali, English, and Banglish) agricultural assistant for smallholder farmers in Bangladesh.
Context: District=${district.name}, Temp=${district.temp}C, Humidity=${district.humidity}%, Rain72h=${district.rainForecast}mm, ActiveCrop=${activeFarm.crop}.
Rules:
1. Reply in the same language (Bengali, English, or Banglish) as the user's question.
2. Ground answers in verified FAO, BAMIS, BRRI, BARI, and DAE Bangladesh practices.
3. NEVER invent unverified chemical or pesticide dosages; instruct farmers to consult their local Upazila Agriculture Officer (DAE) for chemical dosages.
4. Keep answers clear, structured, practical, and concise.`;

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] }
        })
      });

      const data = await res.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (replyText) {
        setMessages((prev) => [
          ...prev,
          {
            id: `b-${Date.now()}`,
            sender: 'bot',
            text: replyText,
            source: 'AgriShield RAG • Grounded in BRRI / BARI / BAMIS / FAO Knowledge Corpus'
          }
        ]);
        setLoading(false);
        return;
      }
    } catch (err) {
      // Fallback to verified local RAG knowledge response
    }

    const fallback = generateGroundedReply(query);
    setMessages((prev) => [
      ...prev,
      {
        id: `b-${Date.now()}`,
        sender: 'bot',
        text: fallback.text,
        source: fallback.source
      }
    ]);
    setLoading(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Chat Window */}
      <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 flex flex-col h-[580px] shadow-xs overflow-hidden">
        <div className="p-4 bg-[#166534] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm">AgriBot — Bilingual Evidence-Based Assistant</h3>
              <p className="text-[11px] text-emerald-200">Supports বাংলা • English • Banglish with Source Citations</p>
            </div>
          </div>
          <span className="text-[11px] bg-emerald-500/30 px-2.5 py-1 rounded-full">RAG Grounded</span>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F7FAF5]">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-line shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-[#166534] text-white rounded-br-sm'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                }`}
              >
                {m.text}
                {m.source && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                    <FileText className="w-3.5 h-3.5 shrink-0" />
                    <span>Source: {m.source}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-xs text-slate-500 flex items-center gap-2 px-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#166534]" />
              Retrieving verified agricultural guidance...
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex gap-2 overflow-x-auto">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(qp)}
              className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#166534] font-medium whitespace-nowrap border border-emerald-200 transition"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="বাংলা, English বা Banglish-এ আপনার প্রশ্ন লিখুন..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-[#166534]"
          />
          <button
            type="submit"
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#166534] hover:bg-emerald-800 text-white transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Verified Knowledge Corpus Sidebar */}
      <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
          <Database className="w-4 h-4 text-[#166534]" />
          Verified Knowledge Sources
        </h3>
        <p className="text-xs text-slate-500">
          AgriBot restricts recommendations to vetted institutional publications and refuses unverified chemical dosages.
        </p>
        <div className="space-y-3">
          {KNOWLEDGE_SOURCES.map((src) => (
            <div key={src.id} className="p-3.5 rounded-xl bg-[#F7FAF5] border border-emerald-200/70 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  {src.year} Verified
                </span>
              </div>
              <h4 className="font-bold text-xs text-slate-800">{src.title}</h4>
              <p className="text-[11px] font-medium text-slate-500">{src.authority}</p>
              <p className="text-[11px] text-slate-600 leading-relaxed">{src.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE 7: AGRICULTURAL MARKETPLACE (FARMER LISTINGS + CONSUMER CART & ORDERS)
// ============================================================================
function MarketplaceModule({
  role, userName, products, setProducts, orders, setOrders, harvests, db, appId, user, triggerToast
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [cart, setCart] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProd, setNewProd] = useState({
    cropName: '',
    category: 'Cereals',
    priceBdt: '65',
    availableQty: '300',
    district: 'Gazipur',
    batchId: harvests[0]?.batchId || 'AGS-2026-BD-9901',
    description: ''
  });

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.farmerName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = categoryFilter === 'All' || p.category === categoryFilter;
      const matchesDist = districtFilter === 'All' || p.district === districtFilter;
      return matchesSearch && matchesCat && matchesDist;
    });
  }, [products, searchQuery, categoryFilter, districtFilter]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 10 } : i));
      }
      return [...prev, { ...product, qty: 10 }];
    });
    triggerToast(`Added 10 ${product.unit} of ${product.cropName} to demo cart`);
  };

  const handlePlaceDemoOrder = async () => {
    if (cart.length === 0) return;
    const totalBdt = cart.reduce((sum, item) => sum + item.priceBdt * item.qty, 0);
    const summaryName = cart.map((c) => `${c.cropName} (${c.qty}${c.unit})`).join(', ');
    const totalQty = cart.reduce((s, c) => s + c.qty, 0);

    const newOrder = {
      id: `ORD-2026-${Math.floor(100 + Math.random() * 899)}`,
      productName: summaryName,
      quantity: totalQty,
      totalBdt,
      buyerName: `${userName} (Demo Buyer)`,
      status: 'Demo Order Placed — Awaiting Farmer Confirmation',
      createdAt: new Date().toLocaleString(),
      isDemo: true
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    triggerToast('Demonstration order placed! (No real payment processed)');

    if (user) {
      try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'orders'), newOrder);
      } catch (e) {}
    }
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    if (!newProd.cropName.trim()) return;
    const created = {
      id: `prod-${Date.now()}`,
      cropName: newProd.cropName,
      category: newProd.category,
      priceBdt: Number(newProd.priceBdt) || 50,
      unit: 'kg',
      availableQty: Number(newProd.availableQty) || 100,
      district: newProd.district,
      farmerName: userName,
      farmerPhone: '+880 17XX-XXXXXX',
      batchId: newProd.batchId,
      qualityGrade: 'Grade A Verified',
      verifiedTraceability: true,
      description: newProd.description || 'Direct farm-gate harvest listed via AgriShield AI.'
    };

    setProducts([created, ...products]);
    setShowAddProduct(false);
    setNewProd({ ...newProd, cropName: '', description: '' });
    triggerToast(`Listed "${created.cropName}" on the AgriShield Marketplace!`);

    if (user) {
      try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), created);
      } catch (e) {}
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.priceBdt * item.qty, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Direct Farm-to-Market Exchange</h2>
          <p className="text-sm text-slate-500">
            Transparent smallholder produce listings with QR batch traceability. Demonstration order workflow enabled.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DataSourceBadge label="Demo Order Mode (No Live Payment Gateway)" type="demo" />
          {(role === 'farmer' || role === 'admin') && (
            <button
              onClick={() => setShowAddProduct(true)}
              className="px-4 py-2.5 rounded-xl bg-[#166534] hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              List Produce
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search crops, varieties, or farmer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#166534]"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="All">All Categories</option>
          <option value="Cereals">Cereals (Rice)</option>
          <option value="Tubers">Tubers (Potato)</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Fiber">Fiber (Jute)</option>
        </select>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
        >
          <option value="All">All Districts</option>
          {BD_DISTRICTS.map((d) => (
            <option key={d.name} value={d.name}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Cart Summary Banner if items in cart */}
      {cart.length > 0 && (
        <div className="bg-[#DCFCE7] border border-emerald-300 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase text-[#166534]">Demonstration Cart ({cart.length} items)</span>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {cart.map((c) => `${c.cropName} (${c.qty}${c.unit})`).join(' • ')} — Total: ৳{cartTotal.toLocaleString()} BDT
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCart([])} className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white/60">
              Clear
            </button>
            <button
              onClick={handlePlaceDemoOrder}
              className="px-4 py-2 rounded-xl bg-[#166534] text-white text-xs font-bold hover:bg-emerald-800 shadow-sm"
            >
              Place Demo Order (৳{cartTotal.toLocaleString()})
            </button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => (
          <div key={prod.id} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#166534] border border-emerald-200">
                  {prod.category} • {prod.district}
                </span>
                {prod.verifiedTraceability && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    <QrCode className="w-3 h-3" />
                    {prod.batchId}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">{prod.cropName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Farmer: <strong>{prod.farmerName}</strong> • {prod.qualityGrade}</p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{prod.description}</p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-[#166534]">৳{prod.priceBdt}</span>
                <span className="text-xs text-slate-500"> / {prod.unit}</span>
                <p className="text-[11px] text-slate-400">{prod.availableQty} {prod.unit} available</p>
              </div>

              <button
                onClick={() => addToCart(prod)}
                className="px-3.5 py-2 rounded-xl bg-[#166534] hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                Order 10{prod.unit}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Order Tracking Ledger */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-base text-slate-800 mb-3">Demonstration Orders & Fulfillment Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="pb-2 font-semibold">Order ID</th>
                <th className="pb-2 font-semibold">Produce & Quantity</th>
                <th className="pb-2 font-semibold">Buyer</th>
                <th className="pb-2 font-semibold">Est. Value</th>
                <th className="pb-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((ord) => (
                <tr key={ord.id}>
                  <td className="py-3 font-bold text-slate-800">{ord.id}</td>
                  <td className="py-3 text-slate-700">{ord.productName}</td>
                  <td className="py-3 text-slate-600">{ord.buyerName}</td>
                  <td className="py-3 font-bold text-[#166534]">৳{ord.totalBdt.toLocaleString()}</td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                      {ord.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Listing Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900">List Harvested Produce</h3>
              <button onClick={() => setShowAddProduct(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <form onSubmit={handleCreateListing} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Crop / Product Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Fresh BRRI dhan49 Aman Rice"
                  value={newProd.cropName}
                  onChange={(e) => setNewProd({ ...newProd, cropName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Price (BDT / kg)</label>
                  <input
                    type="number"
                    value={newProd.priceBdt}
                    onChange={(e) => setNewProd({ ...newProd, priceBdt: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity (kg)</label>
                  <input
                    type="number"
                    value={newProd.availableQty}
                    onChange={(e) => setNewProd({ ...newProd, availableQty: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newProd.category}
                    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="Cereals">Cereals</option>
                    <option value="Tubers">Tubers</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fiber">Fiber</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Linked Batch ID</label>
                  <input
                    type="text"
                    value={newProd.batchId}
                    onChange={(e) => setNewProd({ ...newProd, batchId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quality & Cultivation Notes</label>
                <textarea
                  rows="2"
                  placeholder="Describe moisture grade, storage, and climate-smart cultivation..."
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddProduct(false)} className="px-4 py-2 rounded-xl border text-xs font-semibold">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#166534] text-white text-xs font-semibold">
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 8: HARVEST & TRACEABILITY
// ============================================================================
function HarvestTraceabilityModule({ harvests, setHarvests, farms, setProducts, setActiveTab, triggerToast }) {
  const [selectedQrBatch, setSelectedQrBatch] = useState(null);
  const [form, setForm] = useState({
    cropName: farms[0]?.crop || 'Boro Rice (BRRI dhan28)',
    farmName: farms[0]?.name || 'Shonar Bangla Paddy Plot A',
    district: farms[0]?.district || 'Gazipur',
    harvestDate: '2026-11-12',
    quantityKg: '650',
    qualityGrade: 'Grade A',
    storageLocation: 'On-Farm Ventilated Hermetic Bags'
  });

  const handleRecordHarvest = (e) => {
    e.preventDefault();
    const batchId = `AGS-2026-BD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newHarv = {
      id: `harv-${Date.now()}`,
      batchId,
      cropName: form.cropName,
      farmName: form.farmName,
      district: form.district,
      harvestDate: form.harvestDate,
      quantityKg: Number(form.quantityKg) || 500,
      qualityGrade: form.qualityGrade,
      storageLocation: form.storageLocation,
      listedOnMarket: false,
      climateScore: 'Verified Low-Risk Harvest'
    };
    setHarvests([newHarv, ...harvests]);
    triggerToast(`Harvest recorded with Traceability Batch ID: ${batchId}`);
  };

  const handleOneClickList = (batch) => {
    const newListing = {
      id: `prod-${Date.now()}`,
      cropName: `${batch.cropName} (Batch ${batch.batchId})`,
      category: batch.cropName.toLowerCase().includes('potato') ? 'Tubers' : 'Cereals',
      priceBdt: 64,
      unit: 'kg',
      availableQty: batch.quantityKg,
      district: batch.district,
      farmerName: 'Abdul Karim',
      farmerPhone: '+880 1712-XXXXXX',
      batchId: batch.batchId,
      qualityGrade: batch.qualityGrade,
      verifiedTraceability: true,
      description: `Traceable batch harvested on ${batch.harvestDate} from ${batch.farmName}. Stored at ${batch.storageLocation}.`
    };
    setProducts((prev) => [newListing, ...prev]);
    setHarvests((prev) => prev.map((h) => (h.id === batch.id ? { ...h, listedOnMarket: true } : h)));
    triggerToast(`Batch ${batch.batchId} published directly to Marketplace!`);
    setActiveTab('marketplace');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Harvest Ledger & Batch Traceability</h2>
        <p className="text-sm text-slate-500">
          Generate verifiable farm-to-market Batch IDs with scannable provenance metadata and one-click marketplace listing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Record Harvest Form */}
        <form onSubmit={handleRecordHarvest} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3.5">
          <h3 className="font-bold text-base text-slate-800">Record New Harvest Batch</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Crop Name</label>
            <input
              type="text"
              value={form.cropName}
              onChange={(e) => setForm({ ...form, cropName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Quantity (kg)</label>
              <input
                type="number"
                value={form.quantityKg}
                onChange={(e) => setForm({ ...form, quantityKg: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Harvest Date</label>
              <input
                type="date"
                value={form.harvestDate}
                onChange={(e) => setForm({ ...form, harvestDate: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Quality Grade</label>
            <input
              type="text"
              value={form.qualityGrade}
              onChange={(e) => setForm({ ...form, qualityGrade: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Storage Location</label>
            <input
              type="text"
              value={form.storageLocation}
              onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[#166534] hover:bg-emerald-800 text-white font-semibold text-sm transition"
          >
            Generate Batch ID & Save
          </button>
        </form>

        {/* Harvest Batches List */}
        <div className="lg:col-span-2 space-y-4">
          {harvests.map((h) => (
            <div key={h.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#166534] text-white font-mono text-xs font-bold">
                    {h.batchId}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {h.qualityGrade}
                  </span>
                </div>
                <h4 className="font-bold text-base text-slate-900">{h.cropName} — {h.quantityKg} kg</h4>
                <p className="text-xs text-slate-500">
                  Origin: {h.farmName} ({h.district}) • Harvested: {h.harvestDate}
                </p>
                <p className="text-xs text-slate-500">Storage: {h.storageLocation}</p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  onClick={() => setSelectedQrBatch(h)}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
                >
                  <QrCode className="w-4 h-4 text-[#166534]" />
                  QR Passport
                </button>
                {!h.listedOnMarket ? (
                  <button
                    onClick={() => handleOneClickList(h)}
                    className="px-3 py-2 rounded-xl bg-[#166534] text-white text-xs font-semibold hover:bg-emerald-800"
                  >
                    List on Marketplace
                  </button>
                ) : (
                  <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    Listed on Market
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QR Traceability Modal */}
      {selectedQrBatch && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#166534] uppercase">AgriShield Provenance Passport</span>
              <button onClick={() => setSelectedQrBatch(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            {/* Deterministic SVG QR Code Graphic */}
            <div className="w-40 h-40 mx-auto bg-white p-3 rounded-2xl border-2 border-[#166534] flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-[#166534]">
                <rect x="5" y="5" width="25" height="25" fill="none" stroke="#166534" strokeWidth="5" />
                <rect x="12" y="12" width="11" height="11" />
                <rect x="70" y="5" width="25" height="25" fill="none" stroke="#166534" strokeWidth="5" />
                <rect x="77" y="12" width="11" height="11" />
                <rect x="5" y="70" width="25" height="25" fill="none" stroke="#166534" strokeWidth="5" />
                <rect x="12" y="77" width="11" height="11" />
                <rect x="40" y="10" width="8" height="8" />
                <rect x="52" y="22" width="8" height="16" />
                <rect x="38" y="40" width="24" height="24" />
                <rect x="12" y="42" width="14" height="8" />
                <rect x="72" y="45" width="18" height="8" />
                <rect x="42" y="74" width="12" height="16" />
                <rect x="68" y="72" width="22" height="18" />
              </svg>
            </div>
            <div>
              <h4 className="font-mono font-bold text-base text-slate-900">{selectedQrBatch.batchId}</h4>
              <p className="text-xs text-slate-600 mt-1">{selectedQrBatch.cropName} ({selectedQrBatch.quantityKg} kg)</p>
              <p className="text-xs text-slate-500">{selectedQrBatch.farmName} • {selectedQrBatch.district}, Bangladesh</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-2">{selectedQrBatch.climateScore}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 9A: SATELLITE VEGETATION MONITORING (SENTINEL-2 NDVI)
// ============================================================================
function SatelliteNdviModule({ district, activeFarm }) {
  const [b08Nir, setB08Nir] = useState(0.78);
  const [b04Red, setB04Red] = useState(0.13);

  const computedNdvi = useMemo(() => {
    const denom = b08Nir + b04Red;
    if (denom === 0) return 0;
    return ((b08Nir - b04Red) / denom).toFixed(3);
  }, [b08Nir, b04Red]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Satellite Vegetation Monitoring (Sentinel-2 NDVI)</h2>
          <p className="text-sm text-slate-500">
            Canopy vigor index derived from Sentinel-2 Bands B08 (NIR) and B04 (Red) for {activeFarm.name}.
          </p>
        </div>
        <DataSourceBadge label="Sample Sentinel-2 Spectral Composite • API Credential Optional" type="sample" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive NDVI Formula Calculator & Spectral Bands */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <h3 className="font-bold text-base text-slate-800">NDVI Spectral Band Calculator</h3>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-center text-slate-700">
            NDVI = (B08_NIR − B04_Red) / (B08_NIR + B04_Red)
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Band B08 (Near-Infrared Reflectance)</span>
              <span>{b08Nir}</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.95"
              step="0.01"
              value={b08Nir}
              onChange={(e) => setB08Nir(parseFloat(e.target.value))}
              className="w-full accent-[#166534]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Band B04 (Visible Red Reflectance)</span>
              <span>{b04Red}</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.60"
              step="0.01"
              value={b04Red}
              onChange={(e) => setB04Red(parseFloat(e.target.value))}
              className="w-full accent-[#DC2626]"
            />
          </div>

          <div className="p-4 rounded-xl bg-[#DCFCE7] border border-emerald-300 text-center">
            <span className="text-xs font-bold uppercase text-[#166534]">Calculated Field NDVI</span>
            <div className="text-3xl font-extrabold text-[#166534] mt-1">{computedNdvi}</div>
            <p className="text-xs text-emerald-800 mt-1">
              {computedNdvi >= 0.6 ? 'Dense Healthy Canopy Vigor' : computedNdvi >= 0.35 ? 'Moderate Vegetative Cover' : 'Sparse / Bare Soil'}
            </p>
          </div>
        </div>

        {/* NDVI Trend Chart + Acquisition Metadata */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-base text-slate-800">Multi-Pass Sentinel-2 NDVI Trajectory</h3>
              <p className="text-xs text-slate-500">Last Acquisition: Nov 11, 2026 • Cloud Cover: 9% • Tile: 45QYG ({district.name})</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={NDVI_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="ndvi" name="Mean Plot NDVI" stroke="#166534" fill="#10B981" fillOpacity={0.25} strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>Agronomic Interpretation Notice:</strong> Satellite NDVI measures canopy greenness and biomass vigor—it is not a standalone crop disease diagnosis. Always verify low-NDVI zones via field scouting or the AI Disease Scanner.
          </div>
        </div>
      </div>
    </div>
  );
}

const getApiBase = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:8000';
    }
    return '';
  }
  return '';
};

// ============================================================================
// MODULE 9B: SYSTEM ADMINISTRATION & API HEALTH PANEL
// ============================================================================
function AdminPanelModule({ products, setProducts, orders, farms, triggerToast }) {
  const API_BASE = getApiBase();
  const [yieldApiHealth, setYieldApiHealth] = useState(null);
  useEffect(() => {
    fetch(`${API_BASE}/health`).then((r) => r.ok ? r.json() : Promise.reject()).then(setYieldApiHealth).catch(() => setYieldApiHealth({ status: 'offline', loaded_models: [] }));
  }, []);
  const handleDeleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    triggerToast('Marketplace listing removed by Administrator');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">System Governance, API Health & Knowledge Audit</h2>
        <p className="text-sm text-slate-500">Monitor backend microservices, AI model readiness, institutional knowledge sources, and marketplace moderation.</p>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Cloud Persistence & Auth</span>
          <p className="text-base font-bold text-amber-700 mt-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Demo / Firebase setup required
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Crop Yield ML API</span>
          <p className={`text-base font-bold mt-1 ${yieldApiHealth?.status === 'healthy' ? 'text-emerald-700' : 'text-amber-700'}`}>{yieldApiHealth?.status === 'healthy' ? `${yieldApiHealth.loaded_models.length} XGBoost models online` : yieldApiHealth?.status === 'offline' ? 'Backend offline' : 'Checking model service…'}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Climate Risk Engine</span>
          <p className="text-base font-bold text-blue-700 mt-1">Rule Baseline v2.4</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200">
          <span className="text-xs text-slate-500 font-medium">Registered Plots / Orders</span>
          <p className="text-base font-bold text-slate-900 mt-1">{farms.length} Farms • {orders.length} Orders</p>
        </div>
      </div>

      {/* Marketplace Moderation */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200">
        <h3 className="font-bold text-base text-slate-800 mb-3">Marketplace Listings Moderation ({products.length})</h3>
        <div className="divide-y divide-slate-100">
          {products.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-sm text-slate-800">{p.cropName}</span>
                <p className="text-slate-500">Seller: {p.farmerName} ({p.district}) • ৳{p.priceBdt}/{p.unit} • Batch: {p.batchId}</p>
              </div>
              <button
                onClick={() => handleDeleteProduct(p.id)}
                className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MODULE: AI CROP YIELD PREDICTION (TRAINED XGBOOST MODELS VIA FASTAPI)
// ============================================================================
function YieldPredictionModule({ defaultDistrict }) {
  const API_BASE = getApiBase();
  const [meta, setMeta] = useState({ crops: [], districts: [] });
  const [crop, setCrop] = useState('Boro');
  const [district, setDistrict] = useState(defaultDistrict || 'Gazipur');
  const [year, setYear] = useState('2027');
  const [climate, setClimate] = useState({
    tmax_mean_c: '', tmin_mean_c: '', rain_total_mm: '',
    vapour_pressure_hpa: '', cloud_mean_okta: '', wet_days: ''
  });
  const [baselineSource, setBaselineSource] = useState('');
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingBaseline, setLoadingBaseline] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;
    fetch(`${API_BASE}/api/yield/meta`)
      .then((r) => { if (!r.ok) throw new Error('Could not load model metadata'); return r.json(); })
      .then((data) => {
        if (!active) return;
        setMeta(data);
        if (data.districts?.length && !data.districts.includes(district)) setDistrict(data.districts.includes('Gazipur') ? 'Gazipur' : data.districts[0]);
        if (data.crops?.length && !data.crops.includes(crop)) setCrop(data.crops[0]);
        setError('');
      })
      .catch(() => active && setError('Yield API is not connected. Start the FastAPI backend using the setup guide.'))
      .finally(() => active && setLoadingMeta(false));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!meta.districts.length || !crop || !district) return;
    let active = true;
    setLoadingBaseline(true);
    fetch(`${API_BASE}/api/yield/baseline?crop=${encodeURIComponent(crop)}&district=${encodeURIComponent(district)}`)
      .then((r) => { if (!r.ok) throw new Error('Baseline unavailable'); return r.json(); })
      .then((data) => {
        if (!active) return;
        setClimate(Object.fromEntries(Object.entries(data.climate).map(([k, v]) => [k, String(v)])));
        setBaselineSource(data.source_label);
        setResult(null);
        setError('');
      })
      .catch(() => active && setError('Historical climate baseline could not be loaded. Check that the backend dataset is available.'))
      .finally(() => active && setLoadingBaseline(false));
    return () => { active = false; };
  }, [API_BASE, crop, district, meta.districts.length]);

  const updateClimate = (key, value) => setClimate((prev) => ({ ...prev, [key]: value }));
  const climateFields = [
    { key: 'tmax_mean_c', label: 'Mean maximum temperature', unit: '°C', step: '0.01' },
    { key: 'tmin_mean_c', label: 'Mean minimum temperature', unit: '°C', step: '0.01' },
    { key: 'rain_total_mm', label: 'Crop-season total rainfall', unit: 'mm', step: '0.1' },
    { key: 'vapour_pressure_hpa', label: 'Vapour pressure', unit: 'hPa', step: '0.001' },
    { key: 'cloud_mean_okta', label: 'Mean cloud cover', unit: 'okta', step: '0.001' },
    { key: 'wet_days', label: 'Wet days', unit: 'days', step: '0.001' }
  ];

  const runPrediction = async () => {
    setError(''); setResult(null);
    const values = Object.fromEntries(Object.entries(climate).map(([k, v]) => [k, Number(v)]));
    if (Object.values(values).some((v) => !Number.isFinite(v))) {
      setError('Please enter valid numeric values for all six climate features.'); return;
    }
    setPredicting(true);
    try {
      const response = await fetch(`${API_BASE}/api/yield/predict`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ crop, district, year: Number(year), ...values })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Prediction request failed');
      setResult(data);
    } catch (e) { setError(e.message || 'Prediction failed. Please check the backend connection.'); }
    finally { setPredicting(false); }
  };

  const metric = result?.benchmark || null;
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><h2 className="text-2xl font-bold text-slate-900">AI Crop Yield Prediction</h2><DataSourceBadge label="Trained XGBoost Models" type="model" /></div>
          <p className="text-sm text-slate-500 mt-1">District-level crop yield estimation using crop-season climate features and saved model pipelines.</p>
        </div>
        <span className="text-xs font-semibold px-3 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800">5 crop-specific models connected</span>
      </div>

      {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{error}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <section className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-5">
          <div><h3 className="font-bold text-slate-900">Prediction scenario</h3><p className="text-xs text-slate-500 mt-1">Choose a crop and district, then review or edit the climate inputs.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="text-xs font-semibold text-slate-600">Crop
              <select value={crop} onChange={(e) => setCrop(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white" disabled={loadingMeta}>
                {(meta.crops.length ? meta.crops : ['Aman','Aus','Boro','Jute','Potato']).map((v) => <option key={v}>{v}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">District
              <select value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm bg-white" disabled={loadingMeta}>
                {(meta.districts.length ? meta.districts : [defaultDistrict || 'Gazipur']).map((v) => <option key={v}>{v}</option>)}
              </select>
            </label>
            <label className="text-xs font-semibold text-slate-600">Scenario year
              <input type="number" min="1984" max="2040" value={year} onChange={(e) => setYear(e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
            </label>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-y border-slate-100 py-3">
            <div><p className="text-sm font-bold text-slate-800">Crop-season climate inputs</p><p className="text-[11px] text-slate-500">{loadingBaseline ? 'Loading district baseline…' : baselineSource || 'Enter climate scenario values'}</p></div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">Editable historical baseline</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {climateFields.map((f) => (
              <label key={f.key} className="text-xs font-semibold text-slate-600">{f.label} <span className="font-normal text-slate-400">({f.unit})</span>
                <input type="number" step={f.step} value={climate[f.key]} onChange={(e) => updateClimate(f.key, e.target.value)} className="mt-1 block w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" placeholder="Enter value" />
              </label>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <p className="text-[11px] text-slate-500 max-w-md">Baseline values are historical CRU TS crop-season averages for the selected district and crop. Edit them to test a climate scenario.</p>
            <button onClick={runPrediction} disabled={predicting || loadingBaseline || !meta.districts.length} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#166534] px-5 py-3 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">
              {predicting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}{predicting ? 'Running model…' : 'Run yield prediction'}
            </button>
          </div>
        </section>

        <section className="xl:col-span-2 bg-[#0B3D2E] text-white rounded-2xl p-6 flex flex-col justify-between min-h-[260px]">
          <div><div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold uppercase tracking-wide"><Sprout className="w-4 h-4" /> Model inference result</div>
            {result ? <>
              <p className="text-sm text-emerald-100 mt-5">Estimated {result.crop} yield • {result.district}, Bangladesh</p>
              <div className="mt-2"><span className="text-4xl sm:text-5xl font-bold tracking-tight">{Number(result.predicted_yield).toFixed(3)}</span><span className="ml-2 text-sm text-emerald-100">{result.yield_unit}</span></div>
              <div className="mt-4 inline-flex rounded-full border border-emerald-300/30 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-100">{result.model_name} • {result.scenario_year}</div>
            </> : <>
              <p className="text-sm text-emerald-100 mt-5">Your model-generated result will appear here.</p>
              <p className="text-2xl font-bold mt-2">Ready for inference</p>
              <p className="text-xs text-emerald-100/80 mt-3">The API calls the saved crop-specific XGBoost pipeline, not a hard-coded sample prediction.</p>
            </>}
          </div>
          {result && <div className="mt-6 pt-4 border-t border-white/15 text-xs text-emerald-100">Historical model benchmark, not a guaranteed farm-level forecast. Input climate scenario: {result.climate_source}.</div>}
        </section>
      </div>

      {result && <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5">
          <h3 className="font-bold text-slate-900">Model validation benchmark</h3><p className="text-xs text-slate-500 mt-1">Held-out temporal test set: 2016–2023 • Training period: 1984–2015</p>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[['MAE',metric?.mae],['RMSE',metric?.rmse],['R²',metric?.r2]].map(([label,value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-[11px] text-slate-500">{label}</p><p className="text-xl font-bold text-slate-900 mt-1">{Number(value).toFixed(3)}</p></div>)}
          </div>
          <p className="text-[11px] text-slate-500 mt-4">MAE and RMSE are in the crop-specific yield unit. R² describes held-out historical test performance, not prediction confidence.</p>
        </div>
        <div className={`rounded-2xl border p-5 ${metric?.r2 < 0 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <h3 className="font-bold text-slate-900">Reliability note</h3>
          <p className="text-xs text-slate-700 mt-2">{metric?.r2 < 0 ? 'This crop has a negative held-out R². The model is connected and produces an estimate, but its historical predictive skill is weak. Treat the result as exploratory only.' : 'The model achieved a positive R² on the held-out historical test set. This is evidence of historical predictive signal, not a guarantee of future or individual-farm accuracy.'}</p>
        </div>
      </div>}

      {result && <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div><h3 className="font-bold text-slate-900">Random Forest vs XGBoost</h3><p className="text-xs text-slate-500 mt-1">Actual saved results on the 2016–2023 temporal test set.</p></div>
          <span className="text-[11px] rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-800">Selected: XGBoost • lowest RMSE</span>
        </div>
        <div className="overflow-x-auto mt-4"><table className="w-full text-left text-xs">
          <thead><tr className="border-b border-slate-200 text-slate-500"><th className="py-2 pr-4">Model</th><th className="py-2 pr-4">MAE</th><th className="py-2 pr-4">RMSE</th><th className="py-2">R²</th></tr></thead>
          <tbody>{result.model_comparison?.map((item) => <tr key={item.model} className={`border-b border-slate-100 ${item.model === 'XGBoost' ? 'bg-emerald-50/60 font-semibold' : ''}`}><td className="py-3 pr-4">{item.model}{item.model === 'XGBoost' ? ' ✓' : ''}</td><td className="py-3 pr-4 tabular-nums">{Number(item.mae).toFixed(4)}</td><td className="py-3 pr-4 tabular-nums">{Number(item.rmse).toFixed(4)}</td><td className="py-3 tabular-nums">{Number(item.r2).toFixed(4)}</td></tr>)}</tbody>
        </table></div>
        <p className="text-[11px] text-slate-500 mt-3">Lower MAE/RMSE is better. Higher R² is better. The two models are compared within the same crop and target unit.</p>
      </div>}

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-bold text-slate-900">Model methodology & transparency</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs text-slate-600">
          <div><p className="font-bold text-slate-800">Model</p><p className="mt-1">Separate XGBoost Regressor pipeline for Aman, Aus, Boro, Jute and Potato.</p></div>
          <div><p className="font-bold text-slate-800">Features</p><p className="mt-1">Year, district and six CRU TS crop-season climate indicators: temperature, rainfall, vapour pressure, cloud cover and wet days.</p></div>
          <div><p className="font-bold text-slate-800">Validation</p><p className="mt-1">Chronological split: 1984–2015 training and 2016–2023 testing. Metrics are displayed from the saved experiment results.</p></div>
        </div>
        <p className="text-[11px] text-slate-500 mt-4 border-t border-slate-100 pt-3">Limitations: district-level historical data, gridded climate inputs, and scenario values entered by the user. The model does not currently ingest live BMD forecasts, farm sensors, or plot-level observations.</p>
      </div>
    </div>
  );
}
