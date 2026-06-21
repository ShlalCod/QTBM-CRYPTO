# تقرير التدقيق الشامل لتطبيق QTBM CRYPTO
## فحص جودة الواجهات (UI/UX) — اللغة العربية، RTL، الشفافية، الموبايل، التناسق، النصوص

> **طبيعة المهمة:** تدقيق قراءة فقط (Read-Only Audit). لم يتم تعديل أو كتابة أو حذف أي سطر برمجي إطلاقاً.
> **البيئة المدققة:** تطبيق موبايل (Next.js 16 + Capacitor 8 → APK أندرويد)، Firebase هو الـ backend المُعلَن.
> **نطاق الفحص:** 42 شاشة (view) + 48 مكوّن واجهة + طبقة الثيم/الـ CSS (3994 سطر) + ملف i18n (3635 سطر) + Firebase + mini-services.
> **التاريخ:** جلسة تدقيق واحدة، أربعة مدققين فرعيين متوازيين + مدقق رئيسي.

---

## 0. ملخص تنفيذي (Executive Summary)

التطبيق **غير جاهز للإنتاج** كتطبيق مالي عربي. رغم أن البنية الوظيفية واسعة (42 شاشة، تداول/محفظة/استثمار/P2P/إدارة)، إلا أن طبقة العرض تعاني من **خلل هيكلي جذر** في خمسة محاور:

1. **نظام ثيم مزدوج ومتناقض** يجعل زر تبديل الوضع الفاتح/الداكن غير فعّال فعلياً.
2. **ألوان Hex مُرمّزة (hardcoded)** في كل الشاشات لا تستجيب للثيم → الوضع الفاتح مستحيل.
3. **تعامل RTL رقيعي (patchwork)** يجمع 3 استراتيجيات متضاربة → انكسارات اتجاهية منتشرة.
4. **تعريفات الشفافية (glass) مكررة ومتصارعة** مع حروب `!important` → نية المصمم تُلغى بصمت.
5. **أمان Firebase شبه معدوم** (لا قواعد أمان، مصادقة وهمية، تصعيد صلاحيات للمشرف بأي رمز 6 أرقام).

**متوسط درجات الجاهزة عبر الشاشات الأربع:** العربية ≈ 33% · RTL ≈ 40% · تداخل النصوص ≈ 50% · وضوح الشفافية ≈ 52% · وضوح المودالات ≈ 55% · انضغاط العناصر ≈ 40% · ثبات الموبايل ≈ 45% · الانكسار البصري ≈ 42% · **أمان Firebase ≈ 10%**.

**تقييم الجاهزية الإجمالي للإنتاج:** **غير جاهز (≈ 30%)**.

---

## A) تحديد وتصنيف المشاكل

### A.1 تصنيف حسب الشدة (عبر المشروع كاملاً)

| الشدة | العدد التقريبي | أمثلة رئيسية |
|------|----------------|--------------|
| **حرجة (Critical)** | ~60+ | مصادقة وهمية + تصعيد صلاحيات؛ غياب قواعد Firebase؛ نظام ثيم مكسور؛ ألوان hardcoded تُلغي الوضع الفاتح؛ خط عربي غير محمّل؛ z-index للمودالات يخفي محتواها خلف overlay؛ بطاقة QR تتوهّر بإعادة render؛ أزرار أقل من 44px تُجبَر للضغط فتكسر الصفوف |
| **متوسطة (Medium)** | ~100+ | نصوص إنجليزية hardcoded في كل شاشة؛ تاريخ/أرقام بـ locale ثابت 'en-US'؛ استعمال right-2/left-2/left-2.5 غير مشمول بقواعد القلب؛ تكرار تعريفات glass؛ شريط فئات NewsFeed على الجهة الخطأ في RTL؛ بيانات وهمية بالإنجليزية فقط |
| **بسيطة (Low)** | ~80+ | تضارب radius (2xl/xl/lg) في نفس المودال؛ اختلاف أحجام أزرار الرجوع (h-8 vs h-9)؛ اختلاف ارتفاع أشرطة التقدم (h-1/h-1.5/h-2/h-2.5/h-6)؛ اختلاف padding بين البطاقات المتشابهة |

### A.2 تصنيف حسب النوع (مع أمثلة المواقع الدقيقة)

> ملاحظة: كل موقع موثّق بصيغة `الملف:السطر`. أسماء الملفات مختصرة (الشاشات في `src/components/qtbm/`).

#### (1) مشاكل اللغة العربية والاتجاه — حرجة
- **نصوص إنجليزية hardcoded لا تمرّ بـ t()** في **كل** الشاشات الـ42:
  - TradeView:568 `"LIVE"` · MarketsView:467 `"HOT"` · FuturesView:105/131/147/297 `"PERP"` (×4) · TradeHistoryView:142 `"B"/"S"` · TransactionDetailView:174/179/402 (`tx.type`, `tx.status`, memo).
  - AIChatView: 6 أسئلة سريعة كاملة بالإنجليزية (`'What is Bitcoin?'`...) · AdminDashboardView: ~30+ حرفياً إنجليزي (lastActive, أسباب flagged orders, إجراءات audit logs, عناوين announcements) · NotificationsView: يعرض `notification.type` خام ('security','trade'...) · SettingsView: `'User'`, `'user@qtbm.bank'`, `'+1 ***-***-1234'` · SupportView: يعرض `ticketCategory` خام.
  - Earn/DeFi/Social: "APR"/"APY"/"ROI"/"USDT"/"d h m s"/"K M B" حرفياً في كل شاشة؛ NewsFeed/SocialFeed/Voting تعرض **نصوص المقالات/المنشورات/المقترحات بالإنجليزية بالكامل**؛ بيانات وهمية (mock data) بالإنجليزية فقط في 10+ ملفات.
