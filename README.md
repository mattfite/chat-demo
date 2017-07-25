# A simple serverless chat application

This is a living project built to demonstrate serverless concepts

## Configure

Create a file named credentials.json from the template, and fill in all the secret info. You'll have to get this from Matt.

```bash
cp credentials-template.json credentials.json
```

## Develop

To develop, install dependencies with [NPM](https://www.npmjs.com) and launch [webpack dev server](https://webpack.github.io/docs/webpack-dev-server.html):

```bash
npm install
npm run webpack-serve
```

The app is accessible at [localhost:8080](http://localhost:8080). The files are automatically recompiled and served from memory as the contents change.

## Build

Build static files in the public directory with [NPM](https://www.npmjs.com):

```bash
npm install
npm run build
```

## Deploy

After building, you can host the root directory somewhere, like [Amazon S3](https://aws.amazon.com/s3)
