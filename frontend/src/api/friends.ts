import type { Friend, FriendRequest, Project } from '../types'
import { normalizeProject } from '../projectOverviewMedia'
import { api } from './client'
import { friendSchema, friendRequestSchema, projectSchema, safeParsed } from './schemas'
import { z } from 'zod'

export const friendsApi = {
  getFriends: async (): Promise<Friend[]> => {
    const r = await api.get<Friend[]>('/friends')
    return safeParsed(z.array(friendSchema), r.data, 'Friend[]')
  },

  getPendingRequests: async (): Promise<FriendRequest[]> => {
    const r = await api.get<FriendRequest[]>('/friends/requests')
    return safeParsed(z.array(friendRequestSchema), r.data, 'FriendRequest[]')
  },

  sendRequest: async (email: string): Promise<Friend> => {
    const r = await api.post<Friend>('/friends/request', { email })
    return safeParsed(friendSchema, r.data, 'Friend')
  },

  acceptRequest: async (friendshipId: number): Promise<Friend> => {
    const r = await api.put<Friend>(`/friends/${friendshipId}/accept`)
    return safeParsed(friendSchema, r.data, 'Friend')
  },

  remove: (friendshipId: number) => api.delete(`/friends/${friendshipId}`),

  getFriendProjects: async (friendUserId: string): Promise<Project[]> => {
    const r = await api.get<Project[]>(`/friends/${friendUserId}/projects`)
    return safeParsed(z.array(projectSchema), r.data, 'Project[]').map(normalizeProject)
  },

  getFriendProject: async (friendUserId: string, projectId: number): Promise<Project> => {
    const r = await api.get<Project>(`/friends/${friendUserId}/projects/${projectId}`)
    return normalizeProject(safeParsed(projectSchema, r.data, 'Project'))
  },
}
