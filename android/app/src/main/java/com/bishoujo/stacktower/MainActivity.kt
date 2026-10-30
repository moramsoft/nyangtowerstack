package com.bishoujo.stacktower

import android.annotation.SuppressLint
import android.content.Context
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.crashlytics.FirebaseCrashlytics
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var firebaseAnalytics: FirebaseAnalytics
    private lateinit var crashlytics: FirebaseCrashlytics

    class FirebaseBridge(private val context: Context) {
        private val analytics: FirebaseAnalytics = FirebaseAnalytics.getInstance(context)
        private val crashlytics: FirebaseCrashlytics = FirebaseCrashlytics.getInstance()
        private val vibrator: Vibrator? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            vibratorManager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }

        @JavascriptInterface
        fun vibrate(durationMs: Long, effectType: String?) {
            try {
                val vib = vibrator ?: return
                if (!vib.hasVibrator()) return
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    val effect = when (effectType?.lowercase()) {
                        "click", "tick", "light" -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK)
                        "heavy", "strike" -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK)
                        "double_click" -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_DOUBLE_CLICK)
                        else -> {
                            val d = if (durationMs in 1..2000) durationMs else 25L
                            VibrationEffect.createOneShot(d, VibrationEffect.DEFAULT_AMPLITUDE)
                        }
                    }
                    vib.vibrate(effect)
                } else {
                    @Suppress("DEPRECATION")
                    vib.vibrate(if (durationMs in 1..2000) durationMs else 25L)
                }
            } catch (e: Exception) {
                android.util.Log.e("FirebaseBridge", "Vibrate error: ${e.message}")
            }
        }

        @JavascriptInterface
        fun logEvent(name: String, paramsJson: String?) {
            try {
                val bundle = Bundle()
                if (!paramsJson.isNullOrEmpty()) {
                    val json = JSONObject(paramsJson)
                    val keys = json.keys()
                    while (keys.hasNext()) {
                        val key = keys.next()
                        when (val value = json.get(key)) {
                            is Int -> bundle.putInt(key, value)
                            is Long -> bundle.putLong(key, value)
                            is Double -> bundle.putDouble(key, value)
                            is Boolean -> bundle.putBoolean(key, value)
                            else -> bundle.putString(key, value.toString())
                        }
                    }
                }
                analytics.logEvent(name, bundle)
                android.util.Log.d("FirebaseBridge", "Logged event: $name with params: $paramsJson")
            } catch (e: Exception) {
                android.util.Log.e("FirebaseBridge", "Failed to log event $name: ${e.message}")
            }
        }

        @JavascriptInterface
        fun recordException(message: String, stack: String?) {
            try {
                val ex = JavaScriptException(message, stack ?: "")
                crashlytics.recordException(ex)
                android.util.Log.d("FirebaseBridge", "Recorded exception: $message")
            } catch (e: Exception) {
                android.util.Log.e("FirebaseBridge", "Failed to record exception: ${e.message}")
            }
        }

        @JavascriptInterface
        fun setUserId(userId: String) {
            try {
                analytics.setUserId(userId)
                crashlytics.setUserId(userId)
            } catch (e: Exception) {
                android.util.Log.e("FirebaseBridge", "Failed to set user ID: ${e.message}")
            }
        }

        @JavascriptInterface
        fun setCustomKey(key: String, value: String) {
            try {
                crashlytics.setCustomKey(key, value)
            } catch (e: Exception) {
                android.util.Log.e("FirebaseBridge", "Failed to set custom key: ${e.message}")
            }
        }

        @JavascriptInterface
        fun log(message: String) {
            try {
                crashlytics.log(message)
            } catch (e: Exception) {
                // ignore
            }
        }
    }

    class JavaScriptException(message: String, stack: String) : Exception(
        if (stack.isNotEmpty()) "$message\nStack: $stack" else message
    )

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize Firebase instances
        firebaseAnalytics = FirebaseAnalytics.getInstance(this)
        crashlytics = FirebaseCrashlytics.getInstance()
        crashlytics.setCustomKey("app_version", "1.0")

        // Keep screen on during gameplay
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Create WebView dynamically by code without XML layout
        webView = WebView(this).apply {
            setBackgroundColor(Color.parseColor("#1a162b")) // Matches index.html background to eliminate white flashes

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true // Required for localStorage (best score)
                mediaPlaybackRequiresUserGesture = false
                allowFileAccess = true
                cacheMode = WebSettings.LOAD_DEFAULT
                useWideViewPort = true
                loadWithOverviewMode = true
                displayZoomControls = false
                builtInZoomControls = false
            }

            // Expose FirebaseBridge to JavaScript
            addJavascriptInterface(FirebaseBridge(this@MainActivity), "FirebaseBridge")

            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    return false // Keep navigation inside WebView
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                    val msg = consoleMessage?.message() ?: ""
                    android.util.Log.d("GameConsole", "$msg (line ${consoleMessage?.lineNumber()})")
                    if (consoleMessage?.messageLevel() == android.webkit.ConsoleMessage.MessageLevel.ERROR) {
                        crashlytics.log("Console Error [${consoleMessage.sourceId()}:${consoleMessage.lineNumber()}]: $msg")
                    }
                    return true
                }
            }

            val targetUrl = intent?.dataString ?: "file:///android_asset/www/index.html"
            loadUrl(targetUrl)
        }

        setContentView(webView)

        hideSystemUI()

        // Back button directly exits or goes back
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    finish() // Direct exit without prompt for casual game UX
                }
            }
        })
    }

    private fun hideSystemUI() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val controller = WindowCompat.getInsetsController(window, window.decorView)
        controller.hide(WindowInsetsCompat.Type.systemBars())
        controller.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
        hideSystemUI()
    }

    override fun onPause() {
        super.onPause()
        webView.onPause()
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
