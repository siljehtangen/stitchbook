package com.stitchbud.repository

import com.stitchbud.model.LibraryItemImage
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface LibraryItemImageRepository : JpaRepository<LibraryItemImage, Long> {
    @Modifying
    @Query("DELETE FROM LibraryItemImage i WHERE i.libraryItem.userId = :userId")
    fun deleteAllByLibraryItemUserId(userId: String)
}
