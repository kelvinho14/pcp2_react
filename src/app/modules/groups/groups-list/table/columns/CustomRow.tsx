import { FC } from 'react'
import { Row } from 'react-table'
import { Group } from '../../core/_models'

type Props = {
  row: Row<Group>
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