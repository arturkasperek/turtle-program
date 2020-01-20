/// <reference types="Cypress" />

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;

context('Speed control', () => {
  beforeEach(() => {
    cy.visit('http://localhost:1234')
  });

  it('cy.wait() - wait for a specific amount of time', () => {
    cy.get('#ACE_EDITOR')
      .type('drawLine(350);')
      .wait(1200);

    cy.get('#range').then(($range) => {
      // get the DOM node
      const range = $range[0];
      // set the value manually
      nativeInputValueSetter.call(range, 95);
      // now dispatch the event
      range.dispatchEvent(new Event('change', { value: 95, bubbles: true }));
    });

    cy.get('#runButton')
      .click();

    cy.get('.notification')
      .contains('Sketch is done!!!', { timeout: 1000 });
  });
});
