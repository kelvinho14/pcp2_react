import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

type FetchUsersParams = {
  page: number
  items_per_page: number
  sort?: string
  order?: string
  search?: string
}

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async ({ page, items_per_page, sort, order, search }: FetchUsersParams) => {
    const params: any = { page, items_per_page }
    if (sort) params.sort = sort
    if (order) params.order = order
    if (search) params.search = search

    const response = await axios.get('https://preview.keenthemes.com/theme-api/api/users/query', { params })
    return {
      items: response.data.data,
      total: response.data.payload.pagination.total,
    }
  }
)

const userSlice = createSlice({
  name: 'users',
  initialState: {
    users: [] as any[],
    total: 0,
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.users = action.payload.items
        state.total = action.payload.total
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || null
      })
  }
})

export default userSlice.reducer
