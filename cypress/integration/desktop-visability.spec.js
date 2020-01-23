/// <reference types="Cypress" />

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

context('Visability for desktop', () => {
  beforeEach(() => {
    cy.viewport('macbook-11');
    cy.visit('http://localhost:1234');
  });

  it('cy.wait() - wait for a specific amount of time', () => {
    cy.get('#drawer-container').should('be.visible');
    cy.get('#rightPanel').should('be.visible');
    cy.get('#back-button').should('not.be.visible');
  });
});
