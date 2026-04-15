import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { projectsApi, friendsApi } from '../api'
import { CATEGORY_ICONS, categoryLabel } from '../constants/categories'
import ProjectCard from '../components/ProjectCard'
import { useAsyncData } from '../hooks/useAsyncData'
import { useProjectFilter } from '../hooks/useProjectFilter'
import type { Friend, Project } from '../types'
import { projectCoverImageUrls } from '../projectOverviewMedia'

type Mode = 'mine' | 'friends'

export default function Projects() {
  const { data: projects, loading, error } = useAsyncData(() => projectsApi.getAll(), [])
  const { filter, setFilter, search, setSearch, filtered, newProjectPath } = useProjectFilter(projects)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [mode, setMode] = useState<Mode>('mine')

  const [friends, setFriends] = useState<Friend[]>([])
  const [friendsLoading, setFriendsLoading] = useState(false)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)
  const [friendProjects, setFriendProjects] = useState<Project[]>([])
  const [friendProjectsLoading, setFriendProjectsLoading] = useState(false)

  useEffect(() => {
    if (mode !== 'friends') return
    setFriendsLoading(true)
    friendsApi.getFriends()
      .then(f => {
        setFriends(f)
        if (f.length > 0 && !selectedFriend) {
          loadFriendProjects(f[0])
        }
      })
      .finally(() => setFriendsLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  async function loadFriendProjects(friend: Friend) {
    setSelectedFriend(friend)
    setFriendProjectsLoading(true)
    try {
      const ps = await friendsApi.getFriendProjects(friend.userId)
      setFriendProjects(ps)
    } catch {
      setFriendProjects([])
    } finally {
      setFriendProjectsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('mine')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            mode === 'mine'
              ? 'bg-sand-green text-gray-800 shadow-sm'
              : 'bg-soft-brown/20 text-warm-gray hover:bg-soft-brown/40'
          }`}
        >
          {t('projects_mode_mine')}
        </button>
        <button
          onClick={() => setMode('friends')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            mode === 'friends'
              ? 'bg-sand-green text-gray-800 shadow-sm'
              : 'bg-soft-brown/20 text-warm-gray hover:bg-soft-brown/40'
          }`}
        >
          {t('projects_mode_friends')}
        </button>
      </div>

      {mode === 'mine' ? (
        <>
          <input
            type="search"
            className="input text-sm py-2 w-full"
            placeholder={t('projects_search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <div className="flex gap-2 flex-wrap">
            {(['ALL', 'KNITTING', 'CROCHET', 'SEWING'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filter === cat
                    ? 'bg-sand-green text-gray-800 shadow-sm'
                    : 'bg-soft-brown/20 text-warm-gray hover:bg-soft-brown/40'
                }`}
              >
                {cat === 'ALL' ? t('filter_all') : <><span className="leading-none flex-shrink-0">{CATEGORY_ICONS[cat]}</span><span>{categoryLabel(cat, t)}</span></>}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12 text-warm-gray">{t('loading')}</div>
          ) : error ? (
            <div className="text-center py-12 text-red-400 text-sm">{t('load_failed')}</div>
          ) : filtered.length === 0 ? (
            <div className="card text-center py-10">
              <p className="text-warm-gray text-sm">{t('no_projects_found')}</p>
              <button onClick={() => navigate(newProjectPath)} className="btn-primary mt-4 text-sm">
                {t('add_project')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(project => (
                <ProjectCard key={project.id} project={project} onClick={() => navigate(`/projects/${project.id}`)} />
              ))}
            </div>
          )}
        </>
      ) : (
        <FriendsProjectsView
          friends={friends}
          friendsLoading={friendsLoading}
          selectedFriend={selectedFriend}
          friendProjects={friendProjects}
          friendProjectsLoading={friendProjectsLoading}
          onSelectFriend={loadFriendProjects}
          t={t}
          navigate={navigate}
        />
      )}
    </div>
  )
}

function FriendsProjectsView({
  friends,
  friendsLoading,
  selectedFriend,
  friendProjects,
  friendProjectsLoading,
  onSelectFriend,
  t,
  navigate,
}: {
  friends: Friend[]
  friendsLoading: boolean
  selectedFriend: Friend | null
  friendProjects: Project[]
  friendProjectsLoading: boolean
  onSelectFriend: (f: Friend) => void
  t: TFunction
  navigate: (path: string) => void
}) {
  if (friendsLoading) {
    return <div className="text-center py-12 text-warm-gray">{t('loading')}</div>
  }

  if (friends.length === 0) {
    return (
      <div className="card text-center py-10">
        <p className="text-warm-gray text-sm">{t('projects_friends_empty')}</p>
        <button onClick={() => navigate('/friends')} className="btn-primary mt-4 text-sm">
          {t('projects_go_to_friends')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Friend picker */}
      <div className="flex gap-2 flex-wrap">
        {friends.map(friend => (
          <button
            key={friend.friendshipId}
            onClick={() => onSelectFriend(friend)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedFriend?.friendshipId === friend.friendshipId
                ? 'bg-sand-green text-gray-800 shadow-sm'
                : 'bg-soft-brown/20 text-warm-gray hover:bg-soft-brown/40'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-sand-blue flex items-center justify-center text-gray-700 font-semibold text-xs flex-shrink-0">
              {(friend.displayName ?? friend.email).slice(0, 1).toUpperCase()}
            </span>
            <span className="truncate max-w-[120px]">{friend.displayName ?? friend.email}</span>
          </button>
        ))}
      </div>

      {/* Selected friend's projects */}
      {friendProjectsLoading ? (
        <div className="text-center py-12 text-warm-gray">{t('loading')}</div>
      ) : friendProjects.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-warm-gray text-sm">{t('friends_no_public_projects')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {friendProjects.map(p => (
            <FriendProjectCard key={p.id} project={p} t={t} />
          ))}
        </div>
      )}
    </div>
  )
}

function FriendProjectCard({ project, t }: { project: Project; t: TFunction }) {
  const coverUrls = projectCoverImageUrls(project)
  return (
    <div className="card flex items-center gap-3">
      {coverUrls[0] ? (
        <img src={coverUrls[0]} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" loading="lazy" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-sand-blue/30 flex items-center justify-center text-2xl flex-shrink-0">
          {project.category === 'KNITTING' ? '🧶' : project.category === 'CROCHET' ? '🪡' : '🧵'}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{project.name}</p>
        <p className="text-xs text-warm-gray">{categoryLabel(project.category, t)}</p>
        {project.description && (
          <p className="text-xs text-gray-600 truncate mt-0.5">{project.description}</p>
        )}
      </div>
    </div>
  )
}