- **تواريخ/أرقام بـ locale ثابت**: PriceAlerts:192 `toLocaleDateString('en-US', ...)` · ConvertView:42-45 `"min ago"/"hr ago"` · 7+ شاشات تستعمل `toLocaleString()` بلا وسيط locale → أرقام إنجليزية/لاتينية داخل واجهة عربية.
- **`.toLowerCase()`/`.toUpperCase()` على نصوص عربية**: VotingView:679, TradeChallengeView:235, SavingsGoalsView:328 — لا أثر وظيفي لكنه يدل على تفكير إنجليزي-أولاً.
- **اتجاهات فيزيائية غير مشمولة بقواعد القلب** (قواعد القلب في globals.css:3849-3869 تشمل فقط `pl-9/3/2/4`, `ml-1/2/3`, `mr-1/2/1.5`, `.absolute.left-0/.right-0`, `.fixed.left-0/.right-0`):
  - WithdrawView:318/344 + TransferView:372 `right-2` على أزرار اللصق/الحد الأقصى → تتداخل مع النص المكتوب في RTL.
  - AdminDashboardView: أيقونة بحث عند `absolute left-2.5` + حقل `ps-8` → الأيقونة تتداخل مع النص في RTL.
  - DialogClose/SheetClose: `absolute top-4 right-4` لا يُقلب → زر الإغلاق X يبقى أعلى-يمين بدل أعلى-يسار.
  - DropdownMenuItem: `pl-8` + مؤشر `absolute left-2` · SelectItem: `pr-8` + مؤشر `absolute right-2` — لا تشملها قواعد القلب.
  - NFTGalleryView:154 `top-2 right-2` (قلب المفضلة) · NewsFeedView:453 `top-3 left-3` (شارات الفئة) · ReferralView:322 `left-6` (رابط الموصل) · EarnView:340 `right-1` · CopyTradingView:454 `rounded-l-xl` (الحدود تُقلب لكن نصف القطر لا).
  - NewsFeedView:200-204 شريط فئات `border-l-[3px]` على كل بطاقة → يظهر على الجهة الخطأ في RTL.
  - ~15 أيقونة `ChevronRight` كعنصر قائمة لا تُقلب (SettingsView, MoreView, KYCView, AdminDashboardView).
  - SwapView:269 `right-2` على علامة نسبة الانزلاق (slippage %).
- **تدرجات SVG فيزيائية لا تُقلب**: TradeView:666/699 أعمدة عمق دفتر الأوامر (`linear-gradient(to left,...)`) — المرساة `.absolute.right-0` تُقلب لكن اتجاه التدرج لا → وزن اللون على الجهة الخطأ في العربية.
- **رسوم Framer Motion فيزيائية**: P2PView فقاعات الدردشة `slide-in-right` + `x:300` · NewsFeedView شريط متحرك `x:['0%','-50%']` · WalletView تدفقات `x:-N` — كلها بالاتجاه الخطأ في RTL.
- **أحرف سهمية hardcoded**: WalletView:478 `→` · SwapView أسهم المسار · NFTGalleryView سهم النشاط `←` في RTL.
- **خط عربي غير محمّل**: layout.tsx يستورد Geist + Geist_Mono بـ `subsets:["latin"]` فقط؛ globals.css:3822 يذكر "Tajawal/Noto Sans Arabic/Cairo" لكنها **غير مستوردة** عبر next/font أو @font-face → العربية تُرسم بخط النظام fallback، اللاتيني بـ Geist → خطوط أساس (baseline) مختلفة في نفس السطر عند مزج عربي + أرقام.
- **0 تواجد لـ `dir="ltr"`** في كل شاشات المحفظة (7 شاشات) → عناوين المحافظ/التحويلات/الهاشات معرّضة لإعادة ترتيب bidi في واجهة عربية.
- **ReferralView رمز الإحالة `"QTBM-7X9K2M"`** بلا `dir="ltr"` → الواصلة قد تُعيد ترتيب الرمز بصرياً في RTL.

#### (2) مشاكل الشفافية والتداخل البصري — حرجة
- **تعريفات glass مكررة 2-3 مرات بقيم متناقضة** في globals.css:
  - `.glass` : سطر 215 (blur 24px, rgba 0.6) ← يُعاد تعريفه سطر 3898 بـ `!important` (blur 6px, rgba 0.88).
  - `.glass-card`: سطر 222 (blur 24px, rgba 0.55) ← يُعاد سطر 3885 بـ `!important` (blur 8px, rgba 0.92).
  - `.glass-header`: سطر 230 (blur 32px, rgba 0.8) ← يُعاد سطر 3892 بـ `!important` (blur 12px, rgba 0.95).
  - تعريفات light-theme للـ glass تتكرر 3 مرات (سطور 168, 1676, 3940).
  - **النتيجة:** نية المصمم الأصلية (blur قوي + طبقات شفافة) تُلغى بصمت بقواعد `!important` اللاحقة.
- **`!important` على نص ثانوي**: globals.css:3936 يجبر `text-[#5E6673]` على `#707785 !important` في ~40+ موضعاً → اللون المعروض ≠ المحدد.
- **خلفيات مودالات z-[100] لا تُصلبة**: globals.css:3908-3921 يجبر خلفية المودالات على `rgba(0,0,0,0.7)` لكنه **يطابق فقط** `z-50` و `z-[60]` (مطابقة substring). المودالات الآتية بـ `z-[100]` **لا تُطابق** فتبقى بشفافية 40% تنزف منها الخلفية:
  - ConvertView:71 · SwapView:79 · PortfolioAnalyticsView:748 (AIRebalanceModal) · StrategyBotView:333 · Staking/Savings/CopyTrading/Leaderboard/PriceAlerts.
