import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../store'
import { processContentToText, setProcessedContent } from '../store/ai/aiSlice'
import { toast } from '../_metronic/helpers/toast'

export const useAIImageToText = (questionType: 'mc' | 'lq') => {
  const dispatch = useDispatch<AppDispatch>()
  const [processingField, setProcessingField] = useState<'question' | 'answer' | null>(null)
  const { processing, targetField } = useSelector((state: RootState) => state.ai)

  const handleAIImageToText = async (content: string, field: 'question' | 'answer') => {
    // Check if there are images in the current content
    if (!content.includes('<img')) {
      toast.warning(`No images found in the ${field} content.`, 'Warning')
      return
    }

    setProcessingField(field)
    try {
      const type = `${questionType}_${field}` as 'mc_question' | 'mc_answer' | 'lq_question' | 'lq_answer'
      const processedText = await dispatch(processContentToText({ content, type })).unwrap()
      
      // Show the modal with processed content
      dispatch(setProcessedContent({ content: processedText, field }))
      
    } catch (error: any) {
      console.error('Error processing AI image to text:', error)
      // Error handling is already done in the Redux thunk
    } finally {
      setProcessingField(null)
    }
  }

  return {
    processingField: processingField || (processing ? targetField : null),
    handleAIImageToText
  }
} 