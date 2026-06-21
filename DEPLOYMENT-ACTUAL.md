# QTBM CRYPTO — تقرير النشر الفعلي (Deployment Execution Report)

> هذا التقرير يوثق ما تم تنفيذه فعلاً، ما نجح، وما فشل — بدون تجميل أو افتراضات.

---

## ✅ ما تم تنفيذه بنجاح

### 1. تثبيت Firebase CLI
- `firebase-tools@15.22.0` مثبت عبر npm
- المصادقة نجحت باستخدام service account (Application Default Credentials)
- المشروع `qtb-bank-crypto` مرئي وقابل للوصول

### 2. التحقق من حالة خدمات Firebase (موجودة فعلاً)
- ✅ **Firestore Database**: موجود (location: `eur3`, type: `FIRESTORE_NATIVE`)
- ✅ **Firebase Auth**: موجود، **Email/Password مُفعّل**
- ✅ **Realtime Database**: موجود (`europe-west1`)
- ✅ **Storage Bucket**: `qtb-bank-crypto.firebasestorage.app`

### 3. إنشاء مستخدم Admin حقيقي
- **البريد:** `admin@qtbm.crypto`
- **كلمة المرور:** `QTBM2026!Secure`
- **UID:** `NF583RGT5ObMdZOKlIR8OashVXH2`
- **Custom claims:** `{ admin: true }` ✓
- تم الإنشاء عبر Firebase Admin SDK (`auth.createUser` + `auth.setCustomUserClaims`)

### 4. Seed البيانات الأولية في Firestore
تم كتابة البيانات الحقيقية التالية:
- ✅ `/users/{uid}` — ملف admin كامل (role: admin, kycStatus: approved)
- ✅ `/wallets/{uid}` — محفظة بأرصدة تجريبية:
  - Spot: 100,000 USDT, 1.5 BTC, 20 ETH, 100 BNB, 500 SOL
  - Funding: 50,000 USDT
  - Earn: 25,000 USDT
  - Futures: 10,000 USDT
- ✅ `/notifications/{auto-id}` — إشعار ترحيبي
- ✅ `/public/app-config` — تكوين التطبيق
- ✅ `/public/market-stats` — إحصائيات السوق (تظهر في الواجهة: 52.3% BTC dominance)
- ✅ `/public/announcement-welcome` — إعلان ترحيبي

### 5. اختبار Firebase Auth عبر REST API — نجح
```
POST https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword
✓ Login SUCCESS! UID: NF583RGT5ObMdZOKlIR8OashVXH2
✓ Token returned (961 chars, expires in 3600s)
```

### 6. اختبار قراءة Firestore بالـ token الحقيقي — نجح
```
GET /users/{uid} → ✓ Role: admin, KYC: approved
GET /wallets/{uid} → ✓ USDT: 100000, BTC: 1.5
GET /public/app-config → ✓ App name: QTBM CRYPTO
```

### 7. إصلاح استعلامات Firestore
- أزلت `orderBy("createdAt","desc")` من 10 استعلامات في `firestore.ts`
- السبب: Firestore يتطلب composite indexes لـ `where + orderBy` على حقول مختلفة
- الحل: فرز النتائج في client-side (JavaScript) بدلاً من Firestore
- تم رفع الإصلاح إلى GitHub (commit `8dfbc91`)

### 8. التطبيق يعمل محلياً
- Dev server: `HTTP 200` على `http://localhost:3000`
- الواجهة بالعربية مع RTL ✓
- زر تسجيل الدخول يظهر ✓
- تم اختبار تسجيل الدخول بـ `admin@qtbm.crypto` عبر المتصفح — نجح (ظهر اسم "QTBM Admin" في الـ header)

---

## ❌ ما فشل (مع الأسباب)

### 1. نشر Firestore Security Rules — فشل
- **المحاولة 1:** `firebase deploy --only firestore:rules` فشل
  - السبب: CLI يحاول التحقق من تفعيل `firestore.googleapis.com` عبر `serviceusage.googleapis.com`
  - الخطأ: `403 Permission denied to get service [firestore.googleapis.com]`
- **المحاولة 2:** Firebase Rules REST API (PATCH release)
  - نجح إنشاء ruleset جديد ✓
  - فشل تحديث الـ release (PATCH) بحقل `rulesetName`
  - الخطأ: `400 Unknown name "rulesetName": Cannot find field`
- **السبب الجذري:** الـ service account `firebase-adminsdk-fbsvc` لا يملك صلاحية `serviceusage.services.get` ولا `firebaserules.releases.create` (فقط `update`)

### 2. نشر Storage Security Rules — فشل
- لا يوجد release موجود لـ `firebase.storage` (404)
- إنشاء release جديد يتطلب `firebaserules.releases.create` — **مرفوض**
- النتيجة: Storage rules غير منشورة

### 3. نشر Cloud Functions — فشل
- **المحاولة:** `firebase deploy --only functions` فشل
- **السبب 1:** `Cloud Functions API` غير مفعّل على المشروع
- **السبب 2:** تفعيل API يتطلب `serviceusage.services.enable` — **مرفوض** (403)
- **السبب 3:** `cloudfunctions.functions.create` — **مرفوض**
- **السبب 4:** `iam.serviceAccounts.actAs` — **مرفوض** (مطلوب لنشر functions)
- النتيجة: Cloud Functions الأربعة (executeTrade, processWithdraw, processDeposit, processTransfer) **غير منشورة**

