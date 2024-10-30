# Decentralized Voting System Using Blockchain Smart Contracts

Part of the Project-Based Learning module of the Advanced Internet Computing course at TUHH, SoSe, 2024. Group W4.

## Blockchain

Smart contracts are written using Solidity and deployed on Ganache, an Ethereum-based testnet blockchain. There are two smart contracts: **User smart contract** and **Candidate smart contract**. The User smart contract manages voter-related details on the blockchain. It stores comprehensive user information. The Candidate smart contract handles election-related functionalities, including candidate management and voting processes.The details such as deployed contract addresses and ABI (Application Binary Interface) are stored in a cloud database for easy retrieval and tracking purposes. This architecture ensures a secure, transparent, and efficient voting system leveraging blockchain technology.

## Middleware Application

The Node.js application is used for authentication purposes, wallet setup for the users, and execution of smart contracts on the blockchain network. The application uses the Express framework for API development. It also uses Google APIs to connect to the cloud platform for database-related activities. Twilio is utilized for OTP service, which is used for authentication purposes. On the trial version, the numbers provided during registration should be verified in the Twilio console. Web3 is used to connect to the blockchain network and execute smart contract functionalities.

## Frontend

The frontend is developed with ReactJS and is used for user interactions. The application is structured into compoments.

## Steps to Run Locally in VSCode

