import { PrismaClient, EmailStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clean up existing data
  await prisma.email.deleteMany()

  // Create sample emails with different statuses
  const emails = await Promise.all([
    // Inbox emails
    prisma.email.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Meeting Tomorrow',
        text: 'Hi, let\'s discuss the project tomorrow at 10 AM.',
        status: EmailStatus.INBOX,
        read: false,
        labels: ['work', 'meeting'],
      },
    }),
    prisma.email.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        subject: 'Project Update',
        text: 'Here\'s the latest update on our project progress.',
        status: EmailStatus.INBOX,
        read: true,
        labels: ['work', 'update'],
      },
    }),

    // Draft email
    prisma.email.create({
      data: {
        name: 'Me',
        email: 'me@example.com',
        subject: 'Draft: Team Meeting Notes',
        text: 'Dear team,\n\nHere are the notes from our last meeting...',
        status: EmailStatus.DRAFT,
        read: false,
        labels: ['draft'],
      },
    }),

    // Sent email
    prisma.email.create({
      data: {
        name: 'Me',
        email: 'me@example.com',
        subject: 'Sent: Project Proposal',
        text: 'Hi team,\n\nI\'ve attached the project proposal...',
        status: EmailStatus.SENT,
        read: true,
        labels: ['sent', 'work'],
      },
    }),

    // Archived email
    prisma.email.create({
      data: {
        name: 'Alice Brown',
        email: 'alice@example.com',
        subject: 'Old Project Details',
        text: 'Here are the details from our previous project.',
        status: EmailStatus.ARCHIVE,
        read: true,
        labels: ['archive', 'work'],
      },
    }),

    // Junk email
    prisma.email.create({
      data: {
        name: 'Spam Sender',
        email: 'spam@example.com',
        subject: 'You\'ve Won a Prize!',
        text: 'Congratulations! You\'ve won a million dollars!',
        status: EmailStatus.JUNK,
        read: false,
        labels: ['spam'],
      },
    }),

    // Trash email
    prisma.email.create({
      data: {
        name: 'Old Contact',
        email: 'old@example.com',
        subject: 'Deleted Message',
        text: 'This is a message that was deleted.',
        status: EmailStatus.TRASH,
        read: true,
        labels: ['deleted'],
      },
    }),
  ])

  console.log('Created emails:', emails)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  }) 