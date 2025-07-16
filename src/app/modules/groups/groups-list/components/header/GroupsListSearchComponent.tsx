import {KTIcon} from '../../../../../../_metronic/helpers'

type Props = {
  value: string
  onChange: (value: string) => void
}

const GroupsListSearchComponent = ({value, onChange}: Props) => {
  return (
    <div className='card-title'>
      {/* begin::Search */}
      <div className='d-flex align-items-center position-relative my-1'>
        <KTIcon iconName='magnifier' className='fs-1 position-absolute ms-6' />
        <input
          type='text'
          data-kt-group-table-filter='search'
          className='form-control form-control-solid w-250px ps-14'
          placeholder='Search groups'
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {/* end::Search */}
    </div>
  )
}

export {GroupsListSearchComponent} 