- **z-index متناقض داخل الـ Dialog**: globals.css:3908 يجبر overlay (`fixed inset-0 z-50`) على `z-index:60 (!important)`. لكن content (`fixed top-[50%] left-[50%] z-50`) **لا يُطابق** الانتقاء فيبقى z-50 → **الـ overlay فوق المحتوى** (z-60 > z-50). الترتيب البصري يُعوَّض بترتيب DOM لكن قيم z-index متناقضة.
- **`[data-radix-popper-content-wrapper]` يُجبَر على z-30**: globals.css:3907 → كل Popovers/Dropdowns/Selects/Tooltips تصبح z-30، **أي منها داخل Dialog (z-60) يكون مخفياً أسفله وغير قابل للنقر**.
- **بطاقات hero مزدحمة الطبقات**: كل بطاقة بطل (SavingsGoals, Launchpad, DeFi, Leaderboard, CopyTrading, Voting, TradeChallenge, Referral) تجمع: `bg-gradient-to-br from-.../X via-transparent to-.../Y` + `animate-gradient-shift` + شريط علوي مطلق + `glass-card` (!important 0.92) → بصرياً موحل (muddy) مع تقليل تباين الأرقام البطولية.
- **بطاقة CopyTrading overview**: 4 طبقات شفافية متراكمة (`/80` + `backdrop-blur-xl` + `glass-card` + تدرج `/8`).
- **تحذيرات مخاطر بشفافية 5%**: FuturesView:598 `bg-[#F6465D]/5` · MarginView:609 `bg-[#F0B90B]/5` — لإشعارات مخاطر عالية (تصفية عقود آجلة/نداء هامش) الـ5% تجعلها تتلاشى بصرياً.
- **رسم بياني خلف نصوص**: TradeView شبكة الرسم (chart-grid-bg) بـ `opacity-40` فوق lightweight-charts → يقلل وضوح تسميات المؤشرات.
- **رأس AIChatView**: alpha 80% + شريط إدخال لاصق → تنزف الرسائل خلفه.
- **`flow-dot` معطّل**: WalletView:114-135 + globals:2914-2938 يستعمل `offset-distance` بلا `offset-path` → النقاط لا تتحرك أصلاً (animation ميت).

#### (3) مشاكل الموبايل — حرجة
- **قاعدة اللمس العامة تكسر الصفوف المزدحمة**: globals.css:3872-3882 تُجبر كل الأزرار على 44×44px تحت 768px (باستثناء الجداول). النتيجة:
  - كل زر رجوع `h-8 w-8`/`h-9 w-9` يُفرض 44px → يفيض عن صفوف `h-8` (FuturesView, MarginView, ConvertView, SwapView, OrderHistory, TradeHistory, TransactionDetail).
  - أزرار الإغلاق `h-7 w-7` (ConvertView:88, SwapView:96) تُفرض 44px فتفيض عن صف `h-8`.
  - SocialFeed زر المتابعة h-6 (24px→44px) يشوه صفوف المتداولين · P2P أزرار الرسائل السريعة · NewsFeed أزرار المشاركة/الحفظ · CopyTrading/TradeChallenge صفوف بأزرار h-7 مزدوجة تفيض أفقياً على 360px.
- **جداول/شبكات أعرض من الشاشة**: TradeView:968 شبكة 7 أعمدة (40px/عمود على 360px) · TradeHistoryView:96 شبكة 12 عمود (24px/وحدة) · FuturesView:444 جدول 10 أعمدة · MarginView:514/576 جدولا 9 و5 أعمدة · AdminDashboard جدولان 7 و6 أعمدة — كلها بـ `overflow-x-auto` بلا إشارات تمرير بصرية.
- **OTP على 360px**: AuthView 6 خانات (~348px) تفيض عن مساحة البطاقة (~216px) → قص.
- **شريط إدخال AIChatView مغطّى**: `h-[calc(100vh-4rem)]` على الموبايل والديسكتوب معاً؛ الموبايل يحتاج 7rem (112px chrome) → شريط الإدخال **مخفي خلف شريط التنقل السفلي** (~48px مقطوعة).
- **ارتفاع ScrollArea خاطئ**: 6 شاشات (KYC, Settings, More, Notifications, Support, StrategyBot) تستعمل `h-[calc(100vh-8rem)]` وتفترض 128px chrome، الحقيقي 112px → 16px سوء محاذاة.
- **حساب viewport رياضي هش**: ConvertView:162, SwapView:202, TransactionDetailView:145 `h-[calc(100vh-8rem)]` يفترض رأساً 128px بينما الفعلي ~56px رأس + رأس فرعي.
- **عناوين لزجة تبتلع الشاشة**: OrderHistoryView:212 رأس لزك ~140px · TradeHistoryView رأسان لزكان متداخلان ~110px → >30% من شاشة الموبايل قبل المحتوى.
- **scroll أفق داخل scroll عمودي**: FuturesView:556, MarginView:514/576/191 → صراع لمس على الموبايل.
- **صنف `no-scrollbar` غير معرّف**: MarketsView:363 + P2PView:125 يستعملانه لكن لا تعريف CSS له → أشرطة تمرير قبيحة ظاهرة.
- **شريط 9 تبويبات أفقية**: MarketsView على 360px مزدحم.
- **بطاقة QR تتوهّر**: DepositView:327-346 — "الرمز" هو أيقونة QrCode تتغيّر + شبكة `Math.random()` تُعاد توليدها كل render (وميض).

