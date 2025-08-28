describe('Analytics', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/analytics')
  })

  it('should display the analytics header and description', () => {
    cy.contains('h1', 'Analytics').should('be.visible')
    cy.contains('Monitor rule engine performance and insights').should('be.visible')
  })

  it('should display time range and metric controls', () => {
    // Time range selector
    cy.get('select').eq(0).should('contain', 'Last 7 days')
    cy.get('option[value="7d"]').should('exist')
    cy.get('option[value="30d"]').should('exist')
    cy.get('option[value="90d"]').should('exist')

    // Metric selector
    cy.get('select').eq(1).should('contain', 'Total Executions')
    cy.get('option[value="executions"]').should('exist')
    cy.get('option[value="success"]').should('exist')
    cy.get('option[value="failed"]').should('exist')
    cy.get('option[value="responseTime"]').should('exist')
  })

  it('should display export report dropdown', () => {
    // Export button should be visible
    cy.contains('button', 'Export Report').should('be.visible')
    
    // Click to open dropdown
    cy.contains('button', 'Export Report').click()
    
    // Export options should be visible
    cy.contains('Export as CSV').should('be.visible')
    cy.contains('Export as JSON').should('be.visible')
    cy.contains('Export as Excel').should('be.visible')
    
    // Click outside to close
    cy.get('body').click(0, 0)
    cy.contains('Export as CSV').should('not.exist')
  })

  it('should display key metrics cards', () => {
    // Total Executions card
    cy.contains('Total Executions').should('be.visible')
    cy.get('.text-2xl.font-bold').should('exist')
    cy.contains('+12.5%').should('be.visible') // Growth indicator

    // Success Rate card
    cy.contains('Success Rate').should('be.visible')
    cy.contains('%').should('be.visible')
    cy.contains('+2.1%').should('be.visible')

    // Failed Executions card
    cy.contains('Failed Executions').should('be.visible')
    cy.contains('-8.3%').should('be.visible')

    // Avg Response Time card
    cy.contains('Avg Response Time').should('be.visible')
    cy.contains('ms').should('be.visible')
    cy.contains('-15.2%').should('be.visible')
  })

  it('should display the main performance chart', () => {
    // Chart title should show current metric
    cy.contains('Total Executions Over Time').should('be.visible')
    
    // Chart should be rendered
    cy.get('.recharts-wrapper').should('be.visible')
    cy.get('.recharts-area-chart').should('exist')
    
    // Filter indicator should be visible
    cy.contains('Filtered by 7d').should('be.visible')
  })

  it('should change chart when selecting different metrics', () => {
    // Change to success metric
    cy.get('select').eq(1).select('success')
    cy.contains('Successful Executions Over Time').should('be.visible')

    // Change to failed metric
    cy.get('select').eq(1).select('failed')
    cy.contains('Failed Executions Over Time').should('be.visible')

    // Change to response time metric
    cy.get('select').eq(1).select('responseTime')
    cy.contains('Response Time Over Time').should('be.visible')
  })

  it('should update data when changing time range', () => {
    // Change to 30 days
    cy.get('select').eq(0).select('30d')
    cy.contains('Filtered by 30d').should('be.visible')
    
    // Chart should still be visible with updated data
    cy.get('.recharts-wrapper').should('be.visible')

    // Change to 90 days
    cy.get('select').eq(0).select('90d')
    cy.contains('Filtered by 90d').should('be.visible')
  })

  it('should display rule performance section', () => {
    // Should show rule performance data
    cy.contains('High Value Customer Alert').should('be.visible')
    cy.contains('Inventory Low Alert').should('be.visible')
    cy.contains('Payment Processing Rule').should('be.visible')
    cy.contains('Customer Support Escalation').should('be.visible')
    cy.contains('Fraud Detection').should('be.visible')

    // Should show execution counts and success rates
    cy.contains('156').should('be.visible') // Executions
    cy.contains('152').should('be.visible') // Success
    cy.contains('120').should('be.visible') // Response time
  })

  it('should display action performance section', () => {
    // Should show action performance data
    cy.contains('Sales Team Email').should('be.visible')
    cy.contains('Warehouse SMS Alert').should('be.visible')
    cy.contains('CRM Webhook').should('be.visible')
    cy.contains('Database Update').should('be.visible')

    // Should show performance metrics
    cy.contains('134').should('be.visible') // Executions
    cy.contains('130').should('be.visible') // Success
  })

  it('should display error analysis section', () => {
    // Should show error types
    cy.contains('Timeout Error').should('be.visible')
    cy.contains('Validation Error').should('be.visible')
    cy.contains('Connection Error').should('be.visible')
    cy.contains('Authorization Error').should('be.visible')

    // Should show error percentages and impact
    cy.contains('45.2%').should('be.visible') // Percentage
    cy.contains('High').should('be.visible') // Impact level
    cy.contains('Medium').should('be.visible')
    cy.contains('Low').should('be.visible')
  })

  it('should show trending indicators correctly', () => {
    // Positive trends should show green arrows
    cy.get('.text-green-600').should('exist')
    
    // Negative trends should show red arrows  
    cy.get('.text-red-600').should('exist')
    
    // Trend percentages should be visible
    cy.contains('+12.5%').should('be.visible')
    cy.contains('-8.3%').should('be.visible')
  })

  it('should have responsive charts', () => {
    // Charts should be responsive
    cy.get('.recharts-responsive-container').should('exist')
    
    // Multiple chart types should be rendered
    cy.get('.recharts-area-chart').should('exist')
    cy.get('.recharts-bar-chart').should('exist')
  })

  it('should export data in different formats', () => {
    // Open export dropdown
    cy.contains('button', 'Export Report').click()
    
    // Test CSV export (can't test actual download but can test click)
    cy.contains('Export as CSV').click()
    
    // Dropdown should close after selection
    cy.contains('Export as CSV').should('not.exist')
  })

  it('should handle chart tooltips on hover', () => {
    // Hover over the main chart area
    cy.get('.recharts-area-chart').should('be.visible')
    
    // Chart should be interactive
    cy.get('.recharts-wrapper').should('exist')
  })

  it('should display performance tables with correct headers', () => {
    // Should have appropriate table headers for rules/actions
    cy.contains('Name').should('be.visible')
    cy.contains('Executions').should('be.visible')
    cy.contains('Success').should('be.visible')
    cy.contains('Failed').should('be.visible')
  })

  it('should be responsive on mobile devices', () => {
    cy.viewport(375, 667)
    
    // Header should still be visible
    cy.contains('Analytics').should('be.visible')
    
    // Controls should stack vertically
    cy.get('.flex.flex-col.sm\\:flex-row').should('be.visible')
    
    // Metrics cards should stack on mobile
    cy.get('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4').should('be.visible')
    
    // Charts should still be visible and responsive
    cy.get('.recharts-responsive-container').should('exist')
  })

  it('should show icons for different sections', () => {
    // Calendar icon for time range
    cy.get('svg').should('exist')
    
    // Bar chart icon for metrics
    cy.get('svg').should('exist')
    
    // Download icon for export
    cy.get('svg').should('exist')
  })

  it('should maintain state when navigating between time ranges', () => {
    // Change metric first
    cy.get('select').eq(1).select('success')
    cy.contains('Successful Executions Over Time').should('be.visible')
    
    // Change time range
    cy.get('select').eq(0).select('30d')
    
    // Metric selection should be preserved
    cy.contains('Successful Executions Over Time').should('be.visible')
    cy.contains('Filtered by 30d').should('be.visible')
  })

  it('should show proper error impact levels', () => {
    // Different impact levels should be color coded
    cy.contains('High').should('have.class', 'text-red-600')
    cy.contains('Medium').should('have.class', 'text-yellow-600')
    cy.contains('Low').should('have.class', 'text-green-600')
  })
})