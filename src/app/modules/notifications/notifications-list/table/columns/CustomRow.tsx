import {Row} from 'react-table'
import {Notification} from '../types'

type Props = {
  row: Row<Notification>
}

const CustomRow = ({row}: Props) => {
  return (
    <tr {...row.getRowProps()} className={!row.original.isRead ? 'bg-light-primary' : ''}>
      {row.cells.map((cell) => {
        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
      })}
    </tr>
  )
}

export {CustomRow}
