const { expect } = require('chai')
const reducer = require('../client/reducers/reducer.js')
const store = require('../client/store/store.js')
const actions = require('../client/actions/actions.js')

describe('Unit Testing', () => {

  // Testing Variables
  const memberData = {
    accounts: [
      { balance: 0, inst_name: 'Chase', name: 'Plaid Checking', number: 1402, type: 'checking' }
    ],
    transactions: [
      { amount: 20, category: ['Misc'], date: '2016-11-10', name: 'Test Insurance' },
      { amount: 40, category: ['Misc'], date: '2016-12-10', name: 'Test Insurance' },
      { amount: 50, category: ['Misc'], date: '2017-01-09', name: 'Test Insurance' }
    ],
    inst_name: 'Chase',
    inst_names: ['Chase']
  }

  const monthsByYear = ['November 2016', 'December 2016', 'January 2017']
  const users = ['Adam Apple', 'Billy Bob', 'Cory Carlos']

  // Reducer function
  describe('Reducer', () => {

    let initialState

    before(() => {
      initialState = store.getState()
    })

    it('Initial state should be returned if there is no matching action type', () => {
      expect(reducer(initialState, { type: 'INVALID_TYPE' })).to.deep.equal(initialState)
      expect(reducer(initialState, { })).to.deep.equal(initialState)
    })

    it('ADD_ACCOUNTS should set the load accounts state to true', () => {
      expect(reducer(initialState, { type: 'ADD_ACCOUNTS' }).loadAccounts).to.be.true
    })

    it('ADD_DONE should set the load accounts state to false', () => {
      expect(reducer(initialState, { type: 'ADD_DONE' }).loadAccounts).to.be.false
    })

    it('ADD_MEMBERDATA should append new member data to existing member data', () => {
      const expectedState = Object.assign({}, initialState, {
        accounts: [...initialState.accounts, ...memberData.accounts],
        transactions: [...initialState.transactions, ...memberData.transactions],
        institutions: [...initialState.institutions, memberData.inst_name]
      })
      const actualState = reducer(initialState, { type: 'ADD_MEMBERDATA', memberData })

      expect(actualState).to.deep.equal(expectedState)
      expect(actualState.accounts).to.be.an.instanceOf(Array)
      expect(actualState.transactions).to.be.an.instanceOf(Array)
      expect(actualState.institutions).to.be.an.instanceOf(Array)
    })

    it('CHANGE_MEMBER_VIEW should switch the user menu view', () => {
      const memberView = 'TestView'
      const expectedState = Object.assign({}, initialState, { memberView })
      const actualState = reducer(initialState, { type: 'CHANGE_MEMBER_VIEW', memberView })

      expect(actualState).to.deep.equal(expectedState)
    })

    it('CHANGE_TRANSACTION_VIEW should change the transactions view', () => {
      const transactionView = 'TestView'
      const expectedState = Object.assign({}, initialState, { transactionView })
      const actualState = reducer(initialState, { type: 'CHANGE_TRANSACTION_VIEW', transactionView })

      expect(actualState).to.deep.equal(expectedState)
    })

    it('CHANGE_USER should change the active user', () => {
      const username = 'TestUser'
      const expectedState = Object.assign({}, initialState, { username })
      const actualState = reducer(initialState, { type: 'CHANGE_USER', username })

      expect(actualState).to.deep.equal(expectedState)
    })

    it('CHANGE_VIEW should change the master page view', () => {
      const view = 'TestView'
      const expectedState = Object.assign({}, initialState, { view })
      const actualState = reducer(initialState, { type: 'CHANGE_VIEW', view })

      expect(actualState).to.deep.equal(expectedState)
    })

    it('GET_MEMBERDATA should add new member data', () => {
      const expectedState = Object.assign({}, initialState, {
        accounts: memberData.accounts,
        transactions: memberData.transactions,
        institutions: memberData.inst_names
      })
      const actualState = reducer(initialState, { type: 'GET_MEMBERDATA', memberData })

      expect(actualState).to.deep.equal(expectedState)
      expect(actualState.accounts).to.be.an.instanceOf(Array)
      expect(actualState.transactions).to.be.an.instanceOf(Array)
      expect(actualState.institutions).to.be.an.instanceOf(Array)
    })

    it('GET_TRANSACTION_DETAILS should get details of a particular transaction', () => {
      const expectedState = Object.assign({}, initialState, {
        transactionDetails: memberData.transactions
      })
      const actualState = reducer(initialState, { type: 'GET_TRANSACTION_DETAILS', transactionDetails: memberData.transactions })

      expect(actualState).to.deep.equal(expectedState)
    })

    it('GET_USERS should get the list of existing users', () => {
      const expectedState = Object.assign({}, initialState, { users })
      const actualState = reducer(initialState, { type: 'GET_USERS', users })

      expect(actualState).to.deep.equal(expectedState)
    })

  })

  // Action Creator functions
  describe('Action Creators', () => {

    it('addMemberData should create an action to append member data', () => {
      const expectedAction = { type: 'ADD_MEMBERDATA', memberData }
      const actualAction = actions.addMemberData(memberData)

      expect(actualAction).to.deep.equal(expectedAction)
      expect(actualAction).to.be.an.instanceOf(Object)
    })

    it('changeMemberView should create an action to switch the user menu view', () => {
      const memberView = 'TestView'
      const expectedAction = { type: 'CHANGE_MEMBER_VIEW', memberView }
      const actualAction = actions.changeMemberView(memberView)

      expect(actualAction).to.deep.equal(expectedAction)
      expect(actualAction).to.be.an.instanceOf(Object)
    })

    it('changeTransactionView should create an action to switch the transactional data view', () => {
      const transactionView = 'TestView'
      const expectedAction = { type: 'CHANGE_TRANSACTION_VIEW', transactionView }
      const actualAction = actions.changeTransactionView(transactionView)

      expect(actualAction).to.deep.equal(expectedAction)
      expect(actualAction).to.be.an.instanceOf(Object)
    })

    it('changeUser should create an action to change the active username', () => {
      const username = 'TestUser'
      const expectedAction = { type: 'CHANGE_USER', username }
      const actualAction = actions.changeUser(username)

      expect(actualAction).to.deep.equal(expectedAction)
      expect(actualAction).to.be.an.instanceOf(Object)
    })

    it('changeView should create an action to switch the master page view', () => {
      const view = 'TestView'
      const expectedAction = { type: 'CHANGE_VIEW', view }
      const actualAction = actions.changeView(view)

      expect(actualAction).to.deep.equal(expectedAction)
      expect(actualAction).to.be.an.instanceOf(Object)
    })

    it('getMemberData should create an action to get the member data of an account', () => {
      const expectedAction = { type: 'GET_MEMBERDATA', memberData }
      const actualAction = actions.getMemberData(memberData)

      expect(actualAction).to.deep.equal(expectedAction)
      expect(actualAction).to.be.an.instanceOf(Object)
    })

    it('getTransactionDetails should create an action to get recurring transaction details', () => {
      const transactionDetails = memberData.transactions
      const expectedAction = { type: 'GET_TRANSACTION_DETAILS', transactionDetails }
      const actualAction = actions.getTransactionDetails(transactionDetails)

      expect(actualAction).to.deep.equal(expectedAction)
      expect(actualAction).to.be.an.instanceOf(Object)
    })

    it('getUsers should create an action to get existing users', () => {
      const users = ['Tim', 'Bob', 'Shaun']
      const expectedAction = { type: 'GET_USERS', users }
      const actualAction = actions.getUsers(users)

      expect(actualAction).to.deep.equal(expectedAction)
      expect(actualAction).to.be.an.instanceOf(Object)
    })

    it('linkAccount should create an action to update the link status', () => {
      const expectedAction = { type: 'ADD_ACCOUNTS' }
      const actualAction = actions.linkAccount()

      expect(actualAction).to.deep.equal(expectedAction)
      expect(actualAction).to.be.an.instanceOf(Object)
    })

    it('linkDone should create an action to update the link status', () => {
      const expectedAction = { type: 'ADD_DONE' }
      const actualAction = actions.linkDone()

      expect(actualAction).to.deep.equal(expectedAction)
      expect(actualAction).to.be.an.instanceOf(Object)
    })

    it('sortingTransStart should create an action to update the transactional sort status', () => {
      const expectedAction = { type: 'SORT_TRANSACTIONS', doneSorting: false }
      const actualAction = actions.sortingTransStart()

      expect(actualAction).to.deep.equal(expectedAction)
      expect(actualAction).to.be.an.instanceOf(Object)
    })

    it('sortingTransEnd should create an action to update the transactional sort status', () => {
      const expectedAction = { type: 'SORT_TRANSACTIONS', transactionsByMonth: memberData.transactions, monthsByYear, doneSorting: true }
      const actualAction = actions.sortingTransEnd(memberData.transactions, monthsByYear)

      expect(actualAction).to.deep.equal(expectedAction)
      expect(actualAction).to.be.an.instanceOf(Object)
    })

  })

})
