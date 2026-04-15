package com.stitchbud.model

import jakarta.persistence.*

enum class FriendshipStatus { PENDING, ACCEPTED }

@Entity
@Table(
    name = "friendships",
    indexes = [
        Index(name = "idx_friendships_requester", columnList = "requesterId"),
        Index(name = "idx_friendships_recipient", columnList = "recipientId"),
    ]
)
data class Friendship(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    var requesterId: String,
    var recipientId: String,
    @Enumerated(EnumType.STRING)
    var status: FriendshipStatus = FriendshipStatus.PENDING,
    var createdAt: Long = System.currentTimeMillis()
)
