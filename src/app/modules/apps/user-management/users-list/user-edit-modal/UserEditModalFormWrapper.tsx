import {useEffect} from 'react'
import {UserEditModalForm} from './UserEditModalForm'
import {isNotEmpty} from '../../../../../../_metronic/helpers'
import {useListView} from '../core/ListViewProvider'
import {getUserById, clearSelectedUser} from '../../../../../../store/user/userSlice'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../../../store'

const UserEditModalFormWrapper = () => {
  const {itemIdForUpdate, setItemIdForUpdate} = useListView()
  const dispatch = useDispatch<AppDispatch>()
  const {selectedUser, loading} = useSelector((state: RootState) => state.users)
  
  const enabledQuery: boolean = isNotEmpty(itemIdForUpdate)

  useEffect(() => {
    if (enabledQuery && itemIdForUpdate) {
      dispatch(getUserById(itemIdForUpdate))
    } else {
      dispatch(clearSelectedUser())
    }
  }, [dispatch, itemIdForUpdate, enabledQuery])

  if (!itemIdForUpdate) {
    return <UserEditModalForm isUserLoading={loading} user={{id: undefined}} />
  }

  if (!loading && selectedUser) {
    return <UserEditModalForm isUserLoading={loading} user={selectedUser} />
  }

  return null
}

export {UserEditModalFormWrapper}
