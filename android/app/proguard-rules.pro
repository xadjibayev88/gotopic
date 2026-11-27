# Voilà! — R8 qoidalari.
# JS ko'priklari (window.AndroidAdMob, window.AndroidAuth) nomlari saqlanadi, aks holda sayt ularni chaqira olmaydi.
-keepclassmembers class uz.salut.app.MainActivity$AdMobBridge { @android.webkit.JavascriptInterface <methods>; }
-keepclassmembers class uz.salut.app.MainActivity$AuthBridge { @android.webkit.JavascriptInterface <methods>; }
-keepclassmembers class uz.salut.app.MainActivity$TtsBridge { @android.webkit.JavascriptInterface <methods>; }
-keepattributes JavascriptInterface
-keepattributes *Annotation*
# Google Play xizmatlari va Credential Manager
-keep class com.google.android.gms.ads.** { *; }
-keep class androidx.credentials.** { *; }
-keep class com.google.android.libraries.identity.googleid.** { *; }
-dontwarn com.google.android.gms.**
# Log chaqiruvlari release'dan olib tashlanadi
-assumenosideeffects class android.util.Log { public static *** d(...); public static *** v(...); }
