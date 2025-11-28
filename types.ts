
export interface Student {
  id: string;
  regNo: string;
  name: string;
  fatherName: string;
  motherName: string;
  class: string;
  roll: string;
  phone: string;
  address: string;
  dob: string;
  bloodGroup: string;
  birthRegNo: string;
  photo?: string;
  admissionDate: string;
  gender: 'Male' | 'Female';
  religion: string;
  category: string;
}

export interface MadrasaConfig {
  name: string;
  address: string;
  logo: string;
  banner: string;
  established: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
}

export interface UserProfile {
  name: string;
  role: string;
  madrasaName: string;
  email: string;
  phone: string;
  address: string;
  established: string;
}

export interface AuthUser {
  email: string;
  name: string;
  isVerified: boolean;
  loginTime: string;
}

export interface LoginLog {
  id: string;
  email: string;
  timestamp: string;
  device: string;
}

export interface Transaction {
  id: string;
  date: string;
  title: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  description: string;
  paymentMethod: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'contact';
  text: string;
  timestamp: Date;
  senderName?: string;
}

export interface ChatContact {
  id: string;
  name: string;
  role: string; // Student, Staff, Admin
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  lastMessage: string;
  unreadCount: number;
}

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  inTime: string;
  outTime: string;
  date: string;
}

export interface FeeRecord {
  id: string;
  studentName: string;
  regNo: string;
  amount: number;
  type: string;
  status: 'Paid' | 'Due';
  date: string;
  invoiceNo: string;
  paymentMethod: string;
}

export interface LibraryBook {
  id: string;
  title: string;
  author: string;
  isbn: string;
  status: 'Available' | 'Issued';
  rackNo: string;
}

export interface Staff {
  id: string;
  name: string;
  designation: string;
  phone: string;
  email: string;
  joiningDate: string;
  salary: number;
  photo?: string;
}

export interface ExamResult {
  id: string;
  examName: string;
  studentName: string;
  regNo: string;
  subject: string;
  marks: number;
  grade: string;
}

export interface Notice {
  id: string;
  title: string;
  date: string;
  content: string;
  audience: 'All' | 'Student' | 'Staff';
}

export interface TransportRoute {
  id: string;
  routeName: string;
  vehicleNumber: string;
  driverName: string;
  fare: number;
}

export interface HostelRoom {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  costPerBed: number;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'Theory' | 'Practical';
}

export interface TimeTable {
  id: string;
  day: string;
  class: string;
  subject: string;
  teacher: string;
  startTime: string;
  endTime: string;
}

export type Language = 'en' | 'bn';

// Main Categories
export enum Module {
  DASHBOARD = 'Dashboard',
  GALLERY = 'Gallery',
  FRONT_OFFICE = 'Front Office',
  STUDENT_INFO = 'Student Information',
  FEES_COLLECTION = 'Fees Collection',
  INCOME = 'Income',
  EXPENSES = 'Expenses',
  EXAMINATIONS = 'Examinations',
  ACADEMICS = 'Academics',
  HUMAN_RESOURCE = 'Human Resource',
  COMMUNICATE = 'Communicate',
  CERTIFICATE = 'Certificate',
  LIBRARY = 'Library',
  TRANSPORT = 'Transport',
  HOSTEL = 'Hostel',
  DEVELOPER_INFO = 'Developer Info'
}

export interface MenuItem {
  id: string;
  label: string;
  module: Module;
  icon?: any; // Lucide Icon
  subItems?: { id: string; label: string }[];
}
