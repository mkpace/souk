const MOCK_EMAIL_TEMPLATE = {
  name: 'forgot-password',
  from: 'noreply@souk.com',
  type: 'html',
};

const UPDATED_MOCK_EMAIL_TEMPLATE = {
  name: 'forgot-password-new',
};

const MOCK_EMAIL1 = {
  subject: 'Forgot Password',
  template_name: 'forgot-password',
  recipients: ['user@souk.com'],
  tokens: {
    name: 'Joel Genes',
    url: 'http://www.souk.com/forgot-password',
  },
};

const MOCK_EMAIL2 = {
  subject: 'Forgot Password',
  template_name: 'forgot-password',
  sender_email: 'noreply@gmail.com',
  userFilter: {
    email: 'user@souk.com',
  },
  tokens: {
    url: 'http://www.souk.com/forgot-password',
  },
  tokenQuery: {
    model: 'User',
    query: {
      email: 'user@souk.com',
    },
    fields: {
      name: 'first_name',
    },
  },
};

const MOCK_EMAIL3 = {
  subject: 'Custom Email',
  content: 'This is custom email.',
  sender_email: 'info@souk.com',
  recipients: ['user@souk.com'],
};

module.exports = {
  MOCK_EMAIL1,
  MOCK_EMAIL2,
  MOCK_EMAIL3,
  MOCK_EMAIL_TEMPLATE,
  UPDATED_MOCK_EMAIL_TEMPLATE,
};
