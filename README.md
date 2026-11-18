# TechMart REST API

TechMart is a small, beginner-friendly e-commerce REST API built with Node.js and Express. It uses in-memory sample data, so you can learn API development and Azure App Service deployment without setting up a database. Products, stock changes, orders, and metrics reset when the app process restarts.

## Prerequisites

- Node.js LTS and npm
- Git, if you want to push the project to GitHub
- An Azure account and Azure CLI for the CLI deployment option
- Postman or curl for sending API requests

## Install and run locally

From the project directory:

```bash
npm install
cp .env.example .env
npm run dev
```

The development server uses nodemon and listens at `http://localhost:3000`. For the production start command, run `npm start`. The app reads `PORT`, `NODE_ENV`, and `APP_NAME` from the environment; the local port fallback is 3000.

## API endpoints

All responses are JSON. Order errors use `{ "error": { "message": "..." } }`. Unknown routes return 404, invalid JSON or input returns 400, unknown products return 404, insufficient stock returns 409, and unexpected errors return 500.

### `GET /`

Returns app information and status.

```bash
curl http://localhost:3000/
```

```json
{
  "application": "TechMart",
  "status": "healthy",
  "environment": "development"
}
```

### `GET /health`

Simple health check, suitable for a quick browser or curl check.

```bash
curl http://localhost:3000/health
```

```json
{ "status": "healthy" }
```

### `GET /secret`

Checks whether the `secret` environment variable is configured and returns only a boolean. It deliberately does not send the secret value to the caller, because an unauthenticated HTTP endpoint would expose it to anyone who can reach the app.

```bash
curl http://localhost:3000/secret
```

```json
{ "secretConfigured": false }
```

For local learning, set `secret=some-test-value` in your untracked `.env` file, restart the app, and call the endpoint again. For Azure, add an application setting named `secret` in **Settings → Environment variables** (or **Configuration**) and save. Do not commit `.env` or include the secret value in source code or logs.

### `GET /products`

Returns all products with ID, name, price, category, and stock quantity.

```bash
curl http://localhost:3000/products
```

The response shape is `{ "count": 5, "products": [...] }`. For example, a product is:

```json
{ "id": "p-1001", "name": "Wireless Mouse", "price": 24.99, "category": "Accessories", "stock": 25 }
```

### `GET /orders`

Returns all sample and newly-created orders.

```bash
curl http://localhost:3000/orders
```

The response shape is `{ "count": 1, "orders": [...] }`. The sample order includes `id`, `productId`, `productName`, `quantity`, `customerName`, `total`, and `createdAt`.

### `POST /orders`

Creates an order, assigns it a unique ID, and reduces the in-memory stock. Send a positive integer `quantity`, an existing `productId`, and a non-empty `customerName`.

```bash
curl -X POST http://localhost:3000/orders \
  -H 'Content-Type: application/json' \
  -d '{"productId":"p-1002","quantity":1,"customerName":"Jamie Lee"}'
```

Success returns HTTP 201 with the created order, for example:

```json
{
  "order": {
    "id": "o-<unique-id>",
    "productId": "p-1002",
    "productName": "Mechanical Keyboard",
    "quantity": 1,
    "customerName": "Jamie Lee",
    "total": 79.5,
    "createdAt": "<ISO timestamp>"
  }
}
```

In Postman, choose **POST**, enter `http://localhost:3000/orders`, select **Body → raw → JSON**, and use the same JSON shown above.

### `GET /metrics`

Returns basic process-local metrics. The request count includes this metrics request and all other incoming requests, including health checks and unknown routes.

```bash
curl http://localhost:3000/metrics
```

```json
{ "totalApiRequests": 6, "totalOrders": 1, "uptimeSeconds": 42 }
```

### Example errors

