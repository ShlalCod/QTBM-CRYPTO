# تقرير تدقيق لوحة تحكم الأدمن — AdminDashboardView.tsx

> فحص فعلي لكل سطر في الملف (525 سطر). لا افتراضات، لا تجميل.

---

## الحقيقة الصادمة: لوحة الأدمن **شكلية بالكامل** — 0% وظيفية

### كل بيانات اللوحة ثابتة (hardcoded mock):

| العنصر | المصدر | حقيقي؟ |
|--------|--------|--------|
| الإحصائيات (284,592 مستخدم / $1.82B حجم / 42,891 طلب / $4.2M إيراد) | `statsCards` (سطر 40-45) | ❌ ثابتة |
| قائمة المستخدمين (Ahmed, Sarah, Mohammed, Elena, James, Yuki) | `mockUsers` (سطر 47-54) | ❌ وهمية |
| الطلبات المشبوهة | `mockFlaggedOrders` (سطر 56-60) | ❌ وهمية |
| قائمة KYC | `mockKYCQueue` (سطر 62-67) | ❌ وهمية |
| سجلات التدقيق | `mockAuditLogs` (سطر 76-85) | ❌ وهمية |
| الإعلانات | `mockAnnouncements` (سطر 87-92) | ❌ وهمية |
| صحة النظام (99.97% uptime / 42ms / 12847 WS / 78% DB) | `systemHealth` (سطر 69-74) | ❌ ثابتة |

### فحص كل زر (onClick) في اللوحة:

| الزر | الموقع | له onClick؟ | ينفذ فعلاً؟ |
|------|--------|-------------|-------------|
| **تعليق مستخدم** (Suspend) | سطر 233 | ❌ لا | لا يفعل شيئاً |
| **إعادة تفعيل** (Reactivate) | سطر 238 | ❌ لا | لا يفعل شيئاً |
| **عرض/تحقق KYC** (Verify) | سطر 244 | ❌ لا | لا يفعل شيئاً |
| **الموافقة على KYC** (Approve) | سطر 352 | ❌ لا | لا يفعل شيئاً |
| **رفض KYC** (Reject) | سطر 356 | ❌ لا | لا يفعل شيئاً |
| **تنبيهات** (Alerts) | سطر 122 | ❌ لا | لا يفعل شيئاً |
| **بحث المستخدمين** | سطر 166 | ✅ نعم (setState) | يفلتر mock فقط |
| **فلتر الطلبات** (all/pending/flagged) | سطر 271 | ✅ نعم (setState) | يفلتر mock فقط |
| **إعلان جديد** (New Announcement) | سطر 464 | ❌ لا | لا يفعل شيئاً |
| **تعديل إعلان** (Edit) | سطر 507 | ❌ لا | لا يفعل شيئاً |
| **حذف إعلان** (Delete) | سطر 510 | ❌ لا | لا يفعل شيئاً |
| **رجوع** (Back) | سطر 110 | ✅ نعم | يعمل |

### النتيجة: 11 زر، **فقط 2 يعملان** (بحث + فلتر — وكلاهما يفلتر بيانات وهمية)

---

## ما لا تستطيع اللوحة فعله (رغم عرضه):

1. **لا تستطيع تعليق/إلغاء تعليق مستخدم** — الزر موجود لكن بلا منطق
2. **لا تستطيع الموافقة/رفض KYC** — الزرين موجودين لكن بلا منطق
3. **لا تستطيع إنشاء/تعديل/حذف إعلان** — الأزرار موجودة لكن بلا منطق
4. **لا تستطيع تجميد سحب** — غير موجود أصلاً
5. **لا تستطيع تعديل رسوم التداول** — غير موجود
6. **لا تقرأ مستخدمين حقيقيين** من Firestore
7. **لا تقرأ طلبات حقيقية** من Firestore
8. **لا تقرأ KYC حقيقي** من Firestore
9. **لا تكتب سجلات تدقيق** في Firestore
10. **الإحصائيات ثابتة** — لا تتحدث من بيانات حقيقية

---

## ما يجب إصلاحه لجعل اللوحة وظيفية:

1. استبدال `mockUsers` بـ Firestore query (`adminDb.collection('users').get()`)
2. استبدال `mockFlaggedOrders` بـ Firestore query للطلبات المشبوهة
3. استبدال `mockKYCQueue` بـ Firestore query (`adminDb.collection('kyc').where('status','==','pending')`)
4. استبدال `mockAuditLogs` بـ Firestore query (`adminDb.collection('admin/auditLogs/logs')`)
5. استبدال `mockAnnouncements` بـ Firestore query (`adminDb.collection('public/announcements/list')`)
6. استبدال `statsCards` بـ aggregation queries حقيقية
7. إضافة `onClick` handlers لكل زر:
   - Suspend/Reactivate → `updateDoc(userRef, { status: 'suspended'/'active' })`
   - KYC Approve/Reject → `updateDoc(kycRef, { status: 'approved'/'rejected' })`
   - New Announcement → modal + `addDoc(announcementsRef, {...})`
   - Edit/Delete Announcement → `updateDoc`/`deleteDoc`
8. كل عملية إدارية يجب أن تنشئ سجل تدقيق في Firestore
