package com.stitchbud.model

import jakarta.persistence.*
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction

@Entity
@Table(name = "row_counters")
class RowCounter(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    var stitchesPerRound: Int = 0,
    var totalRounds: Int = 0,
    @Column(columnDefinition = "TEXT")
    var checkedStitches: String = "[]",
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    var project: Project? = null
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other !is RowCounter) return false
        if (id == 0L || other.id == 0L) return false
        return id == other.id
    }

    override fun hashCode(): Int = if (id != 0L) id.hashCode() else System.identityHashCode(this)
}
