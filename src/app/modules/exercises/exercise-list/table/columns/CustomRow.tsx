import {FC} from 'react'
import {Row} from 'react-table'
import {Exercise} from '../../../../../../store/exercises/exercisesSlice'

type Props = {
  row: Row<Exercise>
}

const CustomRow: FC<Props> = ({row}) => {
  const rowProps = row.getRowProps()
  const {key: rowKey, ...restRowProps} = rowProps

  return (
    <tr key={rowKey} {...restRowProps}>
      {row.cells.map((cell) => {
        const cellProps = cell.getCellProps()
        const {key: cellKey, ...restCellProps} = cellProps
        
        return <td key={cellKey} {...restCellProps}>{cell.render('Cell')}</td>
      })}
    </tr>
  )
}

export {CustomRow} 