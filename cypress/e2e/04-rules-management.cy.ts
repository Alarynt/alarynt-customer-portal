describe('Rules Management', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/rules')
  })

  it('should display the rules management header and actions', () => {
    cy.contains('h1', 'Rules Management').should('be.visible')
    cy.contains('Create and manage your business rules').should('be.visible')
    cy.contains('button', 'Create Rule').should('be.visible')
  })

  it('should display search and filter controls', () => {
    cy.get('input[placeholder="Search rules..."]').should('be.visible')
    cy.get('select').should('contain', 'All Status')
    cy.get('option[value="active"]').should('exist')
    cy.get('option[value="inactive"]').should('exist') 
    cy.get('option[value="draft"]').should('exist')
  })

  it('should display the list of rules with correct information', () => {
    // Check that rules are displayed
    cy.contains('High Value Customer Alert').should('be.visible')
    cy.contains('Inventory Low Alert').should('be.visible')
    cy.contains('Payment Processing Rule').should('be.visible')

    // Check rule descriptions
    cy.contains('Send notification when customer order value exceeds threshold').should('be.visible')
    cy.contains('Alert when product inventory falls below minimum threshold').should('be.visible')
    cy.contains('Handle payment processing based on customer risk score').should('be.visible')

    // Check status badges
    cy.contains('.px-2.py-1', 'active').should('be.visible')
    cy.contains('.px-2.py-1', 'draft').should('be.visible')

    // Check metadata
    cy.contains('Priority: 1').should('be.visible')
    cy.contains('Executions: 45').should('be.visible')
    cy.contains('Success: 98.2%').should('be.visible')
  })

  it('should filter rules by search term', () => {
    // Search for specific rule
    cy.get('input[placeholder="Search rules..."]').type('High Value')
    
    // Should show only matching rule
    cy.contains('High Value Customer Alert').should('be.visible')
    cy.contains('Inventory Low Alert').should('not.exist')
    cy.contains('Payment Processing Rule').should('not.exist')

    // Clear search
    cy.get('input[placeholder="Search rules..."]').clear()
    cy.contains('Inventory Low Alert').should('be.visible')
  })

  it('should filter rules by status', () => {
    // Filter by active status
    cy.get('select').select('active')
    cy.contains('High Value Customer Alert').should('be.visible')
    cy.contains('Inventory Low Alert').should('be.visible')
    cy.contains('Payment Processing Rule').should('not.exist')

    // Filter by draft status
    cy.get('select').select('draft')
    cy.contains('Payment Processing Rule').should('be.visible')
    cy.contains('High Value Customer Alert').should('not.exist')

    // Reset to all
    cy.get('select').select('all')
    cy.contains('High Value Customer Alert').should('be.visible')
    cy.contains('Payment Processing Rule').should('be.visible')
  })

  it('should have functional action buttons for each rule', () => {
    // Find the first rule row and check action buttons
    cy.get('.border.border-gray-200.rounded-lg').first().within(() => {
      // Play/Pause button
      cy.get('button[title*="Deactivate"], button[title*="Activate"]').should('exist')
      
      // Edit button
      cy.get('button[title="Edit"]').should('exist')
      
      // View DSL button  
      cy.get('button[title="View DSL"]').should('exist')
      
      // Delete button
      cy.get('button[title="Delete"]').should('exist')
    })
  })

  it('should toggle DSL editor visibility', () => {
    // DSL editor should be closed initially
    cy.contains('Click the code icon to open the DSL editor').should('be.visible')
    cy.get('textarea[placeholder*="WHEN condition"]').should('not.exist')

    // Click to open DSL editor
    cy.get('.card').contains('DSL Editor').parent().within(() => {
      cy.get('button').click()
    })

    // DSL editor should be open
    cy.get('input[placeholder="Enter rule name"]').should('be.visible')
    cy.get('textarea[placeholder="Enter rule description"]').should('be.visible')
    cy.get('textarea[placeholder*="WHEN condition"]').should('be.visible')
    cy.contains('Click the code icon to open the DSL editor').should('not.exist')

    // Should have save and cancel buttons
    cy.contains('button', 'Create Rule').should('be.visible')
    cy.contains('button', 'Cancel').should('be.visible')
  })

  it('should navigate to create rule page', () => {
    cy.contains('button', 'Create Rule').first().click()
    cy.url().should('include', '/rules/create')
  })

  it('should open DSL editor when clicking code icon on a rule', () => {
    // Click the View DSL button on first rule
    cy.get('.border.border-gray-200.rounded-lg').first().within(() => {
      cy.get('button[title="View DSL"]').click()
    })

    // DSL editor should open
    cy.get('textarea[placeholder*="WHEN condition"]').should('be.visible')
  })

  it('should be able to edit DSL code', () => {
    // Open DSL editor
    cy.get('.card').contains('DSL Editor').parent().within(() => {
      cy.get('button').click()
    })

    // Type in DSL textarea
    cy.get('textarea[placeholder*="WHEN condition"]').type('WHEN test > 10{enter}THEN do_something()')
    cy.get('textarea[placeholder*="WHEN condition"]').should('contain.value', 'WHEN test > 10')
  })

  it('should cancel DSL editing', () => {
    // Open DSL editor
    cy.get('.card').contains('DSL Editor').parent().within(() => {
      cy.get('button').click()
    })

    // Type some content
    cy.get('input[placeholder="Enter rule name"]').type('Test Rule')
    
    // Click cancel
    cy.contains('button', 'Cancel').click()

    // Should close editor and reset
    cy.contains('Click the code icon to open the DSL editor').should('be.visible')
    cy.get('input[placeholder="Enter rule name"]').should('not.exist')
  })

  it('should display rule statistics correctly', () => {
    // Check that different types of statistics are shown
    cy.contains('Priority:').should('exist')
    cy.contains('Executions:').should('exist')  
    cy.contains('Success:').should('exist')
    cy.contains('Last:').should('exist')
  })

  it('should show different status colors', () => {
    // Active status should be green
    cy.get('.border.border-gray-200.rounded-lg').contains('active').should('have.class', 'text-green-600')
    
    // Draft status should have appropriate color
    cy.get('.border.border-gray-200.rounded-lg').contains('draft').should('exist')
  })

  it('should be responsive on mobile devices', () => {
    cy.viewport(375, 667)
    
    // Header should still be visible
    cy.contains('Rules Management').should('be.visible')
    
    // Grid should collapse to single column
    cy.get('.grid.grid-cols-1.lg\\:grid-cols-3').should('be.visible')
    
    // Rules should still be visible
    cy.contains('High Value Customer Alert').should('be.visible')
    
    // DSL editor should be accessible
    cy.contains('DSL Editor').should('be.visible')
  })

  it('should handle empty search results', () => {
    cy.get('input[placeholder="Search rules..."]').type('nonexistent rule')
    
    // Should show no rules
    cy.contains('High Value Customer Alert').should('not.exist')
    cy.contains('Inventory Low Alert').should('not.exist')
    cy.contains('Payment Processing Rule').should('not.exist')
  })
})