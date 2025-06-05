'use server'

import { sendEmail } from '@/lib/sendgrid'

export async function sendEmailAction(to: string, subject: string, text: string) {
  try {
    const success = await sendEmail(to, subject, text)
    if (!success) {
      throw new Error('Failed to send email')
    }
    return { success: true }
  } catch (error) {
    console.error('Error in sendEmailAction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send email'
    }
  }
} 