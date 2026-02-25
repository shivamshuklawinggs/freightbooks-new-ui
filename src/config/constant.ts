const todayDate=new Date()
todayDate.setHours(0,0,0,0)
const todayEndDate=new Date()
todayEndDate.setHours(23,59,59,999)
const TIME_FORMAT:string=import.meta.env.VITE_FORMAT_TIME_FORMAT
const DATE_TIME_FORMAT:string=import.meta.env.VITE_FORMAT_DATE_TIME_FORMAT
const TIME_ZONE:string=import.meta.env.VITE_TIME_ZONE
const HOUR_MINUTE_FORMAT='HH:mm'
const REPORT_TIME_FORMAT='dddd, MMMM DD, YYYY hh:mm A [GMT]Z'
const DATE_PICKER_TIME_FORMAT:string=import.meta.env.VITE_DATE_PICKER_TIME_FORMAT
export {todayDate,todayEndDate,TIME_FORMAT,TIME_ZONE,HOUR_MINUTE_FORMAT,REPORT_TIME_FORMAT,DATE_PICKER_TIME_FORMAT,DATE_TIME_FORMAT}