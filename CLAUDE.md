# Budget App - TODOs

## Existing Code TODOs

- [ ] Recalculate account amounts when deleting a transaction (`frontend/src/components/AppHome.jsx:97`)
- [ ] Move TxnTypeSelector into TxnView instead of AppHome (`frontend/src/components/AppHome.jsx:237`)
- [ ] Improve TxnTypeSelector appearance — make it look less like radio buttons (`frontend/src/components/TxnTypeSelector.jsx:10`)
- [ ] Improve AccountTypeSelector appearance — make it look less like radio buttons (`frontend/src/components/AccountTypeSelector.jsx:10`)

## Security

- [x] Move hardcoded MongoDB credentials in `backend/index.js` to `.env`
- [ ] Add authentication to API endpoints
- [x] Restrict CORS from `*` to specific origins

## Code Quality

- [x] Clean up root `package.json` — it has frontend and backend deps mixed in that don't belong there
- [ ] Migrate class components to functional components with hooks
- [ ] Add `.catch()` error handling to API calls
- [ ] Wrap transaction-related DB operations in a single Mongoose transaction (`backend/helpers/txn.helpers.js`)
- [ ] Fix frontend proxy port (set to 5000) to match backend port (5004)

## Infrastructure

- [ ] Upgrade dependencies (React 17→18+, Material-UI v4→MUI v5, Mongoose 5→7+)
- [ ] Update Node engine requirement from 14.x or upgrade deps for modern Node

## Feature Ideas

- [ ] Recurring transactions (auto-create monthly bills/income)
- [ ] Budget vs. actual summary dashboard
- [ ] Search/filter transactions by merchant
- [ ] Export transactions to CSV
- [ ] Multi-year spending comparison
- [x] Don't allow any edits to forms while submit http requests are still pending, eg for transaction creation
- [x] Be more clear when an http request has failed
- [ ] paginate the TXN retrieval so the initial pageload doesn't take forever
- [ ] provide an option to re-calculate the "current balance" on an account or on a category based on all transactions ever. if there is a mismatch, confirm with the user before overwriting the old value(s).
- [ ] make the page generally look nicer and easier to use
- [ ] integrate sankey diagrams directly into the app
- [ ] automatically add more years in the year dropdown as we reach the future years
- [ ] add real support for an 'edit txn' popup, rather than deleting and re-creating. for now, don't allow the source accounts to change - only title, description, etc.
- [ ] add support for modifying the accounts and categories of an existing transaction. this means the transaction has to be removed from those accounts (and thus erasing the effect the transaction had on those accounts/categories), then added to the new account/category.
