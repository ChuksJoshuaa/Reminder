declare global {
  namespace Cypress {
    interface Chainable {
      getBySel(dataTestAttribute: string): Chainable<JQuery<HTMLElement>>
    }
  }
}

Cypress.Commands.add('getBySel', (selector: string) => {
  return cy.get(`[data-test="${selector}"]`)
})

export {}
