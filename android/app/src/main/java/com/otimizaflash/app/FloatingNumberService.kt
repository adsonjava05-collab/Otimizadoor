package com.otimizaflash.app

import android.annotation.SuppressLint
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
import android.os.SystemClock
import android.util.Log
import android.view.Gravity
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.WindowManager
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import kotlin.math.abs
import kotlin.math.max
import kotlin.random.Random

class FloatingNumberService : Service() {

    private var floatingView: View? = null
    private var buttonView: ImageView? = null
    private var menuView: LinearLayout? = null
    private var windowManager: WindowManager? = null

    private val handler = Handler(Looper.getMainLooper())

    private var lastNumber: Int = -1

    private var feedbackRunnable: Runnable? = null

    private var menuMode: Boolean = false

    private var longPressFired: Boolean = false

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

    // =========================================================
    // MODO SELECIONADO
    // =========================================================

    private fun getSelectedMode(): String {
        return getSharedPreferences(MODE_PREFS, Context.MODE_PRIVATE)
            .getString(MODE_KEY, null)
            ?: ""
    }

    private fun setSelectedMode(mode: String) {
        getSharedPreferences(MODE_PREFS, Context.MODE_PRIVATE)
            .edit()
            .putString(MODE_KEY, mode)
            .apply()
    }

    private fun applyModeAppearance() {
        val button = buttonView ?: return
        applyModeAppearanceOn(button)
    }

