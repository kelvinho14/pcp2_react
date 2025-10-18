import {Column} from 'react-table'
import {PracticeQuestionItem} from '../../../../../../store/dojo/practiceQuestionsSlice'
import {PracticeQuestionCell} from './PracticeQuestionCell.tsx'
import {PracticeQuestionWithOptionsCell} from './PracticeQuestionWithOptionsCell.tsx'
import {QuestionTypeCell} from './QuestionTypeCell.tsx'
import {AttemptTimeCell} from './AttemptTimeCell.tsx'

export const createPracticeQuestionsColumns = (onQuestionClick?: (questionId: string) => void): ReadonlyArray<Column<PracticeQuestionItem>> => [
  {
    Header: 'Question & Options',
    accessor: 'question_content',
    Cell: ({row}) => <PracticeQuestionWithOptionsCell question={row.original} />,
  },
  {
    Header: 'Type',
    accessor: 'type',
    Cell: ({row}) => <QuestionTypeCell type={row.original.type} />,
  },
  {
    Header: 'Created',
    accessor: 'created_at',
    Cell: ({row}) => <AttemptTimeCell answeredAt={row.original.created_at} />,
  },
]

// Keep the old export for backward compatibility (without onClick)
const practiceQuestionsColumns: ReadonlyArray<Column<PracticeQuestionItem>> = [
  {
    Header: 'Question',
    accessor: 'question_content',
    Cell: ({row}) => <PracticeQuestionCell question={row.original} />,
  },
  {
    Header: 'Type',
    accessor: 'type',
    Cell: ({row}) => <QuestionTypeCell type={row.original.type} />,
  },
  {
    Header: 'Created',
    accessor: 'created_at',
    Cell: ({row}) => <AttemptTimeCell answeredAt={row.original.created_at} />,
  },
]

export {practiceQuestionsColumns}

