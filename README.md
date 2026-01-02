# Microservices E-Commerce Platform

## Architecture de l'Application

Cette application est une plateforme e-commerce basée sur une architecture microservices sécurisée.

### Composants

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                                │
│                           http://localhost:3000                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ OAuth2/OIDC
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              KEYCLOAK                                        │
│                           http://localhost:8180                              │
│                    (Authentification & Autorisation)                         │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ JWT Token
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY                                        │
│                        http://localhost:8090                                 │
│              (Routage, Validation JWT, CORS, Logging)                        │
└─────────────────────────────────────────────────────────────────────────────┘
                           │                    │
              ┌────────────┴────────────────────┴────────────┐
              │                                               │
              ▼                                               ▼
┌─────────────────────────────┐           ┌─────────────────────────────┐
│    PRODUCT SERVICE          │           │      ORDER SERVICE          │
│    http://localhost:8081    │◄─────────►│    http://localhost:8082    │
│    (Spring Boot + PostgreSQL)│  REST    │    (Spring Boot + PostgreSQL)│
└─────────────────────────────┘           └─────────────────────────────┘
              │                                               │
              ▼                                               ▼
┌─────────────────────────────┐           ┌─────────────────────────────┐
│      PostgreSQL             │           │        PostgreSQL           │
│      (product-db)           │           │        (order-db)           │
└─────────────────────────────┘           └─────────────────────────────┘
```

## Prérequis

- Docker & Docker Compose
- Java 17+ (pour développement local)
- Node.js 18+ (pour développement local)
- Maven 3.8+

## Démarrage Rapide

### 1. Lancer tous les services

```bash
# Construire et démarrer tous les conteneurs
docker compose up --build -d

# Ou utiliser le script
chmod +x scripts/start.sh
./scripts/start.sh
```

### 2. Vérifier le statut

```bash
docker-compose ps
```

### 3. Accéder aux applications

| Service | URL | Credentials |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | - |
| Keycloak Admin | http://localhost:8080 | admin / admin |
| API Gateway | http://localhost:8090 | - |
| SonarQube | http://localhost:9000 | admin / admin |

### Utilisateurs de test

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | ADMIN |
| client1 | client123 | CLIENT |
| client2 | client123 | CLIENT |

## Structure du Projet

```
project/
├── api-gateway/          # Spring Cloud Gateway
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── product-service/      # Microservice Produits
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── order-service/        # Microservice Commandes
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── frontend/             # Application React
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── keycloak/
│   └── realm-config.json # Configuration du realm
├── scripts/
│   ├── start.sh
│   └── security-scan.sh
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Product Service (via API Gateway)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| GET | /api/products | ADMIN, CLIENT | Liste tous les produits |
| GET | /api/products/{id} | ADMIN, CLIENT | Détail d'un produit |
| POST | /api/products | ADMIN | Créer un produit |
| PUT | /api/products/{id} | ADMIN | Modifier un produit |
| DELETE | /api/products/{id} | ADMIN | Supprimer un produit |

### Order Service (via API Gateway)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | /api/orders | CLIENT | Créer une commande |
| GET | /api/orders/my-orders | CLIENT | Mes commandes |
| GET | /api/orders | ADMIN | Toutes les commandes |
| GET | /api/orders/{id} | ADMIN | Détail d'une commande |
| PATCH | /api/orders/{id}/status | ADMIN | Modifier le statut |

## Sécurité

### Authentification OAuth2/OIDC
- Keycloak comme serveur d'autorisation
- Tokens JWT pour l'authentification
- PKCE pour le frontend

### Autorisation basée sur les rôles
- **ADMIN**: Gestion complète des produits et commandes
- **CLIENT**: Consultation produits, création/consultation de ses commandes

### Sécurité des APIs
- Validation JWT au niveau de l'API Gateway
- Validation JWT au niveau de chaque microservice
- CORS configuré pour le frontend
- Headers de sécurité HTTP

## DevSecOps

### Analyse de Sécurité

