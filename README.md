# Microservices E-Commerce Platform

A secure microservices-based e-commerce platform with integrated DevSecOps practices, containerization, and automated security scanning.

## Table of Contents

- [Architecture](#architecture)
- [DevSecOps Workflow](#devsecops-workflow)
- [Microservices Components](#microservices-components)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Security Features](#security-features)
- [CI/CD Pipeline](#cicd-pipeline)
- [Service Documentation](#service-documentation)
- [Development](#development)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

A secure microservices-based e-commerce platform with OAuth2/OIDC authentication, API gateway routing, and independent databases for each microservice.

### System Components

```
Frontend (React)
    http://localhost:3000
         |
    OAuth2/OIDC
         |
    Keycloak
    http://localhost:8180
         |
    JWT Token
         |
    API Gateway
    http://localhost:8090
    Routing, JWT Validation, CORS
         |
    +---------+---------+
    |                   |
Product Service   Order Service
http://8081      http://8082
PostgreSQL       PostgreSQL
```

## DevSecOps Workflow

DevSecOps (Development, Security, Operations) integrates security practices throughout the entire software development lifecycle. This project implements a comprehensive DevSecOps pipeline with automated security scanning, vulnerability detection, and secure deployments.

### DevSecOps Pipeline Stages

#### 1. Plan Phase
- Security requirements definition
- Threat modeling and risk assessment
- SAST/DAST tool selection
- Compliance requirements mapping

#### 2. Code Development Phase
- Developers write secure code following OWASP guidelines
- Code repositories with access control
- Branch protection rules enforcing code review
- Commit signing for audit trails
- IDE plugins for security linting

#### 3. Commit and Push
- Developer commits code to feature branch
- Pre-commit hooks scan for secrets and credentials
- Push to remote repository triggers webhook

#### 4. CI/CD Pipeline Execution (Jenkins)

The Jenkins pipeline orchestrates the entire security workflow:

##### a) Checkout Stage
- Retrieve source code from Git repository
- Verify commit signatures
- Extract repository metadata

##### b) Build Stage
- Compile application code
- Build Docker images for all microservices
- Services built: api-gateway, product-service, order-service, frontend
- Tag images with build number for traceability

##### c) Container Image Scanning (Trivy)
- Scan container images for vulnerabilities in base images and dependencies
- Detect HIGH and CRITICAL severity vulnerabilities
- Generates JSON reports for each service
- Execution order:
  - api-gateway image scan
  - product-service image scan
  - order-service image scan
  - frontend image scan
- Blocks pipeline on vulnerabilities found
- Archive reports as build artifacts

**Trivy Execution Command**:
```bash
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image --no-progress --ignore-unfixed \
  --exit-code 1 --severity HIGH,CRITICAL \
  --format json --output trivy-reports/service-image.json \
  image-name
```

##### d) Static Application Security Testing (SAST)
- SonarQube analysis on backend services
- Analyzes code quality metrics
- Detects code smells and bugs
- Identifies security hotspots
- Coverage metrics tracking
- Integration with Jenkins dashboard

##### e) Dependency Vulnerability Scanning (OWASP)

**Maven Dependency-Check for Java services**:
- Scans all Maven dependencies in pom.xml
- Checks against NVD (National Vulnerability Database)
- Generates HTML and XML reports
- Identifies known vulnerabilities with CVSS scores
- Execution command:
  ```bash
  mvn clean verify \
    org.owasp:dependency-check-maven:check \
    sonar:sonar
  ```

**NPM Audit for Frontend**:
- Scans JavaScript/Node.js dependencies
- Identifies vulnerable packages
- Provides fix recommendations
- Report generation in JSON and HTML

##### f) SonarQube Analysis & Reporting
- Integrates security findings from all tools
- Combines SAST, dependency check, and Trivy results
- Tracks metrics over time
- Quality gates enforcement:
  - Code coverage thresholds
  - Security rating requirements
  - Technical debt limits
  - Custom metrics based on organizational requirements

##### g) Artifact Archival
- Stores scan reports (Trivy JSON)
- Stores dependency check reports (HTML, XML)
- Enables trend analysis and historical tracking
- Fingerprinting for build traceability

#### 5. Deployment Phase
- Artifact promotion to registry
- Staging environment deployment
- Production deployment (with approvals)
- Continuous monitoring activated

#### 6. Runtime Security Monitoring
- Container runtime security
- Log aggregation and analysis
- Alert on suspicious activities
- Vulnerability re-scanning of running images

### Security Tools Integration

#### Trivy (Container Image Scanner)
```
Purpose: Scan Docker images for vulnerabilities
Severity Levels: CRITICAL, HIGH, MEDIUM, LOW
Reports: JSON format with detailed vulnerability info
Action: Fail pipeline on HIGH/CRITICAL vulnerabilities
Coverage: All microservice Docker images
Database: Updated automatically from multiple sources
```

#### SonarQube (Code Quality & Security)
```
Purpose: Static Application Security Testing (SAST)
Analysis Types:
  - Code quality analysis
  - Security hotspot detection
  - Code coverage tracking
  - Technical debt calculation
Reports: Web dashboard + XML exportable format
Integration: Jenkins plugin with quality gate enforcement
Quality Gates: Customizable pass/fail criteria
Languages: Java, JavaScript, Python, etc.
```

#### OWASP Dependency-Check (Dependency Scanning)
```
Purpose: Identify known vulnerabilities in project dependencies
Scope: Maven POM files, npm packages
Database: National Vulnerability Database (NVD)
Reports: HTML, XML, JSON formats
Action: Publish to Jenkins dashboard
Severity: All levels reported and categorized
```

#### NPM Audit (Frontend Dependencies)
```
Purpose: Identify security vulnerabilities in npm packages
Scope: package.json dependencies and lock file
Report: Console output + Jenkins artifact
Severity: All levels reported (high, moderate, low, critical)
Fix recommendations: Automated suggestions provided
```

### Security Scanning Commands

```bash
# Full security analysis
./scripts/security-scan.sh

# Individual tool scans

# Trivy image scan
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy:latest image <image-name>

# SonarQube analysis
mvn clean verify sonar:sonar -Dsonar.projectKey=<service-name>

# Dependency check
mvn org.owasp:dependency-check-maven:check

# NPM audit
npm audit --audit-level=high
```

### SonarQube Dashboard

1. Access: http://localhost:9000
2. Default credentials: admin / admin
3. Change password on first login
4. View projects:
   - api-gateway
   - product-service
   - order-service
   - frontend

### Vulnerability Management Process

1. **Identification**: Security tools detect vulnerabilities during pipeline execution
2. **Classification**: Severity assessment (CRITICAL > HIGH > MEDIUM > LOW)
3. **Reporting**: Aggregated findings in SonarQube dashboard and Jenkins artifacts
4. **Prioritization**: Risk-based remediation planning based on CVSS scores
5. **Remediation**: 
   - Apply security patches to base images
   - Update dependencies to fixed versions
   - Code fixes for identified security hotspots
6. **Verification**: Re-scan to confirm fixes and validation
7. **Documentation**: Track all remediation efforts and changes

### Pipeline Failure Scenarios

The pipeline fails and blocks deployment if:
- Container image contains HIGH or CRITICAL vulnerabilities (Trivy scan)
- Trivy scan exit code is non-zero
- SonarQube quality gates not met
- Dependency-Check finds unacceptable vulnerabilities
- NPM audit detects critical packages
- Code coverage falls below threshold
- Security rating drops below configured level

### Continuous Monitoring Post-Deployment

- Running containers monitored for new vulnerabilities
- Periodic re-scanning of deployed images
- Real-time alerts on security issues
- Automated rollback procedures for critical vulnerabilities
- Centralized logging and monitoring dashboards

## Microservices Components

### Architecture Overview

The platform follows microservices architecture with independent deployment, scaling, and data management.

### Component Details

**Frontend (React)**
- Single-page application
- OAuth2/OIDC integration with Keycloak
- Responsive UI design
- Service-oriented communication layer
- Port: 3000

**Keycloak (Identity Provider)**
- OAuth2 and OpenID Connect provider
- User and role management
- Realm configuration for multi-tenancy
- PostgreSQL backend for persistence
- Port: 8180

**API Gateway**
- Spring Cloud Gateway
- Centralized request routing
- JWT token validation
- CORS handling
- Request/response logging
- Circuit breaker implementation
- Port: 8090

**Product Service**
- Spring Boot microservice
- PostgreSQL database (product-db)
- Product catalog management
- Stock inventory management
- Pagination and filtering support
- Port: 8081

**Order Service**
- Spring Boot microservice
- PostgreSQL database (order-db)
- Order creation and management
- Order status tracking
- Communication with Product Service
- Port: 8082

## Prerequisites

- Docker & Docker Compose (version 3.8+)
- Java 17 or higher (for local development)
- Node.js 18 or higher (for local development)
- Maven 3.8 or higher
- At least 4GB available RAM for containers

## Quick Start

### 1. Start all services

```bash
# Build and start all containers
docker compose up --build -d

# Or make start script executable and run
chmod +x scripts/start.sh
./scripts/start.sh
```

### 2. Check status

```bash
docker-compose ps
```

Expected output shows all services in healthy state.

### 3. Access applications

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | User login via Keycloak |
| Keycloak Admin | http://localhost:8180 | admin / admin |
| API Gateway | http://localhost:8090 | Bearer token required |
| SonarQube | http://localhost:9000 | admin / admin |

### Test Users

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| client1 | client123 | CLIENT |
| client2 | client123 | CLIENT |

## Project Structure

```
project/
├── api-gateway/              # Spring Cloud Gateway service
│   ├── src/
│   │   ├── main/java/
│   │   └── resources/
│   ├── Dockerfile
│   └── pom.xml
├── product-service/          # Product microservice
│   ├── src/
│   │   ├── main/java/
│   │   └── resources/
│   ├── Dockerfile
│   └── pom.xml
├── order-service/            # Order microservice
│   ├── src/
│   │   ├── main/java/
│   │   └── resources/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── keycloak/
│   └── realm-config.json     # Identity provider configuration
├── ci/
│   └── trivy_to_sonar.py     # Security scan integration script
├── scripts/                  # Helper scripts
│   ├── start.sh
│   └── security-scan.sh
├── docker-compose.yml        # Service orchestration
├── Jenkinsfile              # CI/CD pipeline definition
└── README.md
```

## API Endpoints

### Product Service API (via API Gateway)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/products | ADMIN, CLIENT | List all products |
| GET | /api/products/{id} | ADMIN, CLIENT | Product details |
| POST | /api/products | ADMIN | Create product |
| PUT | /api/products/{id} | ADMIN | Update product |
| DELETE | /api/products/{id} | ADMIN | Delete product |

### Order Service API (via API Gateway)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/orders | CLIENT | Create order |
| GET | /api/orders/my-orders | CLIENT | My orders |
| GET | /api/orders | ADMIN | All orders |
| GET | /api/orders/{id} | ADMIN | Order details |
| PATCH | /api/orders/{id}/status | ADMIN | Update status |

## Security Features

### Authentication and Authorization
- OAuth2/OIDC with Keycloak identity provider
- JWT token-based API authentication
- Role-Based Access Control (RBAC) with fine-grained permissions
- PKCE flow for frontend security
- Token refresh mechanism

### API Security
- JWT validation at API Gateway for all requests
- JWT re-validation at microservice level for defense in depth
- CORS configuration restricted to frontend domain
- Security headers (X-Frame-Options, X-Content-Type-Options, Content-Security-Policy)
- Rate limiting on API endpoints to prevent abuse
- Request ID tracking for audit trails

### Data Security
- PostgreSQL databases with strong authentication
- Encrypted connections between services
- Password hashing with bcrypt algorithms
- Secrets managed via environment variables (never in code)
- No hardcoded credentials in application code

### Container Security
- Base images scanned with Trivy before deployment
- Non-root user execution in containers
- Read-only file systems where applicable
- Resource limits enforcement (CPU, memory)
- Network policies restricting inter-container communication

### Network Security
- Internal services isolated on backend network
- Frontend isolated on dedicated frontend network
- Service-to-service communication only through API Gateway
- Health checks on all containers for availability monitoring
- TLS/SSL ready for production deployments

## CI/CD Pipeline

The Jenkins pipeline orchestrates continuous integration and deployment with security-first approach.

### Jenkins Pipeline Configuration

Located in `Jenkinsfile` at project root with stages for building, scanning, and deploying.

### Pipeline Execution Flow

```
Code Push
    |
    v
Jenkins Webhook Triggered
    |
    v
Checkout (SCM)
    |
    v
Build Docker Images
    |
    v
Trivy Image Scan (Block on HIGH/CRITICAL)
    |
    v
SonarQube SAST Analysis
    |
    v
Dependency-Check Scan (Maven + NPM)
    |
    v
Generate Reports
    |
    v
Archive Artifacts
    |
    v
Deploy (if pipeline passed)
```

### Security Scanning Details

**Trivy Configuration**:
- Scans: api-gateway, product-service, order-service, frontend
- Ignore unfixed vulnerabilities: Yes
- Exit code 1 on HIGH or CRITICAL severities (blocks pipeline)
- Report format: JSON with complete vulnerability details
- Reports location: trivy-reports/ directory
- Cache utilization: /root/.cache/trivy for efficiency

**SonarQube Configuration**:
- Projects analyzed: api-gateway, product-service, order-service, frontend
- Metrics tracked: Code coverage, code smells, security ratings
- Quality gates: Configurable thresholds for pass/fail
- Integration: Maven sonar:sonar plugin + Scanner CLI
- Reporting: Interactive dashboard with trend analysis

**Dependency-Check Configuration**:
- Maven services: Run with Maven dependency-check plugin
- Frontend: Run with standalone CLI tool
- NVD database: Updated automatically from sources
- Report formats: HTML, XML, JSON for different integrations
- Severity reporting: All vulnerabilities categorized

### Manual Pipeline Execution

```bash
# Access Jenkins
http://localhost:8080

# Trigger build for a pipeline
# Select project > Build Now > Console Output to view progress
```

### Security Reports

After pipeline execution, access reports at:
- SonarQube: http://localhost:9000/projects for all projects
- Jenkins Artifacts: Build number > Artifacts section
- Dependency reports: service/target/dependency-check-report.html
- Trivy reports: trivy-reports/ directory in Jenkins workspace

## Service Documentation

### API Gateway
- Central request routing using Spring Cloud Gateway
- Request path pattern matching and routing rules
- JWT token validation before forwarding to services
- CORS configuration for allowed origins
- Rate limiting configuration per endpoint
- Centralized logging of all API traffic
- Circuit breaker protection against cascading failures

### Product Service
- Spring Boot microservice for product management
- RESTful API for CRUD operations on products
- PostgreSQL database for persistent storage
- Inventory management with stock tracking
- Pagination and filtering on product listing
- Integration with Order Service for stock validation
- Caching mechanisms for frequently accessed data

### Order Service
- Spring Boot microservice for order management
- RESTful API for order lifecycle management
- Order status workflow (PENDING, CONFIRMED, SHIPPED, DELIVERED)
- Integration with Product Service via HTTP calls
- PostgreSQL database for order persistence
- User-specific order filtering and queries
- Transaction management for data consistency

### Frontend
- React single-page application with component architecture
- OAuth2/OIDC integration via Keycloak client
- Service layer for API communication with error handling
- State management for user authentication and orders
- Responsive design with CSS modules
- Loading states and error boundaries
- Local storage management for user preferences

### Keycloak
- OpenID Connect and OAuth2 identity provider
- User management with flexible permission model
- Realm configuration defining security policies
- Role-based access control with group management
- Token generation and validation
- User registration and password management
- Multi-factor authentication capabilities

## Development

### Local Development Setup

#### Product Service

```bash
cd product-service
mvn spring-boot:run
```

Service runs on http://localhost:8081 but requires Keycloak and PostgreSQL running.

#### Order Service

```bash
cd order-service
mvn spring-boot:run
```

Service runs on http://localhost:8082 and depends on Product Service.

#### Frontend

```bash
cd frontend
npm install
npm start
```

Application runs on http://localhost:3000 with hot reload enabled.

#### Database Setup

Databases are automatically created and initialized by docker-compose. To manually manage:

```bash
# Access product database
docker exec -it product-db psql -U product_user -d productdb

# Access order database
docker exec -it order-db psql -U order_user -d orderdb
```

## Testing

### Backend Unit Tests

```bash
cd product-service
mvn test

cd order-service
mvn test
```

### Backend Integration Tests

```bash
mvn verify
```

### Frontend Unit Tests

```bash
cd frontend
npm test
```

### Frontend E2E Tests

```bash
cd frontend
npm run test:e2e
```

## Logging and Monitoring

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api-gateway
docker-compose logs -f product-service
docker-compose logs -f order-service
docker-compose logs -f frontend
docker-compose logs -f keycloak

# Last 100 lines with timestamps
docker-compose logs --tail=100 -t <service>
```

### Health Checks

- API Gateway: http://localhost:8090/actuator/health
- Product Service: http://localhost:8081/actuator/health (internal only)
- Order Service: http://localhost:8082/actuator/health (internal only)

All services implement Spring Boot Actuator health endpoints.

## Stopping Services

```bash
# Stop all containers
docker-compose down

# Stop and remove all volumes (data loss)
docker-compose down -v

# Stop specific service
docker-compose stop <service-name>

# Restart service
docker-compose restart <service-name>
```

## Order Creation Sequence Diagram

```
User      Frontend    API Gateway  Order Service  Product Service
  |           |            |            |              |
  | Login     |            |            |              |
  |---------->|            |            |              |
  |           | Keycloak   |            |              |
  |           | Redirect   |            |              |
  |<----------|            |            |              |
  |           |            |            |              |
  | JWT Token |            |            |              |
  |---------->|            |            |              |
  |           |            |            |              |
  | Add Cart  |            |            |              |
  |---------->|            |            |              |
  |           |            |            |              |
  | Place Order|POST /orders + JWT     |              |
  |---------->|---------->| Validate   |              |
  |           |           | JWT        |              |
  |           |           |---------->| Check Stock   |
  |           |           |           |------------>|
  |           |           |           | Stock OK   |
  |           |           |           |<-----------|
  |           |           |           | Reduce Stock|
  |           |           |           |------------>|
  |           |           |           | Done       |
  |           |           |           |<-----------|
  |           |           | Save Order|              |
  |           |<----------|<---------|              |
  |           | Order OK  |            |              |
  |<----------|           |            |              |
  |           |           |            |              |
```

## Troubleshooting

### Keycloak startup issues

```bash
# Check Keycloak logs
docker-compose logs keycloak

# Verify database is healthy
docker-compose ps keycloak-db

# Check database connection
docker-compose logs keycloak-db
```

### Security scan failures

```bash
# Check Trivy scan results
cat trivy-reports/service-name-image.json

# Check SonarQube quality gates
# Access http://localhost:9000 and review project quality gates

# Check dependency-check results
cat target/dependency-check-report.html

# Review Jenkins logs for scan execution details
```

### Service connectivity issues

```bash
# Test service health endpoints
curl -s http://localhost:8090/actuator/health | jq

# Check container logs
docker-compose logs <service-name>

# Verify all containers are running
docker-compose ps

# Inspect specific container
docker inspect <container-name>

# Check network connectivity between containers
docker-compose exec <service> ping <other-service>
```

### Database connection issues

```bash
# Check database container status
docker-compose logs product-db
docker-compose logs order-db

# Test database connectivity
docker-compose exec product-service \
  curl -v postgresql://product_user@product-db:5432/productdb
```

### JWT token validation errors

```bash
# Check Keycloak realm configuration
# Access http://localhost:8180/admin/

# Verify token format in API calls
curl -H "Authorization: Bearer <token>" http://localhost:8090/api/products

# Check API Gateway logs for token validation details
docker-compose logs api-gateway | grep -i "jwt\|token"
```