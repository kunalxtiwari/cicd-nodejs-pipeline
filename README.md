# CI/CD Node.js Pipeline with Jenkins, SonarQube & AWS ECR

An automated, security-focused Continuous Integration pipeline for a Node.js microservice. This project implements enterprise DevSecOps principles, automated code quality gates, container vulnerability scanning and immutable artifact versioning.

## Architecture Overview

  [ Developer ]
       │
       ▼ (git push)
  [ GitHub ]
       │
       ▼ (Webhook / SCM Poll)
  [ Jenkins Pipeline ]
       ├── 1. Install & Test (Node.js 24 Alpine, isolated container)
       ├── 2. Code Quality Analysis (SonarQube Scanner)
       ├── 3. Quality Gate (SonarQube webhook enforcement)
       ├── 4. Docker Build & Immutable Tagging (Git SHA + Build Number)
       ├── 5. Security & Vulnerability Scan (Trivy CLI)
       └── 6. Publish Artifact (Amazon ECR private repository)

**Features & Implementation Details**

**Runtime-Agnostic Testing:** Tests run inside an ephemeral node:24-alpine Docker agent within the Jenkins runner, avoiding dependency drift on the host.

**Code Quality & Static Analysis:** Integrated with SonarQube. Quality Gates halt pipeline execution if code coverage or quality thresholds fail.

**Vulnerability Scanning:** Automated container scanning via Aquasec Trivy inspecting OS libraries and application dependencies. Fails builds on unpatched HIGH or CRITICAL vulnerabilities.

**Traceable & Immutable Tagging:** Implements Git short-SHA combined with Jenkins build numbers (${BUILD_NUMBER}-${GIT_SHA}) alongside latest for rollbacks and audit trails.

**Least-Privilege Security:** Pipeline authenticates to AWS via a scoped IAM service user (jenkins-ecr-publisher) restricted strictly to required ECR actions on target repositories.

**Tech Stack**
**Domain**    	  **Technology / Tool**
Source Control  	Git, GitHub
CI / Automation  	Jenkins (Declarative Pipeline)
Code Quality	    SonarQube Community Edition
Security Scanning	Trivy Container Scanner
Container Engine	Docker
Artifact Registry	AWS Elastic Container Registry (ECR)
Runtime / App	    Node.js, Express, Jest
Infrastructure	  WSL2 (Ubuntu), AWS (ap-south-1)

**Pipeline Workflow**
**Install and Test:** Validates Node environment, executes clean install (npm ci) and runs automated unit tests via Jest.

**SonarQube Analysis:** Transmits source code metrics, test results and static analysis data to SonarQube server.

**Quality Gate:** Pauses execution until SonarQube delivers a Passed status; aborts the pipeline on quality failures.

**Docker Build:** Packages the Node.js application into a minimal container image using Docker multi-stage builds.

**Trivy Scan:** Scans the newly created image for unpatched critical/high CVEs before registry publication.

**Push to AWS ECR:** Retrieves a short-lived authentication token via AWS CLI and uploads the image tags to private AWS ECR.

**Local Verification**
To run and verify the pushed image locally from the registry:

# 1. Authenticate to Amazon ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com

# 2. Run the container
docker run -d --name nodejs-pipeline-app -p 3000:3000 <AWS_ACCOUNT_ID>[.dkr.ecr.ap-south-1.amazonaws.com/cicd-nodejs-pipeline:latest](https://.dkr.ecr.ap-south-1.amazonaws.com/cicd-nodejs-pipeline:latest)

# 3. Test endpoints
curl -i http://localhost:3000/
curl -i http://localhost:3000/health
