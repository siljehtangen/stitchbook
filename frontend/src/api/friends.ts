import type { Friend, FriendRequest, Project } from '../types'
import { normalizeProject } from '../projectOverviewMedia'
import { api } from './client'

export const friendsApi = {
  getFriends: async (): Promise<Friend[]> => {
    const r = await api.get<Friend[]>('/friends')
    return r.data
  },

  getPendingRequests: async (): Promise<FriendRequest[]> => {
    const r = await api.get<FriendRequest[]>('/friends/requests')
    return r.data
  },

  sendRequest: async (email: string): Promise<Friend> => {
    const r = await api.post<Friend>('/friends/request', { email })
    return r.data
  },

  acceptRequest: async (friendshipId: number): Promise<Friend> => {
    const r = await api.put<Friend>(`/friends/${friendshipId}/accept`)
    return r.data
  },

  remove: (friendshipId: number) => api.delete(`/friends/${friendshipId}`),

  getFriendProjects: async (friendUserId: string): Promise<Project[]> => {
    const r = await api.get<Project[]>(`/friends/${friendUserId}/projects`)
    return r.data.map(p => normalizeProject(p))
  },

  getFriendProject: async (friendUserId: string, projectId: number): Promise<Project> => {
    const r = await api.get<Project>(`/friends/${friendUserId}/projects/${projectId}`)
    return normalizeProject(r.data)
  },
}
