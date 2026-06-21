QTBM CRYPTO – PRODUCTION READINESS
Architectural Verdict: PRODUCTION BLOCKED – MANDATORY FULL REBUILD OF AUTH, THEME, AND RTL LAYERS

---

EXECUTIVE VERDICT

PRODUCTION READINESS: 0% (BLOCKED).

التطبيق لا يمتلك أي طبقة عرض أو أمان صالحة للإنتاج. المشاكل ليست تجميلية بل هيكلية (Architectural). ثلاثة أنظمة أساسية (Authentication, Theme System, RTL System) مصممة بشكل خاطئ من الجذر وتتطلب إعادة بناء كاملة (Full Rebuild). الإصلاح الجزئي (Patch) لهذه الأنظمة سيترك ثغرات أمنية وانكسارات اتجاهية لا يمكن تتبعها، وبالتالي مرفوض قطعياً. يجب حذف الملفات التالية واستبدالها بالكامل: api/auth/route.ts, app-store.ts (جزء الثيم), globals.css (أقسام RTL والثيم), وجميع تعريفات الألوان الثابتة في مكونات الشاشات.

---

CRITICAL BLOCKERS

CRITICAL BLOCKER #1: Authentication Bypass (Zero-Day Production Killer)

· api/auth/route.ts يقبل أي كلمة مرور طولها ≥6 وأي رمز 2FA مكون من 6 أرقام ويمنح role:'admin'.
· لا يوجد JWT, session, أو cookie.
· getAuth() مُهيأ في Firebase لكن غير مستخدم نهائياً في أي عملية مصادقة.
· Result: أي مستخدم على الإنترنت يستطيع الدخول كأدمن والتحكم في أموال التطبيق خلال 10 ثوانٍ.

CRITICAL BLOCKER #2: Firebase Security Rules Complete Absence

· لا يوجد firestore.rules, storage.rules, أو database.rules ملتزم بها في المشروع.
· كل عملية قراءة/كتابة من العميل (Frontend) ناجحة بدون أي تحقق من هوية أو صلاحيات على مستوى Backend.
· Result: أي مستخدم يمتلك معرفة بـ Firebase SDK يستطيع تفريغ قاعدة البيانات بالكامل أو تعديل أرصدة المحافظ.

CRITICAL BLOCKER #3: Dual Theme System Collision (UI Unusable in Light Mode)