#### (4) مشاكل التناسق — متوسطة/حرجة
- **ألوان hardcoded مقابل tokens مختلطة في نفس الشاشة**: كل شاشات qtbm تستعمل `bg-[#0B0E11]/[#1E2329]/[#2B3139]`, `text-[#EAECEF]/[#F0B90B]/[#848E9C]/[#5E6673]/[#0ECB81]/[#F6465D]` حصرياً، بينما shadcn/ui primitives تستعمل tokens (`bg-background`...) → تباين ثيمي بين المكوّنات في نفس الصفحة.
- **ثلاثة أنصاف أقطار في مودال واحد**: ConvertView و SwapView يمزجان `rounded-2xl` (مودال) + `rounded-xl` (بطاقات داخلية) + `rounded-lg` (صفوف التوكنز).
- **حجم زر رجوع غير موحّد**: نصف الشاشات `h-9 w-9`، النصف الآخر `h-8 w-8`.
- **حديقة ارتفاعات أشرطة التقدم**: h-1 / h-1.5 / h-2 / h-2.5 / h-6 بلا معيار.
- **`text-[8px]`/`text-[9px]`/`text-[10px]`** منتشرة (AdminDashboard شارة `text-[8px]`, KYC `text-[9px]`) — تحت حد مقروئية WCAG، يفاقمه عدم تحميل خط عربي.
- **padding/margin/border-radius/font-weight متفاوتة** بين البطاقات المتشابهة عبر الشاشات.

#### (5) مشاكل النصوص — متوسطة
- **عناوين محافظ/هاشات مقطوعة بلا tooltip**: WalletView/DepositView/WithdrawView عناوين طويلة بلا `break-all`/`truncate` موثوق.
- **رسالة بطاقة هدية مقطوعة**: GiftCardsView:319 `max-w-[180px]` + truncate → محتوى المستخدم يُفقد بلا توسعة.
- **طريقة دفع P2P مقطوعة**: P2PView:361.
- **`.truncate` بلا توسعة**: NFTGalleryView:161 (الاسم), VotingView:690 (عنوان في مودال `max-w-[200px]`), VotingView:607 (اسم في السجل).
- **نصوص فوق خلفيات شفافة/صور**: NFTGallery (وسم سعر فوق صورة), Leaderboard (منصة بطلية بتدرج + توهج + نص), NewsFeed/SocialFeed (طبقات فوق صور).
- **نصوص مختلطة لغة**: "USDT المحفظة", "APY 12.5% سنوي", "VIP 1", "Spot→Funding" داخل واجهة عربية.

---

## B) التحليل الجذري (Root Cause Analysis)

| # | المشكلة | السبب الجذري | النوع |
|---|---------|--------------|-------|
| B1 | زر الثيم (فاتح/داكن) لا يعمل | **نظاما ثيم متصارعان**: next-themes (layout.tsx) يبدّل `.dark` class بـ `attribute="class"` + `enableSystem=false` + defaultTheme="dark" + hardcoded `className="dark"`؛ لكن app-store.ts يبدّل `data-theme` attribute مستقلاً ولا يستدعي setter الخاص بـ next-themes → `.dark` لا تُزال أبداً | هيكلي (طبقة الثيم) |
| B2 | الوضع الفاتح مستحيل لشاشات qtbm | **ألوان Hex مُرمّزة** (`bg-[#0B0E11]`...) في كل الشاشات بدل tokens (`bg-background`). حتى لو أُصلح B1، الألوان لا تستجيب لمتغيرات الثيم | هيكلي (طبقة العرض) |
| B3 | شفافية glass غير متسقة | **تعريفات مكررة بـ `!important`**: المصمم الأصلي وضع blur قوي + alpha منخفض (سطور 215-235)؛ لاحقاً أُضيف block "Solidify" (3884-3902) بـ `!important` و blur أضعف بكثير وأعلى alpha. القاعدة اللاحقة تفوز → نية المصمم تُلغى. ظهور 3 نسخ من تعريف light-glass يدل على تراكم ترقيعي | هيكلي (CSS cascade) |
| B4 | حروب `!important` | محاولة ترقيع مشاكل cascade و specificity ناتجة عن B1+B3 بـ `!important` على (glass, text color, z-index, modal bg) → هشاشة، أي تجاوز محلي يُلغى | هيكلي |
| B5 | انكسارات RTL منتشرة | **3 استراتيجيات RTL متضاربة**: (أ) logical properties جيدة في الهيكل (QTBMApp)؛ (ب) physical utilities (left/right/pl/pr/ml/mr/text-left) بكثرة داخل الشاشات؛ (ج) قواعد قلب CSS (3849-3869) تشمل مجموعة صغيرة جداً فقط. الفجوات (pl-5/6/8, pr-*, ml-4+, mr-3+, left-N/right-N لـN>0, left-[..]/right-[..]) كلها غير منقلبة | هيكلي (منطق RTL) |
| B6 | خط عربي غير متسق | **الخط غير محمّل**: layout.tsx يستورد Geist بـ `subsets:["latin"]` فقط؛ globals.css يذكر خطوطاً عربية لم تُستورد. النتيجة: عربي بخط النظام، لاتيني/أرقام بـ Geist، خطوط أساس مختلفة في نفس السطر | هيكلي (تحميل الخطوط) |
| B7 | نصوص إنجليزية في واجهة عربية | **بيانات وهمية بالإنجليزية + حرفيات hardcoded تتجاوز t()**: شجرة i18n نفسها مغطاة جيداً، لكن الشاشات تعرض حقول بيانات خام (`notification.type`, `tx.type`, نصوص mock) ولا تمررها عبر t(). fallback آلية ar→en→raw key تخفي المفاتيح المفقودة | منطق برمجي + بيانات |
| B8 | مودالات z-[100] تنزف خلفيتها | **انتقاء substring هش**: `[class*="fixed inset-0"][class*="z-50"]` يطابق z-50/z-[60] فقط. z-[100] غير مشمول، وكذلك z-40/z-[55]/z-[70]. والانتقاء يعتمد على ترتيب الصنف في الـ attribute | هيكلي (CSS selectors) |
| B9 | Select/Dropdown داخل Dialog مخفي | **قاعدة z-index شاملة مفرطة**: `[data-radix-popper-content-wrapper]{z-index:30!important}` تُسقط كل popovers تحت z-60 للـ Dialog. قاعدة صُممت لحماية الـ header (z-50) لكنها تُصيب كل popper | هيكلي (z-index scale) |
| B10 | أزرار صغيرة تكسر الصفوف | **قاعدة لمس عامة**: `@media(max-width:768px){button{min-height:44px;min-width:44px}}` (باستثناءات قليلة). حسنة النية لكنها تُجبر أزرار h-6/h-7/h-8 داخل صفوف مزدحمة فتفيض أفقياً | هيكلي (CSS global) |
| B11 | انكسار محاذاة على الموبايل | **حساب viewport رياضي هش**: `h-[calc(100vh-Nrem)]` بقيم ثابتة تفترض ارتفاعات رأس غير دقيقة، لا تستعمل `dvh`/`svh` أو flexbox | هيكلي (layout) |
| B12 | أمان شبه معدوم | **مصادقة وهمية + لا قواعد Firebase**: api/auth/route.ts يقبل أي كلمة مرور ≥6 حرف، أي رمز 2FA من 6 أرقام يمنح `role:'admin'`، لا JWT/كوكي/جلسة، getAuth() مُهيأ لكن غير مستخدم. لا firestore/database/storage.rules ملتزم بها | منطق برمجي + أمان |

