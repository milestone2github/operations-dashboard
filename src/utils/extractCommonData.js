import { formatDate } from "./formatDate"

export const extractCommonData = (data) => {
  
  return {
    investorName : data.investorName,
    familyHead: data.familyHead,
    panNumber: data.panNumber,
    relationshipManager: data.relationshipManager,
    createdAt: formatDate(data.createdAt),
    pendingTrxCount: '',
    transactionCount: ''
  }
}

let filterPending = (item) => (item.status === 'PENDING')

function sumTransactions(sum, item) {
  if(item.transactionFractions.length) {
    return sum + item.transactionFractions.length
  }
  return sum + 1
}

function sumPending(sum, item) {
  if(item.transactionFractions.length) {
    return sum + item.transactionFractions.filter(filterPending).length
  }
  return sum + Number(filterPending(item))
}

export const countAll = (systematic, purchRedemp, switchData) => {
  let sysCount = systematic.reduce(sumTransactions, 0)
  let purredCount = purchRedemp.reduce(sumTransactions, 0)
  let switchCount = switchData.reduce(sumTransactions, 0)
  return sysCount + purredCount + switchCount;
}

export const countPending = (systematic, purchRedemp, switchData) => {
  let sysCount = systematic.reduce(sumPending, 0)
  let purredCount = purchRedemp.reduce(sumPending, 0)
  let switchCount = switchData.reduce(sumPending, 0)
  return sysCount + purredCount + switchCount;
}