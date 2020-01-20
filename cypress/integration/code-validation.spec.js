/// <reference types="Cypress" />

context('Code Validation', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1234')
  });

  it('cy.wait() - wait for a specific amount of time', () => {
    cy.get('#ACE_EDITOR')
      .type('other{}')
      .wait(1200);

    cy.get('.error')
      .contains('Line 1: Unexpected token {');
  });
});
