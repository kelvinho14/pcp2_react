import {KTIcon} from '../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {useDispatch} from 'react-redux'
import {AppDispatch} from '../../../../../../../store'
import {ConfirmationDialog} from '../../../../../../../_metronic/helpers/ConfirmationDialog'
import {useState} from 'react'
import {bulkDeleteQuestions, fetchQuestions, generateSimilarQuestions} from '../../../../../../../store/questions/questionsSlice'
import {toast} from '../../../../../../../_metronic/helpers/toast'

const QuestionsListGrouping = () => {
  const {selected, clearSelected} = useListView()
  const dispatch = useDispatch<AppDispatch>()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showQuestionTypeDialog, setShowQuestionTypeDialog] = useState(false)
  const [selectedQuestionType, setSelectedQuestionType] = useState<'mc' | 'lq'>('lq')
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'challenging'>('medium')
  const [questionCount, setQuestionCount] = useState<number>(1)

  const handleAIGenerateSimilar = async () => {
    try {
      const questionIds = selected.filter(id => id !== undefined && id !== null).map(id => String(id))
      await dispatch(generateSimilarQuestions({ 
        questionIds, 
        questionType: selectedQuestionType,
        difficulty: selectedDifficulty,
        count: questionCount
      })).unwrap()
      toast.success(`${questionCount} similar ${selectedQuestionType.toUpperCase()} question(s) generated successfully!`, 'Success')
      clearSelected()
      setShowQuestionTypeDialog(false)
      // Refresh the LQ questions list
      dispatch(fetchQuestions({ type: 'lq', page: 1, items_per_page: 10 }))
    } catch (error) {
      console.error('Error generating similar questions:', error)
      // Error toast is handled by the thunk
    }
  }

  const handleBulkDelete = async () => {
    try {
      const questionIds = selected.filter(id => id !== undefined && id !== null).map(id => String(id))
      await dispatch(bulkDeleteQuestions(questionIds)).unwrap()
      toast.success(`${questionIds.length} question(s) deleted successfully!`, 'Success')
      clearSelected()
      setShowDeleteDialog(false)
      // Refresh the LQ questions list
      dispatch(fetchQuestions({ type: 'lq', page: 1, items_per_page: 10 }))
    } catch (error) {
      console.error('Error deleting questions:', error)
      // Error toast is handled by the thunk
    }
  }

  const handleAIGenerateClick = () => {
    setShowQuestionTypeDialog(true)
  }

  return (
    <>
      <div className='d-flex justify-content-end align-items-center' data-kt-question-table-toolbar='selected'>
        <div className='fw-bolder me-5'>
          <span className='me-2'>{selected.length}</span> selected
        </div>

        <button 
          type='button' 
          className='btn btn-primary me-3' 
          onClick={handleAIGenerateClick}
        >
          <KTIcon iconName='magic' className='fs-2' />
          AI Generate Similar
        </button>

        <button type='button' className='btn btn-danger' onClick={() => setShowDeleteDialog(true)}>
          <KTIcon iconName='trash' className='fs-2' />
          Delete Selected
        </button>
      </div>

      {/* Question Type Selection Dialog */}
      {showQuestionTypeDialog && (
        <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className='modal-dialog modal-dialog-centered modal-lg'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h5 className='modal-title'>Generate Similar Questions</h5>
                <button 
                  type='button' 
                  className='btn-close' 
                  onClick={() => setShowQuestionTypeDialog(false)}
                ></button>
              </div>
              <div className='modal-body'>
                {/* Question Type Selection */}
                <div className='mb-4'>
                  <h6 className='mb-3'>Choose the type of questions you want to generate:</h6>
                  <div className='d-flex justify-content-center gap-3'>
                    <button 
                      type='button' 
                      className={`btn btn-lg ${selectedQuestionType === 'mc' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setSelectedQuestionType('mc')}
                    >
                      <div className='d-flex flex-column align-items-center'>
                        <KTIcon iconName='check' className='fs-1 mb-2' />
                        <span className='fw-bold'>Multiple Choice</span>
                        <small className='text-muted'>MC Questions</small>
                      </div>
                    </button>
                    <button 
                      type='button' 
                      className={`btn btn-lg ${selectedQuestionType === 'lq' ? 'btn-info' : 'btn-outline-info'}`}
                      onClick={() => setSelectedQuestionType('lq')}
                    >
                      <div className='d-flex flex-column align-items-center'>
                        <KTIcon iconName='document' className='fs-1 mb-2' />
                        <span className='fw-bold'>Long Question</span>
                        <small className='text-muted'>LQ Questions</small>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div className='mb-4'>
                  <h6 className='mb-3'>Choose the difficulty level:</h6>
                  <div className='d-flex justify-content-center gap-2'>
                    <button 
                      type='button' 
                      className={`btn ${selectedDifficulty === 'easy' ? 'btn-success' : 'btn-outline-success'}`}
                      onClick={() => setSelectedDifficulty('easy')}
                    >
                      <div className='d-flex flex-column align-items-center'>
                        <KTIcon iconName='star' className='fs-4 mb-1' />
                        <span className='fw-bold'>Easy</span>
                      </div>
                    </button>
                    <button 
                      type='button' 
                      className={`btn ${selectedDifficulty === 'medium' ? 'btn-warning' : 'btn-outline-warning'}`}
                      onClick={() => setSelectedDifficulty('medium')}
                    >
                      <div className='d-flex flex-column align-items-center'>
                        <KTIcon iconName='star' className='fs-4 mb-1' />
                        <span className='fw-bold'>Medium</span>
                      </div>
                    </button>
                    <button 
                      type='button' 
                      className={`btn ${selectedDifficulty === 'hard' ? 'btn-danger' : 'btn-outline-danger'}`}
                      onClick={() => setSelectedDifficulty('hard')}
                    >
                      <div className='d-flex flex-column align-items-center'>
                        <KTIcon iconName='star' className='fs-4 mb-1' />
                        <span className='fw-bold'>Hard</span>
                      </div>
                    </button>
                    <button 
                      type='button' 
                      className={`btn ${selectedDifficulty === 'challenging' ? 'btn-dark' : 'btn-outline-dark'}`}
                      onClick={() => setSelectedDifficulty('challenging')}
                    >
                      <div className='d-flex flex-column align-items-center'>
                        <KTIcon iconName='star' className='fs-4 mb-1' />
                        <span className='fw-bold'>Challenging</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Question Count Selection */}
                <div className='mb-4'>
                  <h6 className='mb-3'>Number of questions to generate:</h6>
                  <div className='d-flex justify-content-center'>
                    <div className='input-group' style={{ maxWidth: '200px' }}>
                      <input
                        type='number'
                        className='form-control form-control-lg text-center fw-bold'
                        min='1'
                        max='4'
                        value={questionCount}
                        onChange={(e) => {
                          const value = parseInt(e.target.value)
                          if (value >= 1 && value <= 4) {
                            setQuestionCount(value)
                          }
                        }}
                        onBlur={(e) => {
                          const value = parseInt(e.target.value)
                          if (value < 1) setQuestionCount(1)
                          if (value > 4) setQuestionCount(4)
                        }}
                        style={{ 
                          fontSize: '1.5rem',
                          border: '2px solid #e1e3ea',
                          backgroundColor: '#ffffff'
                        }}
                      />
                      <span className='input-group-text fw-semibold'>(max 4)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className='modal-footer'>
                <button 
                  type='button' 
                  className='btn btn-secondary' 
                  onClick={() => setShowQuestionTypeDialog(false)}
                >
                  Cancel
                </button>
                <button 
                  type='button' 
                  className='btn btn-primary' 
                  onClick={() => {
                    setShowQuestionTypeDialog(false)
                    handleAIGenerateSimilar()
                  }}
                >
                  Generate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmationDialog
        show={showDeleteDialog}
        onHide={() => setShowDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        title="Delete Questions"
        message={`Are you sure you want to delete ${selected.length} selected question(s)? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  )
}

export {QuestionsListGrouping} 