import {ID, Response} from '../../../../../../_metronic/helpers'

export type Subject = {
  subject_id?: ID
  name?: string
  code?: string
  created_at?: string
  updated_at?: string
}

export type SubjectsQueryResponse = Response<Array<Subject>>

export const initialSubject: Subject = {
  name: '',
  code: '',
} 