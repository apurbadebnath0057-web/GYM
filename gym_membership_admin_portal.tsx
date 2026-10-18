import React, { useState, useEffect, useMemo } from 'react';
import {
  Dumbbell,
  ShieldCheck,
  User,
  Users,
  CreditCard,
  QrCode,
  Building2,
  Wallet,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Edit3,
  Trash2,
  LogOut,
  KeyRound,
  Calendar,
  TrendingUp,
  Award,
  Download,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  Search,
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  FileText,
  Zap,
  Lock,
  Settings,
  AlertCircle,
  ChevronRight,
  BadgeCheck,
  Smartphone,
  Receipt
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection
} from 'firebase/firestore';

// ============================================================================
// DEFAULT SEED DATA (Members, Admin, Subscription Plans, Payment Methods, Txns)
// ============================================================================

const INITIAL_PLANS = [
  {
    id: 'plan-monthly',
    name: 'Iron Starter Monthly',
    durationDays: 30,
    durationLabel: '1 Month',
    price: 1499,
    currency: '₹',
    badge: 'Flexible',
    popular: false,
    accent: 'zinc',
    description: 'Full gym floor access with strength & cardio zones for consistent daily training.',
    features: [
      'Unrestricted strength & cardio floor access',
      'Smart locker room & shower facility',
      '1 Free initial BMI & body composition scan',
      'Digital Member ID & QR turnstile access'
    ]
  },
  {
    id: 'plan-quarterly',
    name: 'Pro Shred Quarterly',
    durationDays: 90,
    durationLabel: '3 Months',
    price: 3999,
    currency: '₹',
    badge: 'Most Popular',
    popular: true,
    accent: 'lime',
    description: 'Our best-selling transformation package with group HIIT classes and diet tracking.',
    features: [
      'All Iron Starter benefits included',
      'Unlimited Group HIIT, Spin & CrossFit classes',
      'Monthly InBody 570 muscle-fat analysis',
      'Customized macro & nutrition blueprint',
      '2 Guest passes per month'
    ]
  },
  {
    id: 'plan-annual',
    name: 'Apex Elite Annual',
    durationDays: 365,
    durationLabel: '12 Months',
    price: 12999,
    currency: '₹',
    badge: 'Save 28%',
    popular: false,
    accent: 'cyan',
    description: 'Year-round peak performance membership with recovery spa and freeze flexibility.',
    features: [
      'All Pro Shred benefits for 365 days',
      'Steam, Ice Bath & Infrared Sauna access',
      'Up to 30 days membership freeze allowance',
      'Quarterly 1-on-1 form review with Head Coach',
      'Complimentary protein shake on PR days'
    ]
  },
  {
    id: 'plan-vip',
    name: 'VIP Personal Coaching',
    durationDays: 90,
    durationLabel: '3 Months VIP',
    price: 9499,
    currency: '₹',
    badge: '1-on-1 Coaching',
    popular: false,
    accent: 'amber',
    description: 'Dedicated certified strength coach for every session with bespoke programming.',
    features: [
      '24 Dedicated 1-on-1 personal training sessions',
      'Weekly strength periodization & mobility work',
      'Direct WhatsApp coach check-ins & meal audits',
      'Priority recovery lounge & private locker',
      'All-access pass to every gym zone & class'
    ]
  }
];

const INITIAL_PAYMENT_METHODS = [
  {
    id: 'pm-upi-1',
    type: 'UPI',
    name: 'Instant UPI & Scan QR',
    enabled: true,
    autoApprove: false,
    badge: 'Zero Fee • Instant QR',
    details: {
      upiId: 'ironpulse.gym@okaxis',
      merchantName: 'IRONPULSE FITNESS CLUB PVT LTD',
      instructions: 'Scan the dynamic QR code with Google Pay, PhonePe, or Paytm, or pay directly to the UPI ID and enter your 12-digit UTR number below.'
    }
  },
  {
    id: 'pm-card-1',
    type: 'CARD',
    name: 'Credit / Debit Card Gateway',
    enabled: true,
    autoApprove: true,
    badge: 'Auto-Activates Plan',
    details: {
      gatewayName: 'Stripe / Razorpay Express Checkout',
      merchantId: 'MID-IRON-99412',
      acceptedCards: 'Visa, MasterCard, RuPay, Amex',
      instructions: 'Enter your card details for instant 3D-Secure verification and immediate membership activation.'
    }
  },
  {
    id: 'pm-bank-1',
    type: 'BANK',
    name: 'Direct Bank Transfer (IMPS / NEFT)',
    enabled: true,
    autoApprove: false,
    badge: 'Corporate / High Value',
    details: {
      bankName: 'HDFC Bank Ltd.',
      accountName: 'IRONPULSE FITNESS CLUB',
      accountNumber: '50200084918274',
      ifscCode: 'HDFC0001204',
      instructions: 'Transfer the subscription amount via IMPS or NEFT and submit the transaction reference ID for admin verification.'
    }
  },
  {
    id: 'pm-cash-1',
    type: 'WALLET',
    name: 'Front Desk Cash / Gym Desk POS',
    enabled: true,
    autoApprove: false,
    badge: 'Pay at Reception',
    details: {
      counterCode: 'DESK-COUNTER-01',
      timings: '6:00 AM – 10:00 PM Daily',
      instructions: 'Generate a booking slip here and hand over cash or swipe at the gym front desk reception. Admin will approve upon receipt.'
    }
  }
];

const INITIAL_MEMBERS = [
  {
    id: 'GYM-1001',
    password: 'password123',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    goal: 'Hypertrophy & Strength',
    joinedDate: '2026-01-15',
    bloodGroup: 'O+',
    emergencyContact: '+91 98765 00001',
    subscription: {
      planId: 'plan-quarterly',
      planName: 'Pro Shred Quarterly',
      status: 'ACTIVE', // ACTIVE | PENDING | EXPIRED | NONE
      startDate: '2026-09-01',
      expiryDate: '2026-11-30',
      pricePaid: 3999
    }
  },
  {
    id: 'GYM-1002',
    password: 'password123',
    name: 'Priya Nair',
    email: 'priya.nair@example.com',
    phone: '+91 98111 22334',
    goal: 'Athletic Conditioning & HIIT',
    joinedDate: '2026-03-10',
    bloodGroup: 'B+',
    emergencyContact: '+91 98111 00099',
    subscription: {
      planId: 'plan-monthly',
      planName: 'Iron Starter Monthly',
      status: 'PENDING',
      startDate: '2026-10-18',
      expiryDate: '2026-11-17',
      pricePaid: 1499
    }
  },
  {
    id: 'GYM-1003',
    password: 'password123',
    name: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    phone: '+91 99223 34455',
    goal: 'Fat Loss & Mobility',
    joinedDate: '2025-11-05',
    bloodGroup: 'A+',
    emergencyContact: '+91 99223 11111',
    subscription: {
      planId: 'plan-monthly',
      planName: 'Iron Starter Monthly',
      status: 'EXPIRED',
      startDate: '2026-08-10',
      expiryDate: '2026-09-09',
      pricePaid: 1499
    }
  },
  {
    id: 'GYM-1004',
    password: 'password123',
    name: 'Meera Kapoor',
    email: 'meera.k@example.com',
    phone: '+91 97654 32109',
    goal: 'Powerlifting Prep',
    joinedDate: '2026-06-01',
    bloodGroup: 'AB+',
    emergencyContact: '+91 97654 99999',
    subscription: {
      planId: 'plan-annual',
      planName: 'Apex Elite Annual',
      status: 'ACTIVE',
      startDate: '2026-06-01',
      expiryDate: '2027-06-01',
      pricePaid: 12999
    }
  }
];

const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-90841',
    memberId: 'GYM-1001',
    memberName: 'Aarav Sharma',
    planId: 'plan-quarterly',
    planName: 'Pro Shred Quarterly',
    durationDays: 90,
    amount: 3999,
    currency: '₹',
    paymentMethodId: 'pm-card-1',
    paymentMethodName: 'Credit / Debit Card Gateway',
    paymentType: 'CARD',
    referenceId: 'AUTH-CARD-884120',
    date: '2026-09-01 10:14 AM',
    status: 'APPROVED' // APPROVED | PENDING | REJECTED
  },
  {
    id: 'TXN-90895',
    memberId: 'GYM-1002',
    memberName: 'Priya Nair',
    planId: 'plan-monthly',
    planName: 'Iron Starter Monthly',
    durationDays: 30,
    amount: 1499,
    currency: '₹',
    paymentMethodId: 'pm-upi-1',
    paymentMethodName: 'Instant UPI & Scan QR',
    paymentType: 'UPI',
    referenceId: 'UTR-629104829104',
    date: '2026-10-18 08:45 AM',
    status: 'PENDING'
  },
  {
    id: 'TXN-90712',
    memberId: 'GYM-1004',
    memberName: 'Meera Kapoor',
    planId: 'plan-annual',
    memberEmail: 'meera.k@example.com',
    planName: 'Apex Elite Annual',
    durationDays: 365,
    amount: 12999,
    currency: '₹',
    paymentMethodId: 'pm-bank-1',
    paymentMethodName: 'Direct Bank Transfer (IMPS / NEFT)',
    paymentType: 'BANK',
    referenceId: 'HDFCN2615294810',
    date: '2026-06-01 06:20 PM',
    status: 'APPROVED'
  },
  {
    id: 'TXN-90650',
    memberId: 'GYM-1003',
    memberName: 'Rohan Verma',
    planId: 'plan-monthly',
    planName: 'Iron Starter Monthly',
    durationDays: 30,
    amount: 1499,
    currency: '₹',
    paymentMethodId: 'pm-upi-1',
    paymentMethodName: 'Instant UPI & Scan QR',
    paymentType: 'UPI',
    referenceId: 'UTR-518293041122',
    date: '2026-08-10 09:00 AM',
    status: 'APPROVED'
  }
];

const DEFAULT_ADMIN = {
  id: 'ADMIN-01',
  password: 'admin123',
  name: 'Vikramaditya Rathore',
  role: 'Head Operations & Billing Admin'
};

// ============================================================================
// HELPER UTILITIES
// ============================================================================

function calculateDaysRemaining(expiryDateStr) {
  if (!expiryDateStr) return 0;
  const today = new Date('2026-10-18T00:00:00');
  const expiry = new Date(expiryDateStr + 'T23:59:59');
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

function addDaysToDate(startDateStr, days) {
  const d = new Date(startDateStr);
  d.setDate(d.getDate() + Number(days));
  return d.toISOString().split('T')[0];
}

function getTodayFormatted() {
  return '2026-10-18';
}

function getNowTimestamp() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  return `2026-10-18 ${timeStr}`;
}

// ============================================================================
// CUSTOM SVG QR CODE GENERATOR COMPONENT (Deterministic Pattern from String)
// ============================================================================

