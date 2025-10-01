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
      const questionContent = props.data[props.row.index].question_content
      const mcQuestion = props.data[props.row.index].mc_question
      const correctOptionLetter = mcQuestion?.correct_option || ''
      const answerContent = mcQuestion?.answer_content || ''
      const navigate = useNavigate()
      
      
      const handleContentClick = () => {
        navigate(`/questions/mc/edit/${props.data[props.row.index].q_id}`)
      }
      
      return (
        <ContentTooltip
          questionContent={questionContent}
          answerContent={answerContent}
          correctOption={correctOptionLetter}
          options={mcQuestion?.options}
          questionType="mc"
        >
          <div 
            className="d-flex flex-column cursor-pointer" 
            style={{ maxWidth: '500px', minWidth: '400px', cursor: 'pointer' }}
            onClick={handleContentClick}
          >
            {/* Question Content */}
              <div className="mb-2">
                <div className="fw-bold mb-1" style={{ fontSize: '0.75rem', color: '#6f42c1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Question:</div>
                <div 
                  style={{ fontSize: '0.875rem' }}
                  dangerouslySetInnerHTML={{ __html: getHtmlPreview(questionContent, CONTENT_PREVIEW_LIMIT, { maxImageWidth: 120, maxImageHeight: 80 }) }}
                />
              </div>
            
            {/* Answer Content */}
            {answerContent && (
              <div className="mb-2">
                <div className="fw-bold mb-1" style={{ fontSize: '0.75rem', color: '#28a745', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Answer:</div>
                <div 
                  style={{ fontSize: '0.875rem' }}
                  dangerouslySetInnerHTML={{ __html: getHtmlPreview(answerContent, CONTENT_PREVIEW_LIMIT, { maxImageWidth: 120, maxImageHeight: 80 }) }}
                />
              </div>
            )}
            
            {/* Correct Answer Option */}
            <div>
              <div className="fw-bold mb-1" style={{ fontSize: '0.75rem', color: '#fd7e14', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Correct Option:</div>
              <div style={{ fontSize: '0.875rem' }}>
                {correctOptionLetter ? (
                  <>
                    <span className='fw-bold'>[Option {correctOptionLetter}]</span>
                    {mcQuestion?.options?.find(opt => opt.option_letter === correctOptionLetter)?.option_text ? (
                      <span className='ms-2'>
                        <span
                          dangerouslySetInnerHTML={{ __html: getHtmlPreview(mcQuestion.options.find(opt => opt.option_letter === correctOptionLetter)?.option_text || '', CONTENT_PREVIEW_LIMIT, { maxImageWidth: 120, maxImageHeight: 80 }) }}
                        />
                      </span>
                    ) : (
                      <span className='text-muted ms-2'>No option text available</span>
                    )}
                  </>
                ) : (
                  'No correct answer set'
                )}
              </div>
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
    Header: 'Actions',
    id: 'actions',
    Cell: ({ ...props }) => <QuestionActionsCell id={props.data[props.row.index].q_id as unknown as ID} />,
  },
]

export { questionsColumns } 