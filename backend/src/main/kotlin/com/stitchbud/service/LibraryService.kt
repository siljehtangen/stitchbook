package com.stitchbud.service

import com.stitchbud.dto.CreateLibraryItemRequest
import com.stitchbud.dto.LibraryItemImageDto
import com.stitchbud.dto.RegisterLibraryImageRequest
import com.stitchbud.dto.UpdateLibraryItemRequest
import com.stitchbud.dto.LibraryItemDto
import com.stitchbud.model.LibraryItem
import com.stitchbud.model.LibraryItemImage
import com.stitchbud.repository.LibraryItemRepository
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Paths
import java.util.UUID

@Service
@Transactional
class LibraryService(
    private val libraryItemRepository: LibraryItemRepository,
    private val storageService: SupabaseStorageService,
    @Value("\${app.upload-dir:./uploads}") private val uploadDir: String
) {
    companion object {
        private const val MAX_IMAGES = 3
    }

    fun getAll(userId: String): List<LibraryItemDto> =
        libraryItemRepository.findByUserIdOrderByCreatedAtDesc(userId).map { it.toDto() }

    fun create(req: CreateLibraryItemRequest, userId: String): LibraryItemDto {
        val item = LibraryItem(
            userId = userId,
            itemType = req.itemType,
            name = req.name,
            colors = req.colors?.joinToString(","),
            yarnMaterial = req.yarnMaterial,
            yarnBrand = req.yarnBrand,
            yarnAmountG = req.yarnAmountG,
            yarnAmountM = req.yarnAmountM,
            fabricWidthCm = req.fabricWidthCm,
            fabricLengthCm = req.fabricLengthCm,
            needleSizeMm = req.needleSizeMm,
            circularLengthCm = req.circularLengthCm,
            hookSizeMm = req.hookSizeMm
        )
        return libraryItemRepository.save(item).toDto()
    }

    fun update(id: Long, req: UpdateLibraryItemRequest, userId: String): LibraryItemDto {
        val item = libraryItemRepository.findById(id).orElseThrow { RuntimeException("Item not found") }
        if (item.userId != userId) throw RuntimeException("Not found")
        req.name?.let { item.name = it }
        req.imageUrl?.let {
            if (item.images.isEmpty()) {
                item.imageUrl = it
            }
        }
        req.colors?.let { item.colors = it.joinToString(",") }
        req.yarnMaterial?.let { item.yarnMaterial = it }
        req.yarnBrand?.let { item.yarnBrand = it }
        req.yarnAmountG?.let { item.yarnAmountG = it }
        req.yarnAmountM?.let { item.yarnAmountM = it }
        req.fabricWidthCm?.let { item.fabricWidthCm = it }
        req.fabricLengthCm?.let { item.fabricLengthCm = it }
        req.needleSizeMm?.let { item.needleSizeMm = it }
        req.circularLengthCm?.let { item.circularLengthCm = it }
        req.hookSizeMm?.let { item.hookSizeMm = it }
        return libraryItemRepository.save(item).toDto()
    }

    fun registerLibraryImage(id: Long, req: RegisterLibraryImageRequest, userId: String): LibraryItemDto {
        val item = libraryItemRepository.findById(id).orElseThrow { RuntimeException("Item not found") }
        if (item.userId != userId) throw RuntimeException("Not found")
        migrateLegacyImageIfNeeded(item)
        if (item.images.size >= MAX_IMAGES) throw RuntimeException("Maximum $MAX_IMAGES images per library item")
        val isFirst = item.images.isEmpty()
        val img = LibraryItemImage(
            storedName = req.fileUrl,
            originalName = req.originalName,
            isMain = isFirst,
            libraryItem = item
        )
        item.images.add(img)
        if (isFirst) {
            item.imageUrl = req.fileUrl
        }
        return libraryItemRepository.save(item).toDto()
    }

    fun setLibraryImageMain(libraryItemId: Long, imageId: Long, userId: String): LibraryItemDto {
        val item = libraryItemRepository.findById(libraryItemId).orElseThrow { RuntimeException("Item not found") }
        if (item.userId != userId) throw RuntimeException("Not found")
        migrateLegacyImageIfNeeded(item)
        val target = item.images.find { it.id == imageId } ?: throw RuntimeException("Image not found")
        item.images.forEach { it.isMain = false }
        target.isMain = true
        item.imageUrl = target.storedName
        return libraryItemRepository.save(item).toDto()
    }

    fun deleteLibraryImage(libraryItemId: Long, imageId: Long, userId: String): LibraryItemDto {
        val item = libraryItemRepository.findById(libraryItemId).orElseThrow { RuntimeException("Item not found") }
        if (item.userId != userId) throw RuntimeException("Not found")
        migrateLegacyImageIfNeeded(item)
        val img = item.images.find { it.id == imageId } ?: throw RuntimeException("Image not found")
        val wasMain = img.isMain
        deleteStoredImage(img.storedName)
        item.images.removeIf { it.id == imageId }
        if (wasMain) {
            val next = item.images.firstOrNull()
            next?.isMain = true
            item.imageUrl = next?.storedName
        }
        return libraryItemRepository.save(item).toDto()
    }

    fun uploadImage(id: Long, file: MultipartFile, userId: String): LibraryItemDto {
        val item = libraryItemRepository.findById(id).orElseThrow { RuntimeException("Item not found") }
        if (item.userId != userId) throw RuntimeException("Not found")
        item.imageStoredName?.let { deleteImageFromDisk(it) }
        val ext = file.originalFilename?.substringAfterLast('.', "") ?: ""
        val storedName = "${UUID.randomUUID()}${if (ext.isNotEmpty()) ".$ext" else ""}"
        val dir = Paths.get(uploadDir, "library").toAbsolutePath()
        Files.createDirectories(dir)
        file.transferTo(dir.resolve(storedName).toFile())
        item.imageStoredName = storedName
        val publicPath = "/api/library-images/$storedName"
        item.imageUrl = publicPath
        return libraryItemRepository.save(item).toDto()
    }

    fun delete(id: Long, userId: String) {
        val item = libraryItemRepository.findById(id).orElseThrow { RuntimeException("Item not found") }
        if (item.userId != userId) throw RuntimeException("Not found")
        item.images.forEach { deleteStoredImage(it.storedName) }
        item.images.clear()
        item.imageUrl?.let { deleteStoredImage(it) }
        item.imageStoredName?.let { deleteImageFromDisk(it) }
        libraryItemRepository.deleteById(id)
    }

    fun deleteAllForUser(userId: String) {
        val items = libraryItemRepository.findByUserId(userId)
        items.forEach { item ->
            item.images.forEach { deleteStoredImage(it.storedName) }
            item.imageUrl?.let { deleteStoredImage(it) }
            item.imageStoredName?.let { deleteImageFromDisk(it) }
        }
        libraryItemRepository.deleteAll(items)
    }

    fun getImageFile(storedName: String): java.io.File =
        Paths.get(uploadDir, "library", storedName).toFile()

    private fun migrateLegacyImageIfNeeded(item: LibraryItem) {
        if (item.images.isNotEmpty()) return
        val url = item.imageUrl ?: item.imageStoredName?.let { "/api/library-images/$it" } ?: return
        item.images.add(
            LibraryItemImage(
                storedName = url,
                originalName = "",
                isMain = true,
                libraryItem = item
            )
        )
        item.imageUrl = url
    }

    private fun deleteStoredImage(storedName: String) {
        try {
            when {
                storedName.startsWith("http") -> storageService.deleteByUrl(storedName)
                storedName.startsWith("/api/library-images/") ->
                    deleteImageFromDisk(storedName.removePrefix("/api/library-images/"))
            }
        } catch (_: Exception) {
        }
    }

    private fun deleteImageFromDisk(storedName: String) {
        try {
            Paths.get(uploadDir, "library", storedName).toFile().delete()
        } catch (_: Exception) {
        }
    }

    private fun LibraryItem.toDto(): LibraryItemDto {
        val imageDtos = images.map {
            LibraryItemImageDto(it.id, it.storedName, it.originalName, it.isMain, id)
        }
        val mainFromRows = images.find { it.isMain } ?: images.firstOrNull()
        val legacyUrl = imageUrl ?: imageStoredName?.let { "/api/library-images/$it" }
        val displayUrl = mainFromRows?.storedName ?: legacyUrl
        return LibraryItemDto(
            id = id,
            itemType = itemType,
            name = name,
            imageUrl = displayUrl,
            images = imageDtos,
            colors = colors?.split(",")?.filter { it.isNotEmpty() } ?: emptyList(),
            yarnMaterial = yarnMaterial,
            yarnBrand = yarnBrand,
            yarnAmountG = yarnAmountG,
            yarnAmountM = yarnAmountM,
            fabricWidthCm = fabricWidthCm,
            fabricLengthCm = fabricLengthCm,
            needleSizeMm = needleSizeMm,
            circularLengthCm = circularLengthCm,
            hookSizeMm = hookSizeMm,
            createdAt = createdAt
        )
    }
}