```bash
# Lancer les scans de sécurité
chmod +x scripts/security-scan.sh
./scripts/security-scan.sh
```

### Outils intégrés
- **SonarQube**: Analyse statique du code
- **OWASP Dependency-Check**: Scan des dépendances
- **Trivy**: Scan des images Docker
- **NPM Audit**: Audit des dépendances frontend

### SonarQube

1. Accéder à http://localhost:9000
2. Se connecter avec admin/admin
3. Changer le mot de passe
4. Lancer l'analyse Maven:
```bash
cd product-service
mvn sonar:sonar -Dsonar.host.url=http://localhost:9000
```

## Logs et Monitoring

### Consulter les logs

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f api-gateway
docker-compose logs -f product-service
docker-compose logs -f order-service
```

### Health Checks

- API Gateway: http://localhost:8090/actuator/health
- Product Service: http://localhost:8081/actuator/health (interne)
- Order Service: http://localhost:8082/actuator/health (interne)

## Développement Local

### Product Service

```bash
cd product-service
mvn spring-boot:run
```

### Order Service

```bash
cd order-service
mvn spring-boot:run
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Tests

### Backend

```bash
cd product-service
mvn test

cd order-service
mvn test
```

### Frontend

```bash
cd frontend
npm test
```

## Arrêt des Services

```bash
# Arrêter tous les conteneurs
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

## Diagramme de Séquence - Création de Commande

```
┌─────────┐     ┌──────────┐     ┌───────────┐     ┌─────────────┐     ┌─────────────┐
│ Client  │     │ Frontend │     │API Gateway│     │Order Service│     │Product Svc  │
└────┬────┘     └────┬─────┘     └─────┬─────┘     └──────┬──────┘     └──────┬──────┘
     │               │                  │                  │                   │
     │ Login         │                  │                  │                   │
     │──────────────►│                  │                  │                   │
     │               │ Redirect to      │                  │                   │
     │               │ Keycloak         │                  │                   │
     │◄──────────────│                  │                  │                   │
     │               │                  │                  │                   │
     │ Authenticate  │                  │                  │                   │
     │──────────────►│                  │                  │                   │
     │ JWT Token     │                  │                  │                   │
     │◄──────────────│                  │                  │                   │
     │               │                  │                  │                   │
     │ Add to cart   │                  │                  │                   │
     │──────────────►│                  │                  │                   │
     │               │                  │                  │                   │
     │ Place Order   │                  │                  │                   │
     │──────────────►│ POST /api/orders │                  │                   │
     │               │ + JWT Token      │                  │                   │
     │               │─────────────────►│ Validate JWT     │                   │
     │               │                  │─────────────────►│                   │
     │               │                  │                  │ Check Stock       │
     │               │                  │                  │──────────────────►│
     │               │                  │                  │ Stock OK          │
     │               │                  │                  │◄──────────────────│
     │               │                  │                  │ Decrease Stock    │
     │               │                  │                  │──────────────────►│
     │               │                  │                  │ Done              │
     │               │                  │                  │◄──────────────────│
     │               │                  │                  │ Save Order        │
     │               │                  │◄─────────────────│                   │
     │               │ Order Created    │                  │                   │
     │               │◄─────────────────│                  │                   │
     │ Confirmation  │                  │                  │                   │
     │◄──────────────│                  │                  │                   │
     │               │                  │                  │                   │
```

## Troubleshooting

### Keycloak ne démarre pas
```bash
docker-compose logs keycloak
# Vérifier que keycloak-db est healthy
docker-compose ps keycloak-db
```

### Erreur 401 Unauthorized
- Vérifier que le token JWT n'est pas expiré
- Vérifier la configuration du realm Keycloak
- Vérifier les URLs du issuer dans les configurations

### Services ne communiquent pas
- Vérifier que tous les services sont sur le même réseau Docker
- Vérifier les health checks avec `docker-compose ps`

## License

Ce projet est développé dans le cadre d'un mini-projet académique.
