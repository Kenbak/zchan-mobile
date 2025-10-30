// Message Types

export interface Message {
  id: string; // transaction ID
  channelId: string;
  channelAddress: string;
  content: string; // decoded memo
  author: string; // 'Anonymous' or partial z-address
  amount: number; // in zatoshis
  timestamp: number;
  blockHeight?: number;
  confirmations: number;
  txid: string;
}

export interface MessageDraft {
  channelId: string;
  content: string;
  estimatedFee: number;
}

export interface MessageState {
  messages: Record<string, Message[]>; // channelId -> messages
  isLoading: boolean;
  lastSynced: Record<string, number>; // channelId -> timestamp
  error: string | null;
}
