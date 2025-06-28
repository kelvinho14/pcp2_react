import {FC} from 'react'
import {ColumnInstance, UseSortByColumnProps} from 'react-table'
import {KTSVG} from '../../../../../../../_metronic/helpers'
import {Question} from '../../../../../../../store/questions/questionsSlice'
import {QuestionSelectionHeader} from './QuestionSelectionHeader'

type Props = {
  column: ColumnInstance<Question> & UseSortByColumnProps<Question>
  onSort: () => void
}

const CustomHeaderColumn: FC<Props> = ({column, onSort}) => {
  const {key, ...headerProps} = column.getHeaderProps(column.getSortByToggleProps())
  
  // Selection Column
  if (column.id === 'selection') {
    return <QuestionSelectionHeader tableProps={{ column }} />
  }

  // Actions Column - disable sorting
  if (column.id === 'actions' || column.id === 'content_preview') {
    return (
      <th key={key} {...headerProps}>
        {column.render('Header')}
      </th>
    )
  }

  // Default Column
  return (
    <th
      {...headerProps}
      className='min-w-125px cursor-pointer'
      onClick={onSort}
    >
      <div className='d-flex align-items-center'>
        {column.render('Header')}
      </div>
    </th>
  )
}

export {CustomHeaderColumn} 