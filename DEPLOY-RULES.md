# ⚠️ مهم: انشر قواعد Firestore المحدثة

## المشكلة
لوحة الأدمن لا تستطيع قراءة بيانات المستخدمين لأن القواعد الحالية تسمح لكل مستخدم بقراءة بياناته فقط.

## الحل: انشر القواعد المحدثة من جهازك

### الخطوة 1: ثبّت Firebase CLI
```bash
npm install -g firebase-tools
```

### الخطوة 2: سجّل الدخول
```bash
firebase login
```
سيفتح المتصفح — سجّل الدخول بحساب Google الذي يملك المشروع `qtb-bank-crypto`.

### الخطوة 3: انسخ المستودع
```bash
git clone https://github.com/ShlalCod/QTBM-CRYPTO.git
cd QTBM-CRYPTO
```

### الخطوة 4: انشر القواعد
```bash
firebase use qtb-bank-crypto
firebase deploy --only firestore:rules
```

### الخطوة 5: تحقق
```
✔ firestore: released rules firestore.rules to cloud.firestore
✔ Deploy complete!
```

## ما تغيّر في القواعد:
- **الأدمن** (مع custom claim `admin: true`) يمكنه قراءة كل:
  - `users` (كل المستخدمين)
  - `wallets` (كل المحافظ)
  - `trades` (كل الصفقات)
  - `transactions` (كل المعاملات)
  - `kyc` (كل طلبات KYC)
  - `admin` (سجلات التدقيق)
- المستخدم العادي يقرأ بياناته فقط (كما كان)
- الأدمن يمكنه كتابة `public` (إعلانات) و `admin` (سجلات) و تحديث `kyc` و `users`
