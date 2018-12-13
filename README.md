# SOUK - The Headless Microservice API for eCommerce (Alpha)

## Overview
This project is the result of searching for an Open Source solution that would fulfill the following requirements:

### Ideal System Requirements
1. Headless
2. High performance and scalable
3. A clean, modular system that is configurable
4. Open Source to crowdsource the best ideas from the community

### Current System

**Features**
* Accounts
* Carts
* Catalogs
* Products / Variants / Options
* Fulfillment
* Orders
* Payments / Refunds
* Coupons
* Slugs
* Tags / Categories

**Current System Support**

The current project is a work in progress as the main end points (APIs) have been created and the system works in production for a specific set of services.

The current implementation supports an eCommerce workflow that consists of:
1. Customer Registration
2. Custom Login
3. Adding/Removing Products from Shopping Cart
4. Checkout workflow:
 * Address verification via UPS API
 * Lookup UPS Shipping Rates based on Address
 * Credit Card Payments via Elavon Payment Gateway
5. Order Verification and Notifications
6. Order Refunds
7. Email Notifications for Registration, Password Reset, and Orders
8. Product Catalog


**Future System Support**
The work that is being done is to modularize the services further that they are configurable from an administrative console that will allow the following:

1. Support for additional Payment Gateways
2. Support for various Shipping fulfilment systems
3. Support for Shipping Rates from various carriers
4. Support for Tax/Nexus calculation for additional states

---

## Development

This project uses the [serverless-webpack](https://github.com/serverless-heaven/serverless-webpack) plugin, [Babel](https://babeljs.io), [serverless-offline](https://github.com/dherault/serverless-offline), and [Mocha](https://mochajs.org/).

This configuration supports:

* __ES7 syntax in your handler functions__

    * Use `import` and `export`

* __Package your functions using Webpack__
* __Run API Gateway locally__

    * Use `serverless offline start`

* __Support for unit tests__

    * Run `npm test` to run your tests

* __Sourcemaps for proper error messages__

    * Error message show the correct line numbers
    * Works in production with CloudWatch

* __Automatic support for multiple handler files__

    * No need to add a new entry to your `webpack.config.js`
  
* __Add environment variables for your stages__

---

## Requirements

* [Install the Serverless Framework](https://serverless.com/framework/docs/providers/aws/guide/installation/)
* [Configure your AWS CLI](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

## Usage

To run unit tests on your local

``` bash
npm test
```

To run a function on your local

``` bash
serverless invoke local --function hello
```

To simulate API Gateway locally using [serverless-offline](https://github.com/dherault/serverless-offline)

``` bash
serverless offline start
```

Run your tests

``` bash
export CONFIG_API_URL=XXX
npm run test
```

We use Jest to run our tests. You can read more about setting up your tests [here](https://facebook.github.io/jest/docs/en/getting-started.html#content).

Deploy your project

``` bash
serverless deploy
```

Deploy a single function

``` bash
serverless deploy function --function hello
```

To add another function as a new file to your project, simply add the new file and add the reference to `serverless.yml`. The `webpack.config.js` automatically handles functions in different files.

To add environment variables to your project

1. Rename `env.example` to `env.yml`.
2. Add environment variables for the various stages to `env.yml`.
3. Make sure to not commit your `env.yml`.