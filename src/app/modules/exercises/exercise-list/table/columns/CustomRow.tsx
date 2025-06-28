import {FC} from 'react'
import {Row} from 'react-table'
import {Exercise} from '../../../../../../store/exercises/exercisesSlice'

type Props = {
  row: Row<Exercise>
}

const CustomRow: FC<Props> = ({row}) => {
  return (
    <tr {...row.getRowProps()}>
      {row.cells.map((cell) => {
        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
      })}
    </tr>
  )
}

export {CustomRow} 