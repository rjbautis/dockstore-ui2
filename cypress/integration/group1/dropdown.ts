/*
 *    Copyright 2018 OICR
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
import { setTokenUserViewPortCurator } from '../../support/commands';

describe('Dropdown test', () => {
  // TODO: GitLab tests are commented out
  setTokenUserViewPortCurator();

  beforeEach(() => {
    cy
      .server()
      .route({
        method: 'GET',
        url: /extended/,
        response: { 'canChangeUsername': true }
      });

    cy.visit('');

    // Select dropdown
    cy
      .get('#dropdown-main')
      .click();
  });

  describe('Go to starred page', () => {
    beforeEach(() => {
      // Select dropdown tokens
      cy
        .get('#dropdown-starred')
        .click();
    });

    it('Should have nothing starred', () => {
      cy
        .get('#starCountButton')
        .should('not.be.visible');
      cy
        .get('#starringButton')
        .should('not.be.visible');
    });
  });

  describe('Go to accounts page', () => {
    beforeEach(() => {
      // Select dropdown accounts
      cy
        .get('#dropdown-accounts')
        .click();
    });

    it('Should show all accounts as linked (except GitLab and Bitbucket)', () => {
      everythingOk();
    });
  });

  describe('Go to requests page', ()  => {

    beforeEach(() => {
      // Pending orgs starts with two
      const pendingOrganizations = [
        { id: 1000, name: 'OrgOne', status: 'PENDING' },
        { id: 1001, name: 'OrgTwo', status: 'PENDING' }
      ];

      cy
        .server()
        .route({
          method: 'GET',
          url: '/organizations/all?type=pending',
          response: pendingOrganizations
        });

      // Logged in user has two memberships, one is not accepted
      const memberships = [
        {id: 1, role: 'MAINTAINER', accepted: false, organization: { id: 1000, status: 'PENDING', name: 'orgOne'}},
        {id: 2, role: 'MAINTAINER', accepted: true, organization: { id: 1001, status: 'PENDING', name: 'orgTwo'}}
      ];
      cy
        .server()
        .route({
          method: 'GET',
          url: '/users/user/memberships',
          response: memberships
      });
      // Choose dropdown
      cy
        .get('#dropdown-accounts')
        .click();
      cy.contains('Requests').click();
    });

    it('Should have two pending orgs', () => {
      // Endpoint should return only one pending organization after approval
      const pendingOrganizations = [{ id: 1001, name: 'OrgTwo', status: 'PENDING' }];
      cy
        .server()
        .route({
          method: 'GET',
          url: '/organizations/all?type=pending',
          response: pendingOrganizations
        });

      // Stub approve response
      cy
      .server()
      .route({
        method: 'POST',
        url: '/organizations/1000/approve',
        response: []
      });

      // Ensure that there are two orgs
      cy.get('#pending-org-card-0').should('be.visible');
      cy.get('#pending-org-card-1').should('be.visible');

      // Accept first org
      cy.get('#reject-pending-org-0').should('be.visible');
      cy.get('#approve-pending-org-0').should('be.visible').click();
      cy.get('#approve-pending-org-dialog').should('be.visible').click();

      // Ensure that only one org exists now
      cy.get('#pending-org-card-0').should('be.visible');
      cy.get('#pending-org-card-1').should('not.be.visible');
    });

    it('Should have a pending invite', () => {
      // Stub the accept invite response
      cy
        .server()
        .route({
          method: 'POST',
          url: '/organizations/1000/invitation?accept=true',
          response: []
      });

      // Membership should have two accepted entries
      const memberships = [
        { id: 1, role: 'MAINTAINER', accepted: true, organization: { id: 1000, status: 'PENDING',  name: 'orgOne' }},
        { id: 2, role: 'MAINTAINER', accepted: true, organization: { id: 1001, status: 'PENDING', name: 'orgTwo' }}
      ];
      cy
        .server()
        .route({
          method: 'GET',
          url: '/users/user/memberships',
          response: memberships
      });

      // One invite should be visible
      cy.get('#my-org-invites-card-0').should('be.visible');

      // Accept org invite
      cy.get('#reject-invite-org-0').should('be.visible');
      cy.get('#accept-invite-org-0').should('be.visible').click();
      cy.get('#accept-pending-org-dialog').should('be.visible').click();

      // Should have two orgs in pending list
      cy.get('#my-pending-org-card-0').should('be.visible');
      cy.get('#my-pending-org-card-1').should('be.visible');
    });

    it('Should have a pending org request', () => {
     // One pending org request should be visible
     cy.get('#my-pending-org-card-0').should('be.visible');
    });


  });

  describe('Go to enabled Dockstore Account Controls', () => {
    beforeEach(() => {
      // Select dropdown accounts
      cy
        .server()
        .route({
          method: 'DELETE',
          url: '/users/user',
          response: 'true'
        });
      cy
        .get('#dropdown-accounts')
        .click();
      cy.contains('Dockstore Account Controls').click();
    });
    it('Should have the delete button enabled', () => {
      cy.contains('Delete Dockstore Account').should('not.be.disabled').click();
      cy.contains('Yes, delete my account').should('be.disabled');
      cy.get('#deleteUserUsernameInput').type('potato');
      cy.contains('Yes, delete my account').should('be.disabled');
      cy.get('#deleteUserUsernameInput').clear().type('user_curator');
      cy.contains('Yes, delete my account').should('not.be.disabled').click();
      cy.url().should('eq', Cypress.config().baseUrl + '/login');
    });
    it('Should have the change username button enabled', () => {
      cy.contains('Update Username').should('not.be.disabled');
    });
  });
  const everythingOk = () => {
    cy.get('#unlink-GitHub').should('be.visible');
    cy.get('#unlink-Quay').should('be.visible');
    cy.get('#link-Bitbucket').should('be.visible');
    cy.get('#link-GitLab').should('be.visible');
  };

  const goToAccountsOnboarding = () => {
    cy
      .contains('Link External Accounts')
      .click();
  };
  describe('Go to setup page', () => {
    beforeEach(() => {

      // Select dropdown setup
      cy
        .get('#dropdown-onboarding')
        .click();
    });

    it('Should let you change your username if possible', () => {

      cy
        .get('#updateUsername')
        .should('not.be.disabled');
      cy
        .get('#username')
        .type('-');
      cy
        .get('#updateUsername')
        .should('be.disabled');
      cy
        .get('#username')
        .type('a');
      cy
        .get('#updateUsername')
        .should('not.be.disabled');
      cy
        .get('#username')
        .type('@');
      cy
        .get('#updateUsername')
        .should('be.disabled');
    });

    it('Should show all accounts as linked (except GitLab and Bitbucket)', () => {
      // everythingOk();
      // goToAccountsOnboarding();
      // cy.visit( '/auth/gitlab.com?code=somefakeid', {'failOnStatusCode': false}).then((resp) => {
      //     expect(resp.status).to.eq('')
      // })
      // goToAccountsOnboarding();
      // TODO: Gitlab is being very slow, hopefully one day we can remove this
      // cy.wait(10000);

      goToAccountsOnboarding();
      everythingOk();
      goToAccountsOnboarding();
      cy.visit('/auth/bitbucket.org?code=somefakeid', { 'failOnStatusCode': false }).then((resp) => {
        expect(resp.status).to.eq('');
      });
      goToAccountsOnboarding();
      everythingOk();
      goToAccountsOnboarding();
      cy.visit('/auth/potato.com?code=somefakeid', { 'failOnStatusCode': false }).then((resp) => {
        expect(resp.status).to.eq('');
      });
      goToAccountsOnboarding();
      everythingOk();
      goToAccountsOnboarding();
      cy.visit('/auth/github.com?code=somefakeid', { 'failOnStatusCode': false }).then((resp) => {
        expect(resp.status).to.eq('');
      });
      goToAccountsOnboarding();
      everythingOk();
      goToAccountsOnboarding();
      cy.visit('/auth/quay.io?code=somefakeid', { 'failOnStatusCode': false }).then((resp) => {
        expect(resp.status).to.eq('');
      });
      goToAccountsOnboarding();
      everythingOk();
    });
    // TODO: this part of the wizard has been reworked
    // it('Go through steps', () => {
    //     // Should start on step 1
    //     cy
    //         .get('h3').contains('Step 1')
    //         .should('be.visible')
    //     cy
    //         .get('h3').contains('Step 2')
    //         .should('not.be.visible')
    //     cy
    //         .get('h3').contains('Step 3')
    //         .should('not.be.visible')
    //     cy
    //         .get('#next_step')
    //         .click()
    //
    //     // Should now be on step 2
    //     cy
    //         .get('h3').contains('Step 1')
    //         .should('not.be.visible')
    //     cy
    //         .get('h3').contains('Step 2')
    //         .should('be.visible')
    //     cy
    //         .get('h3').contains('Step 3')
    //         .should('not.be.visible')
    //     cy
    //         .get('#next_step')
    //         .click()
    //
    //     // Should now be on step 3
    //     cy
    //         .get('h3').contains('Step 1')
    //         .should('not.be.visible')
    //     cy
    //         .get('h3').contains('Step 2')
    //         .should('not.be.visible')
    //     cy
    //         .get('h3').contains('Step 3')
    //         .should('be.visible')
    //     cy
    //         .get('#finish_step')
    //         .click()
    // });
  });
});
