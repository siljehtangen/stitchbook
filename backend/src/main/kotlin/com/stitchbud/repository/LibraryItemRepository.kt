package com.stitchbud.repository

import com.stitchbud.model.LibraryItem
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import java.util.Optional

interface LibraryItemRepository : JpaRepository<LibraryItem, Long> {
    fun findByUserIdOrderByCreatedAtDesc(userId: String): List<LibraryItem>
    fun findByUserId(userId: String): List<LibraryItem>
    fun findByIdAndUserId(id: Long, userId: String): Optional<LibraryItem>

    @Modifying
    @Query("DELETE FROM LibraryItem i WHERE i.userId = :userId")
    fun deleteAllByUserId(userId: String)
}
