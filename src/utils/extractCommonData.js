import { formatDate } from "./formatDate"

export const extractCommonData = (data) => {
  
  return {
    investorName : data.investorName,
    familyHead: data.familyHead,
    panNumber: data.panNumber,
    registrantName: data.registrantName,
    createdAt: formatDate(data.createdAt),
    pendingTrxCount: '',
    transactionCount: ''
  }
}

let filterPending = (item) => (item.status === 'PENDING')
export const countPending = (systematic, purchRedemp, switchData) => {
  let count = systematic.filter(filterPending).length
  count += purchRedemp.filter(filterPending).length
  count += switchData.filter(filterPending).length
  return count;
}