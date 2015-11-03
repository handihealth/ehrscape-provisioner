# Ehrscape Provisioner

[![Build Status](https://travis-ci.org/handihealth/ehrscape-provisioner.svg?branch=master)](https://travis-ci.org/handihealth/ehrscape-provisioner)

This app is built and deployed by Travis CI to Openshift, the resulting deploy can be found at [http://provisioner-handihopd.rhcloud.com/](http://provisioner-handihopd.rhcloud.com/). It is designed to be used to automatically provision an ehrscape instance with sample data, such as patient, EHR, template and composition.

## Usage

### UI

From the index page of the app, you can enter your Ehrscape username and password, click Go! and watch it run through the various requests to provision your domain with a sample patient, EHR, template and composition.

### API

If you would like to carry out the same provision using an API call then use an HTTP client of your choice (such as Postman) and create a POST request to `/api/provision` with the request body specified as:

```
{
  "username": "my_username",
  "password": "my_password"
}
```

The base URL for the ehrscape instance is set to https://ehrscape.code-4-health.org/rest/v1/ but can be overridden by also supplying it in the request body, such as:

```
{
  "username": "my_username",
  "password": "my_password",
  "baseUrl": "https://my.ehrscape.url/rest/v1/"
}
```

## Development

### Docker

These instructions assume you have docker installed and running

To run locally using docker run

```
docker run -v ${PWD}:/src -it -p 3000:8080 davet1985/ehrscape-provisioner
```

To run using nodemon, to watch for file changes and automatically restart the server, use

```
docker run -v ${PWD}:/src -it -p 3000:8080 davet1985/ehrscape-provisioner nodemon /src/bin/www
```

If you need to rebuild the image, use

```
docker build -t davet1985/ehrscape-provisioner .
```

### Local

To run locally for development ensure you have the following installed.

* node.js, we are using version 0.10

For mac I would recommend installing Node Version Manager (nvm) through homebrew.

```sh
brew install nvm
nvm install node
nvm use node
```

Node comes with a version of NPM but to make sure it's up-to-date run `npm install -g npm`

Then a couple of node modules need to be installed globally, to do this run: -

```sh
npm install -g gulp
npm install -g bower
```

From here you should be able to run `npm start` and it will download all the necessary node modules, bower components and gulp will do it's thing and the server should be running on http://localhost:8080.

## Development Options

You might want to install nodemon (`npm install -g nodemon`) and run using `nodemon bin/www` - this will watch for file changes and automatically restart the server for you.

To watch and compile assets (javascript and SASS) and run unit tests you should also have a terminal open running `gulp watch`.

## Tests

To run the tests once run `gulp test` from your terminal. To watch for changes and re-run tests automatically use `gulp watch` as stated above or `gulp watch-test` to only watch and run the tests, and not assets.
