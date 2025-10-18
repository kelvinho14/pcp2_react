import { Column } from 'react-table'
import { QuestionSelectionCell } from './QuestionSelectionCell'
import { QuestionActionsCell } from './QuestionActionsCell'
import { Question } from '../../../../../../../store/questions/questionsSlice'
import { ID } from '../../../../../../../_metronic/helpers'
import { hasImages, renderHtmlSafely, getTextPreview, getHtmlPreview, CONTENT_PREVIEW_LIMIT } from '../../../../../../../_metronic/helpers/htmlRenderer'
import { useNavigate } from 'react-router-dom'
import { formatApiTimestamp } from '../../../../../../../_metronic/helpers/dateUtils'
import { ContentTooltip } from '../../../../shared/ContentTooltip'

const questionsColumns: ReadonlyArray<Column<Question>> = [
  {
    Header: '',
    id: 'selection',
    Cell: ({ ...props }) => <QuestionSelectionCell id={props.data[props.row.index].q_id as unknown as ID} />,
  },
  {
    Header: 'Content Preview',
    accessor: 'question_content',
    id: 'content_preview',
    Cell: ({ ...props }) => {
      const question = props.data[props.row.index]
      const questionContent = question.question_content || ''
      const answerContent = question.lq_question?.answer_content || ''
      const isAIGenerated = question.is_ai_generated
      const navigate = useNavigate()
      
      
      const handleContentClick = () => {
        navigate(`/questions/lq/edit/${question.q_id}`)
      }
      
      return (
        <ContentTooltip
          questionContent={questionContent}
          answerContent={answerContent}
          questionType="lq"
        >
          <div 
            className="d-flex flex-column cursor-pointer" 
            style={{ maxWidth: '500px', minWidth: '400px', cursor: 'pointer' }}
            onClick={handleContentClick}
          >
            {/* AI Generated Badge */}
            {isAIGenerated && (
              <div className="mb-2">
                <span className="badge badge-light-primary">
                  <i className='fas fa-robot me-1'></i>
                  AI Generated
                </span>
              </div>
            )}
            
            {/* Question Content */}
              <div className="mb-2">
                <div className="fw-bold mb-1" style={{ fontSize: '0.75rem', color: '#6f42c1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Question:</div>
                <div 
                  style={{ fontSize: '0.875rem' }}
                  dangerouslySetInnerHTML={{ __html: getHtmlPreview(questionContent, CONTENT_PREVIEW_LIMIT, { maxImageWidth: 520, maxImageHeight: 312 }) }}
                />
              </div>
            
            {/* Answer Content */}
            <div>
              <div className="fw-bold mb-1" style={{ fontSize: '0.75rem', color: '#28a745', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Answer:</div>
              <div 
                style={{ fontSize: '0.875rem' }}
                dangerouslySetInnerHTML={{ __html: getHtmlPreview(answerContent, CONTENT_PREVIEW_LIMIT, { maxImageWidth: 520, maxImageHeight: 312 }) }}
              />
            </div>
          </div>
        </ContentTooltip>
      )
    },
  },
  {
    Header: 'Created',
    accessor: 'created_at',
    id: 'created_at',
    Cell: ({ ...props }) => {
      const date = props.data[props.row.index].created_at
      return formatApiTimestamp(date, { format: 'custom' })
    },
  },
  {
    Header: 'Assigned',
    accessor: 'is_assigned',
    id: 'is_assigned',
    Cell: ({ ...props }) => {
      const isAssigned = props.data[props.row.index].is_assigned
      return (
        <div className='d-flex align-items-center'>
          {isAssigned === 1 ? (
            <>
              <i className='fas fa-check-circle text-success fs-4 me-2'></i>
            </>
          ) : (
            <>
              <i className='fas fa-times-circle text-muted fs-4 me-2'></i>
            </>
          )}
        </div>
      )
    },
  },
  {
    Header: 'Actions',
    id: 'actions',
    Cell: ({ ...props }) => {
      const question = props.data[props.row.index]
      return (
        <QuestionActionsCell 
          id={question.q_id as unknown as ID} 
          isAssigned={question.is_assigned === 1}
        />
      )
    },
  },
]

export { questionsColumns } 