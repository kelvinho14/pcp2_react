import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../../store'
import {deleteQuestions, generateSimilarQuestions} from '../../../../../store/questions/questionsSlice'
import AIGenerateSimilarModal from '../../components/AIGenerateSimilarModal'

const QuestionsListGrouping: FC<Props> = ({list}) => {
  const dispatch = useDispatch<AppDispatch>()
  const {selected, isAllSelected} = useSelector((state: RootState) => state.questions)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false)

  const handleAIGenerate = (questionType: 'mc' | 'lq', difficulty: 'easy' | 'medium' | 'hard' | 'challenging', count: number) => {
    dispatch(generateSimilarQuestions({questionIds: selected, questionType, difficulty, count}))
    setShowAIGenerateModal(false)
  }

  return (
    <>
      {/* Delete Confirmation Modal */}
      <div className={`modal fade ${showDeleteConfirm ? 'show d-block' : ''}`} style={{ backgroundColor: showDeleteConfirm ? 'rgba(0, 0, 0, 0.5)' : 'transparent' }}>
        <div className='modal-dialog modal-dialog-centered'>
          <div className='modal-content'>
            <div className='modal-header'>
              <h5 className='modal-title'>Confirm Delete</h5>
              <button 
                type='button' 
                className='btn-close' 
                onClick={() => setShowDeleteConfirm(false)}
              ></button>
            </div>
            <div className='modal-body'>
              <p>Are you sure you want to delete {selected.length} selected question{selected.length > 1 ? 's' : ''}?</p>
            </div>
            <div className='modal-footer'>
              <button 
                type='button' 
                className='btn btn-secondary' 
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button 
                type='button' 
                className='btn btn-danger' 
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Generate Similar Questions Modal */}
      <AIGenerateSimilarModal
        show={showAIGenerateModal}
        onHide={() => setShowAIGenerateModal(false)}
        onGenerate={handleAIGenerate}
        defaultQuestionType='lq'
      />
    </>
  )
} 