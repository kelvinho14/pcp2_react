import { FC } from 'react'
import { Row } from 'react-table'
import { Subject } from '../../../../../../../store/admin/adminSlice'

type Props = {
  row: Row<Subject>
}

const CustomRow: FC<Props> = ({ row }) => {
  const { key: rowKey, ...restRowProps } = row.getRowProps()

  return (
    <tr key={rowKey} {...restRowProps}>
      {row.cells.map((cell) => {
        const { key: cellKey, ...restCellProps } = cell.getCellProps()

        return (
          <td key={cellKey} {...restCellProps}>
            {cell.render('Cell')}
          </td>
        )
      })}
    </tr>
  )
}

export { CustomRow } 