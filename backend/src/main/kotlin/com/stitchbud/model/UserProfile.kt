package com.stitchbud.model

import jakarta.persistence.*

@Entity
@Table(name = "user_profiles")
data class UserProfile(
    @Id
    val userId: String,
    var email: String,
    var displayName: String? = null,
    var updatedAt: Long = System.currentTimeMillis()
)
