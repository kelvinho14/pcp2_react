import { FC } from 'react'
import { Row } from 'react-table'
import { Migration } from '../../../../../../../store/admin/migrationsSlice'

type Props = {
  row: Row<Migration>
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

