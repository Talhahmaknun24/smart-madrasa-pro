
export interface Student {
  id?: string;
  // Personal Info
  regNo: string;
  name: string;
  dob: string;
  gender: 'Male' | 'Female';
  bloodGroup: string;
  religion: string;
  mobile: string;
  email?: string;
  birthRegNo?: string;
  category?: string;
  
  // Guardian Info
  fatherName: string;
  fatherPhone: string;
  fatherOccupation?: string;
  motherName: string;
  motherPhone?: string;
  guardianNid?: string;
  
  // Academic Info
  class: string;
  section?: string;
  roll: string;
  admissionDate: string;
  previousSchool?: string;
  
  // Address
  presentAddress: string;
  permanentAddress: string;
}

export interface FeeInvoice {
  id?: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  class: string;
  title: string;
  amount: number;
  paid: number;
  status: 'Paid' | 'Unpaid' | 'Partial';
  date: string;
  paymentMethod: string;
}

export interface LibraryBook {
  id?: string;
  title: string;
  author: string;
  isbn: string;
  publisher?: string;
  rackNo?: string;
  quantity: number;
  available: number;
}

export interface Transaction {
  id?: string;
  date: string;
  title: string;
  type: 'Income' | 'Expense';
  amount: number;
  description?: string;
}

export interface Notice {
  id?: string;
  title: string;
  date: string;
  content: string;
  postedBy: string;
}

export interface ChatMessage {
  id?: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: any;
}

export interface AuthUser {
  uid: string;
  email: string;
  name: string;
  role: string;
}

export interface MadrasaConfig {
  name: string;
  address: string;
  logo: string;
  banner: string;
  established: string;
}

// Menu Modules
export enum Module {
  DASHBOARD = 'Dashboard',
  STUDENT_ADMISSION = 'Student Admission',
  STUDENT_LIST = 'Student List',
  FEES_INVOICE = 'Fees Invoice',
  FEES_LIST = 'Fees History',
  ACADEMICS = 'Academics',
  LIBRARY = 'Library',
  TRANSPORT = 'Transport',
  HOSTEL = 'Hostel',
  COMMUNICATE = 'Communicate',
  DEVELOPER = 'Developer Info',
  SETTINGS = 'Settings'
}
