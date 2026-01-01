describe('Call Me Reminder E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the home page correctly', () => {
    cy.contains('Call Me Reminder').should('be.visible')
    cy.contains('Never miss important moments').should('be.visible')
    cy.contains('New Reminder').should('be.visible')
  })

  it('should open and close the create reminder dialog', () => {
    cy.contains('New Reminder').click()
    cy.contains('Create New Reminder').should('be.visible')

    cy.get('[aria-label="Close"]').click()
    cy.contains('Create New Reminder').should('not.exist')
  })

  it('should show validation errors for empty form', () => {
    cy.contains('New Reminder').click()

    cy.get('button[type="submit"]').click()

    cy.contains('Title is required').should('be.visible')
    cy.contains('Message is required').should('be.visible')
    cy.contains('Date and time are required').should('be.visible')
  })

  it('should show validation error for invalid phone number', () => {
    cy.contains('New Reminder').click()

    cy.get('input[id="phoneNumber"]').type('1234567890')
    cy.get('button[type="submit"]').click()

    cy.contains('Phone number must be in E.164 format').should('be.visible')
  })

  it('should create a new reminder successfully', () => {
    cy.intercept('POST', '**/reminders', {
      statusCode: 201,
      body: {
        id: 'test-123',
        title: 'Test Reminder',
        message: 'This is a test reminder',
        phoneNumber: '+14155552671',
        scheduledFor: new Date(Date.now() + 3600000).toISOString(),
        timezone: 'America/New_York',
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }).as('createReminder')

    cy.intercept('GET', '**/reminders', {
      statusCode: 200,
      body: [],
    }).as('getReminders')

    cy.contains('New Reminder').click()

    cy.get('input[id="title"]').type('Test Reminder')
    cy.get('textarea[id="message"]').type('This is a test reminder')
    cy.get('input[id="phoneNumber"]').type('+14155552671')

    const futureDate = new Date(Date.now() + 3600000)
    const dateString = futureDate.toISOString().slice(0, 16)
    cy.get('input[id="scheduledFor"]').type(dateString)

    cy.get('button[type="submit"]').click()

    cy.wait('@createReminder')
    cy.contains('Reminder created successfully').should('be.visible')
  })

  it('should display reminders in the dashboard', () => {
    const futureDate = new Date(Date.now() + 3600000).toISOString()

    cy.intercept('GET', '**/reminders', {
      statusCode: 200,
      body: [
        {
          id: '1',
          title: 'Morning Meeting',
          message: 'Don\'t forget the morning standup',
          phoneNumber: '+14155552671',
          scheduledFor: futureDate,
          timezone: 'America/New_York',
          status: 'scheduled',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Lunch Appointment',
          message: 'Meet John for lunch',
          phoneNumber: '+14155552672',
          scheduledFor: futureDate,
          timezone: 'America/Los_Angeles',
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }).as('getReminders')

    cy.visit('/')
    cy.wait('@getReminders')

    cy.contains('Morning Meeting').should('be.visible')
    cy.contains('Lunch Appointment').should('be.visible')
  })

  it('should filter reminders by status', () => {
    const futureDate = new Date(Date.now() + 3600000).toISOString()

    cy.intercept('GET', '**/reminders', {
      statusCode: 200,
      body: [
        {
          id: '1',
          title: 'Scheduled Reminder',
          message: 'Test',
          phoneNumber: '+14155552671',
          scheduledFor: futureDate,
          timezone: 'America/New_York',
          status: 'scheduled',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Completed Reminder',
          message: 'Test',
          phoneNumber: '+14155552672',
          scheduledFor: futureDate,
          timezone: 'America/New_York',
          status: 'completed',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }).as('getReminders')

    cy.visit('/')
    cy.wait('@getReminders')

    cy.contains('Scheduled Reminder').should('be.visible')
    cy.contains('Completed Reminder').should('be.visible')

    cy.contains('button', 'Scheduled').click()
    cy.contains('Scheduled Reminder').should('be.visible')
    cy.contains('Completed Reminder').should('not.exist')

    cy.contains('button', 'Completed').click()
    cy.contains('Completed Reminder').should('be.visible')
    cy.contains('Scheduled Reminder').should('not.exist')
  })

  it('should search reminders', () => {
    const futureDate = new Date(Date.now() + 3600000).toISOString()

    cy.intercept('GET', '**/reminders', {
      statusCode: 200,
      body: [
        {
          id: '1',
          title: 'Morning Meeting',
          message: 'Standup call',
          phoneNumber: '+14155552671',
          scheduledFor: futureDate,
          timezone: 'America/New_York',
          status: 'scheduled',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Lunch Appointment',
          message: 'Meet John',
          phoneNumber: '+14155552672',
          scheduledFor: futureDate,
          timezone: 'America/New_York',
          status: 'scheduled',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }).as('getReminders')

    cy.visit('/')
    cy.wait('@getReminders')

    cy.get('input[placeholder="Search reminders..."]').type('Morning')

    cy.contains('Morning Meeting').should('be.visible')
    cy.contains('Lunch Appointment').should('not.exist')
  })

  it('should delete a reminder', () => {
    const futureDate = new Date(Date.now() + 3600000).toISOString()

    cy.intercept('GET', '**/reminders', {
      statusCode: 200,
      body: [
        {
          id: '1',
          title: 'Test Reminder',
          message: 'Test message',
          phoneNumber: '+14155552671',
          scheduledFor: futureDate,
          timezone: 'America/New_York',
          status: 'scheduled',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    }).as('getReminders')

    cy.intercept('DELETE', '**/reminders/1', {
      statusCode: 204,
    }).as('deleteReminder')

    cy.visit('/')
    cy.wait('@getReminders')

    cy.contains('Test Reminder').should('be.visible')

    cy.get('button[aria-label="Delete"]').first().click()

    cy.on('window:confirm', () => true)
  })

  it('should toggle theme', () => {
    cy.get('button[aria-label="Toggle theme"]').should('be.visible').click()

    cy.contains('Light').should('be.visible')
    cy.contains('Dark').should('be.visible')
    cy.contains('System').should('be.visible')

    cy.contains('Dark').click()
    cy.get('html').should('have.class', 'dark')

    cy.get('button[aria-label="Toggle theme"]').click()
    cy.contains('Light').click()
    cy.get('html').should('not.have.class', 'dark')
  })

  it('should show empty state when no reminders', () => {
    cy.intercept('GET', '**/reminders', {
      statusCode: 200,
      body: [],
    }).as('getReminders')

    cy.visit('/')
    cy.wait('@getReminders')

    cy.contains('No reminders yet').should('be.visible')
    cy.contains('Get started by creating your first reminder').should('be.visible')
  })

  it('should show loading state', () => {
    cy.intercept('GET', '**/reminders', {
      statusCode: 200,
      body: [],
      delay: 1000,
    }).as('getReminders')

    cy.visit('/')

    cy.get('.animate-pulse').should('exist')
  })
})
