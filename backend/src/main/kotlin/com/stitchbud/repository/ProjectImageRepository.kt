package com.stitchbud.repository

import com.stitchbud.model.ProjectImage
import org.springframework.data.jpa.repository.JpaRepository

interface ProjectImageRepository : JpaRepository<ProjectImage, Long> {
    /** Load all images for a project from DB (avoids stale/incomplete in-memory collections on `Project.images`). */
    fun findByProject_Id(projectId: Long): List<ProjectImage>
}
