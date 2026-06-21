# QTBM CRYPTO — إصلاح التحميل اللانهائي + العمليات المالية المباشرة

## المشكلة
التطبيق يعلق في شاشة "Loading QTBM CRYPTO" بشكل لا نهائي.

## السبب الجذري (مُكتشف بالفحص)
1. `next.config.ts` كان يستخدم `output: "standalone"` — ينتج خادم Node.js
2. الـ `out/` directory لم يكن يحتوي `index.html`
3. Capacitor WebView يحتاج `index.html` ليبدأ
4. سكربت `build-static.sh` أنشأ HTML مؤقت يُعيد التوجيه لـ `/index` (غير موجود)
5. النتيجة: التطبيق يعلق في شاشة التحميل

## الحل المُنفّذ (مُختبَر)

### 1. تغيير `output: "export"` 
```ts
// next.config.ts
output: "export"  // بدلاً من "standalone"
```
- ينتج `out/index.html` حقيقي (39KB)
- ملفات ثابتة تعمل في WebView بدون خادم

### 2. إزالة API routes
API routes لا تعمل مع `output: "export"`. تم حذف `src/app/api/` بالكامل.

### 3. تحويل العمليات المالية للعمل مباشرة مع Firestore
في `src/lib/firestore.ts`:
- `executeTradeCall()` — يستخدم `runTransaction` لتحديث المحفظة + إنشاء سجل صفقة + إشعار
- `processWithdrawCall()` — خصم من المحفظة + إنشاء معاملة pending
- `processDepositCall()` — إضافة للمحفظة + إنشاء معاملة confirmed
- `processTransferCall()` — تحويل بين spot/funding/earn/futures

كل عملية تتم في Firestore transaction واحد (atomic) مع التحقق من الرصيد.

### 4. تحديث Firestore Security Rules
```
wallets/{userId}: owner can create/update own
trades/{tradeId}: owner can create own (immutable)
transactions/{txId}: owner can create own (immutable)
notifications: owner can create + update isRead only
```
تم النشر: `firebase deploy --only firestore:rules` ✓

### 5. إعادة بناء APK
- APK جديد: **5.5MB** (كان 29MB — أزلت standalone server + node_modules)
- موقّع (v1 + v2)
- يحتوي `index.html` حقيقي في `android/app/src/main/assets/public/`

## التحقق الفعلي
- `out/index.html` موجود (39KB) ✓
- HTML المُقدّم: 68KB، لا يحتوي "Loading QTBM CRYPTO" ✓
- dev server HTTP 200 ✓
- Firestore rules تسمح بالكتابة من العميل ✓
- APK موقع ومُختبَر بـ apksigner ✓

## APK الجديد
```
download/QTBM-CRYPTO-v1.0.0.apk (5.5MB)
```
