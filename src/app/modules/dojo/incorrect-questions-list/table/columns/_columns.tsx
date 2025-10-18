import {Column} from 'react-table'
import {IncorrectQuestionItem} from '../../../../../../store/dojo/incorrectQuestionsSlice'
import {QuestionCell} from './QuestionCell.tsx'
import {QuestionTypeCell} from './QuestionTypeCell.tsx'
import {AttemptTimeCell} from './AttemptTimeCell.tsx'
import {GenerationCountCell} from './GenerationCountCell.tsx'
import {QuestionActionsCell} from './QuestionActionsCell.tsx'

// Note: Actions column needs to be created with a custom accessor
export const createIncorrectQuestionsColumns = (
  onGenerateClick: (questionId: string) => void,
  onGeneratedCountClick: (questionId: string) => void,
  showAnswer: boolean
): ReadonlyArray<Column<IncorrectQuestionItem>> => [
  {
    Header: 'Question & Options',
    accessor: 'question_content',
    Cell: ({row}) => <QuestionCell question={row.original} showAnswer={showAnswer} />,
  },
  {
    Header: 'Type',
    accessor: 'question_type',
    Cell: ({row}) => <QuestionTypeCell type={row.original.question_type} />,
  },
  {
    Header: 'Generated',
    accessor: 'generation_count',
    Cell: ({row}) => (
      <GenerationCountCell 
        count={row.original.generation_count} 
        onClick={row.original.generation_count > 0 ? () => onGeneratedCountClick(row.original.question_id) : undefined}
      />
    ),
  },
  {
    Header: 'Attempt',
    accessor: 'answered_at',
    Cell: ({row}) => <AttemptTimeCell answeredAt={row.original.answered_at} />,
  },
  {
    Header: 'Actions',
    id: 'actions',
    Cell: ({row}) => <QuestionActionsCell questionId={row.original.question_id} onGenerateClick={onGenerateClick} />,
  },
]

// Keep the old export for backward compatibility (without actions)
const incorrectQuestionsColumns: ReadonlyArray<Column<IncorrectQuestionItem>> = [
  {
    Header: 'Question',
    accessor: 'question_content',
    Cell: ({row}) => <QuestionCell question={row.original} showAnswer={false} />,
  },
  {
    Header: 'Type',
    accessor: 'question_type',
    Cell: ({row}) => <QuestionTypeCell type={row.original.question_type} />,
  },
  {
    Header: 'Generated',
    accessor: 'generation_count',
    Cell: ({row}) => <GenerationCountCell count={row.original.generation_count} />,
  },
  {
    Header: 'Attempt',
    accessor: 'answered_at',
    Cell: ({row}) => <AttemptTimeCell answeredAt={row.original.answered_at} />,
  },
]

export {incorrectQuestionsColumns}

