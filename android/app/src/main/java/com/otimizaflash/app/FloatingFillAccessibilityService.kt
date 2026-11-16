package com.otimizaflash.app

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.Bundle
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

class FloatingFillAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
    }

    override fun onUnbind(intent: Intent?): Boolean {
        instance = null
        return super.onUnbind(intent)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}

    override fun onInterrupt() {}

    private fun setTextOnFocusedInput(text: String): Boolean {
        val root = rootInActiveWindow ?: return false
        val target = root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT)
        root.recycle()

        if (target == null) return false

        return try {
            if (!target.isEditable || target.isPassword) return false

            val args = Bundle().apply {
                putCharSequence(
                    AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE,
                    text
                )
            }

            target.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
        } finally {
            target.recycle()
        }
    }

    companion object {

        @Volatile
        private var instance: FloatingFillAccessibilityService? = null

        fun isConnected(): Boolean = instance != null

        fun fillFocusedInput(text: String): Boolean =
            instance?.setTextOnFocusedInput(text) ?: false
    }
}
