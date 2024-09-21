import { Timestamp } from 'firebase/firestore';

export interface Transaction {
  id: string;
  amount: number;
  date: Timestamp;
}