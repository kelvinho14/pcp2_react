import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../../../store'
import { 
  bulkDeleteQuestions, 
  fetchQuestions, 
  generateSimilarQuestions, 
  createMultipleQuestions, 
  createSingleQuestion, 
  clearGeneratedQuestions 
} from '../../../../store/questions/questionsSlice'
import { toast } from '../../../../_metronic/helpers/toast'
import { transformQuestionsForBackend, transformSingleQuestionForBackend } from '../components/questionTransformers'

type QuestionType = 'mc' | 'lq' // Will extend to 'tf' | 'matching' later
type Difficulty = 'easy' | 'medium' | 'hard' | 'challenging'

export const useQuestionsListGrouping = (questionType: QuestionType, useListViewHook: () => { selected: any[], clearSelected: () => void }) => {
  const { selected, clearSelected } = useListViewHook()
  const dispatch = useDispatch<AppDispatch>()
  const { generatedQuestions, generatingSimilarQuestions, creatingMultipleQuestions, creating, deleting, questions } = useSelector((state: RootState) => state.questions)
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAIGenerateModal, setShowAIGenerateModal] = useState(false)
  const [showGeneratedQuestionsModal, setShowGeneratedQuestionsModal] = useState(false)
  const [showAssignToExerciseModal, setShowAssignToExerciseModal] = useState(false)

  const handleAIGenerateSimilar = async (selectedQuestionType: QuestionType, difficulty: Difficulty, count: number) => {
    try {
      const questionIds = selected.filter((id: any) => id !== undefined && id !== null).map((id: any) => String(id))
      await dispatch(generateSimilarQuestions({ 
        questionIds, 
        questionType: selectedQuestionType,
        difficulty,
        count
      })).unwrap()
      setShowAIGenerateModal(false)
      setShowGeneratedQuestionsModal(true)
    } catch (error) {
      // Error toast is handled by the thunk
    }
  }

  const handleAcceptGeneratedQuestions = async (questions: any[], questionIds?: Map<number, string>) => {
    try {
      const questionData = transformQuestionsForBackend(questions, questionIds)
      await dispatch(createMultipleQuestions(questionData)).unwrap()
      toast.success(`${questions.length} questions created successfully!`, 'Success')
      clearSelected()
      setShowGeneratedQuestionsModal(false)
      dispatch(clearGeneratedQuestions())
      // Refresh the questions list
      dispatch(fetchQuestions({ type: questionType, page: 1, items_per_page: 10 }))
    } catch (error) {
      // Error toast is handled by the thunk
    }
  }

  const handleAcceptSingleQuestion = async (question: any, questionId?: string) => {
    try {
      const questionData = transformSingleQuestionForBackend(question, questionId)
      await dispatch(createSingleQuestion(questionData)).unwrap()
      toast.success('Question created successfully!', 'Success')
      // Refresh the questions list
      dispatch(fetchQuestions({ type: questionType, page: 1, items_per_page: 10 }))
    } catch (error) {
      // Error toast is handled by the thunk
      throw error
    }
  }

  const handleDismissGeneratedQuestions = () => {
    setShowGeneratedQuestionsModal(false)
    dispatch(clearGeneratedQuestions())
  }

  const handleBulkDelete = async () => {
    try {
      const questionIds = selected.filter((id: any) => id !== undefined && id !== null).map((id: any) => String(id))
      await dispatch(bulkDeleteQuestions(questionIds)).unwrap()
      toast.success(`${questionIds.length} question(s) deleted successfully!`, 'Success')
      clearSelected()
      setShowDeleteDialog(false)
      // Refresh the questions list
      dispatch(fetchQuestions({ type: questionType, page: 1, items_per_page: 10 }))
    } catch (error) {
      // Error toast is handled by the thunk
    }
  }

  const handleAIGenerateClick = () => {
    setShowAIGenerateModal(true)
  }

  const handleAssignToExerciseClick = () => {
    setShowAssignToExerciseModal(true)
  }

  return {
    // State
    selected,
    generatedQuestions,
    generatingSimilarQuestions,
    creatingMultipleQuestions,
    creating,
    deleting,
    questions,
    showDeleteDialog,
    showAIGenerateModal,
    showGeneratedQuestionsModal,
    showAssignToExerciseModal,
    
    // Handlers
    handleAIGenerateSimilar,
    handleAcceptGeneratedQuestions,
    handleAcceptSingleQuestion,
    handleDismissGeneratedQuestions,
    handleBulkDelete,
    handleAIGenerateClick,
    handleAssignToExerciseClick,
    
    // State setters
    setShowDeleteDialog,
    setShowAIGenerateModal,
    setShowGeneratedQuestionsModal,
    setShowAssignToExerciseModal
  }
}
