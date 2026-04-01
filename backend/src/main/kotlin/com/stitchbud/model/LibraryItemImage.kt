package com.stitchbud.model

import jakarta.persistence.*

@Entity
@Table(name = "library_item_images")
data class LibraryItemImage(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    var storedName: String = "",
    var originalName: String = "",
    var isMain: Boolean = false,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_item_id")
    var libraryItem: LibraryItem? = null
)
