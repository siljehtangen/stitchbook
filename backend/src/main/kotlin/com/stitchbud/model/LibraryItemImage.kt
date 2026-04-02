package com.stitchbud.model

import jakarta.persistence.*

@Entity
@Table(name = "library_item_images")
class LibraryItemImage(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    var storedName: String = "",
    var originalName: String = "",
    var isMain: Boolean = false,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "library_item_id")
    var libraryItem: LibraryItem? = null
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is LibraryItemImage) return false
        if (id == 0L || other.id == 0L) return false
        return id == other.id
    }

    override fun hashCode(): Int = if (id != 0L) id.hashCode() else System.identityHashCode(this)
}
