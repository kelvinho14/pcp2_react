import {FC} from 'react'
import {useNavigate} from 'react-router-dom'
import {Group} from '../../core/_models'

type Props = {
  group: Group
}

const GroupInfoCell: FC<Props> = ({group}) => {
  const navigate = useNavigate()

  const handleNameClick = () => {
    navigate(`/groups/edit/${group.group_id}`)
  }

  return (
    <div className='d-flex align-items-center'>
      <div className='d-flex flex-column'>
        <a 
          href='#' 
          className='text-gray-800 text-hover-primary mb-1 cursor-pointer'
          onClick={(e) => {
            e.preventDefault()
            handleNameClick()
          }}
        >
          {group.name}
        </a>
      </div>
    </div>
  )
}

export {GroupInfoCell} 