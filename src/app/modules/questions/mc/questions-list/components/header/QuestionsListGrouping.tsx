import {KTIcon} from '../../../../../../../_metronic/helpers'
import {useListView} from '../../core/ListViewProvider'
import {useDispatch, useSelector} from 'react-redux'
import {AppDispatch, RootState} from '../../../../../../../store'
import {ConfirmationDialog} from '../../../../../../../_metronic/helpers/ConfirmationDialog'
import {useState} from 'react'
import {bulkDeleteQuestions, fetchQuestions, generateSimilarQuestions, createMultipleQuestions, createSingleQuestion, clearGeneratedQuestions} from '../../../../../../../store/questions/questionsSlice'
import {toast} from '../../../../../../../_metronic/helpers/toast'
import AIGenerateSimilarModal from '../../../../components/AIGenerateSimilarModal'
import AIGeneratedQuestionsModal from '../../../../components/AIGeneratedQuestionsModal'

const QuestionsListGrouping = () => {
  const {selected, clearSelected} = useListView()
  const dispatch = useDispatch<AppDispatch>()
  const {generatedQuestions, generatingSimilarQuestions, creatingMultipleQuestions, creating} = useSelector((state: RootState) => state.questions)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false)
  const [showGeneratedQuestionsModal, setShowGeneratedQuestionsModal] = useState(false)

  const handleAIGenerateSimilar = async (questionType: 'mc' | 'lq', difficulty: 'easy' | 'medium' | 'hard' | 'challenging', count: number) => {
    try {
      const questionIds = selected.filter(id => id !== undefined && id !== null).map(id => String(id))
      await dispatch(generateSimilarQuestions({ 
        questionIds, 
        questionType,
        difficulty,
        count
      })).unwrap()
      setShowAIGenerateModal(false)
      setShowGeneratedQuestionsModal(true) // Show the review modal
    } catch (error) {
      console.error('Error generating similar questions:', error)
      // Error toast is handled by the thunk
    }
  }

  const handleAcceptGeneratedQuestions = async (questions: any[]) => {
    try {
      // Convert the questions to the format expected by the API
      const questionData = questions.map(q => ({
        type: q.type,
        name: q.name,
        question_content: q.question_content,
        teacher_remark: q.teacher_remark,
        ...(q.type === 'lq' && q.lq_question && {
          lq_question: {
            answer_content: q.lq_question.answer_content
          }
        }),
        ...(q.type === 'mc' && q.mc_question && {
          mc_question: {
            options: q.mc_question.options.map((opt: string, idx: number) => ({
              option_letter: String.fromCharCode(65 + idx),
              is_correct: idx === q.mc_question.correct_answer
            })),
            correct_option: String.fromCharCode(65 + q.mc_question.correct_answer)
          }
        })
      }))

      await dispatch(createMultipleQuestions(questionData)).unwrap()
      toast.success(`${questions.length} questions created successfully!`, 'Success')
      clearSelected()
      setShowGeneratedQuestionsModal(false)
      dispatch(clearGeneratedQuestions())
      // Refresh the MC questions list
      dispatch(fetchQuestions({ type: 'mc', page: 1, items_per_page: 10 }))
    } catch (error) {
      console.error('Error creating questions:', error)
      // Error toast is handled by the thunk
    }
  }

  const handleAcceptSingleQuestion = async (question: any) => {
    try {
      // Convert the question to the format expected by the API
      const questionData = {
        type: question.type,
        name: question.name,
        question_content: question.question_content,
        teacher_remark: question.teacher_remark,
        ...(question.type === 'lq' && question.lq_question && {
          lq_question: {
            answer_content: question.lq_question.answer_content
          }
        }),
        ...(question.type === 'mc' && question.mc_question && {
          mc_question: {
            options: question.mc_question.options.map((opt: string, idx: number) => ({
              option_letter: String.fromCharCode(65 + idx),
              is_correct: idx === question.mc_question.correct_answer
            })),
            correct_option: String.fromCharCode(65 + question.mc_question.correct_answer)
          }
        })
      }

      await dispatch(createSingleQuestion(questionData)).unwrap()
      toast.success('Question created successfully!', 'Success')
      // Refresh the MC questions list
      dispatch(fetchQuestions({ type: 'mc', page: 1, items_per_page: 10 }))
    } catch (error) {
      console.error('Error creating question:', error)
      // Error toast is handled by the thunk
      throw error // Re-throw to let the modal handle the error state
    }
  }

  const handleDismissGeneratedQuestions = () => {
    setShowGeneratedQuestionsModal(false)
    dispatch(clearGeneratedQuestions())
  }

  const handleBulkDelete = async () => {
    try {
      const questionIds = selected.filter(id => id !== undefined && id !== null).map(id => String(id))
      await dispatch(bulkDeleteQuestions(questionIds)).unwrap()
      toast.success(`${questionIds.length} question(s) deleted successfully!`, 'Success')
      clearSelected()
      setShowDeleteDialog(false)
      // Refresh the MC questions list
      dispatch(fetchQuestions({ type: 'mc', page: 1, items_per_page: 10 }))
    } catch (error) {
      console.error('Error deleting questions:', error)
      // Error toast is handled by the thunk
    }
  }

  const handleAIGenerateClick = () => {
    setShowAIGenerateModal(true)
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

      <AIGenerateSimilarModal
        show={showAIGenerateModal}
        onHide={() => setShowAIGenerateModal(false)}
        onGenerate={handleAIGenerateSimilar}
        defaultQuestionType='mc'
        isLoading={generatingSimilarQuestions}
      />

      <AIGeneratedQuestionsModal
        show={showGeneratedQuestionsModal}
        onHide={handleDismissGeneratedQuestions}
        onAccept={handleAcceptGeneratedQuestions}
        onAcceptSingle={handleAcceptSingleQuestion}
        questions={generatedQuestions}
        isLoading={generatingSimilarQuestions || creatingMultipleQuestions || creating}
      />
    </>
  )
}

export default QuestionsListGrouping 