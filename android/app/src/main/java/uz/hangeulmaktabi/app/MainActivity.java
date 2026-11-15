package uz.hangeulmaktabi.app;

import android.Manifest;
import android.app.Activity;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.Gravity;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.NonNull;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.rewarded.RewardItem;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

import org.json.JSONObject;

public final class MainActivity extends Activity {
    private static final String START_URL = "https://gotopic-jmqzyljc.manus.space/";
    private static final String TEST_BANNER = "ca-app-pub-3940256099942544/6300978111";
    private static final String TEST_REWARDED = "ca-app-pub-3940256099942544/5224354917";
    private static final int AUDIO_PERMISSION = 4101;

    private FrameLayout root;
    private WebView webView;
    private AdView banner;
    private RewardedAd rewardedAd;
    private PermissionRequest pendingPermission;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(8, 16, 38));
        getWindow().setNavigationBarColor(Color.rgb(8, 16, 38));
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(8, 16, 38));
        setContentView(root);

        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(8, 16, 38));
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webView.getSettings().setAllowFileAccess(false);
        webView.getSettings().setAllowContentAccess(false);
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public void onPermissionRequest(final PermissionRequest request) {
                runOnUiThread(() -> {
                    boolean audio = false;
                    for (String resource : request.getResources()) audio |= PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resource);
                    if (!audio) { request.deny(); return; }
                    if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                    else { pendingPermission = request; requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, AUDIO_PERMISSION); }
                });
            }
        });
        webView.addJavascriptInterface(new AdMobBridge(), "AndroidAdMob");
        root.addView(webView, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        webView.loadUrl(START_URL);
        MobileAds.initialize(this, status -> {});
    }

    private static String quote(String value) { return JSONObject.quote(value == null ? "" : value); }
    private void js(String expression) { runOnUiThread(() -> webView.evaluateJavascript(expression, null)); }
    private void resolve(String id, String value) { js("window.__gtAdResolve(" + quote(id) + "," + (value == null ? "true" : value) + ")"); }
    private void reject(String id, String message) { js("window.__gtAdReject(" + quote(id) + "," + quote(message) + ")"); }
    private boolean isDebugBuild() { return (getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0; }
    private String adId(String requested, boolean testing, String testId) { return testing || isDebugBuild() || requested == null || requested.trim().isEmpty() ? testId : requested; }

    private final class AdMobBridge {
        @JavascriptInterface public void initialize(String requestId, boolean testing) { MobileAds.initialize(MainActivity.this, status -> resolve(requestId, "true")); }

        @JavascriptInterface public void showBanner(String requestId, String requestedId, boolean testing) {
            runOnUiThread(() -> {
                if (banner == null) {
                    banner = new AdView(MainActivity.this);
                    banner.setAdSize(AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(MainActivity.this, 360));
                    banner.setAdUnitId(adId(requestedId, testing, TEST_BANNER));
                    FrameLayout.LayoutParams params = new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM);
                    root.addView(banner, params);
                }
                banner.setVisibility(AdView.VISIBLE);
                banner.loadAd(new AdRequest.Builder().build());
                resolve(requestId, "true");
            });
        }

        @JavascriptInterface public void hideBanner(String requestId) { runOnUiThread(() -> { if (banner != null) banner.setVisibility(AdView.GONE); resolve(requestId, "true"); }); }
        @JavascriptInterface public void resumeBanner(String requestId) { runOnUiThread(() -> { if (banner != null) banner.setVisibility(AdView.VISIBLE); resolve(requestId, "true"); }); }

        @JavascriptInterface public void prepareRewardVideoAd(String requestId, String requestedId, boolean testing) {
            String id = adId(requestedId, testing, TEST_REWARDED);
            RewardedAd.load(MainActivity.this, id, new AdRequest.Builder().build(), new RewardedAdLoadCallback() {
                @Override public void onAdLoaded(@NonNull RewardedAd ad) { rewardedAd = ad; resolve(requestId, "true"); }
                @Override public void onAdFailedToLoad(@NonNull LoadAdError error) { rewardedAd = null; reject(requestId, error.getMessage()); }
            });
        }

        @JavascriptInterface public void showRewardVideoAd(String requestId) {
            RewardedAd ad = rewardedAd;
            if (ad == null) { reject(requestId, "Rewarded ad is not ready"); return; }
            rewardedAd = null;
            ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                @Override public void onAdDismissedFullScreenContent() { resolve(requestId, "{\"amount\":1,\"type\":\"xp\"}"); }
                @Override public void onAdFailedToShowFullScreenContent(@NonNull AdError error) { reject(requestId, error.getMessage()); }
            });
            ad.show(MainActivity.this, (RewardItem reward) -> js("window.__gtAdReward()"));
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

    @Override public void onBackPressed() { if (webView != null && webView.canGoBack()) webView.goBack(); else super.onBackPressed(); }
    @Override protected void onDestroy() { if (banner != null) banner.destroy(); if (webView != null) webView.destroy(); super.onDestroy(); }
}
