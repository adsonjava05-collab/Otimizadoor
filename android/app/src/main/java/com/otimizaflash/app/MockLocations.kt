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
        ),
        MockLocation(
            id = "2",
            name = "Lapa",
            latitude = -23.51774718,
            longitude = -46.72421649
        ),
        MockLocation(
    id = "3",
    name = "Guarulhos",
    latitude = -23.489981,
    longitude = -46.539874
)
    )

    fun findById(id: String): MockLocation? = LOCATIONS.find { it.id == id }

    fun hasCoordinates(id: String): Boolean = findById(id) != null
}