---

## C) تقييم الجاهزية ومعايير النجاح

| المعيار | النسبة الحالية | التقدير |
|---------|----------------|---------|
| هل العربية تظهر سليمة؟ | **~33%** | لا — نصوص hardcoded بالإنجليزية في كل شاشة، بيانات وهمية بالإنجليزية، تواريخ/أرقام بـ locale 'en-US'، خط عربي غير محمّل، `.toLowerCase()` على عربي |
| هل اتجاه الواجهة صحيح في كل صفحة؟ | **~40%** | لا — قواعد قلب CSS ناقصة، physical utilities غير مشمولة منتشرة (right-2, left-2.5, left-6...)، تدرجات SVG فيزيائية، حركات Framer فيزيائية، ~15 أيقونة سهم لا تُقلب، شريط فئات NewsFeed على الجهة الخطأ |
| هل النصوص تتداخل؟ | **~50%** (أي تتداخل جزئياً) | نعم، جزئياً — شبكة رسم خلف نصوص، رؤوس لزجة تبتلع 30%+ من الشاشة، بطاقات hero مزدحمة الطبقات، شريط إدخال AIChat مغطّى |
| هل الشفافية تفسد القراءة؟ | **~52%** | نعم، جزئياً — المودالات z-[100] تنزف 40%، تحذيرات مخاطر 5% alpha، بطاقات hero موحلة، لكن glass-card المُجبَرة (0.92) تصلح معظم البطاقات |
| هل المودالات والحوارات واضحة؟ | **~55%** | لا بالكامل — overlay فوق content (z-60>z-50)، Select/Dropdown/Tooltip داخل Dialog **مخفية**، X لا يُقلب في RTL، مودالات z-[100] فوق toasts |
| هل العناصر لا تنضغط فوق بعضها؟ | **~40%** | لا — قاعدة 44px تُكسر الصفوف المزدحمة، جداول أعرض من الشاشة، OTP يفيض، شريط إدخال AIChat مغطّى |
| هل التخطيط ثابت على الموبايل؟ | **~45%** | لا — حساب viewport هش، scroll متداخل، رؤوس لزكة عملاقة، `no-scrollbar` غير معرّف، انكسار على 320-360px |
| هل يوجد كسر بصري في الشاشات الأساسية أو الفرعية؟ | **~42%** (أي يوجد كسر) | نعم — TradeView شبكة خلف رسم، MarketsView no-scrollbar، ConvertView/SwapView 3 radius + z-[100] ينزف، AuthView OTP يفيض، AIChat إدخال مغطّى، NewsFeed شريط فئة خاطئ، P2P دردشة تنزلق بالاتجاه الخطأ |
| **أمان Firebase / صحة الـ backend** | **~10%** | حرج — لا قواعد أمان، مصادقة وهمية، تصعيد صلاحيات، لا جلسة، مفتاح API مكرر 3 مرات، أيقونات إشعارات مفقودة، price-stream بيانات محاكاة + CORS مفتوح + subscription منطق ميت |

**الجاهزية الإجمالية للإنتاج:** **غير جاهز (~30%)**.

---

## D) المخرجات المطلوبة

### المخرج 1 — تقرير مفصل بالمشاكل المكتشفة
→ مُقدَّم بالكامل في **القسم A** أعلاه، مع تصنيف حسب الشدة (حرجة/متوسطة/بسيطة) وحسب النوع (5 فئات) ومواقع دقيقة (`ملف:سطر`). التفاصيل الكاملة بكل سطر برمجي موثّقة في ملف `/home/z/my-project/worklog.md` (1244 سطر) ضمن أقسام المهام 4-a/4-b/4-c/4-d.

### المخرج 2 — قائمة الأماكن التي تسبب التداخل أو الخلل (مع نوع الخلل)

