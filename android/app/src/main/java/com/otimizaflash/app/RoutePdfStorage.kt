package com.otimizaflash.app

import android.content.ContentValues
import android.content.Context
import android.media.MediaScannerConnection
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Armazenamento permanente dos PDFs gerados pelo aplicativo.
 *
 * Android 10+:
 * Salva na pasta pública Downloads utilizando MediaStore.
 *
 * Android 9 ou inferior:
 * Tenta salvar na pasta pública Downloads.
 * Caso não seja possível, utiliza o armazenamento privado.
 *
 * Padrão dos arquivos:
 * Rota_DD-MM.pdf
 * Rota2_DD-MM.pdf
 * Rota3_DD-MM.pdf
 */
object RoutePdfStorage {

    private const val TAG = "RoutePdfStorage"
    private const val BASE_NAME = "Rota"
    private const val MIME_TYPE = "application/pdf"
    private const val PRIVATE_DIR = "route_pdfs"

    private val namePattern = Regex(
        """Rota(\d*)_(\d{2}-\d{2})\.pdf"""
    )

    /**
     * Salva uma cópia permanente do PDF.
     *
     * Retorna o nome do arquivo salvo ou null em caso de erro.
     */
    @Synchronized
    fun save(
        context: Context,
        bytes: ByteArray,
        now: Date = Date()
    ): String? {

        if (bytes.isEmpty()) {
            Log.e(TAG, "PDF vazio. Salvamento cancelado.")
            return null
        }

        return try {

            val dayMonth = SimpleDateFormat(
                "dd-MM",
                Locale.US
            ).format(now)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {

                saveViaMediaStore(
                    context,
                    bytes,
                    dayMonth
                )

            } else {

                saveLegacy(
                    context,
                    bytes,
                    dayMonth
                )
            }

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Falha ao salvar PDF permanente",
                e
            )

            null
        }
    }

    /**
     * Android 10 ou superior.
     */
    private fun saveViaMediaStore(
        context: Context,
        bytes: ByteArray,
        dayMonth: String
    ): String? {

        val resolver = context.contentResolver

        for (attempt in 0 until 100) {

            val name = nextAvailableName(
                context,
                dayMonth
            )

            val values = ContentValues().apply {

                put(
                    MediaStore.MediaColumns.DISPLAY_NAME,
                    name
                )

                put(
                    MediaStore.MediaColumns.MIME_TYPE,
                    MIME_TYPE
                )

                put(
                    MediaStore.MediaColumns.RELATIVE_PATH,
                    "${Environment.DIRECTORY_DOWNLOADS}/"
                )

                put(
                    MediaStore.MediaColumns.IS_PENDING,
                    1
                )
            }

            var uri: Uri? = null

            try {

                uri = resolver.insert(
                    MediaStore.Downloads.EXTERNAL_CONTENT_URI,
                    values
                )

                if (uri == null) {
                    Log.w(
                        TAG,
                        "MediaStore não criou o arquivo: $name"
                    )
                    continue
                }

                val outputStream = resolver.openOutputStream(
                    uri,
                    "w"
                ) ?: throw IllegalStateException(
                    "Não foi possível abrir o arquivo PDF"
                )

                outputStream.use { stream ->

                    stream.write(bytes)
                    stream.flush()
                }

                val updateValues = ContentValues().apply {

                    put(
                        MediaStore.MediaColumns.IS_PENDING,
                        0
                    )
                }

                val updated = resolver.update(
                    uri,
                    updateValues,
                    null,
                    null
                )

                if (updated <= 0) {
                    throw IllegalStateException(
                        "Não foi possível finalizar o PDF"
                    )
                }

                val actualName = queryDisplayName(
                    context,
                    uri
                ) ?: name

                if (namePattern.matches(actualName)) {

                    Log.i(
                        TAG,
                        "PDF salvo em Downloads: $actualName"
                    )

                    return actualName
                }

                Log.w(
                    TAG,
                    "Nome inesperado: $actualName"
                )

                resolver.delete(
                    uri,
                    null,
                    null
                )

            } catch (e: Exception) {

                Log.e(
                    TAG,
                    "Erro ao salvar PDF: $name",
                    e
                )

                uri?.let { createdUri ->

                    runCatching {

                        resolver.delete(
                            createdUri,
                            null,
                            null
                        )
                    }
                }

                return savePrivate(
                    context,
                    bytes,
                    name
                )
            }
        }

        Log.e(
            TAG,
            "Não foi possível gerar um nome disponível"
        )

        return savePrivate(
            context,
            bytes,
            nextAvailableName(context, dayMonth)
        )
    }

    /**
     * Android 9 ou inferior.
     */
    private fun saveLegacy(
        context: Context,
        bytes: ByteArray,
        dayMonth: String
    ): String? {

        val name = nextAvailableName(
            context,
            dayMonth
        )

        val publicDir =
            Environment.getExternalStoragePublicDirectory(
                Environment.DIRECTORY_DOWNLOADS
            )

        val target = File(
            publicDir,
            name
        )

        return try {

            if (!publicDir.exists() && !publicDir.mkdirs()) {
                throw IllegalStateException(
                    "Não foi possível criar Downloads"
                )
            }

            FileOutputStream(target).use { stream ->

                stream.write(bytes)
                stream.flush()
            }

            MediaScannerConnection.scanFile(
                context,
                arrayOf(target.absolutePath),
                arrayOf(MIME_TYPE),
                null
            )

            Log.i(
                TAG,
                "PDF salvo: ${target.absolutePath}"
            )

            name

        } catch (e: Exception) {

            Log.w(
                TAG,
                "Sem acesso à pasta Downloads",
                e
            )

            if (target.exists()) {
                runCatching {
                    target.delete()
                }
            }

            savePrivate(
                context,
                bytes,
                name
            )
        }
    }

    /**
     * Armazenamento privado de segurança.
     */
    private fun savePrivate(
        context: Context,
        bytes: ByteArray,
        suggestedName: String
    ): String? {

        return try {

            val dir = File(
                context.filesDir,
                PRIVATE_DIR
            )

            if (!dir.exists() && !dir.mkdirs()) {
                throw IllegalStateException(
                    "Não foi possível criar diretório privado"
                )
            }

            val target = uniquePrivateFile(
                dir,
                suggestedName
            )

            FileOutputStream(target).use { stream ->

                stream.write(bytes)
                stream.flush()
            }

            Log.i(
                TAG,
                "PDF salvo no armazenamento privado: ${target.name}"
            )

            target.name

        } catch (e: Exception) {

            Log.e(
                TAG,
                "Falha ao salvar PDF privado",
                e
            )

            null
        }
    }

    /**
     * Evita sobrescrever arquivos privados existentes.
     */
    private fun uniquePrivateFile(
        directory: File,
        suggestedName: String
    ): File {

        var target = File(
            directory,
            suggestedName
        )

        if (!target.exists()) {
            return target
        }

        val match = namePattern.matchEntire(
            suggestedName
        )

        if (match != null) {

            val dayMonth = match.groupValues[2]

            var number = 2

            while (true) {

                target = File(
                    directory,
                    "${BASE_NAME}${number}_${dayMonth}.pdf"
                )

                if (!target.exists()) {
                    return target
                }

                number++
            }
        }

        var number = 2

        val base = suggestedName.substringBeforeLast(
            ".pdf"
        )

        while (true) {

            target = File(
                directory,
                "${base}_$number.pdf"
            )

            if (!target.exists()) {
                return target
            }

            number++
        }
    }

    /**
     * Consulta o nome real do arquivo no MediaStore.
     */
    private fun queryDisplayName(
        context: Context,
        uri: Uri
    ): String? {

        return try {

            context.contentResolver.query(
                uri,
                arrayOf(
                    MediaStore.MediaColumns.DISPLAY_NAME
                ),
                null,
                null,
                null
            )?.use { cursor ->

                if (cursor.moveToFirst()) {

                    cursor.getString(
                        cursor.getColumnIndexOrThrow(
                            MediaStore.MediaColumns.DISPLAY_NAME
                        )
                    )

                } else {

                    null
                }
            }

        } catch (e: Exception) {

            Log.w(
                TAG,
                "Erro ao consultar nome do PDF",
                e
            )

            null
        }
    }

    /**
     * Gera o próximo nome disponível.
     */
    private fun nextAvailableName(
        context: Context,
        dayMonth: String
    ): String {

        val used = existingSuffixes(
            context,
            dayMonth
        )

        if (!used.contains("")) {

            return "${BASE_NAME}_${dayMonth}.pdf"
        }

        var number = 2

        while (used.contains(number.toString())) {
            number++
        }

        return "${BASE_NAME}${number}_${dayMonth}.pdf"
    }

    /**
     * Identifica os nomes já utilizados em Downloads.
     */
    private fun existingSuffixes(
        context: Context,
        dayMonth: String
    ): Set<String> {

        val used = mutableSetOf<String>()

        val datePattern = Regex(
            """Rota(\d*)_${Regex.escape(dayMonth)}\.pdf"""
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {

            val projection = arrayOf(
                MediaStore.MediaColumns.DISPLAY_NAME
            )

            val selection = StringBuilder().apply {

                append(
                    "${MediaStore.MediaColumns.RELATIVE_PATH}=?"
                )

                append(
                    " AND ${MediaStore.MediaColumns.IS_PENDING}=0"
                )

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {

                    append(
                        " AND ${MediaStore.MediaColumns.IS_TRASHED}=0"
                    )
                }
            }

            val args = arrayOf(
                "${Environment.DIRECTORY_DOWNLOADS}/"
            )

            try {

                context.contentResolver.query(
                    MediaStore.Downloads.EXTERNAL_CONTENT_URI,
                    projection,
                    selection.toString(),
                    args,
                    null
                )?.use { cursor ->

                    val index = cursor.getColumnIndexOrThrow(
                        MediaStore.MediaColumns.DISPLAY_NAME
                    )

                    while (cursor.moveToNext()) {

                        val fileName = cursor.getString(
                            index
                        ) ?: continue

                        val match = datePattern.matchEntire(
                            fileName
                        )

                        if (match != null) {

                            used.add(
                                match.groupValues[1]
                            )
                        }
                    }
                }

            } catch (e: Exception) {

                Log.w(
                    TAG,
                    "Erro ao listar PDFs em Downloads",
                    e
                )
            }

        } else {

            val publicDir =
                Environment.getExternalStoragePublicDirectory(
                    Environment.DIRECTORY_DOWNLOADS
                )

            publicDir.listFiles()?.forEach { file ->

                val match = datePattern.matchEntire(
                    file.name
                )

                if (match != null) {

                    used.add(
                        match.groupValues[1]
                    )
                }
            }
        }

        return used
    }
}