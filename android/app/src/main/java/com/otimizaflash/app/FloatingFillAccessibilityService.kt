package com.otimizaflash.app

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.Bundle
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.text.Normalizer
import java.util.Locale

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

    private fun performSetText(node: AccessibilityNodeInfo, text: String): Boolean {
        val args = Bundle().apply {
            putCharSequence(
                AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE,
                text
            )
        }
        return node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
    }

    private fun setTextOnFocusedInput(text: String): Boolean {
        val root = rootInActiveWindow ?: return false

        try {
            root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT)?.let { target ->
                try {
                    if (target.isEditable && !target.isPassword && performSetText(target, text)) {
                        return true
                    }
                } finally {
                    target.recycle()
                }
            }

            // Sem campo focado: procura o campo "Número do documento" na tela ativa.
            return fillDocumentNumberField(root, text)
        } finally {
            root.recycle()
        }
    }

    private fun fillDocumentNumberField(root: AccessibilityNodeInfo, text: String): Boolean {
        val editable = mutableListOf<AccessibilityNodeInfo>()
        collectEditableNodes(root, editable)

        if (editable.isEmpty()) return false

        val candidates = editable.filter { isDocumentNumberField(it) }

        if (candidates.size != 1) {
            editable.forEach { it.recycle() }
            return false
        }

        val filled = performSetText(candidates.first(), text)
        editable.forEach { it.recycle() }
        return filled
    }

    private fun collectEditableNodes(
        node: AccessibilityNodeInfo,
        out: MutableList<AccessibilityNodeInfo>
    ) {
        if (node.isEditable && !node.isPassword) {
            out.add(node)
        }

        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { collectEditableNodes(it, out) }
        }
    }

    private fun isDocumentNumberField(node: AccessibilityNodeInfo): Boolean {
        if (labelMatches(node)) return true

        node.labeledBy?.let { label ->
            if (labelMatches(label)) return true
        }

        val parent = node.parent ?: return false

        for (i in 0 until parent.childCount) {
            val sibling = parent.getChild(i) ?: continue
            if (sibling.isEditable) continue
            if (labelMatches(sibling)) return true
        }

        return false
    }

    private fun labelMatches(node: AccessibilityNodeInfo): Boolean {
        val sources = listOfNotNull(
            node.hint,
            node.contentDescription,
            node.text
        )

        return sources.any { normalize(it.toString()).contains("numero do documento") }
    }

    private fun normalize(value: String): String =
        Normalizer.normalize(value, Normalizer.Form.NFD)
            .replace(Regex("\\p{M}+"), "")
            .lowercase(Locale.ROOT)
            .trim()

    companion object {

        @Volatile
        private var instance: FloatingFillAccessibilityService? = null

        fun isConnected(): Boolean = instance != null

        fun fillFocusedInput(text: String): Boolean =
            instance?.setTextOnFocusedInput(text) ?: false
    }
}