| الموقع | نوع الخلل |
|--------|-----------|
| ConvertView:71, SwapView:79 (z-[100] modals) | شفافية — خلفية تنزف 40% |
| PortfolioAnalyticsView:748 (AIRebalanceModal z-[100]) | شفافية — chart ينزف |
| StrategyBotView:333 (z-[100]) | شفافية + z-index فوق toasts |
| Staking/Savings/CopyTrading/Leaderboard/PriceAlerts (z-[100] modals) | شفافية — لا تُصلب |
| TradeView:666,699 (SVG gradient `to left`) | تداخل بصري — وزن اللون بالجهة الخطأ في RTL |
| TradeView chart-grid-bg opacity-40 | تداخل — شبكة خلف تسميات المؤشرات |
| OrderHistoryView:212, TradeHistoryView:43+96 | تداخل — رؤوس لزكة تبتلع 30%+ من الشاشة |
| CopyTrading overview (4 طبقات شفافية) | تداخل — موحل |
| Leaderboard podium (gradient + glow + text) | تداخل — تباين منخفض |
| NFTGallery CardContent `-mt-8` | تداخل — فوق تلاشي الصورة السفلي |
| AIChatView input bar (`h-[calc(100vh-4rem)]`) | تداخل — مخفي خلف شريط التنقل السفلي |
| AdminDashboardView search icon (`absolute left-2.5` + `ps-8`) | تداخل — أيقونة فوق النص في RTL |
| AuthView OTP (6 خانات ~348px) | تداخل — يفيض عن البطاقة 216px |
| FuturesView/MarginView/TradeView/TradeHistory جداول | تداخل — أعرض من 360px |
| WithdrawView:318/344, TransferView:372 (`right-2` + `pe-16`) | تداخل — أزرار فوق النص المكتوب في RTL |
| globals.css:3908-3909 (overlay z-60 > content z-50) | تداخل — overlay فوق محتواه |
| globals.css:3907 (Radix popper z-30) | تداخل — Select/Dropdown داخل Dialog مخفي |
| WalletView:114-135 (`flow-dot` بلا offset-path) | خلل — animation ميت |
| MarketsView:363, P2PView:125 (`no-scrollbar` غير معرّف) | خلل — صنف بلا تعريف |
| OrderHistoryView:82 (منطق) | خلل — أوامر محددة مُعنونة "Market" |
| DepositView:327-346 (QR بـ Math.random) | خلل — وميض + غير حقيقي |
| PortfolioAnalyticsView:321 (SVG `<text>` "$45.6K" ثابت) | خلل — لا يتطابق مع الرأس الحي |

### المخرج 3 — مواطن الاختلال في RTL واللغة (قائمة مكثفة)

**اتجاه (RTL):**
- قواعد قلب CSS ناقصة (globals.css:3849-3869): لا تشمل `pl-5/6/8/10`, `pr-*`, `ml-4+`, `mr-3+`, `left-N`/`right-N` لـ N>0, `left-[..]`/`right-[..]`, `top-N right-N` المركبة.
- شريط التنقل السفلي (QTBMApp:499) مؤشر "pill" يتحرك بـ `left: %` فيزيائي → يهبط على التبويب الخطأ في العربية.
- أيقونات سهمية: ~15 `ChevronRight` (Settings/More/KYC/Admin)، `ArrowLeft` أزرار رجوع، `→`/`←` حرفية (Wallet:478, Swap, NFT).
- تدرجات فيزيائية: `bg-gradient-to-r` للأسطح التقدمية (TradeChallenge:137, Voting:286) تُقرأ بالعكس في RTL؛ TradeView order-book depth `linear-gradient(to left)`.
- حركات فيزيائية: P2P دردشة `slide-in-right`/`x:300`، NewsFeed شريط `x:['0%','-50%']`، WalletView `x:-N`.
- نوافذ: Sheet `side="right"` يُقلب لليسار بـ RTL لكن الأنيميشن يأتي من اليمين (sheet.tsx:63)؛ Drawer `direction=right` يُفسد (drawer.tsx:62)؛ DialogClose/SheetClose `top-4 right-4` لا يُقلب.
- عناصر قائمة: DropdownMenuItem `pl-8`+مؤشر`left-2`، SelectItem `pr-8`+مؤشر`right-2`، Shortcut `ml-auto`، SubTrigger `ChevronRight ml-auto`.
- NewsFeed:200-204 شريط فئة `border-l-[3px]` على كل بطاقة (جهة خطأ).
- CopyTrading:454 `rounded-l-xl` (نصف القطر لا يُقلب).
- AIChatViewذيول الفقاعات `rounded-br-md`/`rounded-bl-md` فيزيائية.
- SupportView زر الدردشة العائم `fixed right-4` لا يُقلب.
- AdminDashboard أيقونة بحث `absolute left-2.5`.
- NFTGallery:154 `top-2 right-2`، NewsFeed:453 `top-3 left-3`، Referral:322 `left-6`، Earn:340 `right-1`.

**لغة:**
- نصوص hardcoded في كل شاشة الـ42 (انظر A.2-1).
- بيانات وهمية بالإنجليزية فقط (10+ ملفات mock).
- تواريخ `toLocaleDateString('en-US')` و `toLocaleString()` بلا locale في 7+ شاشات.
- `.toLowerCase()`/`.toUpperCase()` على نصوص (Voting:679, TradeChallenge:235, SavingsGoals:328).
- خط عربي غير محمّل (B6).
- fallback i18n ar→en→raw يخفي المفاتيح المفقودة بصمت.
- رسالة `alert()` أصيلة في TradeView:767 (غير مُترجمة).
- FCM service worker عنوان إشعار fallback إنجليزي (`"QTBM CRYPTO"`).

### المخرج 4 — مواطن الاختلال في الشفافية والطبقات

