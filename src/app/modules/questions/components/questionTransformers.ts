import { toast } from '../../../../_metronic/helpers/toast'
import { QuestionFormData, MCOption as StoreMCOption } from '../../../../store/questions/questionsSlice'

interface MCOption {
  option_letter: string
  option_text: string
}

interface GeneratedQuestion {
  type: 'mc' | 'lq'
  name: string
  question_content: string
  teacher_remark: string
  lq_question?: {
    answer_content: string
  }
  mc_question?: {
    options: MCOption[]
    correct_option: string
    answer_content?: string
  }
}

const isValidLetter = (letter: string, options: any[]) =>
  !!letter && options.some(opt => opt.option_letter === letter)

export const transformQuestionsForBackend = (questions: GeneratedQuestion[]): QuestionFormData[] => {
  const questionData = questions.map(q => {
    if (q.type === 'mc' && q.mc_question) {
      const correctLetter = q.mc_question.correct_option
      if (!isValidLetter(correctLetter, q.mc_question.options)) {
        toast.error('Please select a valid correct answer for the MC question.', 'Error')
        throw new Error('No valid correct answer selected')
      }
      console.log('MC correct_option to send:', correctLetter)
    }
    
    return {
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
          options: q.mc_question.options.map((opt: any): StoreMCOption => ({
            option_letter: opt.option_letter,
            is_correct: opt.option_letter === q.mc_question!.correct_option
          })),
          correct_option: q.mc_question!.correct_option,
          answer_content: q.mc_question!.answer_content
        }
      })
    }
  })

  // BEFORE SEND: Log the full payload
  console.log('[Before Send] Payload to backend:', questionData)
  
  return questionData
}

export const transformSingleQuestionForBackend = (question: GeneratedQuestion): QuestionFormData => {
  let questionData: QuestionFormData = { 
    type: question.type,
    name: question.name,
    question_content: question.question_content,
    teacher_remark: question.teacher_remark
  }
  
  if (question.type === 'lq' && question.lq_question) {
    questionData.lq_question = {
      answer_content: question.lq_question.answer_content
    }
  }
  
  if (question.type === 'mc' && question.mc_question) {
    const correctLetter = question.mc_question.correct_option
    if (!isValidLetter(correctLetter, question.mc_question.options)) {
      toast.error('Please select a valid correct answer for the MC question.', 'Error')
      throw new Error('No valid correct answer selected')
    }
    console.log('MC correct_option to send:', correctLetter)
    
    questionData.mc_question = {
      options: question.mc_question.options.map((opt: any): StoreMCOption => ({
        option_letter: opt.option_letter,
        is_correct: opt.option_letter === correctLetter
      })),
      correct_option: correctLetter,
      answer_content: question.mc_question.answer_content
    }
  }

  // BEFORE SEND: Log the full payload
  console.log('[Before Send] Single question payload to backend:', questionData)
  
  return questionData
} 