package com.stitchbud.repository

import com.stitchbud.model.ProjectImage
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface ProjectImageRepository : JpaRepository<ProjectImage, Long> {
    /** Load all images for a project from DB (avoids stale/incomplete in-memory collections on `Project.images`). */
    fun findByProject_Id(projectId: Long): List<ProjectImage>

    @Modifying
    @Query("DELETE FROM ProjectImage i WHERE i.project.userId = :userId")
    fun deleteAllByProjectUserId(userId: String)

    @Modifying
    @Query("DELETE FROM ProjectImage i WHERE i.project.id = :projectId")
    fun deleteAllByProjectId(projectId: Long)
}