**تعريفات متصارعة:**
- `.glass` / `.glass-card` / `.glass-header` معرّفة 2-3 مرات (globals.css: 215-235, 1043, 1676, 2261, 3884-3902) مع `!important` في الأخيرة تنسخ نية المصمم.
- light-glass معرّف 3 مرات (168, 1676, 3940).
- `.tabular-nums` معرّف مرتين (648, 3836)؛ `.pulse-badge` مرتين (2997, 3340)؛ `.heatmap-cell` مرتين (2968, 3596).

**z-index:**
- مقياس tokens معرّف (`--z-base/sticky/dropdown/header/modal/toast` = 0/10/30/50/60/80) لكن غير مُتبع: شاشات تستعمل z-10/z-20/z-30/z-40/z-50/z-[60]/z-[100] حرفياً (90 موضعاً).
- `[data-radix-popper-content-wrapper]{z-index:30!important}` تُسقط كل popovers تحت Dialog (z-60).
- overlay (z-50→مُجبَر 60) فوق content (z-50) متناقض.
- مودالات z-[100] فوق `--z-toast:80` (toasts تختفي) + لا تُطابق انتقاء التصلبة.
- Voting z-[60] vs بقية z-[100] — عدم اتساق.

**حروب `!important`:**
- glass (3904-3902), `.text-[#5E6673]→#707785` (3936), z-index header/nav/dropdown/modal (3905-3909), خلفيات modal (3911-3921) — كلها `!important`.

**شفافية مفرطة:**
- تحذيرات مخاطر `bg-[#F6465D]/5` (Futures:598), `bg-[#F0B90B]/5` (Margin:609).
- بطاقات hero 4 طبقات (CopyTrading overview).
- disabled PriceAlerts `opacity-60 × /80 = 48%` فعّال.
- AIChatView رأس 80% alpha + شريط إدخال لاصق.
- TradeView chart-grid `opacity-40` خلف تسميات.

### المخرج 5 — مواطن الاختلال في تجربة الموبايل

**أهداف لمس:**
- قاعدة 44×44 عامة (globals:3872-3882) تكسر: أزرار رجوع h-8/h-9 (كل شاشات), أزرار إغلاق h-7 (Convert:88, Swap:96), أزرار متابعة h-6 (SocialFeed), أزرار رسائل سريعة (P2P), أزرار مشاركة/حفظ p-1.5 (NewsFeed), أزواج أزرار h-7 (CopyTrading/TradeChallenge), صوت تصويت h-7 (Voting), نسخ رمز h-8 (Referral), أزرار إجراء admin h-6 w-6 (AdminDashboard), زر إرسال AIChat 40px, أزرار رفض h-4 VIP badge.

**فيضان أفق/عرض:**
- OTP 6 خانات على 360px (AuthView).
- جداول 7-12 عمود (TradeView, FuturesView, MarginView, TradeHistoryView, AdminDashboard).
- شريط 9 تبويبات (MarketsView).
- 7 أزرار رفع سريع (FuturesView).
- رؤوس بحبات إحصاء 3 (OrderHistoryView).

**ارتفاع/scroll:**
- `h-[calc(100vh-8rem)]` هش في 6+ شاشات (KYC/Settings/More/Notifications/Support/StrategyBot) — يفترض 128px chrome.
- AIChat `h-[calc(100vh-4rem)]` — يغطي شريط الإدخال.
- رؤوس لزكة عملاقة (OrderHistory ~140px, TradeHistory ~110px).
- scroll أفق داخل عمودي (FuturesView:556, MarginView:514/576/191).
- `no-scrollbar` غير معرّف (MarketsView:363, P2PView:125).

**عناصر مطلقة:**
- `absolute -top-1.5 -right-1.5` شارات إشعار (WalletView:106/124/141).
- `flow-dot` inline `left:%` (WalletView:116-134).
- موصل `left-6` (Referral:322).
- blobs تزيينية `translate-x-*` (SavingsGoals, Launchpad, DeFi, Leaderboard).

### المخرج 6 — خريطة أولية لترابط المشاكل

```
نظام الثيم المزدوج (B1) ──┬──> الوضع الفاتح مكسور (B2) ──> ألوان hardcoded ──> تباين منخفض على خلفيات فاتحة
                         └──> .dark لا تُزال ──> dark: variants تبقى ──> مودالات/أزرار تظهر داكنة في "light"

تعريفات glass مكررة (B3) ──┬──> !important wars (B4) ──> تجاوزات محلية تُلغى
                           └──> نية المصمم مُلغاة ──> بطاقات موحلة (hero) ──> تباين أرقام بطولية منخفض

RTL رقيعي (B5) ──┬──> قواعد قلب ناقصة ──> right-2/left-2.5/left-6 غير منقلبة ──> أزرار فوق نص / شارات بجهة خطأ
                 ├──> تدرجات SVG فيزيائية ──> أعمدة عمق بالجهة الخطأ (TradeView)
                 ├──> حركات Framer فيزيائية ──> دردشة/شريط بالاتجاه الخطأ (P2P/NewsFeed)
                 └──> أيقونات سهمية لا تُقلب ──> ChevronRight/ArrowLeft في 15+ موضع

z-index scale غير مُتبع (B8/B9) ──┬──> مودالات z-[100] تنزف ──> شفافية تفسد القراءة
                                  ├──> overlay فوق content ──> محتوى مودال قد يُحجب
                                  └──> popovers z-30 ──> Select/Dropdown داخل Dialog مخفي ──> إدخال مستحيل

قاعدة 44px عامة (B10) ──> أزرار صغيرة تُجبَر ──> صفوف مزدحمة تفيض أفقياً ──> انكسار على 360px
                       └──> رؤوس تفيض ──> قص عناوين

بيانات وهمية إنجليزية (B7) ──┬──> NewsFeed/SocialFeed/Voting محتوى كامل إنجليزي
                             ├──> AdminDashboard ~30 حرفي ──> لوحة إدارة غير عربية
                             └──> fallback i18n يخفي المفقود ──> مفاتيح ناقصة لا تُرصد

حساب viewport هش (B11) ──┬──> AIChat إدخال مغطّى
                          └──> 6 شاشات scroll misaligned 16px

مصادقة وهمية + لا قواعد (B12) ──> تصعيد صلاحيات ──> كل العمليات الحساسة غير محمية
                                  └──> KYC/إيداع/سحب/تداول بلا هوية موثقة
```

