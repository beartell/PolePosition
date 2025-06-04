# PolePosition


PolePosition is an Electron-based installer that orchestrates the deployment of Hadoop and
related services across remote servers. The project combines a graphical wizard with
SSH automation to simplify provisioning a data platform capable of running
analytics and Industrial IoT workloads.

![logo](https://user-images.githubusercontent.com/870265/204732093-1ea33682-9eaa-451c-befd-f7cb7015ecf3.png)

## Features

- Collects installation parameters through a multi-step wizard.
- Installs selected Hadoop components and monitoring tools via SSH.
- Generates Prometheus and Grafana configurations for cluster monitoring.
- Supports packaging the installer for Windows or Linux using Electron Forge.
- Handles large scale data from IoT sensors and other sources.
- Works with Kubernetes to enable hybrid or multi-cloud deployments.

## Repository Structure

- `main.js` – entry point that creates the application window.
- `renderer.js` – controls page navigation and user interactions.
- `PageViewer.js` – loads wizard pages described in `pole_config.json` and
  shares state between them.
- `Pages/` – contains HTML pages and their accompanying filter scripts used by
  the wizard.
- `installation_part/` – executes remote installation commands with `node-ssh`.
- `components.json` – definition of optional Hadoop services and their ports.
- `prometheus_template.yml` – template used to generate monitoring configuration.

## Usage

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the application in development mode:
   ```bash
   npm start
   ```
3. To build distributable packages:
   ```bash
   npm run make
   ```

## Running Tests

Install dependencies and run the Jest suite:

```bash
npm install
npm test
```

During installation the wizard will request server addresses, authentication
methods and the list of components to deploy. After collecting the information it
runs the installer remotely and reports progress in the interface.

## License

This project is licensed under the Apache License. See the [LICENSE](LICENSE) file
for details.
