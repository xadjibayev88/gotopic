package uz.salut.app;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.webkit.WebSettings;
import android.graphics.Color;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.view.Gravity;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;
import androidx.credentials.Credential;
import androidx.credentials.CredentialManager;
import androidx.credentials.CredentialManagerCallback;
import androidx.credentials.CustomCredential;
import androidx.credentials.GetCredentialRequest;
import androidx.credentials.GetCredentialResponse;
import androidx.credentials.exceptions.GetCredentialCancellationException;
import androidx.credentials.exceptions.GetCredentialException;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardItem;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.libraries.identity.googleid.GetGoogleIdOption;
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential;

import org.json.JSONObject;

import java.util.concurrent.Executor;

/**
 * Voilà! — WebView ilova. Sayt (BuildConfig.START_URL) ichida ochiladi va JS ko'priklari beradi:
 *  - AndroidAdMob: banner, mukofotli video, to'liq ekranli reklama (src/engine/ads.ts bilan bir xil protokol)
 *  - AndroidAuth: telefondagi Google hisobi orqali bir bosishda kirish (Credential Manager → ID token)
 */
public final class MainActivity extends Activity {
    private static final String TEST_BANNER = "ca-app-pub-3940256099942544/6300978111";
    private static final String TEST_REWARDED = "ca-app-pub-3940256099942544/5224354917";
    private static final String TEST_INTERSTITIAL = "ca-app-pub-3940256099942544/1033173712";
    private static final int AUDIO_PERMISSION = 4101;
    private static final int NIGHT = Color.rgb(11, 13, 36);

    private FrameLayout root;
    private WebView webView;
    private AdView banner;
    private RewardedAd rewardedAd;
    private InterstitialAd interstitialAd;
    private PermissionRequest pendingPermission;
    private final Executor ui = command -> runOnUiThread(command);

    // ---------------------------------------------------------------- Himoya
    /** Ilovaning o'z sayti (START_URL) — JS ko'priklari faqat shu saytga xizmat qiladi. */
    private String appHost() { return Uri.parse(BuildConfig.START_URL).getHost(); }
    /** Ilova ichida ochilishi mumkin bo'lgan boshqa sahifalar: to'lov va kirish. Qolgani — tashqi brauzerda. */
    private static final String[] INNER_HOSTS = { "checkout.paycom.uz", "checkout.test.paycom.uz", "my.click.uz", "accounts.google.com", "oauth.telegram.org" };
    private boolean isAppUrl(String url) {
        if (url == null) return false;
        Uri u = Uri.parse(url);
        return "https".equals(u.getScheme()) && appHost() != null && appHost().equalsIgnoreCase(u.getHost());
    }
    private boolean isInnerUrl(String url) {
        if (isAppUrl(url)) return true;
        Uri u = Uri.parse(url);
        if (!"https".equals(u.getScheme()) || u.getHost() == null) return false;
        for (String h : INNER_HOSTS) if (h.equalsIgnoreCase(u.getHost())) return true;
        return false;
    }
    /** Hozir ochilgan sahifa ilovaning o'z saytimi (faqat UI oqimida chaqiriladi). */
    private boolean trusted() { return webView != null && isAppUrl(webView.getUrl()); }
    /** Ko'prik metodlari fon oqimida ishlaydi — sahifa manzili UI oqimida shu bayroqqa yoziladi. */
    private volatile boolean pageTrusted = false;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(NIGHT);
        getWindow().setNavigationBarColor(NIGHT);
        root = new FrameLayout(this);
        root.setBackgroundColor(NIGHT);
        setContentView(root);

