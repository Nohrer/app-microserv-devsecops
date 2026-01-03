pipeline{
    agent any
    environment {
       SCANNER_HOME = tool "sonnarScanner"
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
                                -Dsonar.dependencyCheck.xmlReportPath=target/dependency-check-report.xml
                                """
                            }
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
                    sh 'pwd'
                    sh 'npm ci'
                    sh 'npm audit --audit-level=high --production || true'
                    withSonarQubeEnv('sonar-server') {
                        sh """
                        ${SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectKey=frontend \
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