· layout.tsx يستخدم next-themes مع attribute="class", enableSystem=false, defaultTheme="dark", وجلب className="dark" بشكل صريح.
· app-store.ts يتحكم في data-theme attribute بشكل مستقل ولا يستدعي setTheme الخاص بـ next-themes.
· globals.css يفرض قيم !important على خلفيات المودال والـ z-index.
· 42 شاشة تحتوي على ألوان Hex ثابتة (bg-[#0B0E11], text-[#EAECEF]) بدلاً من CSS tokens (bg-background, text-foreground).
· Result: زر تبديل الثيم لا يُحدث أي تغيير بصري (class="dark" لا تُزال أبداً)، والوضع الفاتح مستحيل تماماً حتى مع إصلاح المبدل لأن الألوان ثابتة.

CRITICAL BLOCKER #4: RTL Patchwork Collapse (Directional Chaos)

· globals.css (سطور 3849-3869) يحتوي على قواعد قلب CSS جزئية تغطي فقط pl-9/3/2/4, ml-1/2/3, mr-1/2/1.5, .absolute.left-0/.right-0.
· الشاشات تستخدم right-2, left-2.5, pl-8, pr-8, ml-auto, mr-auto بكميات هائلة (90+ موضعاً) غير مشمولة بالقلب.
· تدرجات SVG فيزيائية (linear-gradient(to left)) لا تُقلب.
· حركات Framer Motion فيزيائية (x:300, slide-in-right) لا تُقلب.
· أيقونات ChevronRight في 15 مكاناً لا تُقلب إلى ChevronLeft.
· Result: الواجهة العربية عبارة عن فوضى من العناصر المعكوسة والغير معكوسة في نفس الوقت، مما يجعل الأزرار فوق النصوص والشارات في جهة خاطئة.

CRITICAL BLOCKER #5: Arabic Font Not Loaded (Baseline Mismatch)

· layout.tsx يستورد Geist و Geist_Mono مع subsets:["latin"] فقط.
· globals.css يذكر Tajawal/Noto Sans Arabic/Cairo في سطر 3822 لكنه غير مستورد عبر next/font أو @font-face.
· Result: النصوص العربية تُرسم بخط النظام (fallback) بينما الأرقام واللاتينية بـ Geist. اختلاف خطوط الأساس (baseline) في نفس السطر يؤدي إلى تقطيع بصري وعدم محاذاة النصوص.

---

ARCHITECTURAL FAILURES

FAILURE #1: Layered Theme Architecture Conflict

· next-themes (Provider) و app-store (State Manager) يتنافسان على التحكم في خصائص DOM.
· app-store يغير data-theme بدون إعلام next-themes، بينما next-themes يغير class بدون تحديث app-store.
· Architectural Decision: تبني next-themes كمصدر وحيد للحقيقة (Single Source of Truth) للثيم، وإزالة أي منطق للثيم من app-store. تحويل كل الألوان الثابتة إلى متغيرات CSS.

FAILURE #2: RTL Implementation as CSS Hack而非 First-Class Feature

· استخدام left/right الفيزيائية مع محاولة قلبها بواسطة CSS بعد التحميل (Post-render patch) هو أسلوب فاشل.
· يجب استخدام الخصائص المنطقية (Logical Properties) inset-inline-start, padding-inline, margin-inline, text-align: start من البداية.
· Architectural Decision: إزالة جميع أدوات left/right/pl/pr/ml/mr الفيزيائية من قاعدة الكود بالكامل واستبدالها بـ start/end equivalents. إزالة قواعد القلب من globals.css.

FAILURE #3: CSS Specificity Wars with !important

· تعريفات glass مكررة 3 مرات (سطور 215, 1676, 3884). التعريف الأخير يحمل !important ويلغي السابق.
· تعريفات z-index تستخدم !important (3905-3909) لتجاوز تعارضات أخرى.
· هذا يدل على أن نظام الـ Cascade الأساسي مكسور وغير قابل للإدارة.
· Architectural Decision: إزالة كل !important من globals.css وإعادة بناء التسلسل الهرمي للـ CSS باستخدام الـ Specificity الطبيعي ومتغيرات CSS.

FAILURE #4: Security as Frontend Mock (No Backend Validation)

· كل عمليات "التداول"، "الإيداع"، "السحب" تعتمد على Firebase client SDK بدون أي تحقق من الخادم (Cloud Functions).
· Architectural Decision: كل عملية حساسة (حسابية، مالية) يجب أن تُنفذ عبر Firebase Cloud Functions (Callable Functions) مع قواعد أمان صارمة على مستوى Firestore.

---

SECURITY REMEDIATION PLAN

TASK SEC-001: Remove Mock Authentication Endpoint

· PROBLEM: api/auth/route.ts يقبل أي بيانات ويصعد صلاحيات.
· ROOT CAUSE: تم بناء endpoint وهمي للتطوير ولم يُستبدل بـ Firebase Auth.
· FILES: src/app/api/auth/route.ts
· RISKS: اختراق كامل (Total Compromise) خلال دقائق من النشر.
· STEPS:
  1. حذف ملف src/app/api/auth/route.ts بالكامل.
  2. حذف أي استيراد لهذا الملف من layout.tsx أو page.tsx.
  3. إزالة أي fetch() داخلي يستدعي /api/auth من جميع الشاشات (خاصة AuthView).
· SUCCESS: مسار /api/auth يعيد 404 Not Found في البيئة المحلية والإنتاج.
· VERIFICATION: تشغيل curl -X POST http://localhost:3000/api/auth -d '{"password":"123456","code":"123456"}' يحصل على 404.
· FAILURE MODES: إذا ظل الملف موجوداً، يظل الثغرة مفتوحة. يجب التأكد من Git commit بحذف الملف.

TASK SEC-002: Implement Firebase Authentication Client-Side

· PROBLEM: getAuth() مهيأ لكن غير مستخدم. لا يوجد تسجيل دخول حقيقي.
· ROOT CAUSE: استخدام وهمي للمصادقة.
· FILES: src/components/qtbm/AuthView.tsx, src/lib/firebase/client.ts (مفترض)
· RISKS: عدم وجود هوية حقيقية للمستخدمين.
· STEPS:
  1. في AuthView.tsx، استبدال منطق fetch('/api/auth') باستدعاء signInWithEmailAndPassword(getAuth(), email, password).
  2. إضافة معالج onAuthStateChanged في مكون Provider علوي (QTBMApp أو layout.tsx) لتحديد حالة المستخدم.
  3. إزالة حقول 2FA code الوهمية من شاشة الدخول واستبدالها بـ Firebase multiFactor إذا لزم الأمر، أو إلغائها حالياً.
  4. تخزين idToken من Firebase في الذاكرة (وليس LocalStorage لأسباب أمنية) لاستخدامه في استدعاءات Cloud Functions.
· SUCCESS: المستخدم الحقيقي المسجل في Firebase يمكنه تسجيل الدخول. المستخدم غير المسجل يتلقى خطأ auth/user-not-found.
· VERIFICATION: محاولة تسجيل الدخول بمستخدم Firebase Console ينجح. محاولة بكلمة سر خاطئة تفشل.
· FAILURE MODES: نسيان onAuthStateChanged يؤدي إلى حالة مستخدم غير متزامنة.

TASK SEC-003: Enforce Firestore Security Rules (Production-Grade)

· PROBLEM: لا توجد قواعد أمان. أي عملية قراءة/كتابة ناجحة.
· ROOT CAUSE: إهمال ملفات القواعد.
· FILES: firestore.rules, firestore.indexes.json (جذر المشروع).
· RISKS: تسريب كامل لقاعدة البيانات.
· STEPS:
  1. إنشاء firestore.rules في جذر المشروع بالمحتوى التالي (إلزامي):
     ```
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /users/{userId} {
           allow read, write: if request.auth != null && request.auth.uid == userId;
         }
         match /wallets/{userId} {
           allow read: if request.auth != null && request.auth.uid == userId;
           allow write: if false; // العمليات الحسابية عبر Cloud Functions فقط
         }
         match /trades/{tradeId} {
           allow read: if request.auth != null && request.auth.uid == resource.data.userId;
           allow write: if false; // فقط عبر Cloud Functions
         }
         match /admin/{document} {
           allow read, write: if request.auth != null && request.auth.token.admin == true;
         }
         match /public/{document} {
           allow read: if true;
           allow write: false;
         }
         match /{document=**} {
           allow read, write: if false; // رفض أي شيء آخر
         }
       }
     }
     ```
  2. إنشاء storage.rules لحماية الملفات المرفوعة (الصور الشخصية، KYC).
     ```
     rules_version = '2';
     service firebase.storage {
       match /b/{bucket}/o {
         match /users/{userId}/{allPaths=**} {
           allow read: if request.auth != null && request.auth.uid == userId;
           allow write: if request.auth != null && request.auth.uid == userId && request.resource.size < 5 * 1024 * 1024;
         }
         match /public/{allPaths=**} {
           allow read: if true;
           allow write: false;
         }
       }
     }
     ```
  3. رفع القواعد باستخدام firebase deploy --only firestore:rules,storage.
· SUCCESS: محاولة كتابة مستند في users بمعرف مستخدم مختلف عن request.auth.uid تفشل مع خطأ PERMISSION_DENIED.
· VERIFICATION: تشغيل firebase emulators:start واختبار读写 من تطبيق العميل مع وبدون مصادقة.
· FAILURE MODES: كتابة قاعدة match /{document=**} بشكل خاطئ قد تغلق التطبيق بالكامل. التأكد من وجود allow read: if true للمواد العامة (مثل أسعار الصرف).

TASK SEC-004: Migrate Sensitive Operations to Firebase Callable Functions

· PROBLEM: منطق التداول والإيداع والسحب موجود على العميل.
· ROOT CAUSE: تصميم Frontend-heavy.
· FILES: src/components/qtbm/TradeView.tsx, WithdrawView.tsx, DepositView.tsx, functions/src/index.ts
· RISKS: تلاعب العميل بالرصيد والحسابات.
· STEPS:
  1. إنشاء مشروع functions فرعي إذا لم يكن موجوداً (firebase init functions).
  2. كتابة Callable Function executeTrade:
     ```typescript
     exports.executeTrade = functions.https.onCall(async (data, context) => {
       if (!context.auth) throw new functions.https.HttpsError('unauthenticated', '...');
       const { symbol, side, quantity, price } = data;
       // تنفيذ منطق التداول في بيئة آمنة (Firestore Transactions).
       // تحديث رصيد المستخدم.
       return { success: true, orderId: '...' };
     });
     ```
  3. كتابة Callable Function processWithdraw و processDeposit.
  4. تعديل الشاشات لاستدعاء httpsCallable('executeTrade') بدلاً من كتابة البيانات مباشرة إلى Firestore.
· SUCCESS: محاولة إيداع 1000 USDT عبر العميل المعدل (باستثناء الاستدعاء) ترفضها الـ Function لأن المستخدم غير مصرح له أو الرصيد غير كافٍ.
· VERIFICATION: اختبار جميع العمليات الحسابية في بيئة Firebase Emulator.
· FAILURE MODES: قد يؤدي عدم تعيين timeout في الـ Functions إلى مهلة للعمليات الطويلة.

---

THEME SYSTEM REMEDIATION PLAN

FULL REBUILD REQUIRED (LAYER)

TASK THEME-001: Remove app-store Theme Control

· PROBLEM: app-store.ts يغير data-theme بشكل مستقل عن next-themes.
· ROOT CAUSE: State management متعارض.
· FILES: src/store/app-store.ts, src/store/theme-slice.ts (إن وجد).
· RISKS: استمرار التعارض حتى بعد الإصلاحات.
· STEPS:
  1. حذف أي إشارة إلى data-theme في app-store.ts.
  2. حذف أي دالة setTheme أو toggleTheme داخل app-store.
  3. استبدال أي استدعاء لـ app-store لجلب الثيم باستدعاء useTheme() من next-themes في المكونات.
  4. إزالة أي ملف theme-slice.ts بشكل كامل.
· SUCCESS: app-store لم يعد يحتوي على أي خاصية أو دالة متعلقة بـ theme أو data-theme.
· VERIFICATION: البحث عن data-theme في src/store/ يعطي 0 نتيجة.
· FAILURE MODES: نسيان إزالة الاستيراد من المكونات سيؤدي إلى أخطاء TypeScript.

TASK THEME-002: Refactor Theme Provider to next-themes Single Source

· PROBLEM: layout.tsx يضيف className="dark" ثابتاً.
· ROOT CAUSE: عدم فهم آلية next-themes.
· FILES: src/app/layout.tsx
· RISKS: .dark لا تُزال أبداً.
· STEPS:
  1. تعديل layout.tsx:
     ```tsx
     import { ThemeProvider } from 'next-themes';
     // إزالة className="dark" من أي عنصر جذر.
     <html lang="ar" dir="rtl" suppressHydrationWarning>
       <body>
         <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme={null}>
           {children}
         </ThemeProvider>
       </body>
     </html>
     ```
  2. إزالة أي className="dark" ثابت من <html> أو <body>.
  3. التأكد من أن next-themes لا يضيف class="dark" أثناء التحميل الأولي لتجنب وميض (Flash) غير صحيح.
· SUCCESS: عند التبديل إلى "light"، يضيف next-themes class="light" إلى <html> ويزيل class="dark".
· VERIFICATION: فتح أداة المطور (DevTools) ومراقبة تغير class على <html> عند الضغط على زر التبديل.
· FAILURE MODES: قد يحدث وميض (FOUC) إذا لم يتم استخدام suppressHydrationWarning بشكل صحيح.

TASK THEME-003: Eliminate Hardcoded Hex Colors in All 42 Screens

· PROBLEM: كل الشاشات تستخدم bg-[#0B0E11], text-[#EAECEF], إلخ.
· ROOT CAUSE: عدم وجود نظام تصميم (Design Tokens) مطبق.
· FILES: src/components/qtbm/**/*.tsx (جميع الملفات الـ42).
· RISKS: الوضع الفاتح يظل مكسوراً حتى مع إصلاح المبدل.
· STEPS:
  1. في ملف globals.css (بعد التنظيف)، تعريف tokens:
     ```css
     :root {
       --background: #FFFFFF;
       --foreground: #0B0E11;
       --card: #F8F9FA;
       --card-foreground: #0B0E11;
       --primary: #F0B90B;
       --primary-foreground: #FFFFFF;
       --secondary: #EAECEF;
       --secondary-foreground: #1E2329;
       --muted: #EAECEF;
       --muted-foreground: #848E9C;
       --destructive: #F6465D;
       --destructive-foreground: #FFFFFF;
       --border: #E0E3E8;
     }
     .dark {
       --background: #0B0E11;
       --foreground: #EAECEF;
       --card: #1E2329;
       --card-foreground: #EAECEF;
       --secondary: #2B3139;
       --secondary-foreground: #EAECEF;
       --muted: #2B3139;
       --muted-foreground: #848E9C;
       --border: #2B3139;
     }
     ```
  2. استخدام أداة sed أو grep -rl للبحث عن bg-[# و text-[# و border-[#.
  3. استبدال الأنماط على النحو التالي (إلزامي لكل حالة):
     · bg-[#0B0E11] -> bg-background
     · bg-[#1E2329] -> bg-card
     · bg-[#2B3139] -> bg-secondary
     · bg-[#EAECEF] -> bg-muted
     · text-[#EAECEF] -> text-foreground
     · text-[#F0B90B] -> text-primary
     · text-[#848E9C] -> text-muted-foreground
     · text-[#5E6673] -> text-muted-foreground (توحيد القيمة)
     · text-[#F6465D] -> text-destructive
     · text-[#0ECB81] -> text-success (يجب تعريفه في :root)
     · border-[#2B3139] -> border-border
     · bg-[#F6465D]/5 -> bg-destructive/10 (رفع الشفافية لتجنب التلاشي)
     · bg-[#F0B90B]/5 -> bg-primary/10
  4. استبدال className="dark:" بآلية next-themes (لا حاجة لـ dark: إذا كانت المتغيرات تتغير تلقائياً).
· SUCCESS: الشاشات تستخدم فقط bg-background, text-foreground, إلخ. وليس أي #hex مباشر.
· VERIFICATION: تشغيل grep -r "bg-\[#" src/components/qtbm/ يعطي 0 نتيجة. grep -r "text-\[#" يعطي 0 نتيجة.
· FAILURE MODES: نسيان بعض الملفات يؤدي إلى ظهور بقع بيضاء/سوداء في الوضع الفاتح. يجب استخدام أداة بحث آلية.

TASK THEME-004: Fix Theme Toggle Button Logic

· PROBLEM: زر التبديل لا يستدعي setTheme.
· ROOT CAUSE: المكون يستخدم app-store بدلاً من useTheme.
· FILES: مكون زر التبديل (مثل ThemeToggle.tsx أو داخل SettingsView.tsx).
· RISKS: المستخدم لا يستطيع تغيير الثيم حتى بعد الإصلاحات الأخرى.
· STEPS:
  1. في المكون، استبدال const { theme, toggleTheme } = useAppStore() بـ const { theme, setTheme } = useTheme() من next-themes.
  2. تعديل معالج onClick لاستدعاء setTheme(theme === 'dark' ? 'light' : 'dark').
  3. إزالة أي منطق يحاول تغيير data-theme.
· SUCCESS: الضغط على الزر يغير <html class> من dark إلى light وبالعكس.
· VERIFICATION: مراقبة DevTools أثناء الضغط.
· FAILURE MODES: قد يحدث خطأ useTheme must be used within a ThemeProvider إذا كان المكون خارج نطاق الـ Provider.

---

RTL REMEDIATION PLAN

FULL REBUILD REQUIRED (LAYER)

TASK RTL-001: Delete All Physical Direction CSS Rules and Utilities

· PROBLEM: globals.css يحتوي على قواعد قلب هشة (3849-3869) تغطي جزءاً صغيراً.
· ROOT CAUSE: الاعتماد على الـ Patch.
· FILES: src/app/globals.css (السطور 3849-3869).
· RISKS: استمرار وجود قواعد متضاربة مع الخصائص المنطقية الجديدة.
· STEPS:
  1. حذف القسم الكامل الذي يبدأ بـ /* RTL CSS rules */ أو ما يشابهه في السطور 3849-3869.
  2. حذف أي قاعدة تستخدم [dir="rtl"] مع left/right في globals.css.
· SUCCESS: globals.css لا يحتوي على أي قاعدة [dir="rtl"] تغير left أو right.
· VERIFICATION: البحث عن [dir="rtl"] في globals.css يعطي 0 نتيجة.
· FAILURE MODES: حذف قواعد تؤثر على مكونات Shadcn/ui (مثل Dialog) يجب تعويضها بالخصائص المنطقية في المكونات نفسها.

TASK RTL-002: Replace All left/right with inset-inline-start/inset-inline-end in All Files

· PROBLEM: استخدام right-2, left-2.5, left-6, right-1 في 90+ موضعاً.
· ROOT CAUSE: استخدام أدوات Tailwind الفيزيائية.
· FILES: جميع ملفات src/components/qtbm/**/*.tsx و src/components/ui/**/*.tsx.
· RISKS: العناصر المطلقة (Absolute) تبقى في جهة خاطئة.
· STEPS:
  1. استبدال right-2 بـ inset-inline-end-2 (أو end-2 في Tailwind إذا كان مُعرّفاً، وإلا استخدم style={{ insetInlineEnd: '0.5rem' }} أو أضف الأدوات).
  2. استبدال left-2.5 بـ inset-inline-start-2.5.
  3. استبدال left-6 بـ inset-inline-start-6.
  4. استبدال right-1 بـ inset-inline-end-1.
  5. استبدال top-2 right-2 (المدمجة) بـ top-2 inset-inline-end-2.
  6. استبدال top-3 left-3 بـ top-3 inset-inline-start-3.
  7. استبدال absolute left-2.5 (AdminDashboard) بـ absolute inset-inline-start-2.5.
· SUCCESS: في RTL، inset-inline-start يعني right وفي LTR يعني left. العناصر تظهر في الجهة الصحيحة.
· VERIFICATION: فتح التطبيق في RTL (الوضع الحالي) والتحقق من موضع أيقونات البحث، شارات التصنيف، أزرار الإغلاق.
· FAILURE MODES: قد لا تدعم بعض إصدارات Tailwind inset-inline-start مباشرة. ستحتاج إلى تثبيت البرنامج المساعد tailwindcss-logical أو كتابة فئات مخصصة في globals.css.

TASK RTL-003: Replace All pl/pr/ml/mr with ps/pe/ms/me

· PROBLEM: pl-8, pr-8, ml-auto, mr-3 تستخدم في Dropdown, Select, List Items.
· ROOT CAUSE: استخدام Padding/Margin الفيزيائي.
· FILES: src/components/ui/dropdown-menu.tsx, select.tsx, src/components/qtbm/SettingsView.tsx, AdminDashboardView.tsx, وغيرها.
· STEPS:
  1. استبدال pl-8 بـ ps-8 (Padding Inline Start).
  2. استبدال pr-8 بـ pe-8 (Padding Inline End).
  3. استبدال ml-auto بـ ms-auto (Margin Inline Start).
  4. استبدال mr-3 بـ me-3 (Margin Inline End).
  5. استبدال ml-2 بـ ms-2.
  6. استبدال mr-2 بـ me-2.
  7. استبدال rounded-l-xl بـ rounded-s-xl (Start).
  8. استبدال border-l-[3px] بـ border-inline-start-[3px] أو border-s-[3px].
· SUCCESS: الهوامش والحدود تنعكس تلقائياً في RTL.
· VERIFICATION: التحقق من أن عناصر القائمة في RTL يكون فيها الأيقونة على اليمين والنص على اليسار (أو العكس حسب التصميم الصحيح للعربية).
· FAILURE MODES: نسيان استبدال px/py (هي صحيحة لأنها رأسية) يجب تركها.

TASK RTL-004: Flip All Physical SVG Gradients

· PROBLEM: linear-gradient(to left, ...) في TradeView لا ينعكس.
· ROOT CAUSE: اتجاه التدرج ثابت فيزيائياً.
· FILES: src/components/qtbm/TradeView.tsx (سطر 666/699), و أي SVG آخر.
· STEPS:
  1. استخدام خاصية style={{ direction: 'ltr' }} مؤقتاً على عنصر التدرج إذا كان يجب أن يبقى ثابتاً (مثل الرسوم البيانية التي تعتمد على اليسار->اليمين).
  2. أو استبدال to left بـ to right مع عكس الألوان إذا كانت بيانات السوق تتطلب ذلك.
  3. القرار النهائي: في الرسوم البيانية للسوق، الاتجاه يعتمد على الزمن (اليسار للقديم، اليمين للجديد) وهو ثابت عالمياً ولا ينعكس مع RTL. لذا يجب إضافة dir="ltr" إلى حاوية الرسم البياني فقط.
· SUCCESS: الرسم البياني يعرض البيانات بالترتيب الزمني الصحيح (قديم->جديد) بغض النظر عن RTL.
· VERIFICATION: مقارنة الرسم البياني مع منصات التداول الأخرى (Binance) في وضع RTL.
· FAILURE MODES: عكس التدرج سيؤدي إلى قراءة خاطئة لعمق السوق.

TASK RTL-005: Flip Framer Motion Animations Directionally

· PROBLEM: slide-in-right, x:300 في P2P و NewsFeed.
· ROOT CAUSE: حركات فيزيائية.
· FILES: src/components/qtbm/P2PView.tsx, NewsFeedView.tsx, WalletView.tsx.
· STEPS:
  1. استبدال x: 300 بـ x: 300 * (dir === 'rtl' ? -1 : 1) حيث dir تُستخرج من useDirection() أو document.dir.
  2. استبدال slide-in-right بـ slide-in-${dir === 'rtl' ? 'left' : 'right'}.
  3. استبدال x: ['0%', '-50%'] (شريط متحرك) بـ x: ['0%', dir === 'rtl' ? '50%' : '-50%'].
· SUCCESS: شريط الأخبار يتحرك من اليمين إلى اليسار في RTL (أي من اليسار إلى اليمين بصرياً)، والرسائل تنزلق من الجهة الصحيحة.
· VERIFICATION: اختبار شاشة P2P والدردشة في وضع RTL.
· FAILURE MODES: استخدام dir من document قد يسبب اختلاف في التقديم (SSR). يجب استخدام useRouter أو next/navigation locale.

TASK RTL-006: Flip All Chevron Icons Directionally

· PROBLEM: ChevronRight في 15 مكاناً (Settings, KYC, Admin).
· ROOT CAUSE: أيقونة ثابتة.
· FILES: src/components/qtbm/SettingsView.tsx, MoreView.tsx, KYCView.tsx, AdminDashboardView.tsx.
· STEPS:
  1. استبدال <ChevronRight className="..." /> بـ <ChevronRight className={... ${dir === 'rtl' ? 'rotate-180' : ''}} />.
  2. أو استبدال مكون ChevronRight بـ ChevronLeft شرطياً.
  3. استبدال أيقونات ArrowLeft في أزرار الرجوع بـ ArrowRight في RTL.
· SUCCESS: جميع الأسهم تشير إلى اليمين في LTR وإلى اليسار في RTL (أي تشير إلى الأمام).
· VERIFICATION: المرور على جميع شاشات القائمة.

TASK RTL-007: Apply dir="ltr" to Wallet Hashes and Referral Codes

· PROBLEM: عناوين المحافظ والرموز (QTBM-7X9K2M) معرضة لإعادة الترتيب Bidi.
· ROOT CAUSE: عدم تحديد اتجاه.
· FILES: WalletView.tsx, DepositView.tsx, WithdrawView.tsx, ReferralView.tsx.
· STEPS:
  1. إضافة dir="ltr" إلى <span> أو <p> المحتوي على الهاش أو الرمز.
  2. إضافة className="inline-block" لتجنب كسر التخطيط.
· SUCCESS: الرمز QTBM-7X9K2M يظهر بالترتيب الصحيح دائماً.
· VERIFICATION: فحص شاشة الإحالة في RTL.

---

TYPOGRAPHY REMEDIATION PLAN

TASK FONT-001: Load Arabic Font via next/font

· PROBLEM: الخط العربي غير محمّل.
· ROOT CAUSE: layout.tsx يستورد فقط Geist مع subsets:["latin"].
· FILES: src/app/layout.tsx
· RISKS: استمرار اختلاف خط الأساس.
· STEPS:
  1. استيراد خط عربي (مثل Tajawal أو Noto Sans Arabic):
     ```tsx
     import { Tajawal } from 'next/font/google';
     const tajawal = Tajawal({
       weight: ['400', '500', '700'],
       subsets: ['arabic'],
       variable: '--font-tajawal',
     });
     ```
  2. إضافة المتغير إلى <html className={tajawal.variable}>.
  3. في globals.css، تعيين font-family: var(--font-tajawal), sans-serif; على body.
  4. الاحتفاظ بـ Geist للأرقام/اللاتينية أو دمجها عبر font-family: var(--font-tajawal), var(--font-geist), sans-serif;.
· SUCCESS: النصوص العربية تُرسم بخط Tajawal، والأرقام/اللاتينية بخط Geist (أو Tajawal إذا كان يدعمها).
· VERIFICATION: فتح أي شاشة تحتوي على عربي وأرقام في نفس السطر، ومقارنة المحاذاة.
· FAILURE MODES: قد يتسبب تحميل خطين في زيادة حجم الـ Bundle. يجب استخدام preload للخط العربي.

TASK FONT-002: Replace All text-[8px] and text-[9px] with Minimum text-xs (12px)

· PROBLEM: نصوص بحجم 8px و 9px تحت حد القراءة WCAG.
· ROOT CAUSE: محاولة ضغط العناصر.
· FILES: AdminDashboardView.tsx (شارة 8px), KYCView.tsx (9px), وغيرها.
· STEPS:
  1. استبدال text-[8px] بـ text-[10px] كحد أدنى مطلق، ولكن الأفضل text-xs (12px).
  2. إذا كان الـ Badge صغيراً جداً، إعادة تصميمه باستخدام scale(0.8) أو تغيير الـ Container.
· SUCCESS: أصغر نص في التطبيق هو 10px (مع إمكانية 12px).
· VERIFICATION: تشغيل أداة Wave أو Lighthouse للتحقق من تباين النصوص.
· FAILURE MODES: قد يكسر بعض التخطيطات المزدحمة، ولكن الوصولية أهم.

---

UI REMEDIATION PLAN

TASK UI-001: Normalize Button Heights to h-10 or h-9 Across All Screens

· PROBLEM: أزرار الرجوع h-8 و h-9 وأزرار الإغلاق h-7.
· ROOT CAUSE: عدم وجود نظام قياسي.
· FILES: جميع ملفات الشاشات التي تحتوي على أزرار رجوع وإغلاق.
· STEPS:
  1. توحيد جميع أزرار الرجوع على h-9 w-9.
  2. توحيد جميع أزرار الإغلاق (DialogClose) على h-9 w-9 (بدلاً من h-7).
  3. استخدام min-h-[44px] لأزرار النص الرئيسية (Submit, Trade, إلخ).
· SUCCESS: جميع أزرار الرجوع متساوية الحجم.
· VERIFICATION: فحص شاشات ConvertView, SwapView, SettingsView.

TASK UI-002: Standardize Border Radii in Modals

· PROBLEM: مودال ConvertView يستخدم rounded-2xl (مودال), rounded-xl (بطاقات), rounded-lg (صفوف).
· ROOT CAUSE: عدم وجود تصميم موحد.
· FILES: ConvertView.tsx, SwapView.tsx.
· STEPS:
  1. اختيار rounded-2xl للمودال الخارجي.
  2. اختيار rounded-xl للبطاقات الداخلية.
  3. اختيار rounded-lg للصفوف إذا كانت قابلة للنقر، وإلا rounded-none.
  4. تطبيق هذا المعيار على جميع المودالات (Portfolio, Strategy, Staking, إلخ).
· SUCCESS: جميع المودالات تتبع نفس التسلسل الهرمي للـ radius.
· VERIFICATION: فتح كل مودال في التطبيق ومقارنته.

TASK UI-003: Fix Progress Bar Height Standardization

· PROBLEM: h-1, h-1.5, h-2, h-2.5, h-6.
· ROOT CAUSE: استخدام ارتفاعات عشوائية.
· FILES: جميع ملفات الشاشات.
· STEPS:
  1. استخدام h-2 لجميع أشرطة التقدم الأساسية.
  2. استخدام h-1.5 للأشرطة الفرعية (في البطاقات).
  3. إزالة h-6 نهائياً (استبدالها بـ h-2).
· SUCCESS: أشرطة التقدم موحدة.
· VERIFICATION: فحص TradeChallengeView, VotingView.

---

MOBILE REMEDIATION PLAN

TASK MOBILE-001: Delete Global 44px Button Rule and Apply Targeted min-h-[44px]

· PROBLEM: قاعدة @media(max-width:768px){button{min-height:44px;min-width:44px}} تكسر الصفوف.
· ROOT CAUSE: قاعدة عامة غير ذكية.
· FILES: src/app/globals.css (سطور 3872-3882).
· STEPS:
  1. حذف القاعدة العامة بالكامل.
  2. إضافة min-h-[44px] فقط لأزرار الإجراءات الرئيسية (Submit, Buy, Sell, Confirm).
  3. أزرار الرجوع والإغلاق تحتفظ بـ h-9 w-9 بدون min-h-[44px] (تستثنى).
· SUCCESS: الصفوف المزدحمة (مثل FuturesView) لا تفيض أفقياً.
· VERIFICATION: فتح التطبيق على شاشة 360px والتحقق من أزرار الرجوع والتبويبات.

TASK MOBILE-002: Replace All h-[calc(100vh-8rem)] with h-dvh or Flexbox Layout

· PROBLEM: حساب ارتفاع ثابت (128px) غير دقيق على الموبايل.
· ROOT CAUSE: تجاهل شريط التنقل السفلي والـ Chrome.
· FILES: KYCView.tsx, SettingsView.tsx, MoreView.tsx, NotificationsView.tsx, SupportView.tsx, StrategyBotView.tsx, ConvertView.tsx (162), SwapView.tsx (202), TransactionDetailView.tsx (145), AIChatView.tsx.
· STEPS:
  1. استبدال h-[calc(100vh-8rem)] بـ h-dvh أو h-[100dvh] (Dynamic Viewport).
  2. أو إعادة هيكلة الـ Layout باستخدام Flexbox: flex flex-col h-dvh -> <ScrollArea className="flex-1" />.
  3. في AIChatView، استبدال h-[calc(100vh-4rem)] بـ h-dvh وجعل شريط الإدخال absolute bottom-0 مع pb-[env(safe-area-inset-bottom)].
· SUCCESS: شريط الإدخال في AIChat يصبح مرئياً. جميع الشاشات تحتل الارتفاع الصحيح.
· VERIFICATION: اختبار على أجهزة مختلفة (Chrome على Android مع شريط عنوان).

TASK MOBILE-003: Define .no-scrollbar CSS Class

· PROBLEM: MarketsView.tsx و P2PView.tsx يستخدمان no-scrollbar لكنه غير معرّف.
· ROOT CAUSE: نسيت إضافة الـ CSS.
· FILES: src/app/globals.css.
· STEPS:
  1. إضافة:
     ```css
     .no-scrollbar::-webkit-scrollbar {
       display: none;
     }
     .no-scrollbar {
       -ms-overflow-style: none;
       scrollbar-width: none;
     }
     ```
· SUCCESS: أشرطة التمرير الأفقية تختفي في MarketsView و P2PView.
· VERIFICATION: فتح MarketsView على الموبايل.

TASK MOBILE-004: Fix OTP Input Overflow on 360px

· PROBLEM: 6 خانات OTP (~348px) تفيض عن بطاقة Auth (~216px).
· ROOT CAUSE: عرض الخانة ثابت كبير جداً.
· FILES: src/components/qtbm/AuthView.tsx.
· STEPS:
  1. تقليل عرض كل خانة من w-12 إلى w-10 أو w-9.
  2. استخدام gap-1 بدلاً من gap-2.
  3. إضافة max-w-full للحاوية.
· SUCCESS: OTP يظهر داخل البطاقة في شاشة 360px.
· VERIFICATION: فتح AuthView على جهاز محاكى 360px.

TASK MOBILE-005: Fix Nested Scroll Conflicts (Horizontal inside Vertical)

· PROBLEM: FuturesView (556) و MarginView (514/576) تحتوي على overflow-x-auto داخل ScrollArea.
· ROOT CAUSE: تعارض لمس.
· FILES: FuturesView.tsx, MarginView.tsx.
· STEPS:
  1. إضافة touch-action: pan-x على الحاويات الأفقية.
  2. أو استخدام ScrollArea مع type="always" لإظهار أشرطة التمرير لتوعية المستخدم.
· SUCCESS: التمرير الأفقي لا يعطل التمرير العمودي.
· VERIFICATION: اختبار يدوي على شاشة لمس.

---

CSS REMEDIATION PLAN

TASK CSS-001: Remove All !important Declarations from globals.css

· PROBLEM: !important منتشرة في glass, text, z-index, modal bg (سطور 3884-3936).
· ROOT CAUSE: محاولة ترقيع cascade.
· FILES: src/app/globals.css.
· STEPS:
  1. حذف !important من جميع القواعد في النطاق المذكور.
  2. زيادة Specificity عن طريق مضاعفة الـ Class Names إذا لزم الأمر (مثل .glass.glass).
  3. إزالة أي قاعدة تفرض لوناً ثابتاً (#707785 !important) واستبدالها بمتغير.
· SUCCESS: globals.css لا يحتوي على أي !important.
· VERIFICATION: البحث عن !important في الملف يعطي 0 نتيجة.
· FAILURE MODES: قد تظهر بعض العناصر بلون خاطئ مؤقتاً، سيتم إصلاحها في TASK THEME-003.

TASK CSS-002: Consolidate Glass Definitions into a Single Set

· PROBLEM: 3 تعريفات لـ .glass, 3 لـ .glass-card, 3 لـ .glass-header.
· ROOT CAUSE: تراكم تعليمات برمجية.
· FILES: src/app/globals.css.
· STEPS:
  1. الاحتفاظ بتعريف واحد فقط لكل منها (يفضل التعريف الأول في سطر 215-235 لأنه يعكس نية المصمم الأصلي: blur 24px, alpha 0.6).
  2. حذف التعريفات المتكررة في السطور 1043, 1676, 2261, 3884-3902.
  3. تطبيق خصائص الشفافية باستخدام backdrop-filter و background-color مع opacity عبر rgba(var(--glass-bg), 0.6).
· SUCCESS: تغيير قيمة .glass في مكان واحد ينعكس على كل البطاقات.
· VERIFICATION: فحص CopyTrading Overview (كان 4 طبقات) أصبح بطبقتين شفافتين فقط.

---

Z-INDEX REMEDIATION PLAN

TASK Z-001: Replace Substring Selectors with Explicit Data Attributes

· PROBLEM: [class*="fixed inset-0"][class*="z-50"] في globals.css (3908) هش ولا يطابق z-[100].
· ROOT CAUSE: الاعتماد على ترتيب الكلاسات.
· FILES: src/app/globals.css.
· STEPS:
  1. إزالة الانتقاء [class*="..."].
  2. إضافة data-overlay="true" إلى جميع مكونات الـ Overlay في Dialog, Sheet, Drawer (تعديل مكونات Shadcn/ui).
  3. تعريف قاعدة [data-overlay="true"] { background-color: rgba(0,0,0,0.7) !important; /* مؤقتاً */ z-index: 60; }.
  4. استخدام !important مؤقتاً ثم إزالته لاحقاً بتحسين الـ specificity.
· SUCCESS: المودالات ذات z-[100] (ConvertView, SwapView, Portfolio) تحصل على خلفية صلبة rgba(0,0,0,0.7).
· VERIFICATION: فتح أي مودال z-[100] والتأكد من عدم نزيف الخلفية.

TASK Z-002: Fix Dialog Overlay vs Content Z-Index Conflict

· PROBLEM: Overlay مُجبَر على z-60, Content z-50. Overlay فوق المحتوى.
· ROOT CAUSE: قاعدة z-60 تُطبق على الـ Overlay فقط.
· FILES: src/app/globals.css, src/components/ui/dialog.tsx.
· STEPS:
  1. جعل Content z-60 أو z-[70] (أعلى من Overlay).
  2. أو إزالة z-60 من Overlay وجعلها z-50 مع z-60 للـ Content.
  3. التأكد من [data-radix-popper-content-wrapper] ليس z-30.
· SUCCESS: الـ Content يظهر فوق الـ Overlay وليس تحته.
· VERIFICATION: فتح Dialog مع Dropdown داخله.

TASK Z-003: Remove Forced z-30 on Radix Poppers

· PROBLEM: [data-radix-popper-content-wrapper]{z-index:30!important} يجعل Dropdowns مخفية داخل Dialog (z-60).
· ROOT CAUSE: قاعدة شاملة خاطئة.
· FILES: src/app/globals.css (سطر 3907).
· STEPS:
  1. حذف هذه القاعدة بالكامل.
  2. السماح للمكونات بإدارة z-index الخاص بها (عادةً z-50 بشكل افتراضي).
· SUCCESS: Dropdown داخل Dialog يظهر فوق الـ Dialog Content.
· VERIFICATION: فتح ConvertView أو SwapView والنقر على Select العملة.

TASK Z-004: Unify Z-Index Scale Across All Screens

· PROBLEM: استخدام z-10, z-20, z-30, z-40, z-50, z-[60], z-[100] بدون نظام (90 موضعاً).
· ROOT CAUSE: عدم وجود tokens.
· FILES: جميع ملفات الشاشات.
· STEPS:
  1. تعريف متغيرات CSS: --z-dropdown: 30; --z-sticky: 40; --z-modal: 60; --z-tooltip: 70; --z-toast: 80;.
  2. استبدال z-10 بـ z-[--z-dropdown] إذا كان منطقياً.
  3. استبدال z-[100] بـ z-modal (60) أو z-toast (80).
  4. استبدال z-[60] بـ z-modal.
· SUCCESS: جميع قيم z-index محصورة في 5-6 مستويات موحدة.
· VERIFICATION: فحص عناصر الـ DOM وحساب قيم z-index.

---

I18N REMEDIATION PLAN

TASK I18N-001: Wrap All Hardcoded English Strings with t() Function

· PROBLEM: "LIVE", "HOT", "PERP", "B", "S", "USDT", "APR", "APY", "ROI", "min ago", "hr ago" في كل الشاشات.
· ROOT CAUSE: تجاهل دالة الترجمة.
· FILES: TradeView.tsx:568, MarketsView.tsx:467, FuturesView.tsx (×4), TradeHistoryView.tsx:142, TransactionDetailView.tsx (174/179/402), AIChatView.tsx (6 أسئلة), AdminDashboardView.tsx (~30 حرفي), NotificationsView.tsx (type), SettingsView.tsx ('User', 'user@qtbm.bank'), EarnView.tsx, DeFiView.tsx, SocialFeedView.tsx, NewsFeedView.tsx (mock data).
· STEPS:
  1. استيراد useTranslation من next-i18next أو react-i18next.
  2. استبدال "LIVE" بـ {t('labels.live')}.
  3. استبدال "PERP" بـ {t('futures.perpetual')}.
  4. استبدال "B" و "S" بـ {t('orders.buy')} و {t('orders.sell')}.
  5. استبدال "min ago" بـ {t('time.minAgo')}.
  6. في AdminDashboardView، استبدال "lastActive", "flagged", "audit logs" بـ مفاتيح ترجمة.
  7. في AIChatView، ترجمة الأسئلة السريعة الـ6 إلى العربية وإضافتها كـ t('ai.questions.q1'), إلخ.
· SUCCESS: لا يوجد أي نص إنجليزي مرئي في التطبيق عند ضبط اللغة على ar.
· VERIFICATION: تعيين locale على ar والمرور على جميع الشاشات الـ42.
· FAILURE MODES: نسيان بعض النصوص. سيتم اكتشافها في اختبارات التنقل الشامل.

TASK I18N-002: Remove .toLowerCase() and .toUpperCase() on Arabic Strings

· PROBLEM: VotingView.tsx:679, TradeChallengeView.tsx:235, SavingsGoalsView.tsx:328 تستخدمها.
· ROOT CAUSE: عدم فهم أن العربية لا تحتوي على حالات.
· STEPS:
  1. إزالة هذه الدوال إذا كانت لمقارنة النصوص (استخدم localeCompare).
  2. إذا كانت لتنسيق العرض، استخدم t() مباشرة.
· SUCCESS: لا توجد تحويلات حالة على نصوص عربية.
· VERIFICATION: البحث عن .toLowerCase() في src/components/qtbm/.

TASK I18N-003: Fix Locale for Dates and Numbers

· PROBLEM: toLocaleDateString('en-US') و toLocaleString() بلا وسيط locale.
· FILES: PriceAlertsView.tsx:192, ConvertView.tsx:42-45, 7 شاشات أخرى.
· STEPS:
  1. استبدال 'en-US' بـ locale المستخرج من useRouter أو i18n.language.
  2. استخدام new Intl.NumberFormat(locale).format() للأرقام.
  3. استخدام new Intl.DateTimeFormat(locale, options).format() للتواريخ.
· SUCCESS: التواريخ تظهر بالتنسيق العربي (هـ / م) والأرقام العربية.
· VERIFICATION: فحص شاشة Price Alerts.

---

DATA REMEDIATION PLAN

TASK DATA-001: Replace All English Mock Data with Arabic Structured Data or Remove

· PROBLEM: NewsFeed, SocialFeed, Voting تعرض مقالات/منشورات/مقترحات بالإنجليزية بالكامل.
· ROOT CAUSE: Mock data مكتوبة للاختبار باللغة الإنجليزية.
· FILES: ملفات mock الـ10+ (مثل src/mocks/news.ts, social.ts, voting.ts).
· STEPS:
  1. إذا كانت البيانات تمثل محتوى مستخدم حقيقي مستقبلاً، تحويلها إلى بنية بيانات تحتوي على titleAr, titleEn, bodyAr, bodyEn.
  2. في المكونات، عرض item.titleAr أو item.title حسب اللغة.
  3. إذا كانت بيانات تطويرية بحتة، حذف الملفات واستخدام خدمة Firebase حقيقية مع بيانات أولية (Seed) بالعربية.
· SUCCESS: جميع المحتويات الظاهرة في NewsFeed و SocialFeed و Voting تكون بالعربية عند اختيار اللغة العربية.
· VERIFICATION: فتح هذه الشاشات الثلاث.

---

FIREBASE REMEDIATION PLAN

TASK FIREBASE-001: Enforce Authentication State in Every Client Request

· PROBLEM: التطبيق يسمح بطلبات غير مصادق عليها إلى Firestore.
· ROOT CAUSE: عدم استخدام onAuthStateChanged.
· FILES: QTBMApp.tsx (الجذر).
· STEPS:
  1. إنشاء Context AuthContext يحتوي على user و loading.
  2. استخدام onAuthStateChanged لتحديث user.
  3. عرض شاشة تحميل أثناء loading.
  4. توجيه المستخدم إلى AuthView إذا كان !user.
· SUCCESS: لا يمكن الوصول إلى شاشات التداول/المحفظة بدون تسجيل دخول.
· VERIFICATION: محاولة فتح /dashboard بدون تسجيل دخول.

TASK FIREBASE-002: Remove Duplicate API Keys

· PROBLEM: مفتاح API مكرر 3 مرات.
· ROOT CAUSE: نسخ لصق.
· FILES: .env.local, firebase/client.ts, firebase/admin.ts (إن وجد).
· STEPS:
  1. الاحتفاظ بالمفتاح في .env.local فقط.
  2. استيراده من process.env.NEXT_PUBLIC_FIREBASE_API_KEY في جميع الملفات.
· SUCCESS: تغيير المفتاح في .env ينعكس على كل مكان.
· VERIFICATION: البحث عن "AIza" في الملفات المصدرية يجب أن يعطي نتيجة واحدة فقط (باستثناء .env).

TASK FIREBASE-003: Fix FCM Service Worker Notification Fallback

· PROBLEM: عنوان الإشعار fallback إنجليزي "QTBM CRYPTO".
· ROOT CAUSE: قيمة ثابتة.
· FILES: public/firebase-messaging-sw.js, src/lib/fcm.ts.
· STEPS:
  1. استبدال العنوان بـ self.__WB_MANIFEST أو قراءة من localStorage إذا كان متاحاً.
  2. أو جعلها فارغة مع استدعاء t('appName') ولكن Service Worker لا يصل إلى i18n. الأفضل تعيين title: 'QTBM' كاسم قصير.
· SUCCESS: الإشعارات تظهر بالاسم الصحيح.

---

PERFORMANCE REMEDIATION PLAN

TASK PERF-001: Fix QR Code Re-render Loop in DepositView

· PROBLEM: Math.random() في DepositView.tsx:327-346 يعيد توليد الرمز كل Render.
· ROOT CAUSE: استخدام قيمة متغيرة غير مستقرة في الـ useEffect/useMemo.
· STEPS:
  1. إزالة Math.random() من منطق توليد QR.
  2. استخدام useMemo مع address كـ Dependency فقط.
  3. التأكد من أن مكون QR يستقبل address ثابت.
· SUCCESS: الرمز الـ QR لا يومض عند التحديث.
· VERIFICATION: فتح DepositView ومراقبة الـ QR.

TASK PERF-002: Fix flow-dot Animation (Dead Animation)

· PROBLEM: WalletView.tsx:114-135 يستخدم offset-distance بلا offset-path.
· ROOT CAUSE: نقص خصائص الحركة.
· STEPS:
  1. إضافة offset-path: path('...') أو إزالة الـ animation نهائياً إذا كانت غير ضرورية.
  2. إذا كانت ضرورية، استبدالها بـ transform: translateX مع @keyframes.
· SUCCESS: النقاط تتحرك كما هو متوقع أو تُزال.
· VERIFICATION: فتح WalletView.

---

ACCESSIBILITY REMEDIATION PLAN

TASK ACC-001: Add aria-label to All Icon-Only Buttons

· PROBLEM: أزرار الإغلاق والرجوع والبحث تحتوي على أيقونات فقط.
· FILES: جميع ملفات الشاشات.
· STEPS:
  1. إضافة aria-label={t('common.close')} إلى DialogClose.
  2. إضافة aria-label={t('common.back')} إلى أزرار الرجوع.
  3. إضافة aria-label={t('common.search')} إلى أيقونة البحث.
· SUCCESS: قارئ الشاشة يقرأ الأزرار.
· VERIFICATION: تشغيل Lighthouse (Accessibility > 90).

TASK ACC-002: Add role="status" to Toast Notifications

· PROBLEM: الإشعارات قد لا تُقرأ.
· FILES: src/components/ui/toast.tsx.
· STEPS:
  1. إضافة role="status" و aria-live="polite" إلى حاوية الـ Toast.
· SUCCESS: الإشعارات تُقرأ تلقائياً.
· VERIFICATION: تشغيل قارئ شاشة.

---

PRODUCTION ACCEPTANCE CRITERIA

لإعلان المشروع PRODUCTION READY، يجب تحقيق كل المعايير التالية دون استثناء:

1. SECURITY: api/auth/route.ts محذوف. Firebase Auth مفعل. Firestore Rules منشورة وتمنع الكتابة غير المصرح بها. جميع العمليات الحساسة تعمل عبر Cloud Functions.
2. THEME: نظام ثيم واحد (next-themes). لا توجد ألوان Hex ثابتة في src/components/qtbm. التبديل بين الفاتح والداكن يعمل على جميع الشاشات الـ42.
3. RTL: لا توجد أدوات left/right/pl/pr/ml/mr في src/components/qtbm. جميع العناصر المطلقة والمرنة تستخدم inset-inline-start/end أو start/end. التدرجات والحركات منقلبة أو مثبتة بـ dir="ltr".
4. TYPOGRAPHY: الخط العربي محمّل عبر next/font ويظهر بشكل متسق مع الأرقام.
5. MOBILE: لا توجد قاعدة 44px عامة. جميع الشاشات تستخدم dvh أو Flexbox. أشرطة التمرير الأفقية مخفية (no-scrollbar). OTP يظهر في 360px.
6. Z-INDEX: جميع المودالات تظهر فوق الـ Overlay. الـ Dropdowns داخل المودالات قابلة للنقر.
7. I18N: لا توجد نصوص إنجليزية Hardcoded في أي شاشة. جميع النصوص تمر عبر t().
8. DATA: Mock data إنجليزية مستبدلة ببيانات عربية أو بنية ثنائية اللغة.

---

ZERO-TOLERANCE CHECKLIST

البند الحالة
api/auth/route.ts موجود؟ FAIL (يجب أن يكون PASS بعد الحذف)
firestore.rules منشور ويمنع write: if true؟ FAIL
app-store.ts يحتوي على theme أو data-theme؟ FAIL
layout.tsx يستورد خطاً عربياً (subsets:['arabic'])? FAIL
أي ملف في qtbm يحتوي على bg-[# أو text-[#? FAIL
globals.css يحتوي على [dir="rtl"] مع left/right? FAIL
أي ملف يحتوي على right- أو left- (غير مستبدلة بـ inset)? FAIL
أي ملف يحتوي على pl- أو pr- أو ml- أو mr-? FAIL
globals.css يحتوي على !important? FAIL
globals.css يحتوي على [class*="z-50"]? FAIL
أي مودال z-[100] يظهر مع خلفية شفافة؟ FAIL
أي زر أصغر من h-9 في الشاشات المزدحمة؟ FAIL
AIChatView شريط الإدخال مخفي؟ FAIL
أي نص إنجليزي Hardcoded (LIVE, HOT, PERP) ظاهر؟ FAIL
toLocaleDateString('en-US') موجود؟ FAIL
NewsFeed يعرض محتوى إنجليزي؟ FAIL
flow-dot animation ميت؟ FAIL
no-scrollbar معرّف في globals.css؟ FAIL
DepositView QR Code يومض؟ FAIL