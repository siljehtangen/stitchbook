package com.stitchbud.repository

import com.stitchbud.model.PatternGrid
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface PatternGridRepository : JpaRepository<PatternGrid, Long> {
    @Modifying
    @Query("DELETE FROM PatternGrid pg WHERE pg.project.userId = :userId")
    fun deleteAllByProjectUserId(userId: String)

    @Modifying
    @Query("DELETE FROM PatternGrid pg WHERE pg.project.id = :projectId")
    fun deleteAllByProjectId(projectId: Long)
}
