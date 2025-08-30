import React from 'react'
import QuestionsListGroupingBase from '../../../../components/QuestionsListGroupingBase'
import { useListView } from '../../core/ListViewProvider'

const QuestionsListGrouping = () => {
  return <QuestionsListGroupingBase questionType="lq" useListViewHook={useListView} />
}

export default QuestionsListGrouping 