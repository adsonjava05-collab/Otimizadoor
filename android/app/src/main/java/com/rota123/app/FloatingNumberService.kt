package com.rota123.app

import android.app.Service
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.ImageView
import kotlin.random.Random

class FloatingNumberService : Service() {

    private var floatingView: View? = null
    private var buttonView: ImageView? = null
    private var windowManager: WindowManager? = null
    private val handler = Handler(Looper.getMainLooper())
    private var lastNumber: Int = -1

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int =
        START_NOT_STICKY

    override fun onCreate() {
        super.onCreate()
        isRunning = true
        showFloatingButton()
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        removeFloatingButton()
        isRunning = false
        super.onDestroy()
    }

    private fun showFloatingButton() {
        if (floatingView != null) return

        val sizePx = dp(52)

        val params = WindowManager.LayoutParams(
            sizePx,
            sizePx,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            },
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )

        params.gravity = Gravity.TOP or Gravity.START
        params.x = 48
        params.y = 240

        var downRawX = 0f
        var downRawY = 0f
        var startX = 0
        var startY = 0
        var moved = false

        val button = ImageView(this).apply {
            scaleType = ImageView.ScaleType.FIT_CENTER
            setPadding(dp(14), dp(14), dp(14), dp(14))
            setImageResource(R.drawable.ic_floating_copy)

            val background = android.graphics.drawable.GradientDrawable().apply {
                shape = android.graphics.drawable.GradientDrawable.OVAL
                setColor(android.graphics.Color.parseColor("#1D4ED8"))
                setStroke(
                    dp(1),
                    android.graphics.Color.parseColor("#93C5FD")
                )
            }

            background(background)

            elevation = dp(6).toFloat()

            setOnClickListener {
                val number = generateNumber()

                if (copyToClipboard(number)) {
                    showCopiedFeedback()
                }
            }

            setOnTouchListener { view, event ->
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        downRawX = event.rawX
                        downRawY = event.rawY
                        startX = params.x
                        startY = params.y
                        moved = false
                        false
                    }

                    MotionEvent.ACTION_MOVE -> {
                        val dx = (event.rawX - downRawX).toInt()
                        val dy = (event.rawY - downRawY).toInt()

                        if (moved || dx * dx + dy * dy > TOUCH_SLOP_SQUARED) {
                            moved = true
                            params.x = startX + dx
                            params.y = startY + dy
                            windowManager?.updateViewLayout(view, params)
                        }
                        false
                    }

                    MotionEvent.ACTION_UP -> {
                        if (!moved) {
                            view.performClick()
                        }
                        false
                    }

                    else -> false
                }
            }
        }

        windowManager =
            getSystemService(WINDOW_SERVICE) as WindowManager

        windowManager?.addView(button, params)

        floatingView = button
        buttonView = button
    }

    private fun removeFloatingButton() {
        val view = floatingView ?: return
        try {
            windowManager?.removeView(view)
        } catch (_: Exception) {
        }
        floatingView = null
        buttonView = null
    }

    private fun generateNumber(): String {
        var candidate: Int
        do {
            candidate = Random.nextInt(100_000_000, 1_000_000_000)
        } while (candidate == lastNumber)
        lastNumber = candidate
        return candidate.toString()
    }

    private fun copyToClipboard(text: String): Boolean {
        return try {
            val clipboard =
                getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager

            clipboard.setPrimaryClip(
                ClipData.newPlainText(
                    "Número Rota 123",
                    text
                )
            )

            true

        } catch (e: Exception) {
            Log.e(TAG, "Erro ao copiar o número", e)
            false
        }
    }

    private fun showCopiedFeedback() {
        val button = buttonView ?: return

        button.setImageResource(R.drawable.ic_floating_check)

        button.animate()
            .scaleX(0.85f)
            .scaleY(0.85f)
            .setDuration(90)
            .withEndAction {
                button.animate()
                    .scaleX(1f)
                    .scaleY(1f)
                    .setDuration(90)
                    .start()
            }
            .start()

        handler.postDelayed({
            button?.setImageResource(R.drawable.ic_floating_copy)
        }, FEEDBACK_MS)
    }

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()

    companion object {
        private const val TAG = "Rota123"
        private const val TOUCH_SLOP_SQUARED = 12 * 12
        private const val FEEDBACK_MS = 700L

        @Volatile
        var isRunning: Boolean = false
            private set
    }
}
