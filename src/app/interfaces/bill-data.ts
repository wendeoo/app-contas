export interface BillData {
    billName: string,
    billValue: number,
    billDate: string,
    billPaidDate: string,
    isPaid: boolean,
    isEditing: boolean,
    isSaved: boolean,
    isExpired: boolean,
    createdAt: number,
    id: string,
    paidBy: string
}
