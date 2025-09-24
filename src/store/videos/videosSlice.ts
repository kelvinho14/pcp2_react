import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'
import { toast } from '../../_metronic/helpers/toast'
import { getHeadersWithSchoolSubject } from '../../_metronic/helpers/axios'

const API_URL = import.meta.env.VITE_APP_API_URL

// Types
export interface Video {
  video_id: string
  title: string
  description?: string
  school_subject_id: string
  source: 1 | 2 // 1 for YouTube, 2 for Vimeo
  status: number
  thumbnail?: string
  duration?: number
  video_id_external: string // YouTube video ID or Vimeo video ID
  play_url?: string // Direct play URL from API
  created_by: string
  created_at: string
  updated_at: string
  tag_count?: number
  tags?: VideoTag[]
  click_count?: number
  // Assignment information from backend
  is_assigned_to_current_user?: boolean
  assignment_id?: string
  assigned_at?: string
  due_date?: string
  message_for_student?: string
}

export interface VideoTag {
  tag_id?: string
  name?: string
}

export interface YouTubeMetadata {
  video_id: string
  title: string
  description: string
  thumbnail: string
  duration: number
  duration_formatted: string
}

export interface VideoFormData {
  source: 1 | 2
  tags?: VideoTag[]
  youtube_urls?: string[]
  vimeo_ids?: string[]
  status: number
}

export interface VimeoFolder {
  uri: string
  name: string
  description?: string
  created_time: string
  modified_time: string
  privacy: {
    view: string
  }
  isExpanded?: boolean
  hasSubfolders?: boolean
  hasVideos?: boolean
}

export interface VimeoVideo {
  uri: string
  name: string
  description?: string
  duration: number
  pictures: {
    base_link?: string
    sizes: Array<{
      width: number
      height: number
      link: string
    }>
  }
  link?: string
  created_time: string
  modified_time: string
  privacy: {
    view: string
  }
}

export interface VimeoFolderWithVideos extends VimeoFolder {
  videos?: VimeoVideo[]
}

