export const emailTemplates = [
  {
    id: 1,
    name: 'Welcome Email',
    subject: 'Welcome to {{company_name}}!',
    body: `Hi {{customer_name}},

Thank you for your interest in our services. We're excited to work with you!

Here's what you can expect:
- Personalized service from our team
- Regular updates on your projects
- 24/7 support when you need it

If you have any questions, feel free to reach out.

Best regards,
{{sender_name}}
{{company_name}}`
  },
  {
    id: 2,
    name: 'Follow-up Email',
    subject: 'Following up on our conversation',
    body: `Hi {{customer_name}},

I wanted to follow up on our recent conversation about {{topic}}.

Do you have any questions or would you like to schedule a call to discuss further?

Looking forward to hearing from you.

Best regards,
{{sender_name}}`
  },
  {
    id: 3,
    name: 'Proposal Email',
    subject: 'Proposal for {{project_name}}',
    body: `Hi {{customer_name}},

As discussed, please find attached our proposal for {{project_name}}.

The proposal includes:
- Detailed project scope
- Timeline and milestones
- Investment breakdown

Please review and let us know if you have any questions.

Best regards,
{{sender_name}}`
  }
];