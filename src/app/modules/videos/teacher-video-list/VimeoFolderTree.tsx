import React, { FC, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../store'
import { VimeoFolder, VimeoVideo } from '../../../../store/videos/videosSlice'

interface VimeoFolderTreeProps {
  folders: VimeoFolder[]
  level?: number
  selectedVideos: Set<string>
  onVideoSelect: (videoUri: string) => void
  expandedFolders: Set<string>
  onFolderExpand: (folderUri: string) => void
}

// Constants for better performance
const DEFAULT_THUMBNAIL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xNjAgOTBDMTYwIDkwIDE2MCA5MCAxNjAgOTBDMTYwIDkwIDE2MCA5MCAxNjAgOTBaIiBmaWxsPSIjQ0NDQ0NDIi8+Cjx0ZXh0IHg9IjE2MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K'

const VimeoFolderTree: FC<VimeoFolderTreeProps> = ({
  folders,
  level = 0,
  selectedVideos,
  onVideoSelect,
  expandedFolders,
  onFolderExpand
}) => {
  const { vimeoFolderContents, fetchingVimeoContents } = useSelector((state: RootState) => state.videos)

  // Memoized duration formatter
  const formatDuration = useCallback((duration: number) => {
    const minutes = Math.floor(duration / 60)
    const seconds = (duration % 60).toString().padStart(2, '0')
    return `${minutes}:${seconds}`
  }, [])

  // Memoized thumbnail URL getter
  const getThumbnailUrl = useCallback((video: VimeoVideo) => {
    return video.pictures.base_link || video.pictures.sizes[0]?.link || DEFAULT_THUMBNAIL
  }, [])

  const handleFolderClick = useCallback((folder: VimeoFolder) => {
    // Just call the parent's onFolderExpand handler
    // The API call is already handled in TeacherVideoListPage
    onFolderExpand(folder.uri)
  }, [onFolderExpand])

  const renderFolder = useCallback((folder: VimeoFolder) => {
    const isExpanded = expandedFolders.has(folder.uri)
    const isLoading = fetchingVimeoContents[folder.uri]
    const contents = vimeoFolderContents[folder.uri]
    const hasContent = contents && (contents.videos.length > 0 || contents.subfolders.length > 0)

    return (
      <div key={folder.uri} className="vimeo-folder-item">
        {/* Folder Header */}
        <div 
          className={`vimeo-folder-header ${level > 0 ? 'sub-level' : 'root-level'}`}
          onClick={() => handleFolderClick(folder)}
        >
          <div className="me-2">
            {isLoading ? (
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            ) : (
              <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-muted`}></i>
            )}
          </div>
          <div className="me-2">
            <i className={`fas fa-folder ${level > 0 ? 'text-warning' : 'text-primary'}`}></i>
          </div>
          <div className="flex-grow-1">
            <strong className="small">{folder.name}</strong>
            {folder.description && (
              <div className="text-muted small">{folder.description}</div>
            )}
            {level > 0 && (
              <div className="text-muted small">
                <i className="fas fa-level-up-alt me-1"></i>
                Subfolder
              </div>
            )}
          </div>
          {hasContent && (
            <div className="vimeo-content-badges">
              <span className="badge bg-primary">{contents?.videos.length || 0}</span>
              <span className="badge bg-warning">{contents?.subfolders.length || 0}</span>
            </div>
          )}
        </div>

        {/* Folder Contents */}
        {isExpanded && contents && (
          <div className={`vimeo-folder-contents ${level > 0 ? 'sub-level' : 'root-level'}`}>
            {/* Videos Section */}
            {contents.videos.length > 0 && (
              <div className="mb-3">
                <div className="vimeo-section-header videos">
                  <i className="fas fa-video"></i>
                  <strong>Videos ({contents.videos.length})</strong>
                </div>
                <div className="row g-2">
                  {contents.videos.map((video: VimeoVideo) => (
                    <div key={video.uri} className="col-12">
                      <div className="vimeo-video-item">
                        <div className="form-check me-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={selectedVideos.has(video.uri)}
                            onChange={() => onVideoSelect(video.uri)}
                          />
                        </div>
                        <img
                          src={getThumbnailUrl(video)}
                          alt={video.name}
                          className="vimeo-video-thumbnail"
                        />
                        <div className="vimeo-video-info">
                          <div className="vimeo-video-name">{video.name}</div>
                          {video.description && (
                            <div className="vimeo-video-description">{video.description}</div>
                          )}
                          <div className="vimeo-video-duration">
                            <i className="fas fa-clock"></i>
                            {formatDuration(video.duration)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subfolders Section */}
            {contents.subfolders.length > 0 && (
              <div className="mb-3">
                <div className="vimeo-section-header subfolders">
                  <i className="fas fa-folder"></i>
                  <strong>Subfolders ({contents.subfolders.length})</strong>
                </div>
                <VimeoFolderTree
                  folders={contents.subfolders}
                  level={level + 1}
                  selectedVideos={selectedVideos}
                  onVideoSelect={onVideoSelect}
                  expandedFolders={expandedFolders}
                  onFolderExpand={onFolderExpand}
                />
              </div>
            )}

            {/* Empty State */}
            {contents.videos.length === 0 && contents.subfolders.length === 0 && (
              <div className="vimeo-empty-folder">
                <i className="fas fa-folder-open"></i>
                <div className="small">This folder is empty</div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }, [expandedFolders, fetchingVimeoContents, vimeoFolderContents, level, selectedVideos, onVideoSelect, onFolderExpand, getThumbnailUrl, formatDuration])

  return (
    <div className="vimeo-folder-tree">
      {folders.map(renderFolder)}
    </div>
  )
}

export default VimeoFolderTree
