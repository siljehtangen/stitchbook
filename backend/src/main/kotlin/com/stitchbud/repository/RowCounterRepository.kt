package com.stitchbud.repository

import com.stitchbud.model.RowCounter
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface RowCounterRepository : JpaRepository<RowCounter, Long> {
    @Modifying
    @Query("DELETE FROM RowCounter r WHERE r.project.userId = :userId")
    fun deleteAllByProjectUserId(userId: String)

    @Modifying
    @Query("DELETE FROM RowCounter r WHERE r.project.id = :projectId")
    fun deleteAllByProjectId(projectId: Long)
}