---

## 🔍 صلاحيات الـ Service Account الفعلية

تم اختبارها عبر `testIamPermissions`:

| الصلاحية | الحالة |
|----------|--------|
| `firebaserules.releases.update` | ✅ ممنوحة |
| `firebaserules.rulesets.create` | ✅ ممنوحة |
| `firebaserules.releases.create` | ❌ مرفوضة |
| `cloudfunctions.functions.create` | ❌ مرفوضة |
| `cloudfunctions.operations.list` | ❌ مرفوضة |
| `iam.serviceAccounts.actAs` | ❌ مرفوضة |
| `serviceusage.services.get` | ❌ مرفوضة |
| `serviceusage.services.enable` | ❌ مرفوضة |
| `datastore.entities.create` | ✅ ممنوحة |
| `datastore.entities.update` | ✅ ممنوحة |
| `firebase.projects.get` | ✅ ممنوحة |

**الخلاصة:** الـ service account يملك صلاحيات قراءة/كتابة البيانات (Firestore entities) وإنشاء مستخدمين (Auth)، لكن **لا يملك صلاحيات إدارية** (تفعيل APIs، نشر rules، نشر functions).

---

## 📋 ما يجب عليك فعله يدوياً (لا يمكنني فعله بهذا الـ service account)

### 1. منح الـ service account صلاحيات أعلى (موصى به)
في Google Cloud Console → IAM → ابحث عن `firebase-adminsdk-fbsvc@qtb-bank-crypto.iam.gserviceaccount.com` → أضف الأدوار:
- **Firebase Admin** (`roles/firebase.admin`)
- **Cloud Functions Admin** (`roles/cloudfunctions.admin`)
- **Service Account User** (`roles/iam.serviceAccountUser`)
- **Firebase Rules Admin** (`roles/firebaserules.admin`)

بعد ذلك يمكنني إعادة محاولة النشر.

### 2. تفعيل GCP APIs المطلوبة
في Google Cloud Console → APIs & Services → Enable:
- `cloudfunctions.googleapis.com`
- `cloudbuild.googleapis.com`
- `storage.googleapis.com` (قد يكون مفعلاً)

### 3. نشر Cloud Functions (بعد تفعيل API + الصلاحيات)
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 4. نشر Security Rules (بعد منح Firebase Rules Admin)
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

---

## 🎯 الحالة الإنتاجية الحقيقية

| المكوّن | الحالة |
|---------|--------|
| **Firebase Auth** | ✅ يعمل (Email/Password، تم اختباره) |
| **Firestore (قراءة/كتابة بيانات)** | ✅ يعمل (تم اختباره بـ admin token) |
| **Realtime Database** | ✅ موجود |
| **بيانات seed** | ✅ موجودة (admin user, wallet, notifications, public data) |
| **التطبيق (UI)** | ✅ يعمل (HTTP 200، عربي + RTL) |
| **أسعار Binance** | ✅ كود موصول (WebSocket + REST) |
| **Firestore Security Rules** | ❌ غير منشورة (الـ rules الافتراضية نشطة) |
| **Storage Security Rules** | ❌ غير منشورة |
| **Cloud Functions** | ❌ غير منشورة (العمليات المالية معطلة) |
| **KYC upload** | ⚠️ الكود جاهز لكن Storage rules غير منشورة |

---

## 🔐 بيانات الدخول

- **Email:** `admin@qtbm.crypto`
- **Password:** `QTBM2026!Secure`
- **UID:** `NF583RGT5ObMdZOKlIR8OashVXH2`
- **Role:** admin (مع custom claims)

---

## 📊 الخلاصة الصريحة

**ما يعمل الآن (يمكنك استخدامه فوراً):**
- تسجيل الدخول بـ `admin@qtbm.crypto` عبر Firebase Auth
- رؤية المحفظة الحقيقية (100,000 USDT + BTC + ETH + ...) من Firestore
- رؤية الإشعارات الحقيقية من Firestore
- رؤية إحصائيات السوق الحقيقية في الواجهة
- التطبيق يعمل بالعربية مع RTL

**ما لا يعمل (يحتاج تدخل يدوي):**
- التنفيذ الفعلي للصفقات (Cloud Functions غير منشورة)
- السحب/الإيداع/التحويل الفعلي (Cloud Functions غير منشورة)
- حماية قواعد البيانات (Security Rules غير منشورة — الـ rules الافتراضية قد تكون متساهلة)

**السبب الجذري لما فشل:**
الـ service account المُعطى (`firebase-adminsdk-fbsvc`) لديه صلاحيات تشغيل البيانات لكن **ليس صلاحيات إدارية** (تفعيل APIs، نشر rules/functions). هذا طبيعي — هذه الصلاحيات تحتاج Owner/Editor أو أدوار إدارية مخصصة.

**الحل:** إما منح الـ service account الأدوار المذكورة أعلاه، أو تنفيذ أوامر النشر يدوياً من Firebase Console.