        webView = new WebView(this);
        webView.setBackgroundColor(NIGHT);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        WebSettings ws = webView.getSettings();
        ws.setAllowFileAccess(false);
        ws.setAllowContentAccess(false);
        ws.setAllowFileAccessFromFileURLs(false);
        ws.setAllowUniversalAccessFromFileURLs(false);
        ws.setGeolocationEnabled(false);
        ws.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        ws.setJavaScriptCanOpenWindowsAutomatically(false);
        if (Build.VERSION.SDK_INT >= 26) ws.setSafeBrowsingEnabled(true);
        // Chrome DevTools orqali ilovani kuzatish faqat sinov (debug) versiyasida.
        WebView.setWebContentsDebuggingEnabled(isDebugBuild());
        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView, false);
        webView.setWebViewClient(new WebViewClient() {
            @Override public void doUpdateVisitedHistory(WebView view, String url, boolean isReload) {
                pageTrusted = isAppUrl(url);
            }
            @Override public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                pageTrusted = isAppUrl(url);
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                // Ilova sayti va to'lov/kirish sahifalari ichkarida; boshqa har qanday havola tashqi brauzerda ochiladi
                // (begona sayt ilovaning JS ko'priklariga — Google kirish, reklama — yeta olmaydi).
                String url = request.getUrl().toString();
                if (isInnerUrl(url)) return false;
                try {
                    startActivity(new Intent(Intent.ACTION_VIEW, request.getUrl()).addCategory(Intent.CATEGORY_BROWSABLE));
                } catch (Exception ignored) {
                    // brauzer topilmadi
                }
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    // Mikrofon faqat ilovaning o'z saytiga beriladi.
                    if (request.getOrigin() == null || appHost() == null || !appHost().equalsIgnoreCase(request.getOrigin().getHost())) { request.deny(); return; }
                    boolean audio = false;
                    for (String resource : request.getResources()) audio |= PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource);
                    if (!audio) { request.deny(); return; }
                    if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                    else { pendingPermission = request; requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, AUDIO_PERMISSION); }
                });
            }
        });
        webView.addJavascriptInterface(new AdMobBridge(), "AndroidAdMob");
        webView.addJavascriptInterface(new AuthBridge(), "AndroidAuth");
        root.addView(webView, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        webView.loadUrl(BuildConfig.START_URL);
    }

    private static String quote(String value) { return JSONObject.quote(value == null ? "" : value); }
    private void js(String expression) { runOnUiThread(() -> { if (trusted()) webView.evaluateJavascript(expression, null); }); }
    private void resolve(String id, String value) { js("window.__gtAdResolve&&window.__gtAdResolve(" + quote(id) + "," + (value == null ? "true" : value) + ")"); }
    private void reject(String id, String message) { js("window.__gtAdReject&&window.__gtAdReject(" + quote(id) + "," + quote(message) + ")"); }
    private boolean isDebugBuild() { return (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0; }
    private String adId(String requested, boolean testing, String testId) { return testing || isDebugBuild() || requested == null || requested.trim().isEmpty() ? testId : requested; }

    // ------------------------------------------------------------------ AdMob
    private final class AdMobBridge {
        @JavascriptInterface public void initialize(String requestId, boolean testing) {
            if (!pageTrusted) return;
            runOnUiThread(() -> MobileAds.initialize(MainActivity.this, status -> resolve(requestId, "true")));
        }

        @JavascriptInterface public void showBanner(String requestId, String requestedId, boolean testing) {
            if (!pageTrusted) return;
            runOnUiThread(() -> {
                if (banner == null) {
                    banner = new AdView(MainActivity.this);
                    banner.setAdSize(AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(MainActivity.this, 360));
                    banner.setAdUnitId(adId(requestedId, testing, TEST_BANNER));
                    root.addView(banner, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM));
                    banner.loadAd(new AdRequest.Builder().build());
                }
                banner.setVisibility(AdView.VISIBLE);
                resolve(requestId, "true");
            });
        }

        @JavascriptInterface public void hideBanner(String requestId) {
            if (!pageTrusted) return; runOnUiThread(() -> { if (banner != null) banner.setVisibility(AdView.GONE); resolve(requestId, "true"); }); }
        @JavascriptInterface public void resumeBanner(String requestId) {
            if (!pageTrusted) return; runOnUiThread(() -> { if (banner != null) banner.setVisibility(AdView.VISIBLE); resolve(requestId, "true"); }); }

        @JavascriptInterface public void prepareRewardVideoAd(String requestId, String requestedId, boolean testing) {
            if (!pageTrusted) return;
            runOnUiThread(() -> RewardedAd.load(MainActivity.this, adId(requestedId, testing, TEST_REWARDED), new AdRequest.Builder().build(), new RewardedAdLoadCallback() {
                @Override public void onAdLoaded(@NonNull RewardedAd ad) { rewardedAd = ad; resolve(requestId, "true"); }
                @Override public void onAdFailedToLoad(@NonNull LoadAdError error) { rewardedAd = null; reject(requestId, error.getMessage()); }
            }));
        }

        @JavascriptInterface public void showRewardVideoAd(String requestId) {
            if (!pageTrusted) return;
            runOnUiThread(() -> {
                RewardedAd ad = rewardedAd;
                if (ad == null) { reject(requestId, "Rewarded ad is not ready"); return; }
                rewardedAd = null;
                ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                    @Override public void onAdDismissedFullScreenContent() { resolve(requestId, "true"); }
                    @Override public void onAdFailedToShowFullScreenContent(@NonNull AdError error) { reject(requestId, error.getMessage()); }
                });
                ad.show(MainActivity.this, (RewardItem reward) -> js("window.__gtAdReward&&window.__gtAdReward()"));
            });
        }

        @JavascriptInterface public void prepareInterstitial(String requestId, String requestedId, boolean testing) {
            if (!pageTrusted) return;
            runOnUiThread(() -> InterstitialAd.load(MainActivity.this, adId(requestedId, testing, TEST_INTERSTITIAL), new AdRequest.Builder().build(), new InterstitialAdLoadCallback() {
                @Override public void onAdLoaded(@NonNull InterstitialAd ad) { interstitialAd = ad; resolve(requestId, "true"); }
                @Override public void onAdFailedToLoad(@NonNull LoadAdError error) { interstitialAd = null; reject(requestId, error.getMessage()); }
            }));
        }

        @JavascriptInterface public void showInterstitial(String requestId) {
            if (!pageTrusted) return;
            runOnUiThread(() -> {
                InterstitialAd ad = interstitialAd;
                if (ad == null) { reject(requestId, "Interstitial is not ready"); return; }
                interstitialAd = null;
                ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                    @Override public void onAdDismissedFullScreenContent() { resolve(requestId, "true"); }
                    @Override public void onAdFailedToShowFullScreenContent(@NonNull AdError error) { reject(requestId, error.getMessage()); }
                });
                ad.show(MainActivity.this);
            });
        }
    }

    // ------------------------------------------------------------------ Google bilan kirish
    private final class AuthBridge {
        @JavascriptInterface public void googleSignIn(String requestId, String serverClientId) {
            if (!pageTrusted) return;
            runOnUiThread(() -> {
                if (!trusted()) return; // faqat ilovaning o'z sayti Google kirishni so'ray oladi
                GetGoogleIdOption option = new GetGoogleIdOption.Builder()
                    .setFilterByAuthorizedAccounts(false)
                    .setServerClientId(serverClientId)
                    .setAutoSelectEnabled(false)
                    .build();
                GetCredentialRequest request = new GetCredentialRequest.Builder().addCredentialOption(option).build();
                CredentialManager.create(MainActivity.this).getCredentialAsync(MainActivity.this, request, new CancellationSignal(), ui,
                    new CredentialManagerCallback<GetCredentialResponse, GetCredentialException>() {
                        @Override public void onResult(GetCredentialResponse response) {
                            Credential credential = response.getCredential();
                            if (credential instanceof CustomCredential && GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL.equals(credential.getType())) {
                                try {
                                    String token = GoogleIdTokenCredential.createFrom(credential.getData()).getIdToken();
                                    js("window.__salutAuthResolve&&window.__salutAuthResolve(" + quote(requestId) + "," + quote(token) + ")");
                                } catch (Exception e) {
                                    js("window.__salutAuthReject&&window.__salutAuthReject(" + quote(requestId) + "," + quote("parse") + ")");
                                }
                            } else {
                                js("window.__salutAuthReject&&window.__salutAuthReject(" + quote(requestId) + "," + quote("unexpected") + ")");
                            }
                        }

                        @Override public void onError(@NonNull GetCredentialException e) {
                            String reason = e instanceof GetCredentialCancellationException ? "cancel" : String.valueOf(e.getMessage());
                            js("window.__salutAuthReject&&window.__salutAuthReject(" + quote(requestId) + "," + quote(reason) + ")");
                        }
                    });
            });
        }
    }

    @Override public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] results) {
        super.onRequestPermissionsResult(requestCode, permissions, results);
        if (requestCode == AUDIO_PERMISSION && pendingPermission != null) {
            if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) pendingPermission.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
            else pendingPermission.deny();
            pendingPermission = null;
        }
    }

    @Override protected void onPause() { CookieManager.getInstance().flush(); super.onPause(); }
    @Override public void onBackPressed() { if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed(); }
    @Override protected void onDestroy() { if (banner != null) banner.destroy(); if (webView != null) webView.destroy(); super.onDestroy(); }
}