Generate a [Service Account](https://cloud.google.com/iam/docs/keys-create-delete) key from GCP for authentication purposes to the cloud platform. Place the file in the root of the project. Create an environment variable in the OS with the name `GOOGLE_APPLICATION_CREDENTIALS` and value `/path/to/json_file`.

### Steps to Run the Blockchain

1. Start a Ganache server, either with Truffle Suite or [Ganache Application](https://archive.trufflesuite.com/ganache/).
2. Create a `.env` file in `blockchain/` and update it with environment variables.
3. Navigate to the blockchain directory: `cd blockchain`.
4. Install the necessary packages: `npm i`.
5. Build the project: `node build.js`.
6. Build the admin project: `node build-admin.js`.
7. Deploy the project: `node deployment.js`.
8. Deploy the admin project: `node deployment-admin.js`.
9. Proceed to set up the middleware application.

### Steps to Run the Middleware Application

1. Create a `.env` file in `middleware/` to store the environment variables. Refer to `middleware/config/config.js` for environment variables.
2. Navigate to the middleware directory: `cd middleware`.
3. Install the necessary packages: `npm i`.
4. Start the application: `npm start`.

### Steps to Run the Frontend Application

Create a `.env` file in `frontend/` to store environment variables. Refer to the code for environment variables.

In the project directory, you can run:

- `npm start`: Runs the app in development mode. Navigate to [http://localhost:3001](http://localhost:3001) to view it in your browser. The page will reload when you make changes.
- `npm test`: Launches the test runner in interactive watch mode. See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.
- `npm run build`: Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance. The build is minified, and the filenames include the hashes. Your app is ready to be deployed!

## Steps to Run Dockerized Version Locally

1. Start the Docker engine.
2. Generate a [Service Account](https://cloud.google.com/iam/docs/keys-create-delete) key (JSON file) from GCP and place it in the root of the project folder with the name `google_auth.json`. This is used as a cloud proxy to connect to the database.
3. Create `.env` files in the `middleware/`, `blockchain/`, and `frontend/` folders to store the environment variables.
4. Run `docker-compose up -d`.

## Deployment

[GKE](https://cloud.google.com/kubernetes-engine/?hl=en) is used for cloud deployment. Container images are required by Kubernetes, for which we have Docker files for each type of service. The services we have are Ganache, UI, and Middleware. Deployment is a job that is a one-time activity to deploy smart contracts on the blockchain. The container images must be stored in an artifact registry, for which we use [Artifact Registry](https://cloud.google.com/artifact-registry).

### Prerequisites

1. Install Google SDK.
2. Run `gcloud auth login` to log in to your Google account with cloud access and set the project ID.

### Artifact Registry Setup

1. Go to the Artifact Registry in the Console and click the "+" button at the top.
2. Name: `repository-name`
3. Format: Docker
4. Location Type: Region
5. Region: Choose one, e.g., `europe-west10`
6. Run `gcloud auth configure-docker europe-west10-docker.pkg.dev` in your shell. This makes Docker push work.

### Build and Push to Registry

1. `export IMAGE_TAG=europe-west10-docker.pkg.dev/concrete-racer-274913/aic-cluster/ganache`
2. `export IMAGE_TAG_1=europe-west10-docker.pkg.dev/concrete-racer-274913/aic-cluster/deployment`
3. `export IMAGE_TAG_2=europe-west10-docker.pkg.dev/concrete-racer-274913/aic-cluster/server`
4. Build and push Ganache image:
   - `docker build -t $IMAGE_TAG -f Dockerfile.ganache --platform linux/x86_64 .`
   - `docker push $IMAGE_TAG`
5. Build and push Deployment image:
   - `docker build -t $IMAGE_TAG_1 -f Dockerfile --platform linux/x86_64 .`
   - `docker push $IMAGE_TAG_1`
6. Build and push Middleware image:
   - `docker build -t $IMAGE_TAG_2 -f Dockerfile.middleware --platform linux/x86_64 .`
   - `docker push $IMAGE_TAG_2`

All container images except the UI service should be in the artifact registry. The UI service will be pushed after an endpoint URL from the server service is retrieved.

### Deploying the Application in GKE

Kubernetes deployment and service files from Docker Compose files can be generated using [Kompose](https://kompose.io/).

1. Run `kompose convert -f docker-compose.prod.yml` (Contains the artifact registry URL).The command will generate service and deployment files for Ganache, Middleware, and UI Service, and just the deployment file for the deployment service.
2. Add a key called `type` with value `LoadBalancer` under the `spec` key in all `.service.yaml` files (This will expose the application).
3. In `deployment-deployment.yaml`:
   - change the `apiVersion` value to `batch/v1`
   - change the `kind` value to `Job`
   - remove the `replicas` and `selector` keys under `spec`
   - change the `restartPolicy` value to `Never`
   - remove `replicas` and `selector` keys under `spec`
   - change `restartPolicy` value to `Never`
4. Create a cluster using GKE Product on the Google Cloud Console: Go to Kubernetes Engine and create a new cluster.
5. Run `gcloud container clusters get-credentials <cluster name> --zone <region>`.
6. Deploy the services:
   - `kubectl apply -f ganache-deployment.yaml`
   - `kubectl apply -f ganache-service.yaml`
   - `kubectl apply -f deployment-deployment.yaml`
   - `kubectl apply -f server-deployment.yaml`
   - `kubectl apply -f server-service.yaml`
7. Once the endpoint for the server service is obtained from the Google Cloud Console, update the `.env` file in the `frontend/` folder.
8. Build and push the UI image:
   - `export IMAGE_TAG_3=europe-west10-docker.pkg.dev/gcloud_projectid/repository-name/ui`
   - `docker build -t $IMAGE_TAG_3 -f Dockerfile.ui --platform linux/x86_64 .`
   - `docker push $IMAGE_TAG_3`
9. Deploy the UI service:
   - `kubectl apply -f frontend-deployment.yaml`
   - `kubectl apply -f frontend-service.yaml`

Deployment to the cloud is now finished.

---

For redeployment:

kubectl patch deployment frontend -p \ "{\"spec\":{\"template\":{\"metadata\":{\"annotations\":{\"kubectl.kubernetes.io/restartedAt\":\"$(date +%Y%m%d%H%M%S)\"}}}}}" -n default

go to workloads on gcloud kubernetees and delete all clusters

after workload is deleted go to clusters and delete everything again

## Authors

This project is developed by:

- [Learta Januzi](learta.januzi@tuhh.de)
- [Akshayanivashini Chandrasekar Vijayalakshmi](akshayanivashini.chandrasekar.vijayalakshmi@tuhh.de)
- [Roshan Rajkumar](roshan.rajkumar@tuhh.de)
- [Venkatesh Ravi](venkatesh.ravi@tuhh.de)
