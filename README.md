

# **AWS S3 Explorer**

Cross-Platform App (win, mac,linux) AWS S3 Explorer

## Technology Stack
- Electron React Boilerplate (https://github.com/electron-react-boilerplate/electron-react-boilerplate)
- React v18 (https://react.dev/)
- AWS SDK for JavaScript (https://aws.amazon.com/sdk-for-javascript/)
- Ant Design v5 (https://ant.design/)


## Features:
- Support AWS creds from aws-cli if it is already installed in the machine
- Add AWS Profile with Access Key and Secret Access Key
- Download
  - support multiple files download
-  Upload files / folder
   - support multiple-part upload per file

## Screenshots
![AWS S3 Explorer](docs/images/dashboard.png)

## App Installation
Platform specific binaries can be downloaded from repo's release page or can be package from source.


## Development and Packaging
### Install dependencies

Clone the repo and install dependencies:

```bash
npm install
```

### Starting Development

Start the app in the `dev` environment:

```bash
npm start
```

### Packaging for Production

To package apps for the local platform:

```bash
npm run package
```
Package binaries will be output to `release/build` directory.


