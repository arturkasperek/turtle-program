/// <reference types="Cypress" />

context('Run Basic Code', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1234')
  });

  it('cy.wait() - wait for a specific amount of time', () => {
    cy.get('#ACE_EDITOR')
      .type('drawLine(150);\nrotate(50);\ndrawLine(100);')
      .wait(1200);

    cy.get('#runButton')
      .click()
      .wait(20);

    cy.get('.notification')
      .contains('Sketching...')
      .wait(1000)
      .contains('Sketch is done!!!');
  });
});
