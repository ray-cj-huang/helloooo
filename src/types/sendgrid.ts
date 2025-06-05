export interface SendGridMessage {
  id: string;
  from: {
    email: string;
    name?: string;
  };
  subject: string;
  text?: string;
  date: string;
  read?: boolean;
  labels?: string[];
}

export interface SendGridResponse {
  body: {
    messages?: SendGridMessage[];
  };
} 