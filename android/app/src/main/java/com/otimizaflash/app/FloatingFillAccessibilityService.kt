package com.otimizaflash.app

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo
import java.text.Normalizer
import java.util.Locale
import kotlin.math.abs

class FloatingFillAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
    }

    override fun onUnbind(intent: Intent?): Boolean {
        if (instance === this) instance = null
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        if (instance === this) instance = null
        super.onDestroy()
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
        val root = rootInActiveWindow ?: run {
            Log.d(TAG, "rootInActiveWindow indisponível — fallback cópia")
            return false
        }

        try {
            val editable = mutableListOf<AccessibilityNodeInfo>()
            collectEditableNodes(root, editable)
            Log.d(TAG, "Campos editáveis encontrados: ${editable.size}")

            // 1. Prioridade: campo "Número do Documento" (por placeholder/hint).
            val placeholderMatch = editable.firstOrNull { matchesPlaceholder(it) }
            if (placeholderMatch != null && labelConfirmsDocumentNumber(placeholderMatch, editable)) {
                Log.d(TAG, "Campo identificado por placeholder/hint compatível")
                val ok = performSetText(placeholderMatch, text)
                Log.d(TAG, "ACTION_SET_TEXT (placeholder): $ok")
                if (ok) return true
            }

            // 2. Campo "Número do Documento" por rótulo/proximidade.
            val labelCandidates = editable.filter { isDocumentNumberFieldByLabel(it, editable) }
            Log.d(TAG, "Candidatos por rótulo 'Número do Documento': ${labelCandidates.size}")
            if (labelCandidates.size == 1) {
                Log.d(TAG, "Campo identificado por rótulo 'Número do Documento'")
                val ok = performSetText(labelCandidates.first(), text)
                Log.d(TAG, "ACTION_SET_TEXT (rótulo): $ok")
                if (ok) return true
            }

            // 3. Campo editável focado (fallback, sem invadir campo sensível).
            root.findFocus(AccessibilityNodeInfo.FOCUS_INPUT)?.let { focused ->
                try {
                    if (focused.isEditable && !focused.isPassword && !isDocumentNumberLabelMissing(focused)) {
                        Log.d(TAG, "Usando campo focado como fallback")
                        val ok = performSetText(focused, text)
                        Log.d(TAG, "ACTION_SET_TEXT (foco): $ok")
                        if (ok) return true
                    }
                } finally {
                    focused.recycle()
                }
            }

            Log.d(TAG, "Nenhuma inserção possível — fallback cópia")
            return false
        } finally {
            root.recycle()
        }
    }

    // ── Coleta de campos editáveis ────────────────────────────────────────

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

    // ── Identificação por placeholder/hint ────────────────────────────────

    private fun matchesPlaceholder(node: AccessibilityNodeInfo): Boolean {
        val sources = listOfNotNull(node.hintText, node.text, node.contentDescription)
        return sources.any { src ->
            val n = normalize(src.toString())
            n.contains("informe o rg") || n.contains("informe o cpf") ||
                n.contains("informe seu rg") || n.contains("informe seu cpf")
        }
    }

    /**
     * Confirma se o campo que casou com o placeholder está associado ao
     * rótulo "Número do Documento", quando essa informação existe na tela.
     * Se o rótulo não existir, aceita só se houver exatamente um candidato
     * de placeholder.
     */
    private fun labelConfirmsDocumentNumber(
        candidate: AccessibilityNodeInfo,
        editable: List<AccessibilityNodeInfo>
    ): Boolean {
        val hasLabel = editable.any { hasDocumentNumberLabel(it, editable) } ||
            anyNodeHasDocumentNumberText()

        if (!hasLabel) {
            val placeholders = editable.count { matchesPlaceholder(it) }
            return placeholders == 1
        }

        return hasDocumentNumberLabel(candidate, editable)
    }

    // ── Identificação por rótulo "Número do Documento" ────────────────────

    private fun isDocumentNumberFieldByLabel(
        node: AccessibilityNodeInfo,
        editable: List<AccessibilityNodeInfo>
    ): Boolean = hasDocumentNumberLabel(node, editable)

    private fun hasDocumentNumberLabel(
        node: AccessibilityNodeInfo,
        editable: List<AccessibilityNodeInfo>
    ): Boolean {
        // labeledBy aponta para o rótulo vinculado pelo framework.
        node.labeledBy?.let { label ->
            if (nodeTextContainsDocumentNumber(label)) return true
        }

        // viewIdResourceName pode conter "document" / "numero".
        node.viewIdResourceName?.let { id ->
            if (normalize(id).contains("numero") && normalize(id).contains("documento")) return true
        }

        // Irmãos dentro do mesmo pai.
        val parent = node.parent ?: return false
        for (i in 0 until parent.childCount) {
            val sibling = parent.getChild(i) ?: continue
            if (sibling === node) continue
            if (nodeTextContainsDocumentNumber(sibling)) {
                if (editable.size > 1 && isAmbiguousSibling(node, sibling, parent, editable)) {
                    return false
                }
                return true
            }
        }
        return false
    }

    /**
     * Evita falsos positivos: se houver outro campo editável colado no
     * mesmo rótulo, considera ambíguo.
     */
    private fun isAmbiguousSibling(
        candidate: AccessibilityNodeInfo,
        label: AccessibilityNodeInfo,
        parent: AccessibilityNodeInfo,
        editable: List<AccessibilityNodeInfo>
    ): Boolean {
        val labelRect = android.graphics.Rect().also { label.getBoundsInScreen(it) }
        val candidateRect = android.graphics.Rect().also { candidate.getBoundsInScreen(it) }
        val candidateCenterY = candidateRect.centerY()

        var sameRow = 0
        for (field in editable) {
            if (field === candidate) continue
            val fr = android.graphics.Rect().also { field.getBoundsInScreen(it) }
            if (abs(fr.centerY() - candidateCenterY) <= labelRect.height()) {
                sameRow++
            }
        }
        return sameRow > 0
    }

    // ── Utilitários de texto ─────────────────────────────────────────────

    private fun anyNodeHasDocumentNumberText(): Boolean {
        val root = rootInActiveWindow ?: return false
        return nodeTreeContainsText(root, "numero do documento")
    }

    private fun nodeTreeContainsText(node: AccessibilityNodeInfo, needle: String): Boolean {
        val sources = listOfNotNull(node.text, node.contentDescription, node.hintText)
        if (sources.any { normalize(it.toString()).contains(needle) }) return true
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { if (nodeTreeContainsText(it, needle)) return true }
        }
        return false
    }

    private fun nodeTextContainsDocumentNumber(node: AccessibilityNodeInfo): Boolean {
        val sources = listOfNotNull(node.text, node.contentDescription, node.hintText)
        return sources.any { normalize(it.toString()).contains("numero do documento") }
    }

    /**
     * Evita usar o campo focado como fallback quando ele claramente NÃO é o
     * campo de documento (por exemplo "Nome do recebedor" ou "Observação").
     */
    private fun isDocumentNumberLabelMissing(node: AccessibilityNodeInfo): Boolean {
        node.labeledBy?.let { label ->
            val n = normalize(
                listOfNotNull(label.text, label.contentDescription, label.hintText)
                    .joinToString(" ")
            )
            if (n.contains("nome") || n.contains("recebedor") || n.contains("observacao")) {
                return true
            }
        }
        return false
    }

    private fun normalize(value: String): String =
        Normalizer.normalize(value, Normalizer.Form.NFD)
            .replace(Regex("\\p{M}+"), "")
            .lowercase(Locale.ROOT)
            .trim()

    // ── Busca de telefone (modo WhatsApp) ───────────────────────────────

    private fun collectTexts(node: AccessibilityNodeInfo, out: MutableList<String>) {
        listOfNotNull(node.text, node.contentDescription, node.hintText).forEach {
            if (it.isNotBlank()) out.add(it.toString())
        }
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { collectTexts(it, out) }
        }
    }

    private fun extractPhoneCandidate(raw: String): String? {
        val candidates = PHONE_REGEX.findAll(raw).map { it.value.trim() }
        for (candidate in candidates) {
            val digits = candidate.filter { it.isDigit() }
            if (digits.length in 10..15) {
                return candidate
            }
        }
        return null
    }

    private fun findPhoneNumber(): String? {
        val root = rootInActiveWindow ?: return null
        try {
            val texts = mutableListOf<String>()
            collectTexts(root, texts)

            // 1. "Tel" e o número no mesmo elemento.
            for (text in texts) {
                val match = TEL_MARK_REGEX.find(text) ?: continue
                val remainder = text.substring(match.range.last + 1)
                extractPhoneCandidate(remainder)?.let { return it }
            }

            // 2. "Tel" isolado, número em elemento seguinte.
            for ((i, text) in texts.withIndex()) {
                if (normalize(text) != "tel") continue
                for (j in i + 1 until minOf(i + 4, texts.size)) {
                    extractPhoneCandidate(texts[j])?.let { return it }
                }
            }

            return null
        } finally {
            root.recycle()
        }
    }

    // ── Tela de baixa do pedido + nome do destinatário (modo Gerar número) ──

    /**
     * Coleta, em ordem de leitura (pré-ordem), todos os textos visíveis.
     * Returns the list; caller owns recycling of root.
     */
    private fun collectTextsOrdered(node: AccessibilityNodeInfo, out: MutableList<String>) {
        listOfNotNull(node.text, node.contentDescription, node.hintText).forEach {
            if (it.isNotBlank()) out.add(it.toString())
        }
        for (i in 0 until node.childCount) {
            node.getChild(i)?.let { collectTextsOrdered(it, out) }
        }
    }

    /**
     * Verifica se a tela atual é a de baixa do pedido reconhecendo
     * os elementos descritivos: título, seção do destinatário, botões.
     */
    private fun isOrderScreen(): Boolean {
        val root = rootInActiveWindow ?: return false
        try {
            val texts = mutableListOf<String>()
            collectTextsOrdered(root, texts)
            val joined = texts.joinToString(" ") { normalize(it) }

            val hasTitle = joined.contains("informacoes do pedido")
            val hasRecipientSection = joined.contains("informacoes do destinatario")
            val hasButtons = joined.contains("ocorrencia") && joined.contains("entregue")

            return hasTitle && hasRecipientSection && hasButtons
        } finally {
            root.recycle()
        }
    }

    /**
     * Busca o nome do destinatário na tela de baixa.
     * Estratégia: percorre os textos em ordem; ao encontrar "Informações do destinatário",
     * o próximo texto significativo que não for "Tel" (nem rótulo vazio) é o nome.
     * Pula rótulos/separadores conhecidos.
     */
    private fun findRecipientName(): String? {
        val root = rootInActiveWindow ?: return null
        try {
            val texts = mutableListOf<String>()
            collectTextsOrdered(root, texts)

            val recipientIdx = texts.indexOfFirst {
                normalize(it).contains("informacoes do destinatario")
            }
            if (recipientIdx < 0) return null

            for (i in (recipientIdx + 1) until texts.size) {
                val candidate = texts[i].trim()
                val normalized = normalize(candidate)
                if (normalized.isEmpty()) continue

                // Parou no campo Tel — nome não estava acima.
                if (normalized == "tel" || normalized.startsWith("tel ")) return null

                // Rótulos de seção/campo que não são o nome.
                if (normalized.contains("informacoes do") ||
                    normalized.contains("ocorrencia") ||
                    normalized.contains("entregue")
                ) continue

                // Ignora telefones.
                if (PHONE_REGEX.containsMatchIn(candidate) &&
                    candidate.filter { it.isDigit() }.length >= 10
                ) continue

                return candidate
            }

            return null
        } finally {
            root.recycle()
        }
    }

    companion object {

        private const val TAG = "OtimizaFlashAccessibility"

        private val TEL_MARK_REGEX = Regex("(?i)\\btel\\b")

        private val PHONE_REGEX = Regex("\\+?[\\d][\\d\\s()\\-.]{6,}")

        @Volatile
        private var instance: FloatingFillAccessibilityService? = null

        fun isConnected(): Boolean = instance != null

        fun fillFocusedInput(text: String): Boolean =
            instance?.setTextOnFocusedInput(text) ?: false

        fun findPhoneOnScreen(): String? =
            instance?.findPhoneNumber()

        fun isOnOrderScreen(): Boolean =
            instance?.isOrderScreen() ?: false

        fun findRecipientNameOnScreen(): String? =
            instance?.findRecipientName()
    }
}
