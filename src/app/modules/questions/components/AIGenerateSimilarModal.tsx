import {FC, useState} from 'react'
import {KTIcon} from '../../../../_metronic/helpers'

interface AIGenerateSimilarModalProps {
  show: boolean
  onHide: () => void
  onGenerate: (questionType: 'mc' | 'lq', difficulty: 'easy' | 'medium' | 'hard' | 'challenging', count: number) => void
  defaultQuestionType?: 'mc' | 'lq'
  isLoading?: boolean
}

const AIGenerateSimilarModal: FC<AIGenerateSimilarModalProps> = ({
  show,
  onHide,
  onGenerate,
  defaultQuestionType = 'lq',
  isLoading = false
}) => {
  const [selectedQuestionType, setSelectedQuestionType] = useState<'mc' | 'lq'>(defaultQuestionType)
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard' | 'challenging'>('medium')
  const [questionCount, setQuestionCount] = useState<number>(1)

  const handleGenerate = () => {
    onGenerate(selectedQuestionType, selectedDifficulty, questionCount)
  }

  if (!show) return null

  return (
    <div className='modal fade show d-block' style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className='modal-dialog modal-dialog-centered modal-lg'>
        <div className='modal-content'>
          <div className='modal-header'>
            <h5 className='modal-title'>Generate Similar Questions</h5>
            <button 
              type='button' 
              className='btn-close' 
              onClick={onHide}
              disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                    disabled={isLoading}
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
              onClick={onHide}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type='button' 
              className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`}
              onClick={handleGenerate}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIGenerateSimilarModal 