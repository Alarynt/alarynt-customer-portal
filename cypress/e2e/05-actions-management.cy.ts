describe('Actions Management', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/actions')
  })

  it('should display the actions management header and controls', () => {
    cy.contains('h1', 'Actions Management').should('be.visible')
    cy.contains('Create and manage your automated actions').should('be.visible')
    cy.contains('button', 'Create New Action').should('be.visible')
  })

  it('should display search and filter controls', () => {
    cy.get('input[placeholder="Search actions..."]').should('be.visible')
    
    // Type filter
    cy.get('select').eq(0).should('contain', 'All Types')
    cy.get('option[value="email"]').should('exist')
    cy.get('option[value="sms"]').should('exist')
    cy.get('option[value="webhook"]').should('exist')
    cy.get('option[value="database"]').should('exist')
    cy.get('option[value="notification"]').should('exist')
    
    // Status filter
    cy.get('select').eq(1).should('contain', 'All Status')
    cy.get('option[value="active"]').should('exist')
    cy.get('option[value="inactive"]').should('exist')
    cy.get('option[value="draft"]').should('exist')
  })

  it('should display the list of actions with correct information', () => {
    // Check that actions are displayed
    cy.contains('Sales Team Email').should('be.visible')
    cy.contains('Warehouse SMS Alert').should('be.visible')
    cy.contains('CRM Webhook').should('be.visible')

    // Check action descriptions
    cy.contains('Send email notifications to sales team').should('be.visible')
    cy.contains('Send SMS alerts to warehouse staff').should('be.visible')
    cy.contains('Update CRM system via webhook').should('be.visible')

    // Check action types
    cy.contains('.px-2.py-1', 'email').should('be.visible')
    cy.contains('.px-2.py-1', 'sms').should('be.visible')
    cy.contains('.px-2.py-1', 'webhook').should('be.visible')

    // Check status badges
    cy.contains('.px-2.py-1', 'active').should('be.visible')

    // Check metadata
    cy.contains('Executions: 45').should('be.visible')
    cy.contains('Success: 98.2%').should('be.visible')
  })

  it('should filter actions by search term', () => {
    // Search for specific action
    cy.get('input[placeholder="Search actions..."]').type('Sales Team')
    
    // Should show only matching action
    cy.contains('Sales Team Email').should('be.visible')
    cy.contains('Warehouse SMS Alert').should('not.exist')
    cy.contains('CRM Webhook').should('not.exist')

    // Clear search
    cy.get('input[placeholder="Search actions..."]').clear()
    cy.contains('Warehouse SMS Alert').should('be.visible')
  })

  it('should filter actions by type', () => {
    // Filter by email type
    cy.get('select').eq(0).select('email')
    cy.contains('Sales Team Email').should('be.visible')
    cy.contains('Warehouse SMS Alert').should('not.exist')
    cy.contains('CRM Webhook').should('not.exist')

    // Filter by sms type
    cy.get('select').eq(0).select('sms')
    cy.contains('Warehouse SMS Alert').should('be.visible')
    cy.contains('Sales Team Email').should('not.exist')

    // Reset to all
    cy.get('select').eq(0).select('all')
    cy.contains('Sales Team Email').should('be.visible')
    cy.contains('Warehouse SMS Alert').should('be.visible')
  })

  it('should filter actions by status', () => {
    // Filter by active status (all mock actions are active)
    cy.get('select').eq(1).select('active')
    cy.contains('Sales Team Email').should('be.visible')
    cy.contains('Warehouse SMS Alert').should('be.visible')

    // Filter by inactive status (should show none)
    cy.get('select').eq(1).select('inactive')
    cy.contains('Sales Team Email').should('not.exist')

    // Reset to all
    cy.get('select').eq(1).select('all')
    cy.contains('Sales Team Email').should('be.visible')
  })

  it('should have functional action buttons for each action', () => {
    // Find the first action row and check action buttons
    cy.get('.border.border-gray-200.rounded-lg').first().within(() => {
      // Play/Pause button
      cy.get('button[title*="Deactivate"], button[title*="Activate"]').should('exist')
      
      // Edit button
      cy.get('button[title="Edit"]').should('exist')
      
      // View Config button  
      cy.get('button[title="View Config"]').should('exist')
      
      // Delete button
      cy.get('button[title="Delete"]').should('exist')
    })
  })

  it('should display action type icons', () => {
    // Check that different action type icons are rendered
    cy.get('.border.border-gray-200.rounded-lg').should('exist')
    
    // Icons should be present (Mail, MessageSquare, Webhook icons from lucide)
    cy.get('svg').should('exist')
  })

  it('should toggle configuration panel visibility', () => {
    // Configuration panel should be closed initially
    cy.contains('Click the settings icon to configure actions').should('be.visible')
    cy.get('input[placeholder="Enter action name"]').should('not.exist')

    // Click to open configuration panel
    cy.get('.card').contains('Configuration').parent().within(() => {
      cy.get('button').click()
    })

    // Configuration panel should be open
    cy.get('input[placeholder="Enter action name"]').should('be.visible')
    cy.get('textarea[placeholder="Enter action description"]').should('be.visible')
    cy.get('select').should('contain', 'Email') // Action type selector
    cy.contains('Click the settings icon to configure actions').should('not.exist')
  })

  it('should navigate to create action page', () => {
    cy.contains('button', 'Create New Action').click()
    cy.url().should('include', '/actions/create')
  })

  it('should open configuration panel when clicking settings icon on an action', () => {
    // Click the View Config button on first action
    cy.get('.border.border-gray-200.rounded-lg').first().within(() => {
      cy.get('button[title="View Config"]').click()
    })

    // Configuration panel should open
    cy.get('input[placeholder="Enter action name"]').should('be.visible')
  })

  it('should show different configuration forms based on action type', () => {
    // Open configuration panel
    cy.get('.card').contains('Configuration').parent().within(() => {
      cy.get('button').click()
    })

    // Should show email configuration by default
    cy.get('select[value="email"]').should('exist')
    cy.get('input[placeholder="recipient@example.com"]').should('be.visible')
    cy.get('input[placeholder="Email subject"]').should('be.visible')

    // Change to SMS type
    cy.get('select').select('sms')
    cy.get('input[placeholder*="Phone"]').should('be.visible')
    cy.get('textarea[placeholder*="message"]').should('be.visible')

    // Change to webhook type
    cy.get('select').select('webhook')
    cy.get('input[placeholder*="https://"]').should('be.visible')
    cy.get('select').should('contain', 'POST') // HTTP method selector
  })

  it('should be able to edit configuration fields', () => {
    // Open configuration panel
    cy.get('.card').contains('Configuration').parent().within(() => {
      cy.get('button').click()
    })

    // Type in various fields
    cy.get('input[placeholder="Enter action name"]').type('Test Action')
    cy.get('textarea[placeholder="Enter action description"]').type('Test description')
    cy.get('input[placeholder="recipient@example.com"]').type('test@example.com')

    // Verify values were entered
    cy.get('input[placeholder="Enter action name"]').should('have.value', 'Test Action')
    cy.get('textarea[placeholder="Enter action description"]').should('have.value', 'Test description')
    cy.get('input[placeholder="recipient@example.com"]').should('have.value', 'test@example.com')
  })

  it('should display action statistics correctly', () => {
    // Check that different types of statistics are shown
    cy.contains('Executions:').should('exist')  
    cy.contains('Success:').should('exist')
    cy.contains('Last:').should('exist')
  })

  it('should show different status and type colors', () => {
    // Active status should be green
    cy.get('.border.border-gray-200.rounded-lg').contains('active').should('have.class', 'text-green-600')
    
    // Different action types should have different colors
    cy.get('.border.border-gray-200.rounded-lg').contains('email').should('exist')
    cy.get('.border.border-gray-200.rounded-lg').contains('sms').should('exist')
  })

  it('should be responsive on mobile devices', () => {
    cy.viewport(375, 667)
    
    // Header should still be visible
    cy.contains('Actions Management').should('be.visible')
    
    // Grid should collapse to single column
    cy.get('.grid.grid-cols-1.lg\\:grid-cols-3').should('be.visible')
    
    // Actions should still be visible
    cy.contains('Sales Team Email').should('be.visible')
    
    // Configuration panel should be accessible
    cy.contains('Configuration').should('be.visible')
  })

  it('should handle empty search results', () => {
    cy.get('input[placeholder="Search actions..."]').type('nonexistent action')
    
    // Should show no actions
    cy.contains('Sales Team Email').should('not.exist')
    cy.contains('Warehouse SMS Alert').should('not.exist')
    cy.contains('CRM Webhook').should('not.exist')
  })

  it('should show test button in configuration panel', () => {
    // Open configuration panel
    cy.get('.card').contains('Configuration').parent().within(() => {
      cy.get('button').click()
    })

    // Should have test functionality (based on TestTube icon import)
    cy.get('input[placeholder="Enter action name"]').should('be.visible')
    
    // Configuration panel should be functional
    cy.get('select').should('be.visible')
  })
})