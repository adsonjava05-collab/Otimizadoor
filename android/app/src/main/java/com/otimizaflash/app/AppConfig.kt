package com.otimizaflash.app

import android.net.Uri

/**
 * Configuração central do aplicativo.
 *
 * Para trocar o endereço do aplicativo, altere apenas [APP_URL],
 * gere um novo APK e instale. O domínio utilizado nas validações
 * de origem acompanha automaticamente a nova URL.
 */
object AppConfig {

    /**
     * URL principal carregada pela WebView.
     */
    const val APP_URL = "https://otimizaflash.vercel.app/"

    /**
     * Domínio extraído automaticamente de [APP_URL].
     */
    val APP_HOST: String =
        try {
            Uri.parse(APP_URL).host?.lowercase().orEmpty()
        } catch (e: Exception) {
            ""
        }
}
