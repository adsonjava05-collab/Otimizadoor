package com.rota123.app

import android.app.Service
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.WindowManager
import android.widget.ImageView
import kotlin.math.abs
import kotlin.math.max
import kotlin.random.Random

class FloatingNumberService : Service() {

    private var floatingView: View? = null
    private var buttonView: ImageView? = null
    private var windowManager: WindowManager? = null

    private val handler = Handler(Looper.getMainLooper())

    private var lastNumber: Int = -1

    private var feedbackRunnable: Runnable? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(
        intent: Intent?,
        flags: Int,
        startId: Int
    ): Int {
        return START_NOT_STICKY
    }

    override fun onCreate() {
        super.onCreate()

        try {
            showFloatingButton()
            isRunning = floatingView != null

        } catch (e: Exception) {
            Log.e(TAG, "Erro ao iniciar botão flutuante", e)

            isRunning = false
            stopSelf()
        }
    }

    override fun onDestroy() {
        feedbackRunnable?.let {
            handler.removeCallbacks(it)
        }

        handler.removeCallbacksAndMessages(null)

        removeFloatingButton()

        isRunning = false

        super.onDestroy()
    }

    private fun showFloatingButton() {

        if (floatingView != null) return

        windowManager =
            getSystemService(Context.WINDOW_SERVICE) as WindowManager

        val sizePx = dp(52)

        val windowType =
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY

            } else {

                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            }

        val params = WindowManager.LayoutParams(
            sizePx,
            sizePx,
            windowType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        )

        params.gravity = Gravity.TOP or Gravity.START

        params.x = dp(48)
        params.y = dp(240)

        val touchSlop =
            ViewConfiguration.get(this).scaledTouchSlop

        var downRawX = 0f
        var downRawY = 0f

        var startX = 0
        var startY = 0

        var isDragging = false

        val buttonBackground = GradientDrawable().apply {

            shape = GradientDrawable.OVAL

            setColor(
                Color.parseColor("#1D4ED8")
            )

            setStroke(
                dp(1),
                Color.parseColor("#93C5FD")
            )
        }

        val button = ImageView(this).apply {

            scaleType = ImageView.ScaleType.FIT_CENTER

            setPadding(
                dp(14),
                dp(14),
                dp(14),
                dp(14)
            )

            setImageResource(
                R.drawable.ic_floating_copy
            )

            background = buttonBackground

            elevation = dp(6).toFloat()

            contentDescription = "Gerar e copiar número"

            isClickable = true

            setOnClickListener {

                val number = generateNumber()

                val copied = copyToClipboard(number)

                if (copied) {
                    showCopiedFeedback()
                }
            }

            setOnTouchListener { view, event ->

                when (event.actionMasked) {

                    MotionEvent.ACTION_DOWN -> {

                        downRawX = event.rawX
                        downRawY = event.rawY

                        startX = params.x
                        startY = params.y

                        isDragging = false

                        true
                    }

                    MotionEvent.ACTION_MOVE -> {

                        val deltaX =
                            event.rawX - downRawX

                        val deltaY =
                            event.rawY - downRawY

                        if (
                            !isDragging &&
                            (
                                abs(deltaX) > touchSlop ||
                                abs(deltaY) > touchSlop
                            )
                        ) {
                            isDragging = true
                        }

                        if (isDragging) {

                            val newX =
                                startX + deltaX.toInt()

                            val newY =
                                startY + deltaY.toInt()

                            updateFloatingPosition(
                                view,
                                params,
                                newX,
                                newY
                            )
                        }

                        true
                    }

                    MotionEvent.ACTION_UP -> {

                        if (!isDragging) {

                            view.performClick()

                        }

                        isDragging = false

                        true
                    }

                    MotionEvent.ACTION_CANCEL -> {

                        isDragging = false

                        true
                    }

                    else -> true
                }
            }
        }

        // Garante que a posição inicial fique visível.
        clampFloatingPosition(params)

        windowManager?.addView(button, params)

        floatingView = button
        buttonView = button

        Log.d(TAG, "Botão flutuante iniciado")
    }

    private fun updateFloatingPosition(
        view: View,
        params: WindowManager.LayoutParams,
        newX: Int,
        newY: Int
    ) {

        params.x = newX
        params.y = newY

        clampFloatingPosition(params)

        try {

            windowManager?.updateViewLayout(
                view,
                params
            )

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Erro ao movimentar botão flutuante",
                e
            )
        }
    }

    private fun clampFloatingPosition(
        params: WindowManager.LayoutParams
    ) {

        val metrics = resources.displayMetrics

        val screenWidth = metrics.widthPixels
        val screenHeight = metrics.heightPixels

        val maxX = max(
            0,
            screenWidth - params.width
        )

        val maxY = max(
            0,
            screenHeight - params.height
        )

        params.x = params.x.coerceIn(
            0,
            maxX
        )

        params.y = params.y.coerceIn(
            0,
            maxY
        )
    }

    private fun removeFloatingButton() {

        val view = floatingView ?: return

        try {

            windowManager?.removeView(view)

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Erro ao remover botão flutuante",
                e
            )
        }

        floatingView = null
        buttonView = null
        windowManager = null
    }

    private fun generateNumber(): String {

        var candidate: Int

        do {

            candidate = Random.nextInt(
                100_000_000,
                1_000_000_000
            )

        } while (candidate == lastNumber)

        lastNumber = candidate

        Log.d(
            TAG,
            "Novo número gerado"
        )

        return candidate.toString()
    }

    private fun copyToClipboard(
        text: String
    ): Boolean {

        return try {

            val clipboard =
                getSystemService(
                    Context.CLIPBOARD_SERVICE
                ) as ClipboardManager

            val clip = ClipData.newPlainText(
                "Número Rota 123",
                text
            )

            clipboard.setPrimaryClip(clip)

            Log.d(
                TAG,
                "Solicitação de cópia enviada ao Android"
            )

            true

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Erro ao copiar número",
                e
            )

            false
        }
    }

    private fun showCopiedFeedback() {

        val button = buttonView ?: return

        feedbackRunnable?.let {
            handler.removeCallbacks(it)
        }

        button.animate().cancel()

        button.setImageResource(
            R.drawable.ic_floating_check
        )

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

        val runnable = Runnable {

            button.setImageResource(
                R.drawable.ic_floating_copy
            )

            feedbackRunnable = null
        }

        feedbackRunnable = runnable

        handler.postDelayed(
            runnable,
            FEEDBACK_MS
        )
    }

    private fun dp(
        value: Int
    ): Int {

        return (
            value * resources.displayMetrics.density
        ).toInt()
    } 

    companion object {

        private const val TAG =
            "Rota123FloatingNumber"

        private const val FEEDBACK_MS =
            700L

        @Volatile
        var isRunning: Boolean = false
            private set
    }
}