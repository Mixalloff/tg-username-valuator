# TG-USERNAME-VALUATOR

Library for approximate cost estimation of Telegram usernames

## Getting started

### Installation

```bash
npm install tg-username-valuator
```

### Setting up a telegram client

First of all we need to get apiId and apiHash of our tg account.
1) [Login to your Telegram account](https://my.telegram.org/) with the phone number of the developer account to use.
2) Click under API Development tools.
3) A Create new application window will appear. Fill in your application details. There is no need to enter any URL, and only the first two fields (App title and Short name) can currently be changed later.
4) Click on Create application at the end. Remember that your API hash is secret and Telegram won’t let you revoke it. Don’t post it anywhere!

### Logging in with apiId and apiHash

Once you need to login to Telegram with your apiId, apiHash, phone number and confirmation code

```bash
tg-username-valuator login
```

After the dialog is completed, you can start using the library

## Available commands from cmd

```bash
// Login into Telegram client
tg-username-valuator login

// Valuate given username
tg-username-valuator valuate <username>

// Load a specified count of top domains
tg-username-valuator load-domains <count>
```