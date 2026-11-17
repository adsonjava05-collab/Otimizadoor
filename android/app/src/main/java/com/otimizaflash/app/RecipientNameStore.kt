package com.otimizaflash.app

/**
 * Armazenamento temporário (em memória) do último nome de destinatário
 * capturado pelo botão flutuante. Não persiste: dura apenas enquanto os
 * serviços estão ativos. Um novo nome substitui completamente o anterior;
 * uma captura que falha limpa o valor guardado.
 */
internal object RecipientNameStore {

    @Volatile
    private var name: String? = null

    fun set(name: String?) {
        this.name = name
    }

    fun clear() {
        this.name = null
    }

    fun get(): String? = this.name
}
