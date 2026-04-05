package com.stitchbud.repository

import com.stitchbud.model.ProjectFile
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface ProjectFileRepository : JpaRepository<ProjectFile, Long> {
    @Modifying
    @Query("DELETE FROM ProjectFile f WHERE f.project.userId = :userId")
    fun deleteAllByProjectUserId(userId: String)

    @Modifying
    @Query("DELETE FROM ProjectFile f WHERE f.project.id = :projectId")
    fun deleteAllByProjectId(projectId: Long)
}