```bash
# Invalid quantity (400)
curl -i -X POST http://localhost:3000/orders -H 'Content-Type: application/json' \
  -d '{"productId":"p-1001","quantity":0,"customerName":"Jamie"}'

# Missing product (404)
curl -i -X POST http://localhost:3000/orders -H 'Content-Type: application/json' \
  -d '{"productId":"missing","quantity":1,"customerName":"Jamie"}'

# Unknown route (404)
curl -i http://localhost:3000/does-not-exist
```

## Deploy to Azure App Service on Linux (Free F1)

F1 is intended for trials, experimentation, and learning; it has no SLA and is not supported for production workloads. Its shared compute has a daily CPU allowance. Select a region and subscription that offer the Free (F1) Linux plan. See [App Service Linux pricing](https://azure.microsoft.com/pricing/details/app-service/linux/).

### Create the App Service in Azure Portal

1. In Azure Portal, select **Create a resource → Web App**.
2. Choose your subscription and create a resource group, or select an existing one.
3. Enter a globally unique web app name.
4. Select **Publish: Code**, **Runtime stack: Node.js LTS**, and **Operating System: Linux**.
5. Create or select a Linux App Service plan and choose **Free F1**. Availability can vary by region/subscription.
6. Review and create the web app. The app starts with `npm start` because `package.json` defines a `start` script.

### Configure app settings

In your web app, open **Settings → Environment variables** (called **Configuration** in some portal layouts), then add or update these application settings:

| Name | Value |
| --- | --- |
| `APP_NAME` | `TechMart` |
| `NODE_ENV` | `production` |

Save the settings and allow App Service to restart the app. Azure supplies `PORT` to the Node.js process; leave it managed by App Service. Settings in the portal are environment variables. Never put secrets in source control or `.env.example`.

### Deploy with Azure CLI ZIP deployment

Install and sign in with the [Azure CLI](https://learn.microsoft.com/cli/azure/install-azure-cli), then run these commands from the project directory. Replace the placeholders with your resource group and web app name.

```bash
az login
zip -r techmart.zip . -x 'node_modules/*' '.git/*' '.env'
az webapp deploy --resource-group <resource-group> --name <app-name> --src-path techmart.zip --type zip
```

Deploy the contents of this project directory so `package.json` and `server.js` are at the ZIP root. App Service detects Node.js and installs production dependencies during build automation. If deployment does not build dependencies, enable build automation in the app's deployment configuration (`SCM_DO_BUILD_DURING_DEPLOYMENT=true`) and redeploy. Check deployment status and logs if the first startup takes a little while.

You can alternatively connect a GitHub repository from the web app's **Deployment Center** and configure a deployment workflow. Push the repository first using the Git commands below, then follow Deployment Center's prompts.

### Verify and view logs

Open `https://<app-name>.azurewebsites.net/health` in a browser, or run:

```bash
curl https://<app-name>.azurewebsites.net/
curl https://<app-name>.azurewebsites.net/products
```

To view startup and application output, open the web app in Azure Portal and select **Monitoring → Log stream**. For CLI streaming, enable filesystem container logging and tail it:

```bash
az webapp log config --resource-group <resource-group> --name <app-name> --docker-container-logging filesystem
az webapp log tail --resource-group <resource-group> --name <app-name>
```

The app writes startup messages and unexpected errors using `console.log` and `console.error`, which appear in the App Service log stream. See Microsoft's guides for [Node.js on App Service](https://learn.microsoft.com/azure/app-service/configure-language-nodejs), [ZIP deployment](https://learn.microsoft.com/azure/app-service/deploy-zip), and [the Node.js quickstart](https://learn.microsoft.com/azure/app-service/quickstart-nodejs).

## Push to GitHub

Create an empty GitHub repository first, then from this project directory:

```bash
git init
git add .
git commit -m "Build TechMart Node.js REST API"
git branch -M main
git remote add origin https://github.com/<your-user>/techmart.git
git push -u origin main
```

The `.gitignore` excludes `.env` and `node_modules`. If this folder is already part of a Git repository, skip `git init` and add the appropriate remote only if needed.
