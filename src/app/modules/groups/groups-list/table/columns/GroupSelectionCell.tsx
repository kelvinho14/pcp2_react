import {FC, useMemo} from 'react'
import {useListView} from '../../core/ListViewProvider'

type Props = {
  id: string
}

const GroupSelectionCell: FC<Props> = ({id}) => {
  const {selected, onSelect, disabled} = useListView()
  const isSelected = useMemo(() => selected.includes(id as any), [id, selected])
  
  return (
    <div className='form-check form-check-custom form-check-solid'>
      <input
        className='form-check-input'
        type='checkbox'
        data-kt-check={isSelected}
        data-kt-check-target='#kt_table_groups .form-check-input'
        checked={isSelected}
        onChange={() => onSelect(id as any)}
        disabled={disabled || id === undefined || id === null}
      />
    </div>
  )
}

export {GroupSelectionCell} 