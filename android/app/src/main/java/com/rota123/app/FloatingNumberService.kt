package com.rota123.app

import android.app.Service
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.Button
import kotlin.random.Random

class FloatingNumberService : Service() {

    private var floatingView: View? = null
    private var windowManager: WindowManager? = null
    private val handler = Handler(Looper.getMainLooper())

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

        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
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

        val button = Button(this).apply {
            text = "Gerar"
            textSize = 14f
            setTextColor(Color.WHITE)
            isAllCaps = false

            setOnClickListener {
                val number = Random.nextInt(1, 1000)
                text = number.toString()
                handler.postDelayed({ text = "Gerar" }, 2000)
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
    }

    private fun removeFloatingButton() {
        val view = floatingView ?: return
        try {
            windowManager?.removeView(view)
        } catch (_: Exception) {
        }
        floatingView = null
    }

    companion object {
        private const val TOUCH_SLOP_SQUARED = 12 * 12

        @Volatile
        var isRunning: Boolean = false
            private set
    }
}