function DynamicQrCode({ value = 'ironpulse.gym@okaxis', size = 168 }) {
  // Creates a crisp deterministic 15x15 QR matrix based on the input string
  const gridSize = 15;
  const cells = useMemo(() => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const matrix = [];
    for (let r = 0; r < gridSize; r++) {
      const row = [];
      for (let c = 0; c < gridSize; c++) {
        // Finder patterns in 3 corners
        const isTopLeft = r < 4 && c < 4;
        const isTopRight = r < 4 && c >= gridSize - 4;
        const isBottomLeft = r >= gridSize - 4 && c < 4;

        if (isTopLeft || isTopRight || isBottomLeft) {
          const lr = isBottomLeft ? r - (gridSize - 4) : r;
          const lc = isTopRight ? c - (gridSize - 4) : c;
          const isBorder = lr === 0 || lr === 3 || lc === 0 || lc === 3;
          const isCenter = lr >= 1 && lr <= 2 && lc >= 1 && lc <= 2;
          row.push(isBorder || isCenter);
        } else {
          const seed = (hash ^ (r * 31 + c * 17 + value.charCodeAt((r + c) % value.length))) >>> 0;
          row.push(seed % 2 === 0);
        }
      }
      matrix.push(row);
    }
    return matrix;
  }, [value]);

  return (
    <div
      className="bg-white p-3 rounded-xl inline-flex flex-col items-center shadow-lg border border-zinc-200"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        className="w-full h-full"
        shapeRendering="crispEdges"
      >
        {cells.map((row, rIdx) =>
          row.map((filled, cIdx) =>
            filled ? (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx}
                y={rIdx}
                width={1}
                height={1}
                fill="#090D16"
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // --------------------------------------------------------------------------
  // Core Data State (Seeded immediately, synced with Firestore if available)
  // --------------------------------------------------------------------------
  const [members, setMembers] = useState(INITIAL_MEMBERS);
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [paymentMethods, setPaymentMethods] = useState(INITIAL_PAYMENT_METHODS);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [adminAccount, setAdminAccount] = useState(DEFAULT_ADMIN);

  // Firebase Sync State
  const [fbUser, setFbUser] = useState(null);
  const [dbInstance, setDbInstance] = useState(null);
  const [appIdStr, setAppIdStr] = useState('ironpulse-gym-app');
  const [cloudSynced, setCloudSynced] = useState(false);

  // --------------------------------------------------------------------------
  // Authentication & Navigation State
  // --------------------------------------------------------------------------
  // session: { role: 'MEMBER' | 'ADMIN' | null, userId: string | null }
  const [session, setSession] = useState({ role: null, userId: null });
  const [authPortalMode, setAuthPortalMode] = useState('MEMBER'); // 'MEMBER' | 'ADMIN'
  const [isRegistering, setIsRegistering] = useState(false);

  // Login Form inputs
  const [loginId, setLoginId] = useState('GYM-1001');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Member Registration Form inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regGoal, setRegGoal] = useState('Hypertrophy & Strength');
  const [regCustomId, setRegCustomId] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Active Navigation Tabs
  const [memberTab, setMemberTab] = useState('dashboard'); // 'dashboard' | 'plans' | 'history' | 'idcard'
  const [adminTab, setAdminTab] = useState('overview'); // 'overview' | 'members' | 'plans' | 'payments' | 'transactions'

  // Notification Toast
  const [toast, setToast] = useState(null);

  // Member Checkout Modal State
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState('');
  const [paymentRefInput, setPaymentRefInput] = useState('');
  const [cardHolderInput, setCardHolderInput] = useState('');
  const [cardNumberInput, setCardNumberInput] = useState('4532 •••• •••• 8891');
  const [cardExpiryInput, setCardExpiryInput] = useState('08/29');
  const [cardCvvInput, setCardCvvInput] = useState('842');
  const [copiedText, setCopiedText] = useState('');

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Admin Modals / Forms State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatusFilter, setMemberStatusFilter] = useState('ALL');

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [txnFilter, setTxnFilter] = useState('ALL');

  // --------------------------------------------------------------------------
  // Helper: Show non-blocking toast notification
  // --------------------------------------------------------------------------
  const notify = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // --------------------------------------------------------------------------
  // Optional Firestore Persistence Initialization (Follows Mandatory Rules)
  // --------------------------------------------------------------------------
  useEffect(() => {
    const initCloud = async () => {
      try {
        if (typeof __firebase_config === 'undefined' || !__firebase_config) {
          return;
        }
        const firebaseConfig = JSON.parse(__firebase_config);
        const currentAppId =
          typeof __app_id !== 'undefined' && __app_id ? __app_id : 'ironpulse-gym-app';
        setAppIdStr(currentAppId);

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);
        setDbInstance(db);

        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }

        onAuthStateChanged(auth, (user) => {
          if (user) {
            setFbUser(user);
          }
        });
      } catch (err) {
        // Fallback gracefully to in-memory state if Firebase isn't configured
        console.warn('Running in fast local state mode:', err?.message);
      }
    };
    initCloud();
  }, []);

  useEffect(() => {
    if (!fbUser || !dbInstance) return;

    const stateDocRef = doc(
      dbInstance,
      'artifacts',
      appIdStr,
      'public',
      'data',
      'gymStateStore',
      'masterRecord'
    );

    const unsubscribe = onSnapshot(
      stateDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.membersJson) setMembers(JSON.parse(data.membersJson));
          if (data.plansJson) setPlans(JSON.parse(data.plansJson));
          if (data.paymentMethodsJson) setPaymentMethods(JSON.parse(data.paymentMethodsJson));
          if (data.transactionsJson) setTransactions(JSON.parse(data.transactionsJson));
          setCloudSynced(true);
        } else {
          // Seed initial master document
          setDoc(stateDocRef, {
            membersJson: JSON.stringify(INITIAL_MEMBERS),
            plansJson: JSON.stringify(INITIAL_PLANS),
            paymentMethodsJson: JSON.stringify(INITIAL_PAYMENT_METHODS),
            transactionsJson: JSON.stringify(INITIAL_TRANSACTIONS),
            updatedAt: Date.now()
          }).catch(() => {});
          setCloudSynced(true);
        }
      },
      (err) => {
        console.warn('Snapshot listener warning:', err?.message);
      }
    );

    return () => unsubscribe();
  }, [fbUser, dbInstance, appIdStr]);

  // Persist updates to Firestore + local React state simultaneously
  const persistGymState = async (nextMembers, nextPlans, nextMethods, nextTxns) => {
    const m = nextMembers ?? members;
    const p = nextPlans ?? plans;
    const pm = nextMethods ?? paymentMethods;
    const t = nextTxns ?? transactions;

    if (nextMembers) setMembers(nextMembers);
    if (nextPlans) setPlans(nextPlans);
    if (nextMethods) setPaymentMethods(nextMethods);
    if (nextTxns) setTransactions(nextTxns);

    if (fbUser && dbInstance) {
      try {
        const stateDocRef = doc(
          dbInstance,
          'artifacts',
          appIdStr,
          'public',
          'data',
          'gymStateStore',
          'masterRecord'
        );
        await setDoc(stateDocRef, {
          membersJson: JSON.stringify(m),
          plansJson: JSON.stringify(p),
          paymentMethodsJson: JSON.stringify(pm),
          transactionsJson: JSON.stringify(t),
          updatedAt: Date.now()
        });
      } catch (e) {
        console.warn('Cloud sync error:', e?.message);
      }
    }
  };

  // --------------------------------------------------------------------------
  // Derived Current Member & Metrics
  // --------------------------------------------------------------------------
  const currentMember = useMemo(() => {
    if (session.role !== 'MEMBER') return null;
    return members.find((m) => m.id.toUpperCase() === session.userId?.toUpperCase()) || null;
  }, [session, members]);

  const enabledPaymentMethods = useMemo(
    () => paymentMethods.filter((pm) => pm.enabled),
    [paymentMethods]
  );

  const memberTransactions = useMemo(() => {
    if (!currentMember) return [];
    return transactions.filter(
      (t) => t.memberId.toUpperCase() === currentMember.id.toUpperCase()
    );
  }, [transactions, currentMember]);

  const adminMetrics = useMemo(() => {
    const totalMembers = members.length;
    const activeSubs = members.filter((m) => m.subscription?.status === 'ACTIVE').length;
    const pendingTxns = transactions.filter((t) => t.status === 'PENDING').length;
    const totalRevenue = transactions
      .filter((t) => t.status === 'APPROVED')
      .reduce((acc, item) => acc + Number(item.amount || 0), 0);

    return { totalMembers, activeSubs, pendingTxns, totalRevenue };
  }, [members, transactions]);

  // --------------------------------------------------------------------------
  // Clipboard Helper (Safe for iframe environments)
  // --------------------------------------------------------------------------
  const handleCopyText = (text, label = 'Copied!') => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedText(text);
      notify(`${label}: ${text}`, 'info');
      setTimeout(() => setCopiedText(''), 2500);
    } catch (e) {
      notify('Could not copy automatically', 'error');
    }
  };

  // --------------------------------------------------------------------------
  // Authentication Handlers
  // --------------------------------------------------------------------------
  const handleSwitchPortalMode = (mode) => {
    setAuthPortalMode(mode);
    setIsRegistering(false);
    setAuthError('');
    if (mode === 'MEMBER') {
      setLoginId('GYM-1001');
      setLoginPassword('password123');
    } else {
      setLoginId('ADMIN-01');
      setLoginPassword('admin123');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const trimmedId = loginId.trim().toUpperCase();

    if (authPortalMode === 'MEMBER') {
      const found = members.find((m) => m.id.toUpperCase() === trimmedId);
      if (!found) {
        setAuthError(`No gym member found with ID "${trimmedId}". Try GYM-1001.`);
        return;
      }
      if (found.password !== loginPassword) {
        setAuthError('Invalid member password. Default demo password is password123.');
        return;
      }
      setSession({ role: 'MEMBER', userId: found.id });
      setMemberTab('dashboard');
      notify(`Welcome back to IronPulse, ${found.name}!`, 'success');
    } else {
      if (
        trimmedId === adminAccount.id.toUpperCase() &&
        loginPassword === adminAccount.password
      ) {
        setSession({ role: 'ADMIN', userId: adminAccount.id });
        setAdminTab('overview');
        notify('Logged into Admin Command Center', 'success');
      } else {
        setAuthError('Invalid Admin credentials. Use ID: ADMIN-01 and Password: admin123');
      }
    }
  };

  const handleInstantDemoLogin = (role, targetMemberId = 'GYM-1001') => {
    setAuthError('');
    if (role === 'MEMBER') {
      const target = members.find((m) => m.id === targetMemberId) || members[0];
      setSession({ role: 'MEMBER', userId: target.id });
      setMemberTab('dashboard');
      notify(`Logged in as Demo Member: ${target.name} (${target.id})`, 'success');
    } else {
      setSession({ role: 'ADMIN', userId: adminAccount.id });
      setAdminTab('overview');
      notify('Logged in as Demo Admin (ADMIN-01)', 'success');
    }
  };

  const handleRegisterMember = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!regName.trim() || !regPassword.trim()) {
      setAuthError('Please enter your full name and a password.');
      return;
    }

    const nextNum = 1001 + members.length;
    const generatedId = regCustomId.trim()
      ? regCustomId.trim().toUpperCase()
      : `GYM-${nextNum}`;

    if (members.some((m) => m.id.toUpperCase() === generatedId)) {
      setAuthError(`Member ID ${generatedId} is already registered. Choose another ID.`);
      return;
    }

    const newMember = {
      id: generatedId,
      password: regPassword,
      name: regName.trim(),
      email: regEmail.trim() || `${generatedId.toLowerCase()}@ironpulse.gym`,
      phone: regPhone.trim() || '+91 98000 00000',
      goal: regGoal,
      joinedDate: getTodayFormatted(),
      bloodGroup: 'O+',
      emergencyContact: 'Not Set',
      subscription: {
        planId: null,
        planName: 'No Active Plan',
        status: 'NONE',
        startDate: null,
        expiryDate: null,
        pricePaid: 0
      }
    };

    const updatedMembers = [newMember, ...members];
    persistGymState(updatedMembers, null, null, null);
    setSession({ role: 'MEMBER', userId: newMember.id });
    setMemberTab('plans');
    notify(`Account created! Your Member ID is ${newMember.id}. Select a plan to start!`, 'success');
  };

  const handleLogout = () => {
    setSession({ role: null, userId: null });
    setCheckoutPlan(null);
    notify('You have been securely logged out.', 'info');
  };

  // --------------------------------------------------------------------------
  // Member Portal: Subscription Purchase & Checkout Flow
  // --------------------------------------------------------------------------
  const openCheckoutForPlan = (plan) => {
    setCheckoutPlan(plan);
    const firstEnabled = enabledPaymentMethods[0];
    setSelectedPaymentId(firstEnabled ? firstEnabled.id : '');
    setPaymentRefInput(`UTR-${Math.floor(100000000000 + Math.random() * 900000000000)}`);
    setCardHolderInput(currentMember?.name || 'AARAV SHARMA');
  };

  const handleCompletePurchase = (e) => {
    e.preventDefault();
    if (!checkoutPlan || !currentMember) return;

    const method = paymentMethods.find((pm) => pm.id === selectedPaymentId);
    if (!method) {
      notify('Please select an active payment method.', 'error');
      return;
    }

    const isAutoApproved = Boolean(method.autoApprove);
    const finalRef =
      method.type === 'CARD'
        ? `CARD-AUTH-${Math.floor(100000 + Math.random() * 900000)}`
        : paymentRefInput.trim() || `REF-${Date.now().toString().slice(-8)}`;

    const newTxnId = `TXN-${Math.floor(10000 + Math.random() * 89999)}`;
    const todayStr = getTodayFormatted();
    const expiryStr = addDaysToDate(todayStr, checkoutPlan.durationDays);

    const newTransaction = {
      id: newTxnId,
      memberId: currentMember.id,
      memberName: currentMember.name,
      planId: checkoutPlan.id,
      planName: checkoutPlan.name,
      durationDays: checkoutPlan.durationDays,
      amount: checkoutPlan.price,
      currency: checkoutPlan.currency || '₹',
      paymentMethodId: method.id,
      paymentMethodName: method.name,
      paymentType: method.type,
      referenceId: finalRef,
      date: getNowTimestamp(),
      status: isAutoApproved ? 'APPROVED' : 'PENDING'
    };

    const updatedMembers = members.map((m) => {
      if (m.id !== currentMember.id) return m;
      return {
        ...m,
        subscription: {
          planId: checkoutPlan.id,
          planName: checkoutPlan.name,
          status: isAutoApproved ? 'ACTIVE' : 'PENDING',
          startDate: todayStr,
          expiryDate: expiryStr,
          pricePaid: checkoutPlan.price
        }
      };
    });

    const updatedTxns = [newTransaction, ...transactions];
    persistGymState(updatedMembers, null, null, updatedTxns);

    setCheckoutPlan(null);
    setMemberTab('dashboard');

    if (isAutoApproved) {
      notify(
        `Payment verified! Your ${checkoutPlan.name} membership is now ACTIVE.`,
        'success'
      );
    } else {
      notify(
        `Payment reference submitted (${finalRef}). Pending Admin verification!`,
        'info'
      );
    }
  };

  // --------------------------------------------------------------------------
  // Admin Portal: Member CRUD Handlers
  // --------------------------------------------------------------------------
  const handleSaveMemberFromAdmin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const idInput = (formData.get('memberId') || '').toString().trim().toUpperCase();
    const name = (formData.get('name') || '').toString().trim();
    const password = (formData.get('password') || '').toString().trim();
    const phone = (formData.get('phone') || '').toString().trim();
    const email = (formData.get('email') || '').toString().trim();
    const goal = (formData.get('goal') || '').toString().trim();
    const assignPlanId = (formData.get('planId') || '').toString();
    const subStatus = (formData.get('subStatus') || 'ACTIVE').toString();

    if (!idInput || !name || !password) {
      notify('Member ID, Name, and Password are required.', 'error');
      return;
    }

    const chosenPlan = plans.find((p) => p.id === assignPlanId);
    const startDate = getTodayFormatted();
    const expiryDate = chosenPlan
      ? addDaysToDate(startDate, chosenPlan.durationDays)
      : addDaysToDate(startDate, 30);

    const subscriptionObj =
      subStatus === 'NONE' || !chosenPlan
        ? {
            planId: null,
            planName: 'No Plan Assigned',
            status: 'NONE',
            startDate: null,
            expiryDate: null,
            pricePaid: 0
          }
        : {
            planId: chosenPlan.id,
            planName: chosenPlan.name,
            status: subStatus,
            startDate,
            expiryDate,
            pricePaid: chosenPlan.price
          };

    if (editingMember) {
      const updated = members.map((m) =>
        m.id === editingMember.id
          ? {
              ...m,
              id: idInput,
              name,
              password,
              phone,
              email,
              goal,
              subscription: subscriptionObj
            }
          : m
      );
      persistGymState(updated, null, null, null);
      notify(`Updated member profile for ${name} (${idInput})`, 'success');
    } else {
      if (members.some((m) => m.id.toUpperCase() === idInput)) {
        notify(`Member ID ${idInput} already exists!`, 'error');
        return;
      }
      const newMember = {
        id: idInput,
        name,
        password,
        phone,
        email,
        goal,
        joinedDate: getTodayFormatted(),
        bloodGroup: 'O+',
        emergencyContact: phone,
        subscription: subscriptionObj
      };
      persistGymState([newMember, ...members], null, null, null);
      notify(`Created new member ${name} with Login ID: ${idInput}`, 'success');
    }

    setShowAddMemberModal(false);
    setEditingMember(null);
  };

  const handleDeleteMember = (memberId) => {
    const updated = members.filter((m) => m.id !== memberId);
    persistGymState(updated, null, null, null);
    notify(`Removed member ${memberId}`, 'info');
  };

  // --------------------------------------------------------------------------
  // Admin Portal: Subscription Plans CRUD
  // --------------------------------------------------------------------------
  const handleSavePlanFromAdmin = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = (formData.get('name') || '').toString().trim();
    const price = Number(formData.get('price') || 0);
    const durationDays = Number(formData.get('durationDays') || 30);
    const durationLabel = (formData.get('durationLabel') || `${durationDays} Days`).toString().trim();
    const badge = (formData.get('badge') || 'Standard').toString().trim();
    const description = (formData.get('description') || '').toString().trim();
    const featuresRaw = (formData.get('features') || '').toString();
    const popular = formData.get('popular') === 'on';

    const features = featuresRaw
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (!name || price <= 0) {
      notify('Please provide a valid plan name and price.', 'error');
      return;
    }

    if (editingPlan) {
      const updated = plans.map((p) =>
        p.id === editingPlan.id
          ? {
              ...p,
              name,
              price,
              durationDays,
              durationLabel,
              badge,
              description,
              features: features.length ? features : p.features,
              popular
            }
          : p
      );
      persistGymState(null, updated, null, null);
      notify(`Updated "${name}" subscription plan`, 'success');
    } else {
      const newPlan = {
        id: `plan-${Date.now().toString().slice(-5)}`,
        name,
        price,
        currency: '₹',
        durationDays,
        durationLabel,
        badge,
        popular,
        accent: popular ? 'lime' : 'cyan',
        description,
        features: features.length
          ? features
          : ['Full gym floor access', 'Locker & shower access', 'Digital QR ID pass']
      };
      persistGymState(null, [...plans, newPlan], null, null);
      notify(`Created new subscription plan: "${name}"`, 'success');
    }

    setShowPlanModal(false);
    setEditingPlan(null);
  };

  const handleDeletePlan = (planId) => {
    const updated = plans.filter((p) => p.id !== planId);
    persistGymState(null, updated, null, null);
    notify('Subscription tier deleted.', 'info');
  };

  // --------------------------------------------------------------------------
  // Admin Portal: Payment Methods CRUD & Toggle
  // --------------------------------------------------------------------------
  const handleTogglePaymentMethod = (methodId) => {
    const updated = paymentMethods.map((pm) =>
      pm.id === methodId ? { ...pm, enabled: !pm.enabled } : pm
    );
    persistGymState(null, null, updated, null);
    const target = updated.find((pm) => pm.id === methodId);
    notify(
      `${target.name} is now ${target.enabled ? 'ENABLED in Member Checkout' : 'DISABLED'}`,
      target.enabled ? 'success' : 'info'
    );
  };

  const handleSavePaymentMethod = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const type = (formData.get('type') || 'UPI').toString();
    const name = (formData.get('name') || '').toString().trim();
    const badge = (formData.get('badge') || 'Verified Method').toString().trim();
    const autoApprove = formData.get('autoApprove') === 'on';
    const instructions = (formData.get('instructions') || '').toString().trim();

    let details = { instructions };
    if (type === 'UPI') {
      details.upiId = (formData.get('upiId') || 'gym.merchant@upi').toString().trim();
      details.merchantName = (formData.get('merchantName') || 'IRONPULSE GYM').toString().trim();
    } else if (type === 'BANK') {
      details.bankName = (formData.get('bankName') || 'HDFC Bank').toString().trim();
      details.accountName = (formData.get('accountName') || 'IRONPULSE FITNESS').toString().trim();
      details.accountNumber = (formData.get('accountNumber') || '').toString().trim();
      details.ifscCode = (formData.get('ifscCode') || '').toString().trim();
    } else if (type === 'CARD') {
      details.gatewayName = (formData.get('gatewayName') || 'Razorpay / Stripe').toString().trim();
      details.merchantId = (formData.get('merchantId') || 'MID-LIVE-001').toString().trim();
      details.acceptedCards = (
        formData.get('acceptedCards') || 'Visa, MasterCard, RuPay'
      ).toString().trim();
    } else {
      details.counterCode = (formData.get('counterCode') || 'FRONT-DESK-01').toString().trim();
      details.timings = (formData.get('timings') || '6 AM - 10 PM').toString().trim();
    }

    if (!name) {
      notify('Please provide a display title for the payment method.', 'error');
      return;
    }

    if (editingPayment) {
      const updated = paymentMethods.map((pm) =>
        pm.id === editingPayment.id
          ? {
              ...pm,
              type,
              name,
              badge,
              autoApprove,
              details
            }
          : pm
      );
      persistGymState(null, null, updated, null);
      notify(`Updated payment method "${name}". Live in Member Checkout!`, 'success');
    } else {
      const newPm = {
        id: `pm-${Date.now().toString().slice(-5)}`,
        type,
        name,
        enabled: true,
        autoApprove,
        badge,
        details
      };
      persistGymState(null, null, [...paymentMethods, newPm], null);
      notify(`Added new payment method "${name}". Available in Member Checkout!`, 'success');
    }

    setShowPaymentModal(false);
    setEditingPayment(null);
  };

  const handleDeletePaymentMethod = (methodId) => {
    const updated = paymentMethods.filter((pm) => pm.id !== methodId);
    persistGymState(null, null, updated, null);
    notify('Payment method removed.', 'info');
  };

  // --------------------------------------------------------------------------
  // Admin Portal: Approve / Reject Member Transactions
  // --------------------------------------------------------------------------
  const handleTransactionDecision = (txn, newStatus) => {
    const updatedTxns = transactions.map((t) =>
      t.id === txn.id ? { ...t, status: newStatus } : t
    );

    const todayStr = getTodayFormatted();
    const expiryStr = addDaysToDate(todayStr, txn.durationDays || 30);

    const updatedMembers = members.map((m) => {
      if (m.id.toUpperCase() !== txn.memberId.toUpperCase()) return m;
      if (newStatus === 'APPROVED') {
        return {
          ...m,
          subscription: {
            planId: txn.planId,
            planName: txn.planName,
            status: 'ACTIVE',
            startDate: todayStr,
            expiryDate: expiryStr,
            pricePaid: txn.amount
          }
        };
      } else if (newStatus === 'REJECTED') {
        return {
          ...m,
          subscription: {
            ...m.subscription,
            status: 'EXPIRED'
          }
        };
      }
      return m;
    });

    persistGymState(updatedMembers, null, null, updatedTxns);
    notify(
      newStatus === 'APPROVED'
        ? `Approved ${txn.id}! ${txn.memberName}'s ${txn.planName} is now ACTIVE.`
        : `Marked transaction ${txn.id} as Rejected.`,
      newStatus === 'APPROVED' ? 'success' : 'error'
    );
  };

  // --------------------------------------------------------------------------
  // Downloadable Receipt Generator
  // --------------------------------------------------------------------------
  const handleDownloadReceiptFile = (txn) => {
    const receiptContent = `============================================================
           IRONPULSE FITNESS CLUB — OFFICIAL RECEIPT
============================================================
Receipt / Txn ID   : ${txn.id}
Date & Time        : ${txn.date}
Payment Status     : ${txn.status}
------------------------------------------------------------
MEMBER DETAILS
Member Name        : ${txn.memberName}
Member Login ID    : ${txn.memberId}
------------------------------------------------------------
SUBSCRIPTION PLAN
Plan Selected      : ${txn.planName}
Duration           : ${txn.durationDays} Days
Amount Paid        : ${txn.currency || '₹'}${txn.amount.toLocaleString()}
------------------------------------------------------------
PAYMENT BREAKDOWN
Payment Gateway    : ${txn.paymentMethodName} (${txn.paymentType})
Transaction Ref/UTR: ${txn.referenceId}
============================================================
Thank you for training with IronPulse Fitness Club!
`;
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IronPulse-Receipt-${txn.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify(`Downloaded receipt ${txn.id}.txt`, 'success');
  };

  // ==========================================================================
  // VIEW 1: DUAL-PORTAL AUTHENTICATION SCREEN (When not logged in)
  // ==========================================================================
  if (!session.role) {
    return (
      <div className="min-h-screen bg-[#0B0D10] text-zinc-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-lime-400 selection:text-zinc-950">
        {/* Ambient Athletic Glow Background */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-lime-400/10 blur-[130px]" />
          <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-[140px]" />
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/95 border border-zinc-700 shadow-2xl text-sm animate-bounce">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
            )}
            <span className="text-zinc-100 font-medium">{toast.message}</span>
          </div>
        )}

        {/* Top Brand Header */}
        <header className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 pt-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-lime-400 flex items-center justify-center text-zinc-950 shadow-lg shadow-lime-400/20">
              <Dumbbell className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-black tracking-tight text-xl text-white">
                IRON<span className="text-lime-400">PULSE</span>
              </span>
              <p className="text-[11px] uppercase tracking-widest text-zinc-400 font-semibold">
                Membership & Payment OS
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-900/80 border border-zinc-800 px-3.5 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span>{enabledPaymentMethods.length} Live Payment Gateways Active</span>
          </div>
        </header>

        {/* Main Split Auth Container */}
        <main className="relative z-10 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Brand Value & One-Click Demo Sandbox */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/30 text-lime-300 text-xs font-semibold tracking-wide uppercase">
              <Zap className="w-3.5 h-3.5" /> Dual-Portal Gym Management System
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-[1.1]">
              Train Harder.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-lime-400 to-emerald-400">
                Manage Smarter.
              </span>
            </h1>

            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl">
              Members log in with their unique <span className="text-zinc-200 font-medium">Member ID & Password</span> to track active plans, access their digital QR turnstile pass, and buy subscriptions using live payment methods configured by the Gym Admin.
            </p>

            {/* Quick One-Click Demo Access Card */}
            <div className="bg-[#13161C]/90 border border-zinc-800/90 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-lime-400" />
                  Instant One-Click Demo Login
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">No typing required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('MEMBER', 'GYM-1001')}
                  className="group flex items-center justify-between p-3.5 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 transition text-left"
                >
                  <div>
                    <div className="text-xs font-bold text-lime-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Demo Member (Active)
                    </div>
                    <div className="text-xs text-zinc-300 font-mono mt-1">
                      ID: GYM-1001 • Aarav
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-lime-400 group-hover:translate-x-1 transition" />
                </button>

                <button
                  type="button"
                  onClick={() => handleInstantDemoLogin('ADMIN')}
                  className="group flex items-center justify-between p-3.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 transition text-left"
                >
                  <div>
                    <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Demo Admin Portal
                    </div>
                    <div className="text-xs text-zinc-300 font-mono mt-1">
                      ID: ADMIN-01 • Full Control
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition" />
                </button>
              </div>

              {/* Additional Demo Member Accounts */}
              <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
                <span>Other Demo Members:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleInstantDemoLogin('MEMBER', 'GYM-1002')}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 font-mono text-[11px] transition"
                  >
                    GYM-1002 (Pending Approval)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInstantDemoLogin('MEMBER', 'GYM-1003')}
                    className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-rose-300 font-mono text-[11px] transition"
                  >
                    GYM-1003 (Expired Plan)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login / Signup Card */}
          <div className="lg:col-span-6">
            <div className="bg-[#13161C] border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
              {/* Role Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#0B0D10] rounded-xl border border-zinc-800/90 mb-6">
                <button
                  type="button"
                  onClick={() => handleSwitchPortalMode('MEMBER')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition ${
                    authPortalMode === 'MEMBER'
                      ? 'bg-lime-400 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Member Login
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchPortalMode('ADMIN')}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition ${
                    authPortalMode === 'ADMIN'
                      ? 'bg-cyan-400 text-zinc-950 shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin Panel Login
                </button>
              </div>

              {/* Error Banner */}
              {authError && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Member Sign-Up Form OR Standard ID/Password Login Form */}
              {authPortalMode === 'MEMBER' && isRegistering ? (
                <form onSubmit={handleRegisterMember} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Create Gym Member Account</h2>
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="text-xs text-lime-400 hover:underline"
                    >
                      Back to Member Login
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g., Kabir Singh"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white text-sm focus:outline-none focus:border-lime-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">
                        Custom Member ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={regCustomId}
                        onChange={(e) => setRegCustomId(e.target.value)}
                        placeholder={`Auto: GYM-${1001 + members.length}`}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white text-sm font-mono uppercase focus:outline-none focus:border-lime-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+91 98765 00000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white text-sm focus:outline-none focus:border-lime-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Primary Fitness Goal</label>
                      <select
                        value={regGoal}
                        onChange={(e) => setRegGoal(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white text-sm focus:outline-none focus:border-lime-400"
                      >
                        <option>Hypertrophy & Strength</option>
                        <option>Fat Loss & Conditioning</option>
                        <option>Powerlifting Prep</option>
                        <option>General Wellness & Mobility</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Create Password *</label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Choose a strong password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white text-sm focus:outline-none focus:border-lime-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-sm transition shadow-lg shadow-lime-400/20 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Member ID & Enter Portal
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        {authPortalMode === 'MEMBER' ? 'Gym Member ID' : 'Admin Access ID'}
                      </label>
                      <span className="text-[11px] font-mono text-zinc-400">
                        Demo: {authPortalMode === 'MEMBER' ? 'GYM-1001' : 'ADMIN-01'}
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        placeholder={authPortalMode === 'MEMBER' ? 'e.g. GYM-1001' : 'ADMIN-01'}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white font-mono text-sm uppercase focus:outline-none focus:border-lime-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                        Password
                      </label>
                      <span className="text-[11px] font-mono text-zinc-400">
                        Demo: {authPortalMode === 'MEMBER' ? 'password123' : 'admin123'}
                      </span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white text-sm focus:outline-none focus:border-lime-400 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg ${
                      authPortalMode === 'MEMBER'
                        ? 'bg-lime-400 hover:bg-lime-300 text-zinc-950 shadow-lime-400/20'
                        : 'bg-cyan-400 hover:bg-cyan-300 text-zinc-950 shadow-cyan-400/20'
                    }`}
                  >
                    <span>
                      {authPortalMode === 'MEMBER'
                        ? 'Sign In to Member Portal'
                        : 'Unlock Admin Command Center'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {authPortalMode === 'MEMBER' && (
                    <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                      <span className="text-zinc-400">New to IronPulse Fitness?</span>
                      <button
                        type="button"
                        onClick={() => setIsRegistering(true)}
                        className="text-lime-400 hover:text-lime-300 font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Create Member ID
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 max-w-7xl w-full mx-auto px-4 sm:px-8 py-5 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-2">
          <span>IRONPULSE FITNESS CLUB • Member & Admin Subscription Portal</span>
          <span className="font-mono">
            Default Member: GYM-1001 / password123 • Default Admin: ADMIN-01 / admin123
          </span>
        </footer>
      </div>
    );
  }

  // ==========================================================================
  // VIEW 2: MEMBER PORTAL
  // ==========================================================================
  if (session.role === 'MEMBER' && currentMember) {
    const sub = currentMember.subscription || { status: 'NONE' };
    const daysLeft = sub.status === 'ACTIVE' ? calculateDaysRemaining(sub.expiryDate) : 0;
    const activePlanDetails = plans.find((p) => p.id === sub.planId);
    const totalPlanDays = activePlanDetails?.durationDays || 90;
    const progressPct =
      sub.status === 'ACTIVE'
        ? Math.min(100, Math.max(8, Math.round((daysLeft / totalPlanDays) * 100)))
        : 0;

    return (
      <div className="min-h-screen bg-[#0B0D10] text-zinc-100 flex flex-col font-sans">
        {/* Global Notification Toast */}
        {toast && (
          <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/95 border border-zinc-700 shadow-2xl text-sm">
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
            )}
            <span className="text-zinc-100 font-medium">{toast.message}</span>
          </div>
        )}

        {/* Top Member Navigation Bar */}
        <header className="sticky top-0 z-30 bg-[#0B0D10]/90 backdrop-blur-md border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-lime-400 flex items-center justify-center text-zinc-950 font-black">
                <Dumbbell className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black tracking-tight text-white text-base">
                    IRON<span className="text-lime-400">PULSE</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-lime-400/15 text-lime-300 border border-lime-400/30">
                    Member Portal
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono hidden sm:block">
                  Logged in as {currentMember.name} ({currentMember.id})
                </p>
              </div>
            </div>

            {/* Center Navigation Pills */}
            <nav className="flex items-center gap-1 bg-[#13161C] p-1 rounded-xl border border-zinc-800 overflow-x-auto">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: Award },
                { id: 'plans', label: 'Buy Subscription', icon: Sparkles },
                { id: 'history', label: 'Payment History', icon: Receipt },
                { id: 'idcard', label: 'Digital ID Pass', icon: QrCode }
              ].map((item) => {
                const Icon = item.icon;
                const active = memberTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMemberTab(item.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                      active
                        ? 'bg-lime-400 text-zinc-950 shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Quick Role Switcher & Logout */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('ADMIN')}
                title="Switch to Admin Panel to test payment settings or approve purchases"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Switch to Admin</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Member Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
          {/* TAB 1: MEMBER DASHBOARD */}
          {memberTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Top Hero Split: Subscription Status + Digital Gym ID Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left 7 Cols: Active Subscription Status Card */}
                <div className="lg:col-span-7 bg-[#13161C] border border-zinc-800 rounded-2xl p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        Current Membership Status
                      </span>

                      {sub.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          ACTIVE SUBSCRIPTION
                        </span>
                      )}
                      {sub.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          <Clock className="w-3.5 h-3.5" />
                          PENDING ADMIN VERIFICATION
                        </span>
                      )}
                      {(sub.status === 'EXPIRED' || sub.status === 'NONE') && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5" />
                          {sub.status === 'EXPIRED' ? 'SUBSCRIPTION EXPIRED' : 'NO ACTIVE PLAN'}
                        </span>
                      )}
                    </div>

                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-white">
                        {sub.planName || 'No Active Subscription'}
                      </h2>
                      <p className="text-sm text-zinc-400 mt-1">
                        {sub.status === 'ACTIVE'
                          ? `Full turnstile access enabled. Enjoy your training, ${currentMember.name}!`
                          : sub.status === 'PENDING'
                          ? 'Your recent subscription payment reference has been submitted and is awaiting Admin approval.'
                          : 'Purchase or renew a gym subscription tier below to unlock gym floor access.'}
                      </p>
                    </div>

                    {/* Key Dates & Countdown Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      <div className="bg-[#0B0D10] border border-zinc-800/80 rounded-xl p-3.5">
                        <span className="text-[11px] uppercase text-zinc-400 block">
                          Start Date
                        </span>
                        <span className="text-sm font-mono font-bold text-white mt-1 block">
                          {sub.startDate || '—'}
                        </span>
                      </div>
                      <div className="bg-[#0B0D10] border border-zinc-800/80 rounded-xl p-3.5">
                        <span className="text-[11px] uppercase text-zinc-400 block">
                          Expiry Date
                        </span>
                        <span className="text-sm font-mono font-bold text-white mt-1 block">
                          {sub.expiryDate || '—'}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 bg-[#0B0D10] border border-zinc-800/80 rounded-xl p-3.5">
                        <span className="text-[11px] uppercase text-zinc-400 block">
                          Days Remaining
                        </span>
                        <span
                          className={`text-lg font-mono font-black mt-0.5 block ${
                            daysLeft > 10
                              ? 'text-lime-400'
                              : daysLeft > 0
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {sub.status === 'ACTIVE' ? `${daysLeft} Days` : '0 Days'}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {sub.status === 'ACTIVE' && (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>Subscription Cycle Remaining</span>
                          <span className="font-mono text-lime-400">{progressPct}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                          <div
                            className="h-full bg-gradient-to-r from-lime-400 to-emerald-400 rounded-full transition-all duration-500"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-6 mt-6 border-t border-zinc-800/80 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMemberTab('plans')}
                      className="px-5 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs sm:text-sm transition flex items-center gap-2 shadow-lg shadow-lime-400/15"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {sub.status === 'ACTIVE' ? 'Upgrade / Extend Plan' : 'Buy Subscription Plan'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberTab('history')}
                      className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs sm:text-sm transition flex items-center gap-2"
                    >
                      <Receipt className="w-4 h-4 text-lime-400" />
                      <span>Payment Receipts ({memberTransactions.length})</span>
                    </button>
                  </div>
                </div>

                {/* Right 5 Cols: Tactile Digital Membership ID Card Preview */}
                <div className="lg:col-span-5 bg-gradient-to-br from-[#191E28] via-[#12151C] to-[#0D1015] border border-zinc-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-12 -top-12 w-40 h-40 rounded-full bg-lime-400/10 blur-2xl pointer-events-none" />

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Dumbbell className="w-4 h-4 text-lime-400" />
                        <span className="text-xs font-black tracking-widest uppercase text-white">
                          IRONPULSE DIGITAL PASS
                        </span>
                      </div>
                      <span className="text-[11px] text-zinc-400 block mt-0.5">
                         Biometric & QR Turnstile Credential
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-zinc-900/90 border border-zinc-700 font-mono text-xs font-bold text-lime-400">
                      {currentMember.id}
                    </span>
                  </div>

                  <div className="my-5 flex items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                          Member Name
                        </span>
                        <span className="text-lg font-bold text-white block">
                          {currentMember.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                          Training Focus
                        </span>
                        <span className="text-xs font-medium text-zinc-300 block">
                          {currentMember.goal}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-zinc-400 block">
                          Pass Tier & Validity
                        </span>
                        <span className="text-xs font-mono text-lime-300 block">
                          {sub.planName} • Valid till {sub.expiryDate || 'N/A'}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <DynamicQrCode
                        value={`IRONPULSE:${currentMember.id}:${sub.status}:${sub.expiryDate}`}
                        size={104}
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/90 flex items-center justify-between text-[11px] text-zinc-400">
                    <span className="font-mono">Joined: {currentMember.joinedDate}</span>
                    <button
                      type="button"
                      onClick={() => setMemberTab('idcard')}
                      className="text-lime-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <span>Expand Full ID Card</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Preview of Available Plans & Live Payment Methods */}
              <div className="bg-[#13161C] border border-zinc-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-lime-400" />
                      Accepted Live Payment Methods (Configured by Admin)
                    </h3>
                    <p className="text-xs text-zinc-400">
                      These payment options are dynamically synced from the Admin Payment System Settings.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMemberTab('plans')}
                    className="text-xs font-bold text-lime-400 hover:text-lime-300 flex items-center gap-1"
                  >
                    <span>Browse All {plans.length} Membership Plans</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {enabledPaymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className="p-4 rounded-xl bg-[#0B0D10] border border-zinc-800/90 flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-lime-400/10 text-lime-300 border border-lime-400/20">
                          {pm.type}
                        </span>
                        <span className="text-[11px] text-zinc-400">{pm.badge}</span>
                      </div>
                      <div className="font-bold text-sm text-white mt-1">{pm.name}</div>
                      <div className="text-xs text-zinc-400 font-mono truncate">
                        {pm.type === 'UPI' && `UPI: ${pm.details.upiId}`}
                        {pm.type === 'CARD' && pm.details.acceptedCards}
                        {pm.type === 'BANK' && `${pm.details.bankName} • ${pm.details.ifscCode}`}
                        {pm.type === 'WALLET' && `Code: ${pm.details.counterCode}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BUY SUBSCRIPTIONS CATALOG */}
          {memberTab === 'plans' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
                    Membership Tiers
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                    Choose Your Training Subscription
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 max-w-md">
                  Select any membership tier below to launch the dynamic checkout with QR/UPI, Card, Bank Transfer, or Front Desk payment options.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                {plans.map((plan) => {
                  const isCurrentPlan =
                    currentMember.subscription?.planId === plan.id &&
                    currentMember.subscription?.status === 'ACTIVE';

                  return (
                    <div
                      key={plan.id}
                      className={`rounded-2xl p-6 flex flex-col justify-between transition relative ${
                        plan.popular
                          ? 'bg-gradient-to-b from-[#1A2118] to-[#13161C] border-2 border-lime-400 shadow-xl shadow-lime-400/10'
                          : 'bg-[#13161C] border border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-full ${
                              plan.popular
                                ? 'bg-lime-400 text-zinc-950'
                                : 'bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            {plan.badge}
                          </span>
                          <span className="text-xs font-mono text-zinc-400">
                            {plan.durationLabel}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-black text-white">{plan.name}</h3>
                          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                            {plan.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-zinc-800/80 flex items-baseline gap-1">
                          <span className="text-3xl font-black font-mono text-white">
                            {plan.currency || '₹'}
                            {Number(plan.price).toLocaleString()}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono">
                            / {plan.durationDays} days
                          </span>
                        </div>

                        <ul className="space-y-2.5 pt-2">
                          {plan.features.map((feat, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-zinc-300">
                              <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-6 mt-6 border-t border-zinc-800/80">
                        <button
                          type="button"
                          onClick={() => openCheckoutForPlan(plan)}
                          className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 ${
                            plan.popular
                              ? 'bg-lime-400 hover:bg-lime-300 text-zinc-950 shadow-lg shadow-lime-400/20'
                              : 'bg-zinc-800 hover:bg-lime-400 hover:text-zinc-950 text-white'
                          }`}
                        >
                          <span>
                            {isCurrentPlan ? 'Renew / Extend This Plan' : 'Buy Subscription'}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MEMBER PAYMENT HISTORY & RECEIPTS */}
          {memberTab === 'history' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white">
                    Your Subscription & Payment History
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Track verification statuses and download official tax receipts for your gym purchases.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMemberTab('plans')}
                  className="self-start px-4 py-2 rounded-xl bg-lime-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Buy New Plan
                </button>
              </div>

              <div className="bg-[#13161C] border border-zinc-800 rounded-2xl overflow-hidden">
                {memberTransactions.length === 0 ? (
                  <div className="p-12 text-center space-y-3">
                    <Receipt className="w-10 h-10 text-zinc-600 mx-auto" />
                    <div className="text-base font-bold text-white">No Transactions Yet</div>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      You have not purchased any subscription plans yet. Head over to Buy Subscription to get started.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-[#0B0D10]/60">
                          <th className="py-3.5 px-4">Txn ID & Date</th>
                          <th className="py-3.5 px-4">Subscription Plan</th>
                          <th className="py-3.5 px-4">Payment Method</th>
                          <th className="py-3.5 px-4">Reference / UTR</th>
                          <th className="py-3.5 px-4">Amount</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/70 text-xs sm:text-sm">
                        {memberTransactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-zinc-900/40 transition">
                            <td className="py-4 px-4">
                              <div className="font-mono font-bold text-white">{txn.id}</div>
                              <div className="text-xs text-zinc-400">{txn.date}</div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-bold text-white">{txn.planName}</div>
                              <div className="text-xs text-zinc-400">{txn.durationDays} Days</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px] mr-1.5">
                                {txn.paymentType}
                              </span>
                              <span className="text-zinc-300 text-xs">{txn.paymentMethodName}</span>
                            </td>
                            <td className="py-4 px-4 font-mono text-xs text-zinc-300">
                              {txn.referenceId}
                            </td>
                            <td className="py-4 px-4 font-mono font-bold text-white">
                              {txn.currency || '₹'}
                              {Number(txn.amount).toLocaleString()}
                            </td>
                            <td className="py-4 px-4">
                              {txn.status === 'APPROVED' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                  <CheckCircle2 className="w-3 h-3" /> Approved
                                </span>
                              )}
                              {txn.status === 'PENDING' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                  <Clock className="w-3 h-3" /> Pending Approval
                                </span>
                              )}
                              {txn.status === 'REJECTED' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                                  <XCircle className="w-3 h-3" /> Rejected
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveReceipt(txn)}
                                  className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition flex items-center gap-1"
                                >
                                  <FileText className="w-3.5 h-3.5 text-lime-400" />
                                  <span>View</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadReceiptFile(txn)}
                                  className="p-1.5 rounded-lg bg-zinc-800 hover:bg-lime-400 hover:text-zinc-950 text-zinc-300 transition"
                                  title="Download Receipt"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: FULL DIGITAL MEMBERSHIP ID CARD */}
          {memberTab === 'idcard' && (
            <div className="max-w-xl mx-auto space-y-6">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-lime-400">
                  Smart Turnstile Access Pass
                </span>
                <h2 className="text-2xl font-black text-white">
                  Your Digital Gym Membership Card
                </h2>
                <p className="text-xs text-zinc-400">
                  Scan this QR pass at the gym entrance turnstile or show to reception.
                </p>
              </div>

              <div className="bg-gradient-to-b from-[#1B222D] to-[#0E1117] border-2 border-zinc-700 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center text-zinc-950">
                      <Dumbbell className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <div className="font-black text-white tracking-tight">IRONPULSE CLUB</div>
                      <div className="text-[11px] text-zinc-400 uppercase tracking-widest">
                        Official Athlete Credential
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-zinc-400 block">Member ID</span>
                    <span className="font-mono font-black text-lg text-lime-400">
                      {currentMember.id}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <DynamicQrCode
                    value={`IRONPULSE-VERIFY:${currentMember.id}:${sub.planName}:${sub.status}`}
                    size={164}
                  />
                  <div className="space-y-3 text-center sm:text-left flex-1">
                    <div>
                      <span className="text-[11px] uppercase text-zinc-400 block">Athlete Name</span>
                      <span className="text-xl font-black text-white">{currentMember.name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] uppercase text-zinc-400 block">Plan Tier</span>
                        <span className="text-xs font-bold text-lime-300">{sub.planName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-zinc-400 block">Status</span>
                        <span className="text-xs font-bold text-white">{sub.status}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-zinc-400 block">Valid Until</span>
                        <span className="text-xs font-mono text-zinc-200">
                          {sub.expiryDate || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-zinc-400 block">Blood Group</span>
                        <span className="text-xs font-mono text-zinc-200">
                          {currentMember.bloodGroup || 'O+'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
                  <span>Phone: {currentMember.phone}</span>
                  <span className="font-mono text-lime-400">VERIFIED PASS</span>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ==================================================================== */}
        {/* DYNAMIC MEMBER CHECKOUT MODAL (Reflects Admin's Live Payment Config) */}
        {/* ==================================================================== */}
        {checkoutPlan && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#13161C] border border-zinc-700 rounded-2xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl space-y-6 my-8">
              <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-lime-400">
                    Dynamic Subscription Checkout
                  </span>
                  <h3 className="text-xl font-black text-white mt-0.5">
                    Complete Purchase: {checkoutPlan.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCheckoutPlan(null)}
                  className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-zinc-800"
                >
                  Close ✕
                </button>
              </div>

              {/* Plan Summary Bar */}
              <div className="p-4 rounded-xl bg-[#0B0D10] border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-zinc-400">Selected Membership Tier</div>
                  <div className="text-base font-bold text-white">
                    {checkoutPlan.name} ({checkoutPlan.durationDays} Days Access)
                  </div>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">
                    Member: {currentMember.name} ({currentMember.id})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-zinc-400">Total Payable</div>
                  <div className="text-2xl font-black font-mono text-lime-400">
                    {checkoutPlan.currency || '₹'}
                    {Number(checkoutPlan.price).toLocaleString()}
                  </div>
                </div>
              </div>

              {enabledPaymentMethods.length === 0 ? (
                <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
                  <div className="text-sm font-bold text-white">
                    No Active Payment Methods Enabled by Admin
                  </div>
                  <p className="text-xs text-zinc-400">
                    Switch to the Admin Panel → Payment System Settings to enable or add a payment method.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleCompletePurchase} className="space-y-5">
                  {/* Step 1: Select Live Admin-Configured Payment Method */}
                  <div className="space-y-2.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300">
                      1. Select Payment Method (Configured by Gym Admin)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {enabledPaymentMethods.map((method) => {
                        const isSelected = selectedPaymentId === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setSelectedPaymentId(method.id)}
                            className={`p-3.5 rounded-xl border text-left transition flex items-start justify-between gap-2 ${
                              isSelected
                                ? 'bg-lime-400/15 border-lime-400 text-white shadow-md'
                                : 'bg-[#0B0D10] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5">
                                {method.type === 'UPI' && (
                                  <QrCode className="w-4 h-4 text-lime-400" />
                                )}
                                {method.type === 'CARD' && (
                                  <CreditCard className="w-4 h-4 text-cyan-400" />
                                )}
                                {method.type === 'BANK' && (
                                  <Building2 className="w-4 h-4 text-amber-400" />
                                )}
                                {method.type === 'WALLET' && (
                                  <Wallet className="w-4 h-4 text-emerald-400" />
                                )}
                                <span className="font-bold text-xs sm:text-sm">{method.name}</span>
                              </div>
                              <span className="text-[11px] text-zinc-400 block mt-1">
                                {method.badge}
                              </span>
                            </div>
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center mt-0.5 ${
                                isSelected ? 'border-lime-400 bg-lime-400 text-zinc-950' : 'border-zinc-600'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Dynamic Payment Method Specific Details */}
                  {(() => {
                    const activeMethod = enabledPaymentMethods.find(
                      (m) => m.id === selectedPaymentId
                    );
                    if (!activeMethod) return null;

                    return (
                      <div className="p-4 sm:p-5 rounded-xl bg-[#0B0D10] border border-zinc-800 space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                          <div>
                            <span className="text-xs font-bold text-white">
                              {activeMethod.name}
                            </span>
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              {activeMethod.details?.instructions}
                            </p>
                          </div>
                          <span
                            className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full shrink-0 ${
                              activeMethod.autoApprove
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {activeMethod.autoApprove ? 'Instant Activation' : 'Admin Verifies Ref'}
                          </span>
                        </div>

                        {/* UPI DETAILS + QR */}
                        {activeMethod.type === 'UPI' && (
                          <div className="flex flex-col sm:flex-row items-center gap-5">
                            <DynamicQrCode
                              value={`upi://pay?pa=${activeMethod.details.upiId}&pn=${activeMethod.details.merchantName}&am=${checkoutPlan.price}`}
                              size={132}
                            />
                            <div className="space-y-3 flex-1 w-full">
                              <div>
                                <span className="text-[11px] uppercase text-zinc-400 block">
                                  Merchant Name
                                </span>
                                <span className="text-sm font-bold text-white">
                                  {activeMethod.details.merchantName}
                                </span>
                              </div>
                              <div>
                                <span className="text-[11px] uppercase text-zinc-400 block">
                                  Official Gym UPI ID
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <code className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-lime-300 font-mono text-xs flex-1">
                                    {activeMethod.details.upiId}
                                  </code>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCopyText(activeMethod.details.upiId, 'Copied UPI ID')
                                    }
                                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-white flex items-center gap-1"
                                  >
                                    <Copy className="w-3.5 h-3.5" /> Copy
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CARD GATEWAY FORM */}
                        {activeMethod.type === 'CARD' && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs text-zinc-400">
                              <span>Gateway: {activeMethod.details.gatewayName}</span>
                              <span className="font-mono">{activeMethod.details.acceptedCards}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-zinc-400 mb-1">
                                  Cardholder Name
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={cardHolderInput}
                                  onChange={(e) => setCardHolderInput(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-zinc-400 mb-1">
                                  Card Number
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={cardNumberInput}
                                  onChange={(e) => setCardNumberInput(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-zinc-400 mb-1">
                                  Expiry (MM/YY)
                                </label>
                                <input
                                  type="text"
                                  required
                                  value={cardExpiryInput}
                                  onChange={(e) => setCardExpiryInput(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] text-zinc-400 mb-1">
                                  CVV Security Code
                                </label>
                                <input
                                  type="password"
                                  required
                                  maxLength={4}
                                  value={cardCvvInput}
                                  onChange={(e) => setCardCvvInput(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs font-mono"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* BANK TRANSFER DETAILS */}
                        {activeMethod.type === 'BANK' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                              <span className="text-zinc-400 block text-[10px] uppercase">
                                Bank Name
                              </span>
                              <span className="font-bold text-white">
                                {activeMethod.details.bankName}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800">
                              <span className="text-zinc-400 block text-[10px] uppercase">
                                Beneficiary Name
                              </span>
                              <span className="font-bold text-white">
                                {activeMethod.details.accountName}
                              </span>
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                              <div>
                                <span className="text-zinc-400 block text-[10px] uppercase">
                                  Account Number
                                </span>
                                <span className="font-mono font-bold text-lime-300">
                                  {activeMethod.details.accountNumber}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyText(
                                    activeMethod.details.accountNumber,
                                    'Copied Account Number'
                                  )
                                }
                                className="text-zinc-400 hover:text-white"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                              <div>
                                <span className="text-zinc-400 block text-[10px] uppercase">
                                  IFSC Code
                                </span>
                                <span className="font-mono font-bold text-lime-300">
                                  {activeMethod.details.ifscCode}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyText(activeMethod.details.ifscCode, 'Copied IFSC Code')
                                }
                                className="text-zinc-400 hover:text-white"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}

                        {/* CASH / WALLET DETAILS */}
                        {activeMethod.type === 'WALLET' && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs">
                            <div>
                              <span className="text-zinc-400 block">Counter Reference Code</span>
                              <span className="font-mono font-bold text-lime-300">
                                {activeMethod.details.counterCode}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-zinc-400 block">Reception Desk Hours</span>
                              <span className="font-semibold text-white">
                                {activeMethod.details.timings}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Transaction Reference / UTR Input (For non-Card methods) */}
                        {activeMethod.type !== 'CARD' && (
                          <div className="pt-2">
                            <label className="block text-xs font-bold text-zinc-300 mb-1">
                              Enter Transaction Reference / 12-Digit UTR Number *
                            </label>
                            <input
                              type="text"
                              required
                              value={paymentRefInput}
                              onChange={(e) => setPaymentRefInput(e.target.value)}
                              placeholder="e.g., UTR-491827364512"
                              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-sm focus:outline-none focus:border-lime-400"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCheckoutPlan(null)}
                      className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-black text-xs sm:text-sm transition shadow-lg shadow-lime-400/20 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Confirm & Pay {checkoutPlan.currency || '₹'}
                        {Number(checkoutPlan.price).toLocaleString()}
                      </span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* RECEIPT VIEWER MODAL */}
        {activeReceipt && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#13161C] border border-zinc-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-lime-400" />
                  <span className="font-black text-white text-sm">OFFICIAL PAYMENT RECEIPT</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveReceipt(null)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs bg-[#0B0D10] p-4 rounded-xl border border-zinc-800 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Receipt ID:</span>
                  <span className="text-white font-bold">{activeReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Date & Time:</span>
                  <span className="text-zinc-200">{activeReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Member:</span>
                  <span className="text-white">
                    {activeReceipt.memberName} ({activeReceipt.memberId})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Subscription Plan:</span>
                  <span className="text-lime-300 font-bold">{activeReceipt.planName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Payment Method:</span>
                  <span className="text-zinc-200">{activeReceipt.paymentMethodName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Reference / UTR:</span>
                  <span className="text-zinc-200">{activeReceipt.referenceId}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm">
                  <span className="text-zinc-300 font-bold">Total Amount:</span>
                  <span className="text-lime-400 font-black">
                    {activeReceipt.currency || '₹'}
                    {Number(activeReceipt.amount).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadReceiptFile(activeReceipt)}
                  className="px-4 py-2 rounded-xl bg-lime-400 hover:bg-lime-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download .TXT Receipt
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================================================
  // VIEW 3: ADMIN COMMAND CENTER PORTAL
  // ==========================================================================
  const filteredMembers = members.filter((m) => {
    const matchesQuery =
      m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.id.toLowerCase().includes(memberSearch.toLowerCase()) ||
      m.phone.toLowerCase().includes(memberSearch.toLowerCase());
    const matchesStatus =
      memberStatusFilter === 'ALL' || m.subscription?.status === memberStatusFilter;
    return matchesQuery && matchesStatus;
  });

  const filteredTransactions = transactions.filter(
    (t) => txnFilter === 'ALL' || t.status === txnFilter
  );

  return (
    <div className="min-h-screen bg-[#0B0D10] text-zinc-100 flex flex-col font-sans">
      {/* Global Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-zinc-900/95 border border-zinc-700 shadow-2xl text-sm">
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          )}
          <span className="text-zinc-100 font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-[#0B0D10]/95 backdrop-blur-md border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-400 flex items-center justify-center text-zinc-950 font-black">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-tight text-white text-base">
                  IRON<span className="text-cyan-400">PULSE</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
                  Admin Panel
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono hidden sm:block">
                {adminAccount.name} ({adminAccount.id})
              </p>
            </div>
          </div>

          {/* Admin Section Tabs */}
          <nav className="flex items-center gap-1 bg-[#13161C] p-1 rounded-xl border border-zinc-800 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'members', label: `Members (${members.length})`, icon: Users },
              { id: 'plans', label: `Plans (${plans.length})`, icon: Dumbbell },
              {
                id: 'payments',
                label: 'Payment System Settings',
                icon: CreditCard
              },
              {
                id: 'transactions',
                label: `Approvals (${adminMetrics.pendingTxns})`,
                icon: CheckCircle2
              }
            ].map((tab) => {
              const Icon = tab.icon;
              const active = adminTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setAdminTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                    active
                      ? 'bg-cyan-400 text-zinc-950 shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Jump to Member Portal & Logout */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleInstantDemoLogin('MEMBER', 'GYM-1001')}
              title="Test changes live in Member Portal"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-lime-400/10 hover:bg-lime-400/20 border border-lime-400/30 text-lime-300 text-xs font-semibold transition"
            >
              <User className="w-3.5 h-3.5" />
              <span>Test as Member</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* ================================================================ */}
        {/* ADMIN TAB 1: OVERVIEW & QUICK APPROVALS                          */}
        {/* ================================================================ */}
        {adminTab === 'overview' && (
          <div className="space-y-8">
            {/* 4 KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#13161C] border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Total Gym Members
                  </span>
                  <div className="text-3xl font-black font-mono text-white mt-1">
                    {adminMetrics.totalMembers}
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    With custom ID & password
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#13161C] border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Active Subscriptions
                  </span>
                  <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
                    {adminMetrics.activeSubs}
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Verified turnstile access
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <BadgeCheck className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#13161C] border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Total Approved Revenue
                  </span>
                  <div className="text-3xl font-black font-mono text-lime-400 mt-1">
                    ₹{adminMetrics.totalRevenue.toLocaleString()}
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-1 block">
                    Across {transactions.filter((t) => t.status === 'APPROVED').length} payments
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center text-lime-400">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#13161C] border border-zinc-800 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Pending Approvals
                  </span>
                  <div className="text-3xl font-black font-mono text-amber-400 mt-1">
                    {adminMetrics.pendingTxns}
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdminTab('transactions')}
                    className="text-[11px] text-amber-300 hover:underline mt-1 block font-semibold"
                  >
                    Review queue →
                  </button>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Split Grid: Pending Approvals Queue & Live Payment Gateways */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Pending Payment Approvals Queue */}
              <div className="lg:col-span-7 bg-[#13161C] border border-zinc-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      Pending Subscription Approvals ({adminMetrics.pendingTxns})
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Verify member UTR / transaction references to activate their gym membership.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdminTab('transactions')}
                    className="text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    View All Transactions
                  </button>
                </div>

                {transactions.filter((t) => t.status === 'PENDING').length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#0B0D10] border border-zinc-800/80 text-center text-xs text-zinc-400">
                    All member subscription payments have been verified!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions
                      .filter((t) => t.status === 'PENDING')
                      .map((txn) => (
                        <div
                          key={txn.id}
                          className="p-4 rounded-xl bg-[#0B0D10] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">
                                {txn.memberName}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-zinc-800 font-mono text-xs text-cyan-300">
                                {txn.memberId}
                              </span>
                            </div>
                            <div className="text-xs text-zinc-300">
                              Plan: <strong className="text-lime-300">{txn.planName}</strong> •{' '}
                              <span className="font-mono font-bold text-white">
                                ₹{Number(txn.amount).toLocaleString()}
                              </span>{' '}
                              via {txn.paymentMethodName}
                            </div>
                            <div className="text-xs font-mono text-amber-300">
                              Submitted Ref: {txn.referenceId} • {txn.date}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleTransactionDecision(txn, 'APPROVED')}
                              className="px-3.5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-md"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve & Activate</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleTransactionDecision(txn, 'REJECTED')}
                              className="px-3 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 font-bold text-xs"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Right Column: Configured Payment Gateways Quick Status */}
              <div className="lg:col-span-5 bg-[#13161C] border border-zinc-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-cyan-400" />
                      Payment Gateways Status
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Toggle or configure payment methods for member checkout.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAdminTab('payments')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-400/15 text-cyan-300 border border-cyan-400/30 text-xs font-bold"
                  >
                    Configure
                  </button>
                </div>

                <div className="space-y-2.5">
                  {paymentMethods.map((pm) => (
                    <div
                      key={pm.id}
                      className="p-3.5 rounded-xl bg-[#0B0D10] border border-zinc-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-cyan-300">
                            {pm.type}
                          </span>
                          <span className="text-xs font-bold text-white">{pm.name}</span>
                        </div>
                        <div className="text-[11px] text-zinc-400 font-mono mt-1">
                          {pm.type === 'UPI' && pm.details.upiId}
                          {pm.type === 'CARD' && pm.details.gatewayName}
                          {pm.type === 'BANK' && `${pm.details.bankName} (${pm.details.ifscCode})`}
                          {pm.type === 'WALLET' && pm.details.counterCode}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTogglePaymentMethod(pm.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                          pm.enabled
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {pm.enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* ADMIN TAB 2: MEMBER MANAGEMENT (Create/Edit Member IDs & Plans)  */}
        {/* ================================================================ */}
        {adminTab === 'members' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Gym Member Management</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Create member accounts with custom Login IDs and Passwords, or manage their subscription status.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingMember(null);
                  setShowAddMemberModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-cyan-400/15 self-start"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Create New Member ID</span>
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#13161C] p-4 rounded-2xl border border-zinc-800">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search by Member ID (e.g. GYM-1001), Name, or Phone..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0D10] border border-zinc-800 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['ALL', 'ACTIVE', 'PENDING', 'EXPIRED', 'NONE'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setMemberStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      memberStatusFilter === st
                        ? 'bg-cyan-400 text-zinc-950'
                        : 'bg-[#0B0D10] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-[#13161C] border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-[#0B0D10]/60">
                      <th className="py-3.5 px-4">Member ID & Password</th>
                      <th className="py-3.5 px-4">Athlete Profile</th>
                      <th className="py-3.5 px-4">Assigned Plan</th>
                      <th className="py-3.5 px-4">Validity</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70 text-xs sm:text-sm">
                    {filteredMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-zinc-900/40 transition">
                        <td className="py-4 px-4">
                          <div className="font-mono font-bold text-cyan-300">{m.id}</div>
                          <div className="text-[11px] font-mono text-zinc-400">
                            Pass: {m.password}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-white">{m.name}</div>
                          <div className="text-xs text-zinc-400">
                            {m.phone} • {m.goal}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-semibold text-zinc-200">
                            {m.subscription?.planName || 'None'}
                          </div>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-zinc-300">
                          {m.subscription?.expiryDate ? `Exp: ${m.subscription.expiryDate}` : '—'}
                        </td>
                        <td className="py-4 px-4">
                          {m.subscription?.status === 'ACTIVE' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              ACTIVE
                            </span>
                          )}
                          {m.subscription?.status === 'PENDING' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              PENDING
                            </span>
                          )}
                          {(m.subscription?.status === 'EXPIRED' ||
                            m.subscription?.status === 'NONE') && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              {m.subscription?.status || 'NONE'}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleInstantDemoLogin('MEMBER', m.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-lime-400/10 hover:bg-lime-400/20 text-lime-300 border border-lime-400/30 text-xs font-semibold"
                              title="Log in directly as this member"
                            >
                              Login As
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMember(m);
                                setShowAddMemberModal(true);
                              }}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                              title="Edit Member"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteMember(m.id)}
                              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-rose-400"
                              title="Delete Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* ADMIN TAB 3: SUBSCRIPTION PLAN MANAGER                           */}
        {/* ================================================================ */}
        {adminTab === 'plans' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">Subscription Plan Manager</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Add, edit, or remove gym membership tiers and pricing. Changes appear immediately in Member Portal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPlan(null);
                  setShowPlanModal(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs sm:text-sm flex items-center gap-2 self-start"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Subscription Plan</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-[#13161C] border border-zinc-800 rounded-2xl p-6 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
                        {plan.badge}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        {plan.durationDays} Days
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white">{plan.name}</h3>
                    <div className="text-2xl font-black font-mono text-lime-400">
                      {plan.currency || '₹'}
                      {Number(plan.price).toLocaleString()}
                    </div>
                    <p className="text-xs text-zinc-400">{plan.description}</p>
                    <ul className="space-y-1.5 pt-2 border-t border-zinc-800">
                      {plan.features.map((f, i) => (
                        <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPlan(plan);
                        setShowPlanModal(true);
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center justify-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Plan
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePlan(plan.id)}
                      className="p-2 rounded-xl bg-zinc-800 hover:bg-rose-500/20 text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* ADMIN TAB 4: PAYMENT SYSTEM SETTINGS (Dynamic Gateway Manager)   */}
        {/* ================================================================ */}
        {adminTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#131822] to-[#13161C] p-6 rounded-2xl border border-cyan-500/30">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                  Live Payment System Configuration
                </span>
                <h2 className="text-2xl font-black text-white">
                  Configure Gym Payment Methods & Merchant Accounts
                </h2>
                <p className="text-xs text-zinc-400 max-w-2xl">
                  Add your custom UPI ID, QR code merchant details, Bank Account (NEFT/IMPS), Card Gateway, or Cash Desk instructions. Any payment method added or toggled here immediately updates the Member Checkout screen.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingPayment(null);
                  setShowPaymentModal(true);
                }}
                className="px-5 py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-black text-xs sm:text-sm flex items-center gap-2 shrink-0 shadow-lg shadow-cyan-400/20"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add New Payment Method</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.id}
                  className={`rounded-2xl p-6 border transition flex flex-col justify-between space-y-5 ${
                    pm.enabled
                      ? 'bg-[#13161C] border-zinc-700'
                      : 'bg-[#0E1015] border-zinc-800/60 opacity-70'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-cyan-400">
                          {pm.type === 'UPI' && <QrCode className="w-5 h-5 text-lime-400" />}
                          {pm.type === 'CARD' && <CreditCard className="w-5 h-5 text-cyan-400" />}
                          {pm.type === 'BANK' && <Building2 className="w-5 h-5 text-amber-400" />}
                          {pm.type === 'WALLET' && <Wallet className="w-5 h-5 text-emerald-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-white">{pm.name}</h3>
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-800 text-cyan-300">
                              {pm.type}
                            </span>
                          </div>
                          <span className="text-xs text-zinc-400">{pm.badge}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTogglePaymentMethod(pm.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
                          pm.enabled
                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {pm.enabled ? '● Live in Checkout' : '○ Disabled'}
                      </button>
                    </div>

                    {/* Method Configuration Details */}
                    <div className="p-4 rounded-xl bg-[#0B0D10] border border-zinc-800/90 space-y-2 text-xs">
                      {pm.type === 'UPI' && (
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div>
                              <span className="text-zinc-400">UPI VPA ID: </span>
                              <span className="font-mono font-bold text-lime-300">
                                {pm.details.upiId}
                              </span>
                            </div>
                            <div>
                              <span className="text-zinc-400">Merchant Name: </span>
                              <span className="font-semibold text-white">
                                {pm.details.merchantName}
                              </span>
                            </div>
                          </div>
                          <DynamicQrCode value={pm.details.upiId} size={64} />
                        </div>
                      )}

                      {pm.type === 'CARD' && (
                        <div className="space-y-1">
                          <div>
                            <span className="text-zinc-400">Gateway Provider: </span>
                            <span className="font-semibold text-white">
                              {pm.details.gatewayName}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-400">Merchant ID: </span>
                            <span className="font-mono text-cyan-300">{pm.details.merchantId}</span>
                          </div>
                          <div>
                            <span className="text-zinc-400">Supported Networks: </span>
                            <span className="text-zinc-200">{pm.details.acceptedCards}</span>
                          </div>
                        </div>
                      )}

                      {pm.type === 'BANK' && (
                        <div className="space-y-1">
                          <div>
                            <span className="text-zinc-400">Bank & Account Name: </span>
                            <span className="font-semibold text-white">
                              {pm.details.bankName} — {pm.details.accountName}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-400">Account Number: </span>
                            <span className="font-mono text-lime-300">
                              {pm.details.accountNumber}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-400">IFSC Code: </span>
                            <span className="font-mono text-cyan-300">{pm.details.ifscCode}</span>
                          </div>
                        </div>
                      )}

                      {pm.type === 'WALLET' && (
                        <div className="space-y-1">
                          <div>
                            <span className="text-zinc-400">POS / Counter Code: </span>
                            <span className="font-mono text-lime-300">
                              {pm.details.counterCode}
                            </span>
                          </div>
                          <div>
                            <span className="text-zinc-400">Desk Hours: </span>
                            <span className="text-zinc-200">{pm.details.timings}</span>
                          </div>
                        </div>
                      )}

                      <p className="text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
                        {pm.details.instructions}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                    <span className="text-[11px] text-zinc-400">
                      Verification Mode:{' '}
                      <strong className="text-zinc-200">
                        {pm.autoApprove ? 'Instant Auto-Approve' : 'Manual Admin Approval'}
                      </strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPayment(pm);
                          setShowPaymentModal(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white flex items-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePaymentMethod(pm.id)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================ */}
        {/* ADMIN TAB 5: TRANSACTIONS & PAYMENT APPROVALS                    */}
        {/* ================================================================ */}
        {adminTab === 'transactions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Member Transactions & Payment Approvals
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Verify UTR / Reference IDs and approve pending payments to automatically activate member subscriptions.
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTxnFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      txnFilter === st
                        ? 'bg-cyan-400 text-zinc-950'
                        : 'bg-[#13161C] text-zinc-400 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#13161C] border border-zinc-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[11px] font-bold uppercase tracking-wider text-zinc-400 bg-[#0B0D10]/60">
                      <th className="py-3.5 px-4">Txn ID & Date</th>
                      <th className="py-3.5 px-4">Member</th>
                      <th className="py-3.5 px-4">Plan & Amount</th>
                      <th className="py-3.5 px-4">Payment Method</th>
                      <th className="py-3.5 px-4">Reference / UTR ID</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/70 text-xs sm:text-sm">
                    {filteredTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-zinc-900/40 transition">
                        <td className="py-4 px-4">
                          <div className="font-mono font-bold text-white">{txn.id}</div>
                          <div className="text-xs text-zinc-400">{txn.date}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-white">{txn.memberName}</div>
                          <div className="font-mono text-xs text-cyan-300">{txn.memberId}</div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="font-bold text-lime-300">{txn.planName}</div>
                          <div className="font-mono text-xs text-white">
                            {txn.currency || '₹'}
                            {Number(txn.amount).toLocaleString()} ({txn.durationDays}d)
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 font-mono text-[11px] text-zinc-300 mr-1.5">
                            {txn.paymentType}
                          </span>
                          <span className="text-xs text-zinc-300">{txn.paymentMethodName}</span>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-amber-300">
                          {txn.referenceId}
                        </td>
                        <td className="py-4 px-4">
                          {txn.status === 'APPROVED' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              APPROVED
                            </span>
                          )}
                          {txn.status === 'PENDING' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              PENDING
                            </span>
                          )}
                          {txn.status === 'REJECTED' && (
                            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                              REJECTED
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            {txn.status !== 'APPROVED' && (
                              <button
                                type="button"
                                onClick={() => handleTransactionDecision(txn, 'APPROVED')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-bold text-xs flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" /> Approve
                              </button>
                            )}
                            {txn.status !== 'REJECTED' && (
                              <button
                                type="button"
                                onClick={() => handleTransactionDecision(txn, 'REJECTED')}
                                className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold"
                              >
                                Reject
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ==================================================================== */}
      {/* ADMIN MODAL 1: ADD / EDIT GYM MEMBER                                 */}
      {/* ==================================================================== */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#13161C] border border-zinc-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-white">
                {editingMember ? `Edit Member: ${editingMember.id}` : 'Create New Gym Member'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddMemberModal(false);
                  setEditingMember(null);
                }}
                className="text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMemberFromAdmin} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Member Login ID *
                  </label>
                  <input
                    name="memberId"
                    type="text"
                    required
                    defaultValue={editingMember?.id || `GYM-${1001 + members.length}`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Login Password *
                  </label>
                  <input
                    name="password"
                    type="text"
                    required
                    defaultValue={editingMember?.password || 'password123'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Full Name *</label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingMember?.name || ''}
                    placeholder="e.g. Siddharth Roy"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Phone Number</label>
                  <input
                    name="phone"
                    type="text"
                    defaultValue={editingMember?.phone || '+91 98000 11223'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editingMember?.email || 'athlete@ironpulse.gym'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Fitness Goal</label>
                  <input
                    name="goal"
                    type="text"
                    defaultValue={editingMember?.goal || 'Strength & Conditioning'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-zinc-800">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Subscription Plan</label>
                  <select
                    name="planId"
                    defaultValue={editingMember?.subscription?.planId || plans[0]?.id}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{p.price})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Subscription Status</label>
                  <select
                    name="subStatus"
                    defaultValue={editingMember?.subscription?.status || 'ACTIVE'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="PENDING">PENDING</option>
                    <option value="EXPIRED">EXPIRED</option>
                    <option value="NONE">NONE (No Plan)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setEditingMember(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs"
                >
                  Save Member Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ADMIN MODAL 2: ADD / EDIT SUBSCRIPTION PLAN                          */}
      {/* ==================================================================== */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#13161C] border border-zinc-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-black text-white">
                {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create New Subscription Plan'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowPlanModal(false);
                  setEditingPlan(null);
                }}
                className="text-zinc-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlanFromAdmin} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Plan Name *</label>
                  <input
                    name="name"
                    type="text"
                    required
                    defaultValue={editingPlan?.name || ''}
                    placeholder="e.g. Summer Shred 6-Month"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Price (₹) *</label>
                  <input
                    name="price"
                    type="number"
                    required
                    defaultValue={editingPlan?.price || 2999}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Duration (Days)</label>
                  <input
                    name="durationDays"
                    type="number"
                    required
                    defaultValue={editingPlan?.durationDays || 60}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Duration Label</label>
                  <input
                    name="durationLabel"
                    type="text"
                    defaultValue={editingPlan?.durationLabel || '2 Months'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Promo Badge</label>
                  <input
                    name="badge"
                    type="text"
                    defaultValue={editingPlan?.badge || 'Best Value'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Short Description</label>
                <input
                  name="description"
                  type="text"
                  defaultValue={
                    editingPlan?.description ||
                    'Complete strength, cardio, and group conditioning access.'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Included Features (One per line)
                </label>
                <textarea
                  name="features"
                  rows={4}
                  defaultValue={
                    editingPlan?.features?.join('\n') ||
                    'Unrestricted gym floor access\nFree monthly InBody scan\nSmart locker & shower access'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white text-xs"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="popular"
                  defaultChecked={editingPlan?.popular || false}
                  className="rounded accent-cyan-400"
                />
                <span>Highlight as "Most Popular" plan in Member Portal</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanModal(false);
                    setEditingPlan(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs"
                >
                  Save Subscription Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* ADMIN MODAL 3: ADD / EDIT PAYMENT METHOD                             */}
      {/* ==================================================================== */}
      {showPaymentModal && (
        <PaymentMethodFormModal
          initialData={editingPayment}
          onClose={() => {
            setShowPaymentModal(false);
            setEditingPayment(null);
          }}
          onSave={handleSavePaymentMethod}
        />
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: ADMIN PAYMENT METHOD CONFIG MODAL
// ============================================================================

function PaymentMethodFormModal({ initialData, onClose, onSave }) {
  const [selectedType, setSelectedType] = useState(initialData?.type || 'UPI');

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#13161C] border border-zinc-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
              Admin Payment System Configuration
            </span>
            <h3 className="text-lg font-black text-white">
              {initialData ? `Edit ${initialData.name}` : 'Add New Payment Method'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSave} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Payment Channel Type *</label>
              <select
                name="type"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white font-semibold"
              >
                <option value="UPI">UPI ID & Dynamic QR Code</option>
                <option value="CARD">Credit / Debit Card Gateway</option>
                <option value="BANK">Direct Bank Transfer (NEFT/IMPS)</option>
                <option value="WALLET">Cash at Reception / Custom Wallet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Display Name in Checkout *</label>
              <input
                name="name"
                type="text"
                required
                defaultValue={
                  initialData?.name ||
                  (selectedType === 'UPI'
                    ? 'PhonePe / GPay Business QR'
                    : selectedType === 'BANK'
                    ? 'ICICI Corporate Bank Transfer'
                    : selectedType === 'CARD'
                    ? 'Razorpay Card Checkout'
                    : 'Front Desk Cash / POS')
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Checkout Highlight Badge</label>
            <input
              name="badge"
              type="text"
              defaultValue={initialData?.badge || 'Zero Fee • Verified Merchant'}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white"
            />
          </div>

          {/* Conditional Fields by Payment Type */}
          {selectedType === 'UPI' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-xl bg-[#0B0D10] border border-zinc-800">
              <div>
                <label className="block text-xs text-lime-300 mb-1">Merchant UPI ID (VPA) *</label>
                <input
                  name="upiId"
                  type="text"
                  required
                  defaultValue={initialData?.details?.upiId || 'ironpulse.fitness@okicici'}
                  placeholder="e.g. gymname@okaxis"
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Merchant Display Name *</label>
                <input
                  name="merchantName"
                  type="text"
                  required
                  defaultValue={initialData?.details?.merchantName || 'IRONPULSE FITNESS CLUB'}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                />
              </div>
            </div>
          )}

          {selectedType === 'BANK' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0B0D10] border border-zinc-800">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Bank Name *</label>
                <input
                  name="bankName"
                  type="text"
                  required
                  defaultValue={initialData?.details?.bankName || 'HDFC Bank'}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Account Holder Name *</label>
                <input
                  name="accountName"
                  type="text"
                  required
                  defaultValue={initialData?.details?.accountName || 'IRONPULSE FITNESS'}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-lime-300 mb-1">Account Number *</label>
                <input
                  name="accountNumber"
                  type="text"
                  required
                  defaultValue={initialData?.details?.accountNumber || '50200084918274'}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-cyan-300 mb-1">IFSC / Routing Code *</label>
                <input
                  name="ifscCode"
                  type="text"
                  required
                  defaultValue={initialData?.details?.ifscCode || 'HDFC0001204'}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs"
                />
              </div>
            </div>
          )}

          {selectedType === 'CARD' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0B0D10] border border-zinc-800">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Gateway Provider *</label>
                <input
                  name="gatewayName"
                  type="text"
                  required
                  defaultValue={initialData?.details?.gatewayName || 'Razorpay / Stripe Express'}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Merchant Account ID</label>
                <input
                  name="merchantId"
                  type="text"
                  defaultValue={initialData?.details?.merchantId || 'MID-GYM-88210'}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">Accepted Card Networks</label>
                <input
                  name="acceptedCards"
                  type="text"
                  defaultValue={
                    initialData?.details?.acceptedCards || 'Visa, MasterCard, RuPay, Amex'
                  }
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                />
              </div>
            </div>
          )}

          {selectedType === 'WALLET' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#0B0D10] border border-zinc-800">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Counter / Wallet Code</label>
                <input
                  name="counterCode"
                  type="text"
                  defaultValue={initialData?.details?.counterCode || 'RECEPTION-DESK-01'}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Operating Hours</label>
                <input
                  name="timings"
                  type="text"
                  defaultValue={initialData?.details?.timings || '6:00 AM - 10:00 PM'}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Member Checkout Instructions
            </label>
            <textarea
              name="instructions"
              rows={2}
              defaultValue={
                initialData?.details?.instructions ||
                'Complete the payment and submit your transaction reference number for verification.'
              }
              className="w-full px-3.5 py-2 rounded-xl bg-[#0B0D10] border border-zinc-800 text-white text-xs"
            />
          </div>

          <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              name="autoApprove"
              defaultChecked={initialData?.autoApprove || false}
              className="rounded accent-cyan-400"
            />
            <span>
              Auto-approve & activate member subscription immediately upon checkout
            </span>
          </label>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-black text-xs"
            >
              Save Payment Method
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}