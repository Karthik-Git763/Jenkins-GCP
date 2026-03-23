pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = '2023bcs0058karthikdasp'
        DOCKER_CREDS_ID = 'dockerhub-credentials'
        
        // Image names following the format: username/rollnumber_service
        FRONTEND_IMAGE = "${DOCKER_HUB_USER}/2023BCS0058_frontend"
        BACKEND_IMAGE = "${DOCKER_HUB_USER}/2023BCS0058_backend"
        TAG = "${env.BUILD_NUMBER}"

        // GCP VM Details
        GCP_VM_IP = '35.239.165.237'
        GCP_USER = 'karthik'
        SSH_CREDENTIALS = 'gcp-ssh-key'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        script {
                            echo "Building Frontend Docker Image..."
                            sh """
                            docker build -t ${FRONTEND_IMAGE}:${TAG} \
                                         -t ${FRONTEND_IMAGE}:latest \
                                         ./frontend
                            """
                        }
                    }
                }
                stage('Build Backend') {
                    steps {
                        script {
                            echo "Building Backend Docker Image..."
                            sh """
                            docker build -t ${BACKEND_IMAGE}:${TAG} \
                                         -t ${BACKEND_IMAGE}:latest \
                                         ./backend
                            """
                        }
                    }
                }
            }
        }

        stage('Test Docker Images') {
            steps {
                script {
                    echo "Testing containers..."
                    
                    // Create a test network
                    sh "docker network create test-network-${TAG} || true"
                    
                    // Start backend container
                    sh """
                    docker run -d --name backend-test-${TAG} \
                        --network test-network-${TAG} \
                        ${BACKEND_IMAGE}:${TAG}
                    """
                    
                    // Start frontend container
                    sh """
                    docker run -d --name frontend-test-${TAG} \
                        --network test-network-${TAG} \
                        -p 8085:80 \
                        ${FRONTEND_IMAGE}:${TAG}
                    """
                    
                    // Wait for containers to start
                    sh "sleep 10"
                    
                    // Show running containers
                    sh "docker ps"
                    
                    // Cleanup test containers
                    sh """
                    docker stop frontend-test-${TAG} backend-test-${TAG} || true
                    docker rm frontend-test-${TAG} backend-test-${TAG} || true
                    docker network rm test-network-${TAG} || true
                    """
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh """
                        echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin

                        # Push Frontend images
                        docker push ${FRONTEND_IMAGE}:${TAG}
                        docker push ${FRONTEND_IMAGE}:latest

                        # Push Backend images
                        docker push ${BACKEND_IMAGE}:${TAG}
                        docker push ${BACKEND_IMAGE}:latest

                        docker logout
                        """
                    }
                }
            }
        }

        stage('Deploy to GCP VM') {
            steps {
                sshagent (credentials: [env.SSH_CREDENTIALS]) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ${GCP_USER}@${GCP_VM_IP} << 'EOF'

echo "Pulling latest Docker images..."
docker pull ${FRONTEND_IMAGE}:latest
docker pull ${BACKEND_IMAGE}:latest

echo "Stopping existing containers..."
docker stop frontend backend || true
docker rm frontend backend || true
docker network rm app-network || true

echo "Creating network..."
docker network create app-network || true

echo "Starting backend container..."
docker run -d --name backend \
    --network app-network \
    -p 5000:5000 \
    --restart unless-stopped \
    ${BACKEND_IMAGE}:latest

echo "Starting frontend container..."
docker run -d --name frontend \
    --network app-network \
    -p 80:80 \
    --restart unless-stopped \
    ${FRONTEND_IMAGE}:latest

echo "Deployment completed successfully!"
docker ps

EOF
                    """
                }
            }
        }

    }

    post {
        always {
            echo "Pipeline finished."
            cleanWs()

            // Cleanup local images
            sh "docker rmi ${FRONTEND_IMAGE}:${TAG} || true"
            sh "docker rmi ${FRONTEND_IMAGE}:latest || true"
            sh "docker rmi ${BACKEND_IMAGE}:${TAG} || true"
            sh "docker rmi ${BACKEND_IMAGE}:latest || true"
        }

        success {
            echo "Build, Push and Deployment Successful!"
            echo "Application available at: http://${GCP_VM_IP}"
        }

        failure {
            echo "Pipeline Failed."
        }
    }
}
