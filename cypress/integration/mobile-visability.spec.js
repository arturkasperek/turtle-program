/// <reference types="Cypress" />

import { createVariableDeclaration, resolveModuleName } from 'typescript';

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

context('Visability for mobile', () => {
  beforeEach(() => {
    cy.viewport('samsung-s10');
    cy.visit('http://localhost:1234');
  });

  it('slide test', () => {
    cy.get('#drawer-container').should('not.be.visible');
    cy.get('#rightPanel').should('be.visible');

    cy.get('#textEditor')
      .trigger('touchstart', { touches: [{ clientX: 1, clientY: 0 }] })
      .trigger('touchmove', { touches: [{ clientX: 200, clientY: 0 }] })
      .trigger('touchend');

    cy.get('#drawer-container').should('be.visible');
    cy.get('#rightPanel').should('not.be.visible');
  });
});
