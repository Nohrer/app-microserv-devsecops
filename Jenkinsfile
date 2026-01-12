pipeline{
    agent any
    environment {
       SCANNER_HOME = tool "sonnarScanner"
         COMPOSE_PROJECT_NAME = 'ci'
    }

    stages {
        stage('checkout'){
            steps{
                checkout scm
            }
        }
        stage("Build"){
            steps{
                sh 'echo "Building the docker images..."'
                sh 'docker compose build'

            }
        }
        stage('Trivy Image Scan'){
            steps{
                script {
                    def services = ['api-gateway', 'product-service', 'order-service', 'frontend']

                    sh 'mkdir -p trivy-reports'

                    services.each { service ->
                        echo "Trivy image scan for ${service}..."
                        sh """
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v \$HOME/.cache/trivy:/root/.cache/ \
                          -v \$PWD/trivy-reports:/trivy-reports \
                          aquasec/trivy:latest image --no-progress --ignore-unfixed \
                          --exit-code 1 --severity HIGH,CRITICAL \
                          --timeout 15m \
                          --format json --output /trivy-reports/${service}-image.json \
                          \$COMPOSE_PROJECT_NAME-${service}
                        """
                    }

                    archiveArtifacts artifacts: 'trivy-reports/*.json', fingerprint: true
                }
            }
        }
        stage("Sonnar Scan & Dependency Check"){
            steps{
                script {
                    def services = ['api-gateway', 'product-service', 'order-service']
                    
                    services.each { service ->
                        echo "Scanning ${service} with SonarQube..."
                        
                        dir(service) {
                            withSonarQubeEnv('sonar-server') {
                                sh """
                                mvn clean verify \
                                org.owasp:dependency-check-maven:check \
                                sonar:sonar \
                                -Dsonar.projectKey=${service} \
                                -Dsonar.dependencyCheck.jsonReportPath=target/dependency-check-report.json \
                                -Dsonar.dependencyCheck.htmlReportPath=target/dependency-check-report.html
                                """
                            }
                            
                            // Publish to Jenkins dashboard
                            dependencyCheckPublisher pattern: 'target/dependency-check-report.xml'
                        }
                        echo "Completed SonarQube scan for ${service}."
                    }
                }
            }
        }
        stage("Front end Sonnar Scan & Dependency Check"){
            steps{
                script {
                    echo "Scanning frontend with SonarQube..."
            
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm audit --audit-level=high --omit=dev || true'
                    
                    dependencyCheck additionalArguments: '''
                        --project frontend
                        --scan .
                        --format JSON
                        --format HTML
                        --format XML
                        --out .
                    ''', nvdApiKeyCredentialsId: 'nvd-api-key', odcInstallation: 'dependecy-check'
                    
                    dependencyCheckPublisher pattern: 'dependency-check-report.xml'
                    
                    withSonarQubeEnv('sonar-server') {
                        sh """
                        ${SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectKey=frontend \
                            -Dsonar.dependencyCheck.jsonReportPath=dependency-check-report.json \
                            -Dsonar.dependencyCheck.htmlReportPath=dependency-check-report.html
                        """
                    }
                }
            }
            }
        }
        stage('Quality Gate') {
            steps {
                // This pauses the pipeline until SonarQube finishes processing
                // If the Quality Gate fails (e.g., bugs found), the pipeline aborts here.
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

    }
    post {
        always {
            cleanWs()
        }
        failure {
            echo 'Pipeline failed. Please check SonarQube report.'
        }
    }
}

