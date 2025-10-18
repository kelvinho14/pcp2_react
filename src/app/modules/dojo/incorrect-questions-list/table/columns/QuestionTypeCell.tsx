import {FC} from 'react'

type Props = {
  type: 'mc' | 'lq' | 'tf'
}

const QuestionTypeCell: FC<Props> = ({type}) => {
  const getTypeDisplay = () => {
    switch (type) {
      case 'mc':
        return {
          label: 'MC',
          badgeClass: 'badge-light-primary',
          icon: 'fa-list-ul'
        }
      case 'lq':
        return {
          label: 'LQ',
          badgeClass: 'badge-light-info',
          icon: 'fa-align-left'
        }
      case 'tf':
        return {
          label: 'TF',
          badgeClass: 'badge-light-success',
          icon: 'fa-check-circle'
        }
    }
  }

  const {label, badgeClass, icon} = getTypeDisplay()

  return (
    <div className={`badge ${badgeClass} fw-bold`}>
      {label}
    </div>
  )
}

export {QuestionTypeCell}