// Async thunks
export const fetchVideos = createAsyncThunk(
  'videos/fetchVideos',
  async ({ page, items_per_page, sort, order, search, platform, teacher_id }: {
    page: number
    items_per_page: number
    sort?: string
    order?: 'asc' | 'desc'
    search?: string
    platform?: 'youtube' | 'vimeo'
    teacher_id?: string
  }) => {
    const params: any = { page, items_per_page }
    if (sort) params.sort = sort
    if (order) params.order = order
    if (search) params.search = search
    if (platform) params.platform = platform
    if (teacher_id) params.teacher_id = teacher_id

    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos`)
      const response = await axios.get(`${API_URL}/videos`, { 
        params, 
        headers,
        withCredentials: true 
      })
      return {
        items: response.data.data || [],
        total: response.data.payload?.pagination?.total || response.data.total || 0,
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch videos'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchVideoById = createAsyncThunk(
  'videos/fetchVideoById',
  async (videoId: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/${videoId}`)
      const response = await axios.get(`${API_URL}/videos/${videoId}`, { 
        headers,
        withCredentials: true 
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch video'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const createVideo = createAsyncThunk(
  'videos/createVideo',
  async (videoData: VideoFormData) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos`)
      
      // Transform tags to the required format
      const transformedData = {
        ...videoData,
        tags: videoData.tags?.map(tag => {
          // If tag_id exists and looks like a UUID, it's an existing tag
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          if (tag.tag_id && uuidRegex.test(tag.tag_id)) {
            return { tag_id: tag.tag_id }
          } else if (tag.name && (!tag.tag_id || tag.tag_id.startsWith('new-'))) {
            // For new tags, use the name
            return { name: tag.name }
          }
          return tag
        }) || []
      }
      
      const response = await axios.post(`${API_URL}/videos`, transformedData, { 
        headers,
        withCredentials: true 
      })
      toast.success('Video created successfully!', 'Success')
      // Handle both single video and array response
      const responseData = response.data.data
      return Array.isArray(responseData) ? responseData[0] : responseData
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create video'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const createMultipleVideos = createAsyncThunk(
  'videos/createMultipleVideos',
  async (videosData: VideoFormData[]) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/bulk`)
      
      // Transform tags to the required format for each video
      const transformedVideos = videosData.map(videoData => ({
        ...videoData,
        tags: videoData.tags?.map(tag => {
          // If tag_id exists and looks like a UUID, it's an existing tag
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
          if (tag.tag_id && uuidRegex.test(tag.tag_id)) {
            return { tag_id: tag.tag_id }
          } else if (tag.name && (!tag.tag_id || tag.tag_id.startsWith('new-'))) {
            // For new tags, use the name
            return { name: tag.name }
          }
          return tag
        }) || []
      }))
      
      const response = await axios.post(`${API_URL}/videos/bulk`, { videos: transformedVideos }, { 
        headers,
        withCredentials: true 
      })
      toast.success(`${videosData.length} videos created successfully!`, 'Success')
      // Handle both array and single video response
      const responseData = response.data.data
      return Array.isArray(responseData) ? responseData : [responseData]
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create videos'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const updateVideo = createAsyncThunk(
  'videos/updateVideo',
  async ({ videoId, videoData }: { videoId: string; videoData: Partial<VideoFormData> }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/${videoId}`)
      const response = await axios.put(`${API_URL}/videos/${videoId}`, videoData, { 
        headers,
        withCredentials: true 
      })
      toast.success('Video updated successfully!', 'Success')
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update video'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const deleteVideo = createAsyncThunk(
  'videos/deleteVideo',
  async (videoId: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/${videoId}`)
      await axios.delete(`${API_URL}/videos/${videoId}`, { 
        headers,
        withCredentials: true 
      })
      toast.success('Video deleted successfully!', 'Success')
      return videoId
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete video'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchTeacherVideos = createAsyncThunk(
  'videos/fetchTeacherVideos',
  async ({ page, items_per_page, sort, order, search, source, status, tags }: {
    page: number
    items_per_page: number
    sort?: string
    order?: 'asc' | 'desc'
    search?: string
    source?: number
    status?: number
    tags?: string[]
  }) => {
    const params: any = { page, items_per_page }
    if (sort) params.sort = sort
    if (order) params.order = order
    if (search) params.search = search
    if (source) params.source = source
    if (status) params.video_status = status
    if (tags && tags.length > 0) params.tags = tags.join(',')

    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos`)
      const response = await axios.get(`${API_URL}/videos`, { 
        params, 
        headers,
        withCredentials: true 
      })
      return {
        items: response.data.data || [],
        total: response.data.payload?.pagination?.total || response.data.total || 0,
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch videos'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Vimeo API functions
export const fetchVimeoFolders = createAsyncThunk(
  'videos/fetchVimeoFolders',
  async () => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/vimeo/projects`)
      const response = await axios.get(`${API_URL}/videos/vimeo/projects`, { 
        headers,
        withCredentials: true 
      })
      
      // Transform the API response to match our expected structure
      const folders = response.data.data?.folders || []
      return folders.map((folder: any) => ({
        uri: folder.ID,
        name: folder.Name,
        description: folder.Description || '',
        created_time: folder.CreatedTime || '',
        modified_time: folder.ModifiedTime || '',
        privacy: {
          view: folder.Privacy?.view || 'anybody'
        }
      }))
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch Vimeo projects'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const fetchVimeoFolderContents = createAsyncThunk(
  'videos/fetchVimeoFolderContents',
  async (projectId: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/vimeo/projects/${projectId}/contents`)
      const response = await axios.get(`${API_URL}/videos/vimeo/projects/${projectId}/contents`, { 
        headers,
        withCredentials: true 
      })
      
      const data = response.data.data
      
      // Transform videos
      const videos = data?.videos || []
      const transformedVideos = videos.map((video: any) => ({
        uri: video.uri || video.ID || video.id,
        name: video.name || video.Name || video.title || '',
        description: video.description || video.Description || '',
        duration: video.duration || video.Duration || 0,
        pictures: {
          base_link: video.pictures?.base_link || video.Pictures?.base_link || '',
          sizes: video.pictures?.sizes || video.Pictures?.sizes || [{
            width: 640,
            height: 360,
            link: video.thumbnail || video.Thumbnail || ''
          }]
        },
        link: video.link || '',
        created_time: video.created_time || video.CreatedTime || '',
        modified_time: video.modified_time || video.ModifiedTime || '',
        privacy: {
          view: video.privacy?.view || video.Privacy?.view || 'anybody'
        }
      }))
      
      // Transform subfolders
      const subfolders = data?.subfolders || []
      const transformedSubfolders = subfolders.map((folder: any) => ({
        uri: folder.ID || folder.uri,
        name: folder.Name || folder.name,
        description: folder.Description || folder.description || '',
        created_time: folder.CreatedTime || folder.created_time || '',
        modified_time: folder.ModifiedTime || folder.modified_time || '',
        privacy: {
          view: folder.Privacy?.view || folder.privacy?.view || 'anybody'
        },
        isExpanded: false,
        hasSubfolders: false,
        hasVideos: false
      }))
      
      return {
        projectId,
        videos: transformedVideos,
        subfolders: transformedSubfolders,
        totalVideos: data?.total_videos || 0,
        totalSubfolders: data?.total_subfolders || 0
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch Vimeo project contents'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Helper function to extract video ID from URL
export const fetchYouTubeMetadata = createAsyncThunk(
  'videos/fetchYouTubeMetadata',
  async (youtubeUrl: string) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/youtube/metadata`)
      const response = await axios.get(`${API_URL}/videos/youtube/metadata?youtube_url=${encodeURIComponent(youtubeUrl)}`, { 
        headers,
        withCredentials: true 
      })
      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch YouTube metadata'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

export const extractVideoId = (url: string): { platform: 'youtube' | 'vimeo'; videoId: string } | null => {
  // YouTube patterns
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ]
  
  // Vimeo patterns
  const vimeoPatterns = [
    /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/,
  ]

  for (const pattern of youtubePatterns) {
    const match = url.match(pattern)
    if (match) {
      return { platform: 'youtube', videoId: match[1] }
    }
  }

  for (const pattern of vimeoPatterns) {
    const match = url.match(pattern)
    if (match) {
      return { platform: 'vimeo', videoId: match[1] }
    }
  }

  return null
}

// Assign videos to students
export const assignVideosToStudents = createAsyncThunk(
  'videos/assignVideosToStudents',
  async ({ videoIds, studentIds, groupIds, dueDate, messageForStudent }: { 
    videoIds: string[]
    studentIds: string[]
    groupIds?: string[]
    dueDate?: string
    messageForStudent?: string
  }) => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/assign`)
      
      // Prepare the payload with both student_ids and group_ids
      const payload: any = {
        video_ids: videoIds, // Always an array
        due_date: dueDate,
        message_for_student: messageForStudent
      }
      
      // Only include student_ids if students are selected
      if (studentIds && studentIds.length > 0) {
        payload.student_ids = studentIds
      }
      
      // Only include group_ids if groups are selected
      if (groupIds && groupIds.length > 0) {
        payload.group_ids = groupIds
      }
      
      const response = await axios.post(`${API_URL}/videos/assign`, payload, { 
        headers,
        withCredentials: true 
      })
      
      if (response.data.status === 'success') {
        const message = groupIds && groupIds.length > 0 
          ? 'Videos assigned to students and groups successfully!' 
          : 'Videos assigned to students successfully!'
        toast.success(message, 'Success')
      } else {
        toast.error('Failed to assign videos. Please try again.', 'Error')
      }
      
      return response.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to assign videos'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// Fetch video tags for filtering
export const fetchVideoTags = createAsyncThunk(
  'videos/fetchVideoTags',
  async () => {
    try {
      const headers = getHeadersWithSchoolSubject(`${API_URL}/videos/tags`)
      const response = await axios.get(`${API_URL}/videos/tags`, { 
        headers,
        withCredentials: true 
      })
      
      return response.data.data || []
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch video tags'
      toast.error(errorMessage, 'Error')
      throw new Error(errorMessage)
    }
  }
)

// State interface
interface VideosState {
  videos: Video[]
  currentVideo: Video | null
  loading: boolean
  creating: boolean
  updating: boolean
  deleting: boolean
  error: string | null
  success: string | null
  total: number
  vimeoFolders: VimeoFolder[]
  vimeoFolderContents: Record<string, { videos: VimeoVideo[]; subfolders: VimeoFolder[] }>
  fetchingVimeoFolders: boolean
  fetchingVimeoContents: Record<string, boolean>
  youtubeMetadata: YouTubeMetadata | null
  fetchingYouTubeMetadata: boolean
  assigning: boolean
  videoTags: VideoTag[]
  fetchingVideoTags: boolean
}

const initialState: VideosState = {
  videos: [],
  currentVideo: null,
  loading: false,
  creating: false,
  updating: false,
  deleting: false,
  error: null,
  success: null,
  total: 0,
  vimeoFolders: [],
  vimeoFolderContents: {},
  fetchingVimeoFolders: false,
  fetchingVimeoContents: {},
  youtubeMetadata: null,
  fetchingYouTubeMetadata: false,
  assigning: false,
  videoTags: [],
  fetchingVideoTags: false,
}

// Slice
const videosSlice = createSlice({
  name: 'videos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearSuccess: (state) => {
      state.success = null
    },
    clearMessages: (state) => {
      state.error = null
      state.success = null
    },
    clearCurrentVideo: (state) => {
      state.currentVideo = null
    },
    clearVimeoData: (state) => {
      state.vimeoFolders = []
      state.vimeoFolderContents = {}
    },
    toggleVimeoFolder: (state, action) => {
      const folderUri = action.payload
      const folder = state.vimeoFolders.find(f => f.uri === folderUri)
      if (folder) {
        folder.isExpanded = !folder.isExpanded
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch videos
    builder
      .addCase(fetchVideos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVideos.fulfilled, (state, action) => {
        state.loading = false
        state.videos = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchVideos.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch videos'
      })

    // Fetch video by ID
    builder
      .addCase(fetchVideoById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVideoById.fulfilled, (state, action) => {
        state.loading = false
        state.currentVideo = action.payload
      })
      .addCase(fetchVideoById.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch video'
      })

    // Create video
    builder
      .addCase(createVideo.pending, (state) => {
        state.creating = true
        state.error = null
        state.success = null
      })
      .addCase(createVideo.fulfilled, (state, action) => {
        state.creating = false
        // Only add the video if payload is valid
        if (action.payload && action.payload.video_id) {
          state.videos.unshift(action.payload)
        }
        state.success = 'Video created successfully'
      })
      .addCase(createVideo.rejected, (state, action) => {
        state.creating = false
        state.error = action.error.message || 'Failed to create video'
      })

    // Create multiple videos
    builder
      .addCase(createMultipleVideos.pending, (state) => {
        state.creating = true
        state.error = null
        state.success = null
      })
      .addCase(createMultipleVideos.fulfilled, (state, action) => {
        state.creating = false
        state.videos.unshift(...action.payload)
        state.success = 'Videos created successfully'
      })
      .addCase(createMultipleVideos.rejected, (state, action) => {
        state.creating = false
        state.error = action.error.message || 'Failed to create videos'
      })

    // Update video
    builder
      .addCase(updateVideo.pending, (state) => {
        state.updating = true
        state.error = null
        state.success = null
      })
      .addCase(updateVideo.fulfilled, (state, action) => {
        state.updating = false
        const index = state.videos.findIndex(video => video.video_id === action.payload.video_id)
        if (index !== -1) {
          state.videos[index] = action.payload
        }
        if (state.currentVideo?.video_id === action.payload.video_id) {
          state.currentVideo = action.payload
        }
        state.success = 'Video updated successfully'
      })
      .addCase(updateVideo.rejected, (state, action) => {
        state.updating = false
        state.error = action.error.message || 'Failed to update video'
      })

    // Delete video
    builder
      .addCase(deleteVideo.pending, (state) => {
        state.deleting = true
        state.error = null
        state.success = null
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.deleting = false
        state.videos = state.videos.filter(video => video.video_id !== action.payload)
        if (state.currentVideo?.video_id === action.payload) {
          state.currentVideo = null
        }
        state.success = 'Video deleted successfully'
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.deleting = false
        state.error = action.error.message || 'Failed to delete video'
      })

    // Fetch teacher videos
    builder
      .addCase(fetchTeacherVideos.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTeacherVideos.fulfilled, (state, action) => {
        state.loading = false
        state.videos = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchTeacherVideos.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch videos'
      })

    // Fetch Vimeo folders
    builder
      .addCase(fetchVimeoFolders.pending, (state) => {
        state.fetchingVimeoFolders = true
        state.error = null
      })
      .addCase(fetchVimeoFolders.fulfilled, (state, action) => {
        state.fetchingVimeoFolders = false
        state.vimeoFolders = action.payload
      })
      .addCase(fetchVimeoFolders.rejected, (state, action) => {
        state.fetchingVimeoFolders = false
        state.error = action.error.message || 'Failed to fetch Vimeo folders'
      })

    // Fetch Vimeo folder contents
    builder
      .addCase(fetchVimeoFolderContents.pending, (state, action) => {
        state.fetchingVimeoContents[action.meta.arg] = true
        state.error = null
      })
      .addCase(fetchVimeoFolderContents.fulfilled, (state, action) => {
        state.fetchingVimeoContents[action.payload.projectId] = false
        state.vimeoFolderContents[action.payload.projectId] = {
          videos: action.payload.videos,
          subfolders: action.payload.subfolders
        }
        
        // Update folder state to show it has content
        const folder = state.vimeoFolders.find(f => f.uri === action.payload.projectId)
        if (folder) {
          folder.hasVideos = action.payload.videos.length > 0
          folder.hasSubfolders = action.payload.subfolders.length > 0
        }
      })
      .addCase(fetchVimeoFolderContents.rejected, (state, action) => {
        state.fetchingVimeoContents[action.meta.arg] = false
        state.error = action.error.message || 'Failed to fetch Vimeo folder contents'
      })

    // Fetch YouTube metadata
    builder
      .addCase(fetchYouTubeMetadata.pending, (state) => {
        state.fetchingYouTubeMetadata = true
        state.error = null
      })
      .addCase(fetchYouTubeMetadata.fulfilled, (state, action) => {
        state.fetchingYouTubeMetadata = false
        state.youtubeMetadata = action.payload
      })
      .addCase(fetchYouTubeMetadata.rejected, (state, action) => {
        state.fetchingYouTubeMetadata = false
        state.error = action.error.message || 'Failed to fetch YouTube metadata'
      })

    // Assign videos to students
    builder
      .addCase(assignVideosToStudents.pending, (state) => {
        state.assigning = true
        state.error = null
        state.success = null
      })
      .addCase(assignVideosToStudents.fulfilled, (state) => {
        state.assigning = false
        state.success = 'Videos assigned to students successfully'
      })
      .addCase(assignVideosToStudents.rejected, (state, action) => {
        state.assigning = false
        state.error = action.error.message || 'Failed to assign videos to students'
      })

    // Fetch video tags
    builder
      .addCase(fetchVideoTags.pending, (state) => {
        state.fetchingVideoTags = true
        state.error = null
      })
      .addCase(fetchVideoTags.fulfilled, (state, action) => {
        state.fetchingVideoTags = false
        state.videoTags = action.payload
      })
      .addCase(fetchVideoTags.rejected, (state, action) => {
        state.fetchingVideoTags = false
        state.error = action.error.message || 'Failed to fetch video tags'
      })
  },
})

export const { clearError, clearSuccess, clearMessages, clearCurrentVideo, clearVimeoData, toggleVimeoFolder } = videosSlice.actions
export default videosSlice.reducer 