**أثر متبادل بارز:**
- مشكلة الهيكل (QTBMApp) **تؤثر** على كل الأقسام الفرعية: نظام الثيم المكسور + قاعدة 44px + z-index scale تظهر في كل شاشة.
- مشكلة RTL الرقيعية **تنتقل** عبر المكوّنات المشتركة: DialogClose/SheetClose/SelectItem/DropdownMenuItem كلها تستعمل `right-4`/`left-2` غير منقلبة → كل مودال/قائمة منسدلة في كل شاشة معطوبة في RTL.
- البيانات الوهمية الإنجليزية **تُلغي** قيمة شجرة i18n الجيدة: حتى لو أُصلحت كل المفاتيح، التجربة العربية مكسورة لأن المحتوى الفعلي (مقالات/منشورات/مقترحات/سجلات) إنجليزي.

### المخرج 7 — أجزاء غير قابلة للإصلاح بسهولة (مع السبب والتوصية الأولية)

| الجزء | لماذا يصعب إصلاحه | التوصية الأولية (دون تنفيذ) |
|-------|------------------|-----------------------------|
| **نظام الثيم المزدوج + ألوان hardcoded في 42 شاشة** | إصلاحه يتطلب: (أ) توحيد نظام الثيم (إزالة next-themes أو app-store theme)، (ب) استبدال مئات المواضع `bg-[#hex]` بـ tokens في 42 ملف — تغيير شامل (refactor) لطبقة العرض كلها | توحيد على نظام واحد + هجرة تدريجية للألوان إلى tokens، شاشة تلو شاشة، بدءاً بالشاشات الأساسية (Trade/Wallet/Auth) |
| **استراتيجية RTL الرقيعية** | إصلاحها يتطلب استبدال كل physical utilities بـ logical equivalents (ps/pe/ms/me/start/end) في 42 شاشة + إزالة قواعد القلب CSS الهشة + معالجة تدرجات SVG وحركات Framer فيزيائياً | تبنّي logical properties حصراً + حذف قواعد القلب + تدقيق كل تدرج/حركة فيزيائية؛ عمل طويل لكن ميكانيكي |
| **خط عربي غير محمّل** | يتطلب إضافة استيراد خط (next/font أو @font-face) + ضبط metrics/line-height لكل خليط عربي+لاتيني + إعادة فحص كل ارتفاعات النصوص | استيراد Tajawal/Cairo عبر next/font بـ subsets عربية + لاتينية، وإعادة قياس الـ line-height |
| **بيانات وهمية بالإنجليزية** | محتوى تجريبي (10+ ملفات mock) مكتوب بالإنجليزية بالكامل — لا يمكن "ترجمته" لأنه يمثل محتوى مستخدم حقيقي (مقالات/منشورات) | إنشاء نسخة عربية من mock data + فصل المحتوى عن المنطق، أو ربط ببيانات حقيقية |
| **أمان Firebase** | لا قواعد أمان + مصادقة وهمية + لا جلسات + getAuth مُهيأ لكن غير مستخدم. إصلاحه يعني بناء طبقة مصادقة حقيقية (Firebase Auth + Cloud Functions للعمليات الحساسة + قواعد firestore/storage + JWT/جلسات) — مشروع فرعي كامل | تصميم طبقة أمان من الصفر: Firebase Auth + Cloud Functions + Rules + إزالة المسار الوهمي /api/auth بالكامل |
| **z-index scale غير مُتبع** | 90 موضعاً حرفياً + قواعد `!important` شاملة + انتقاء substring هش. إصلاحه يتطلب حصر كل z-index الحرفية + استبدالها بـ tokens + إعادة كتابة قواعد globals.css بدون !important | حصر شامل (audit) لكل z-index + توحيد على tokens + إزالة `!important` الانتقائي |
| **انتقاء modal-bg بـ substring** | `[class*="fixed inset-0"][class*="z-50"]` يعتمد على ترتيب الصنف — هش ولا يطابق z-[100]/z-40. إصلاحه يتطلب إعادة تفكير في آلية التصلبة (ربما عبر data-attribute صريح بدل substring) | استبدال الانتقاء substring بـ data-attribute صريح (مثل `data-solid-overlay`) على كل overlay |
| **`h-[calc(100vh-Nrem)]` هش** | منتشر في 9+ شاشات بقيم N مختلفة. إصلاحه يتطلب استبدال بـ `100dvh`/flexbox + قياس الـ chrome الفعلي | هجرة إلى `dvh`/`svh` أو تخطيط flexbox يعتمد على flex-1 بدل ارتفاع محسوب |

---

## خاتمة

تم تنفيذ التدقيق المطلوب **بدون أي تعديل برمجي**. التطبيق يتمتع ببنية وظيفية واسعة وأصول تصميمية قوية (لوحة ألوان Binance، أيقونات، حركات)، لكن طبقة العرض تعاني من **خلل هيكلي جذر** في الثيم وRTL والشفافية، مضافاً إليه **خلل أمني حرج** في طبقة Firebase. التفاصيل الكاملة بكل سطر برمجي موثّقة في ملف `/home/z/my-project/worklog.md`.

**في انتظار أوامر التنفيذ المقطّعة لكل قسم.**
