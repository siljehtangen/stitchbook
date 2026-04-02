package com.stitchbud.model

import jakarta.persistence.*

@Entity
@Table(name = "materials")
class Material(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    var name: String,
    var type: String,
    var itemType: String? = null,
    var color: String = "",
    var colorHex: String = "#000000",
    var amount: String = "",
    var unit: String = "g",
    var imageUrl: String? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    var project: Project? = null
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is Material) return false
        if (id == 0L || other.id == 0L) return false
        return id == other.id
    }

    override fun hashCode(): Int = if (id != 0L) id.hashCode() else System.identityHashCode(this)
}
