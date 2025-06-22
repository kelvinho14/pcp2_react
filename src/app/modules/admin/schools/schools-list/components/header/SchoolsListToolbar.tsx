import {FC} from 'react'
import {Link} from 'react-router-dom'
import {KTIcon} from '../../../../../../../_metronic/helpers'

const SchoolsListToolbar: FC = () => {
  return (
    <div className='d-flex justify-content-end' data-kt-school-table-toolbar='base'>
      <Link to='/admin/schools/create' className='btn btn-primary'>
        <KTIcon iconName='plus' className='fs-2' />
        Add School
      </Link>
    </div>
  )
}

export {SchoolsListToolbar} 