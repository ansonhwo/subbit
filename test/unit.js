const actions = require('../client/actions/actions.js')
const store = require('../client/store/store/js')
const { expect } = require('chai')

describe('Unit Testing', () => {

  describe('Action Creators', () => {

    it('changeMemberView should return an action for member view switching', () => {
      const memberView = 'Test'
      const expectedAction = { type: 'CHANGE_MEMBER_VIEW', memberView }

      expect(actions.changeMemberView(memberView)).to.deep.equal(expectedAction)
    })

    it('changeTransactionView should return an action for transactional view switching', () => {
      const transactionView = 'Test'
      const expectedAction = { type: 'CHANGE_TRANSACTION_VIEW', transactionView }

      expect(actions.changeTransactionView(transactionView)).to.deep.equal(expectedAction)
    })

    it('changeUser should return an action for switching the active user', () => {
      const username = 'Test'
      const expectedAction = { type: 'CHANGE_USER', username }

      expect(actions.changeUser(username)).to.deep.equal(expectedAction)
    })

    it('changeView should return an action for main hub view switching', () => {
      const view = 'Test'
      const expectedAction = { type: 'CHANGE_VIEW', view }

      expect(actions.changeView(view)).to.deep.equal(expectedAction)
    })

    it('getMemberData should return an action for updating existing member data', () => {
      const memberData = {
        accounts: [
          {
            balance: 2000,
            inst_name: 'Chase',
            inst_id: 'chase',
            name: 'TEST CHECKING',
            number: '4444',
            type: 'checking'
          },
          {
            balance: 9999,
            inst_name: 'Citi',
            inst_id: 'citi',
            name: 'TEST CREDIT CARD',
            number: '5555',
            type: 'credit card'
          }
        ],
        transactions: [
          [
            {
              amount: 50,
              category: ['Digital Shops, Entertainment'],
              date: '2017-01-10',
              name: 'TEST STORE'
            },
            {
              amount: 10,
              category: ['Gas Stations'],
              date: '2017-01-20',
              name: 'TEST GAS'
            }
          ]
        ],
        institutions: [
          {
            checked: false,
            inst_name: 'Chase',
            inst_id: 'chase'
          },
          {
            checked: false,
            inst_name: 'Citi',
            inst_id: 'citi'
          }
        ],
        monthsByYear: ['January 2017']
      }
      const expectedAction = { type: 'GET_MEMBERDATA', memberData }

      expect(actions.getMemberData(memberData)).to.deep.equal(expectedAction)
    })

    it('getTransactionDetails should return an action for consolidating transactional details', () => {
      const transactionDetails = [
        {
          amount: 50,
          category: ['Subscription'],
          date: '2016-12-15',
          name: 'Spotify'
        },
        {
          amount: 50,
          category: ['Subscription'],
          date: '2016-11-15',
          name: 'Spotify'
        }
      ]
      const expectedAction = { type: 'GET_TRANSACTION_DETAILS', transactionDetails }

      expect(actions.getTransactionDetails(transactionDetails)).to.deep.equal(expectedAction)
    })

    it('getUsers should return an action for updating the list of users', () => {
      const users = ['Tom Sawyer', 'Bill Lawrence']
      const expectedAction = { type: 'GET_USERS', users }

      expect(actions.getUsers(users)).to.deep.equal(expectedAction)
    })

    it('linkAccount should return an action for indicating the start of a new account link', () => {
      const expectedAction = { type: 'ADD_ACCOUNTS' }

      expect(actions.linkAccount()).to.deep.equal(expectedAction)
    })

    it('linkDone should return an action for indicating the end of a new account link', () => {
      const expectedAction = { type: 'ADD_DONE' }

      expect(actions.linkDone()).to.deep.equal(expectedAction)
    })

    it('toggleAccounts should return an action to update toggled accounts', () => {
      const institutions = [
        {
          checked: true,
          inst_name: 'Chase',
          inst_id: 'chase'
        },
        {
          checked: false,
          inst_name: 'Citi',
          inst_id: 'citi'
        }
      ]
      const expectedAction = { type: 'TOGGLE_ACCOUNTS', institutions }

      expect(actions.toggleAccounts(institutions)).to.deep.equal(expectedAction)
    })

    it('fetchUsers should dispatch an action to update the store with the list of users', () => {
      const expectedAction = {  }
    })

  })

})
