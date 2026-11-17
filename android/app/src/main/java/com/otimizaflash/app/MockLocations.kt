package com.otimizaflash.app

object MockLocations {

    data class MockLocation(
        val id: String,
        val name: String,
        val latitude: Double,
        val longitude: Double
    )

    private val LOCATIONS = listOf(
        MockLocation(
            id = "1",
            name = "Vila Guilherme",
            latitude = -23.52012080,
            longitude = -46.60543151
        )
    )

    fun findById(id: String): MockLocation? = LOCATIONS.find { it.id == id }

    fun hasCoordinates(id: String): Boolean = findById(id) != null
}
