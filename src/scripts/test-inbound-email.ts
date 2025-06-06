import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import superjson from 'superjson';
import type { AppRouter } from '@/server/api/root';

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/api/trpc',
      transformer: superjson,
    }),
  ],
});

const testEmails = [
  {
    category: 'APPOINTMENT_BOOKING',
    from: 'Sarah Johnson <sarah@example.com>',
    subject: 'Schedule Oil Change Appointment',
    text: 'Hi, I would like to schedule an oil change for my Toyota Camry. I prefer next Tuesday afternoon if possible. The car has about 5,000 miles since the last service. Thank you!',
  },
  {
    category: 'APPOINTMENT_CANCELLATION',
    from: 'Mike Wilson <mike@example.com>',
    subject: 'Need to Cancel Tomorrow\'s Service',
    text: 'Unfortunately, I need to cancel my scheduled service appointment for tomorrow at 2 PM. My car is currently in the shop for unexpected repairs. I\'ll reschedule once it\'s fixed. Sorry for the inconvenience.',
  },
  {
    category: 'VEHICLE_STATUS',
    from: 'David Brown <david@example.com>',
    subject: 'Checking Status of My Vehicle Repair',
    text: 'Hello, I dropped off my Honda Civic (VIN: 1HGCM82633A123456) last week for brake repairs. Could you please let me know the current status of the work? Thank you.',
  },
  {
    category: 'VEHICLE_INVENTORY',
    from: 'Lisa Chen <lisa@example.com>',
    subject: 'Looking for 2024 Toyota RAV4',
    text: 'I\'m interested in purchasing a 2024 Toyota RAV4. Do you have any available in white or silver? I\'m specifically looking for the XLE trim with the premium package. Please let me know what\'s in stock.',
  },
  {
    category: 'VEHICLE_SERVICE',
    from: 'Robert Taylor <robert@example.com>',
    subject: 'Service Request for Check Engine Light',
    text: 'My 2020 Ford F-150 (VIN: 1FTEW1EG0LFA12345) has the check engine light on. The truck is running rough and making a strange noise. I\'d like to schedule a diagnostic service as soon as possible.',
  },
  {
    category: 'OTHER',
    from: 'Emily Davis <emily@example.com>',
    subject: 'General Inquiry About Business Hours',
    text: 'Hello, I was wondering what your service department hours are on weekends? Also, do you offer any special discounts for first-time customers? Thank you for your help.',
  },
];

async function testInboundEmail() {
  for (const testEmail of testEmails) {
    try {
      console.log(`\nTesting ${testEmail.category} email...`);
      const result = await trpc.email.inboundEmail.mutate({
        from: testEmail.from,
        to: 'service@example.com',
        subject: testEmail.subject,
        text: testEmail.text,
        html: `<p>${testEmail.text}</p>`,
        attachments: 0,
        charsets: JSON.stringify({
          to: 'UTF-8',
          from: 'UTF-8',
          subject: 'UTF-8',
          text: 'UTF-8',
        }),
        envelope: JSON.stringify({
          to: ['service@example.com'],
          from: testEmail.from,
        }),
        attachments_info: '[]',
        headers: JSON.stringify({
          Received: 'by mx.sendgrid.net',
          Date: 'Wed, 13 Mar 2024 12:00:00 +0000',
        }),
        dkim: 'pass',
        SPF: 'pass',
        spam_score: '0.0',
        spam_report: '',
      });

      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

void testInboundEmail(); 