    private val defaultBackground: GradientDrawable
        get() = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor("#1D4ED8"))
            setStroke(dp(1), Color.parseColor("#93C5FD"))
        }

    private val whatsappBackground: GradientDrawable
        get() = GradientDrawable().apply {
            shape = GradientDrawable.OVAL
            setColor(Color.parseColor("#25D366"))
            setStroke(dp(1), Color.parseColor("#DCF8C6"))
        }

    // =========================================================
    // BOLHA
    // =========================================================

    @SuppressLint("ClickableViewAccessibility")
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

        val longPressTimeout =
            ViewConfiguration.getLongPressTimeout().toLong()

        var downRawX = 0f
        var downRawY = 0f

        var startX = 0
        var startY = 0

        var isDragging = false

        val button = ImageView(this).apply {

            scaleType = ImageView.ScaleType.FIT_CENTER

            setPadding(
                dp(14),
                dp(14),
                dp(14),
                dp(14)
            )

            background = defaultBackground

            elevation = dp(6).toFloat()

            isClickable = true

            setOnTouchListener { view, event ->

                when (event.actionMasked) {

                    MotionEvent.ACTION_DOWN -> {

                        downRawX = event.rawX
                        downRawY = event.rawY

                        startX = params.x
                        startY = params.y

                        isDragging = false
                        longPressFired = false

                        handler.postDelayed({
                            if (!isDragging && floatingView != null) {
                                longPressFired = true
                                view.performHapticFeedback(
                                    android.view.HapticFeedbackConstants.LONG_PRESS
                                )
                                openModeMenu()
                            }
                        }, longPressTimeout)

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
                            handler.removeCallbacksAndMessages(null)
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

                        handler.removeCallbacksAndMessages(null)

                        if (!isDragging && !longPressFired) {

                            handleBubbleTap()
                        }

                        isDragging = false

                        true
                    }

                    MotionEvent.ACTION_CANCEL -> {

                        handler.removeCallbacksAndMessages(null)

                        isDragging = false
                        longPressFired = false

                        true
                    }

                    else -> true
                }
            }
        }

        // Garante que a posição inicial fique visível.
        clampFloatingPosition(params)

        applyModeAppearanceOn(button)

        windowManager?.addView(button, params)

        floatingView = button
        buttonView = button

        // Primeiro uso: sem modo salvo, abre o menu de seleção.
        if (getSelectedMode().isEmpty()) {
            menuMode = true
            openModeMenuInternal()
        }

        Log.d(TAG, "Botão flutuante iniciado")
    }

    private fun applyModeAppearanceOn(button: ImageView) {
        if (getSelectedMode() == MODE_WHATSAPP) {
            button.setImageResource(R.drawable.ic_floating_whatsapp)
            button.background = whatsappBackground
            button.contentDescription = "WhatsApp"
        } else {
            button.setImageResource(R.drawable.ic_floating_copy)
            button.background = defaultBackground
            button.contentDescription = "Botão flutuante"
        }
    }

    private fun handleBubbleTap() {

        if (menuMode) {
            closeMenuMode()
            return
        }

        when (getSelectedMode()) {

            MODE_WHATSAPP -> {
                val phone = FloatingFillAccessibilityService.findPhoneOnScreen()

                if (phone == null) {
                    showTransientMessage("Telefone não encontrado nesta tela.")
                    return
                }

                openWhatsAppChat(phone)
            }

            else -> {
                if (FloatingFillAccessibilityService.isOnOrderScreen()) {
                    val name = FloatingFillAccessibilityService.findRecipientNameOnScreen()

                    if (name == null) {
                        RecipientNameStore.clear()
                        showTransientMessage("Nome do destinatário não encontrado.")
                        return
                    }

                    RecipientNameStore.set(name)

                    if (copyToClipboard(name)) {
                        showTransientMessage("Nome copiado!")
                    } else {
                        showTransientMessage("Nome do destinatário não encontrado.")
                    }
                    return
                }

                val number = generateNumber()

                if (
                    isAutoFillEnabled(this) &&
                    FloatingFillAccessibilityService.fillFocusedInput(number)
                ) {
                    showCopiedFeedback()
                    return
                }

                val copied = copyToClipboard(number)

                if (copied) {
                    showCopiedFeedback()
                }
            }
        }
    }

    // =========================================================
    // MENU DE MODO
    // =========================================================

    private fun openModeMenu() {

        if (menuMode) return

        if (menuView != null) return

        menuMode = true

        openModeMenuInternal()
    }

    private fun openModeMenuInternal() {

        val wm = windowManager ?: return

        if (menuView != null) return

        val menu = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL

            background = GradientDrawable().apply {
                cornerRadius = dp(16).toFloat()
                setColor(Color.parseColor("#F8FAFC"))
                setStroke(dp(1), Color.parseColor("#CBD5E1"))
            }

            elevation = dp(10).toFloat()

            alpha = 0f
            animate().alpha(1f).setDuration(120).start()
        }

        menu.addView(
            buildMenuOption(
                label = "Gerar número",
                iconRes = R.drawable.ic_floating_copy,
                iconTint = Color.parseColor("#1D4ED8")
            ) {
                selectMode(MODE_NUMBER)
            }
        )

        menu.addView(
            buildMenuOption(
                label = "WhatsApp",
                iconRes = R.drawable.ic_floating_whatsapp,
                iconTint = Color.parseColor("#25D366")
            ) {
                selectMode(MODE_WHATSAPP)
            }
        )

        val menuParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            },
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        )

        val button = buttonView

        if (button != null) {
            val loc = IntArray(2)
            button.getLocationOnScreen(loc)

            menuParams.gravity = Gravity.TOP or Gravity.START
            menuParams.x = loc[0]
            menuParams.y = loc[1] + button.height + dp(8)
        } else {
            menuParams.gravity = Gravity.CENTER
        }

        try {
            wm.addView(menu, menuParams)
            menuView = menu
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao abrir menu do botão flutuante", e)
            menuMode = false
        }
    }

    private fun buildMenuOption(
        label: String,
        iconRes: Int,
        iconTint: Int,
        onClick: () -> Unit
    ): View {

        val row = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL

            setPadding(dp(16), dp(12), dp(20), dp(12))

            isClickable = true
            isFocusable = true

            setOnClickListener { onClick() }
        }

        // Efeito de toque.
        row.setOnTouchListener { v, event ->
            when (event.actionMasked) {
                MotionEvent.ACTION_DOWN -> {
                    v.alpha = 0.6f
                    false
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                    v.alpha = 1f
                    false
                }
                else -> false
            }
        }

        val icon = ImageView(this).apply {
            setImageResource(iconRes)
            setColorFilter(iconTint)
            layoutParams = LinearLayout.LayoutParams(dp(22), dp(22))
        }

        row.addView(icon)

        val text = TextView(this).apply {
            setText(label)
            setTextColor(Color.parseColor("#0F172A"))
            textSize = 14f
            layoutParams = LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                LinearLayout.LayoutParams.WRAP_CONTENT
            ).apply {
                marginStart = dp(10)
            }
        }

        row.addView(text)

        return row
    }

    private fun selectMode(mode: String) {

        setSelectedMode(mode)

        applyModeAppearance()

        closeMenuMode()
    }

    private fun closeMenuMode() {

        menuMode = false

        val menu = menuView ?: return

        try {
            windowManager?.removeView(menu)
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao fechar menu do botão flutuante", e)
        }

        menuView = null
    }

    // =========================================================
    // POSIÇÃO
    // =========================================================

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

        closeMenuModeSafely()

        floatingView = null
        buttonView = null
        windowManager = null
    }

    private fun closeMenuModeSafely() {
        menuView = null
        menuMode = false
    }

    // =========================================================
    // GERADOR DE NÚMERO
    // =========================================================

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
                "Número Otimiza Flash",
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

    private fun openWhatsAppChat(phone: String) {

        val digits = phone.filter { it.isDigit() }

        val message = "Olá, tudo bem? 😊 Sou entregador da Shopee e estou entrando em contato sobre sua entrega. 📦🛵"

        val encodedMessage = android.net.Uri.encode(message) 

        val uri = android.net.Uri.parse(
            "https://api.whatsapp.com/send?phone=$digits&text=$encodedMessage"
        )

        val intent = Intent(Intent.ACTION_VIEW).apply {
            data = uri
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        try {
            startActivity(intent)
        } catch (e: Exception) {
            Log.e(TAG, "WhatsApp indisponível", e)
            showTransientMessage("Não foi possível abrir o WhatsApp.")
        }
    }

    private fun showTransientMessage(message: String) {

        val button = buttonView ?: return

        feedbackRunnable?.let {
            handler.removeCallbacks(it)
        }

        button.animate().cancel()

        val toast = android.widget.Toast.makeText(
            this,
            message,
            android.widget.Toast.LENGTH_SHORT
        )

        toast.show()
    }

    private fun showCopiedFeedback() {

        val button = buttonView ?: return

        feedbackRunnable?.let {
            handler.removeCallbacks(it)
        }

        button.animate().cancel()

        val currentIcon =
            if (getSelectedMode() == MODE_WHATSAPP) {
                R.drawable.ic_floating_whatsapp
            } else {
                R.drawable.ic_floating_copy
            }

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

            button.setImageResource(currentIcon)

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

        private const val AUTO_FILL_PREFS = "floating_number_prefs"
        private const val AUTO_FILL_KEY = "auto_fill_enabled"

        private const val MODE_PREFS = "floating_number_prefs"
        private const val MODE_KEY = "selected_mode"

        const val MODE_NUMBER = "number"
        const val MODE_WHATSAPP = "whatsapp"

        @Volatile
        var isRunning: Boolean = false
            private set

        fun isAutoFillEnabled(context: Context): Boolean {
            return context
                .getSharedPreferences(AUTO_FILL_PREFS, Context.MODE_PRIVATE)
                .getBoolean(AUTO_FILL_KEY, false)
        }

        fun setAutoFillEnabled(context: Context, enabled: Boolean) {
            context
                .getSharedPreferences(AUTO_FILL_PREFS, Context.MODE_PRIVATE)
                .edit()
                .putBoolean(AUTO_FILL_KEY, enabled)
                .apply()
        }
    }
}
