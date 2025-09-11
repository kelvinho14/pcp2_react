import { Column } from 'react-table'
import { MigrationInfoCell } from './MigrationInfoCell'
import { MigrationStatusCell } from './MigrationStatusCell'
import { MigrationTimeCell } from './MigrationTimeCell'
import { MigrationDetailsCell } from './MigrationDetailsCell'
import { MigrationErrorCell } from './MigrationErrorCell'
import { Migration } from '../../../../../../../store/admin/migrationsSlice'

const migrationsColumns: ReadonlyArray<Column<Migration>> = [
  {
    Header: 'Migration',
    accessor: 'migration_file',
    Cell: ({ ...props }) => <MigrationInfoCell migration={props.data[props.row.index]} />,
  },
  {
    Header: 'Status',
    accessor: 'success',
    Cell: ({ ...props }) => {
      const migration = props.data[props.row.index]
      return (
        <MigrationStatusCell 
          success={migration.success} 
          status={migration.status}
          isCompleted={migration.is_completed}
        />
      )
    },
  },
  {
    Header: 'Time',
    accessor: 'started_at',
    Cell: ({ ...props }) => {
      const migration = props.data[props.row.index]
      return (
        <MigrationTimeCell 
          startedAt={migration.started_at}
          completedAt={migration.completed_at}
          executionTimeMs={migration.execution_time_ms}
        />
      )
    },
  },
  {
    Header: 'Details',
    accessor: 'execution_type',
    Cell: ({ ...props }) => {
      const migration = props.data[props.row.index]
      return (
        <MigrationDetailsCell 
          executionType={migration.execution_type}
          executionTrigger={migration.execution_trigger}
          executedBy={migration.executed_by}
          environment={migration.environment}
          applicationVersion={migration.application_version}
        />
      )
    },
  },
  {
    Header: 'Error',
    accessor: 'error_message',
    Cell: ({ ...props }) => {
      const migration = props.data[props.row.index]
      return (
        <MigrationErrorCell 
          success={migration.success}
          errorMessage={migration.error_message}
        />
      )
    },
  },
]

export { migrationsColumns }


