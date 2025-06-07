import { FC } from 'react'
import { Row } from 'react-table'
import { User } from '../../core/_models'

type Props = {
  row: Row<User>
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
