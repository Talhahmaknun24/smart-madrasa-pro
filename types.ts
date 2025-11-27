export interface Student {
  id: string;
  regNo: string;
  name: string;
  fatherName: string;
  class: string;
  roll: string;
  phone: string;
  address: string;
  dob: string;
}

export interface UserProfile {
  name: string;
  role: string;
  madrasaName: string;
  email: string;
  phone: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'Income' | 'Expense';
  category: string;
  amount: number;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export type Language = 'en' | 'bn';

export enum Page {
  DASHBOARD = 'DASHBOARD',
  STUDENTS = 'STUDENTS',
  TEACHERS = 'TEACHERS',
  ACCOUNTS = 'ACCOUNTS',
  RESULTS = 'RESULTS',
  NOTICE_GEN = 'NOTICE_GEN',
  QUESTION_GEN = 'QUESTION_GEN',
  LIBRARY = 'LIBRARY'
}
