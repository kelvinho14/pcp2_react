import { Column } from 'react-table'
import { ExerciseSelectionCell } from './ExerciseSelectionCell'
import { ExerciseActionsCell } from './ExerciseActionsCell'
import { Exercise } from '../../../../../../store/exercises/exercisesSlice'
import { ID } from '../../../../../../_metronic/helpers'
import { KTSVG } from '../../../../../../_metronic/helpers'

const exercisesColumns: ReadonlyArray<Column<Exercise>> = [
  {
    Header: '',
    id: 'selection',
    Cell: ({ ...props }) => <ExerciseSelectionCell id={props.data[props.row.index].exercise_id as unknown as ID} />,
  },
  {
    Header: 'Exercise Title',
    accessor: 'title',
    id: 'title',
    Cell: ({ ...props }) => {
      const exercise = props.data[props.row.index]
      const truncateText = (text: string, maxLength: number = 50) => {
        if (!text) return ''
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
      }
      
      return (
        <div className='d-flex align-items-center'>
          <div className='d-flex flex-column'>
            <a
              href='#'
              className='text-gray-800 text-hover-primary mb-1'
              onClick={(e) => {
                e.preventDefault()
                // Navigation will be handled by the actions menu
                console.log('Navigate to exercise:', exercise.exercise_id)
              }}
            >
              {exercise.title || 'Untitled Exercise'}
            </a>
            {exercise.description && (
              <span className='text-muted fs-7'>
                {truncateText(exercise.description, 50)}
              </span>
            )}
          </div>
        </div>
      )
    },
  },
  {
    Header: 'Type',
    accessor: 'exercise_type',
    id: 'type',
    Cell: ({ ...props }) => {
      const exercise = props.data[props.row.index]
      return (
        <div className='text-gray-800'>
          {exercise.exercise_type?.name || 'Unknown Type'}
        </div>
      )
    },
  },
  {
    Header: 'Status',
    accessor: 'status',
    id: 'status',
    Cell: ({ ...props }) => {
      const status = props.data[props.row.index].status
      const getStatusBadge = (status: number) => {
        switch (status) {
          case 0:
            return <span className='badge badge-light-warning'>Draft</span>
          case 1:
            return <span className='badge badge-light-success'>Active</span>
          case 2:
            return <span className='badge badge-light-danger'>Inactive</span>
          default:
            return <span className='badge badge-light-secondary'>Unknown</span>
        }
      }
      
      return getStatusBadge(status)
    },
  },
  {
    Header: 'Created',
    accessor: 'created_at',
    id: 'created_at',
    Cell: ({ ...props }) => {
      const date = props.data[props.row.index].created_at
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
  },
  {
    Header: 'Updated',
    accessor: 'updated_at',
    id: 'updated_at',
    Cell: ({ ...props }) => {
      const date = props.data[props.row.index].updated_at
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
  },
  {
    Header: 'Actions',
    id: 'actions',
    Cell: ({ ...props }) => <ExerciseActionsCell id={props.data[props.row.index].exercise_id as unknown as ID} />,
  },
]

export { exercisesColumns } 