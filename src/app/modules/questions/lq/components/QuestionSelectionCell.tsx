import {FC} from 'react'
import {ID} from '../../../../../_metronic/helpers'

type Props = {
  id: ID
  checked: boolean
  onChange: (checked: boolean) => void
}

const QuestionSelectionCell: FC<Props> = ({id, checked, onChange}) => {
  return (
    <div className='form-check form-check-sm form-check-custom form-check-solid'>
      <input
        className='form-check-input'
        type='checkbox'
        value={String(id)}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
    </div>
  )
}

export {QuestionSelectionCell} 