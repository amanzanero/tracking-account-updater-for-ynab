# Tracking Account Updater for YNAB

I built this little app to help me update all my tracking accounts in [YNAB](https://www.ynab.com/) in bulk.

Otherwise, you have to go reconcile each account manually. This just pulls up a table and allows you to edit the balance on each one, and it'll go ahead and create transactions that you can go ahead and approve in YNAB.

**Privacy note**: This app doesn't store any data from YNAB. It just uses the API to pull in your account balances and create transactions. It's all done in your browser, in memory.

## Hosting

Right now I'm hosting this on github pages since it's free and this is a static site. **For devs**: As a result I have to have the `/tracking-account-updater-for-ynab/` basepath set up everywhere.
