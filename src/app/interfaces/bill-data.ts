export interface BillData {
    billName: string,
    billValue: number,
    billDate: string,
    billPaidDate: string,
    isPaid: boolean,
    isLocked: boolean,
    isEditing: boolean,
    isSaved: boolean,
    id: string
}
