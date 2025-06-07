import clsx from 'clsx'
import { FC } from 'react'
import { HeaderProps } from 'react-table'
import { User } from '../../core/_models'

type Props = {
  className?: string
  title?: string
  tableProps: {
    column: HeaderProps<User>['column']
  }
}

const UserCustomHeader: FC<Props> = ({ className, title, tableProps }) => {
  const { key, ...restHeaderProps } = tableProps.column.getHeaderProps()

  return (
    <th
      key={key}
      {...restHeaderProps}
      className={clsx(className)}
      style={{ cursor: 'pointer' }}
    >
      {title}
    </th>
  )
}

export { UserCustomHeader }
