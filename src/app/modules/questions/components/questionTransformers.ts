import { toast } from '../../../../_metronic/helpers/toast'
import { QuestionFormData, MCOption as StoreMCOption } from '../../../../store/questions/questionsSlice'

interface MCOption {
  option_letter: string
  option_text: string
}

interface GeneratedQuestion {
  type: 'mc' | 'lq'
  name?: string // Made optional since it's no longer used
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

// Unified transformation function for both regular forms and AI modal
export const transformMCQuestionForBackend = (
  type: 'mc',
  question_content: string,
  teacher_remark: string,
  options: Array<{ option_letter: string; content: string; is_correct: boolean }>,
  answer_content: string,
  tags: Array<{ tag_id?: string; name?: string; score?: number }> = [],
  question_id?: string
): QuestionFormData => {
  const correctOption = options.find(opt => opt.is_correct)
  if (!correctOption) {
    toast.error('Please select a correct answer for the MC question.', 'Error')
    throw new Error('No correct answer selected')
  }

  return {
    type,
    name: '', // Name field is no longer used
    question_content,
    teacher_remark,
    ...(question_id && { question_id }),
    mc_question: {
      options: options.map(option => ({
        option_letter: option.option_letter,
        option_text: option.content,
        is_correct: option.is_correct
      })),
      correct_option: correctOption.option_letter,
      answer_content
    },
    tags
  }
}

export const transformLQQuestionForBackend = (
  type: 'lq',
  question_content: string,
  teacher_remark: string,
  answer_content: string,
  tags: Array<{ tag_id?: string; name?: string; score?: number }> = [],
  question_id?: string
): QuestionFormData => {
  return {
    type,
    name: '', // Name field is no longer used
    question_content,
    teacher_remark,
    ...(question_id && { question_id }),
    lq_question: {
      answer_content
    },
    tags
  }
}

export const transformQuestionsForBackend = (questions: GeneratedQuestion[]): QuestionFormData[] => {
  const questionData = questions.map(q => {
    if (q.type === 'mc' && q.mc_question) {
      const correctLetter = q.mc_question.correct_option
      if (!isValidLetter(correctLetter, q.mc_question.options)) {
        toast.error('Please select a valid correct answer for the MC question.', 'Error')
        throw new Error('No valid correct answer selected')
      }

    }
    
    return {
      type: q.type,
      name: '', // Name field is no longer used
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
            option_text: opt.option_text,
            is_correct: opt.option_letter === q.mc_question!.correct_option
          })),
          correct_option: q.mc_question!.correct_option,
          answer_content: q.mc_question!.answer_content
        }
      })
    }
  })


  
  return questionData
}

export const transformSingleQuestionForBackend = (question: GeneratedQuestion): QuestionFormData => {
  let questionData: QuestionFormData = { 
    type: question.type,
    name: '', // Name field is no longer used
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

    
    questionData.mc_question = {
      options: question.mc_question.options.map((opt: any): StoreMCOption => ({
        option_letter: opt.option_letter,
        option_text: opt.option_text,
        is_correct: opt.option_letter === correctLetter
      })),
      correct_option: correctLetter,
      answer_content: question.mc_question.answer_content
    }
  }


  
  return questionData
} 