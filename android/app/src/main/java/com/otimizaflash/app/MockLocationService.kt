package com.otimizaflash.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.location.Criteria
import android.location.Location
import android.location.LocationManager
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.SystemClock
import android.util.Log
import androidx.core.app.NotificationCompat

class MockLocationService : Service() {

    companion object {
        private const val TAG = "MockLocation"
        private const val CHANNEL_ID = "mock_location_channel"
        private const val NOTIFICATION_ID = 8801
        private const val UPDATE_INTERVAL_MS = 1000L
        private const val PROVIDER = LocationManager.GPS_PROVIDER

        const val ACTION_START = "com.otimizaflash.app.START_MOCK"
        const val ACTION_STOP = "com.otimizaflash.app.STOP_MOCK"
        const val EXTRA_LOCATION_ID = "location_id"

        @Volatile
        var isRunning = false

        @Volatile
        var activeLocationId: String? = null

        @Volatile
        var lastError: String? = null
    }

    private var locationManager: LocationManager? = null
    private val handler = Handler(Looper.getMainLooper())
    private var updateRunnable: Runnable? = null
    private var currentLat = 0.0
    private var currentLon = 0.0

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        locationManager = getSystemService(Context.LOCATION_SERVICE) as LocationManager
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val id = intent.getStringExtra(EXTRA_LOCATION_ID)
                if (id != null) handleStart(id)
            }
            ACTION_STOP -> handleStop()
        }
        return START_NOT_STICKY
    }

    private fun handleStart(locationId: String) {
        val loc = MockLocations.findById(locationId)
        if (loc == null) {
            lastError = "no_coordinates"
            isRunning = false
            activeLocationId = null
            stopSelf()
            return
        }

        cleanupProvider()

        try {
            startForegroundWithNotification(loc.name)
        } catch (e: Exception) {
            Log.e(TAG, "Falha ao iniciar foreground", e)
            lastError = "unknown"
            isRunning = false
            activeLocationId = null
            stopSelf()
            return
        }

        try {
            val lm = locationManager
                ?: throw IllegalStateException("LocationManager indisponível")

            lm.addTestProvider(
                PROVIDER,
                false,
                false,
                false,
                false,
                true,
                true,
                true,
                Criteria.POWER_LOW
            )
            lm.setTestProviderEnabled(PROVIDER, true)

            currentLat = loc.latitude
            currentLon = loc.longitude
            activeLocationId = locationId
            lastError = null
            isRunning = true

            startUpdating()
            Log.d(TAG, "Mock location iniciado: ${loc.name}")
        } catch (e: SecurityException) {
            Log.e(TAG, "App não selecionado como mock location provider", e)
            lastError = "not_mock_app"
            isRunning = false
            activeLocationId = null
            cleanupProvider()
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao iniciar mock location", e)
            lastError = "unknown"
            isRunning = false
            activeLocationId = null
            cleanupProvider()
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        }
    }

    private fun handleStop() {
        cleanupProvider()
        isRunning = false
        activeLocationId = null
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
        Log.d(TAG, "Mock location parado")
    }

    private fun startUpdating() {
        updateRunnable = object : Runnable {
            override fun run() {
                pushLocation()
                handler.postDelayed(this, UPDATE_INTERVAL_MS)
            }
        }
        handler.post(updateRunnable!!)
    }

    private fun pushLocation() {
        val lm = locationManager ?: return
        try {
            val mockLoc = Location(PROVIDER).apply {
                latitude = currentLat
                longitude = currentLon
                altitude = 0.0
                accuracy = 1.0f
                speed = 0.0f
                bearing = 0.0f
                time = System.currentTimeMillis()
                elapsedRealtimeNanos = SystemClock.elapsedRealtimeNanos()
            }
            lm.setTestProviderLocation(PROVIDER, mockLoc)
        } catch (e: Exception) {
            Log.e(TAG, "Erro ao atualizar mock location", e)
            handleStop()
        }
    }

    private fun cleanupProvider() {
        updateRunnable?.let { handler.removeCallbacks(it) }
        updateRunnable = null
        try {
            locationManager?.setTestProviderEnabled(PROVIDER, false)
        } catch (_: Exception) {
        }
        try {
            locationManager?.removeTestProvider(PROVIDER)
        } catch (_: Exception) {
        }
    }

    override fun onDestroy() {
        cleanupProvider()
        isRunning = false
        activeLocationId = null
        super.onDestroy()
    }

    private fun startForegroundWithNotification(locationName: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Localização simulada",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_floating_copy)
            .setContentTitle("Localização simulada ativa")
            .setContentText("$locationName (demonstração)")
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }
    }
}
