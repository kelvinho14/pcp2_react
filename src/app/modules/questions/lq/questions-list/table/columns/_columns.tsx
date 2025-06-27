import { Column } from 'react-table'
import { QuestionSelectionCell } from './QuestionSelectionCell'
import { QuestionInfoCell } from './QuestionInfoCell'
import { QuestionActionsCell } from './QuestionActionsCell'
import { Question } from '../../../../../../../store/questions/questionsSlice'
import { ID } from '../../../../../../../_metronic/helpers'
import { hasImages, renderHtmlSafely, getTextPreview } from '../../../../../../../_metronic/helpers/htmlRenderer'

const questionsColumns: ReadonlyArray<Column<Question>> = [
  {
    Header: '',
    id: 'selection',
    Cell: ({ ...props }) => <QuestionSelectionCell id={props.data[props.row.index].q_id as unknown as ID} />,
  },
  {
    Header: 'Name',
    accessor: 'name',
    id: 'name',
    Cell: ({ ...props }) => <QuestionInfoCell question={props.data[props.row.index]} />,
  },
  {
    Header: 'Content Preview',
    accessor: 'question_content',
    id: 'content_preview',
    Cell: ({ ...props }) => {
      const questionContent = props.data[props.row.index].question_content || ''
      const answerContent = props.data[props.row.index].lq_question?.answer_content || ''
      
      return (
        <div className="d-flex flex-column" style={{ maxWidth: '500px', minWidth: '400px' }}>
          {/* Question Content */}
          <div className="mb-2">
            <div className="fw-bold text-muted mb-1" style={{ fontSize: '0.75rem' }}>Question:</div>
            {hasImages(questionContent) ? (
              <div 
                className="d-flex align-items-center"
                dangerouslySetInnerHTML={{ __html: renderHtmlSafely(questionContent, { maxImageWidth: 520, maxImageHeight: 312 }) }}
              />
            ) : (
              <div style={{ fontSize: '0.875rem' }}>{getTextPreview(questionContent, 100)}</div>
            )}
          </div>
          
          {/* Answer Content */}
          <div>
            <div className="fw-bold text-muted mb-1" style={{ fontSize: '0.75rem' }}>Answer:</div>
            {hasImages(answerContent) ? (
              <div 
                className="d-flex align-items-center"
                dangerouslySetInnerHTML={{ __html: renderHtmlSafely(answerContent, { maxImageWidth: 520, maxImageHeight: 312 }) }}
              />
            ) : (
              <div style={{ fontSize: '0.875rem' }}>{getTextPreview(answerContent, 100)}</div>
            )}
          </div>
        </div>
      )
    },
  },
  {
    Header: 'Created',
    accessor: 'created_at',
    id: 'created_at',
    Cell: ({ ...props }) => {
      const date = props.data[props.row.index].created_at
      if (!date) return '-'
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
    Cell: ({ ...props }) => <QuestionActionsCell id={props.data[props.row.index].q_id as unknown as ID} />,
  },
]

export { questionsColumns } 