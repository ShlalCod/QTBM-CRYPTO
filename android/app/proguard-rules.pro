# Add project specific ProGuard rules here.
# By default, the flags in this file are applied to all build variants.

-keep class com.qtbm.crypto.** { *; }
-keep class com.getcapacitor.** { *; }
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }

# Keep model classes used for Firebase Realtime Database
-keepclassmembers class com.qtbm.crypto.** {
    *;
}

# OkHttp
-dontwarn okhttp3.**
-dontwarn okio.**
