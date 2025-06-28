import {FC} from 'react'
import {Row} from 'react-table'
import {Question} from '../../../../../../../store/questions/questionsSlice'

type Props = {
  row: Row<Question>
}

const CustomRow: FC<Props> = ({row}) => {
  const {key, ...rowProps} = row.getRowProps()
  
  return (
    <tr key={key} {...rowProps}>
      {row.cells.map((cell) => {
        const {key: cellKey, ...cellProps} = cell.getCellProps()
        return <td key={cellKey} {...cellProps}>{cell.render('Cell')}</td>
      })}
    </tr>
  )
}

export {CustomRow} 