pipeline {
    agent any

    // Environment variables
    environment {
        DOCKER_IMAGE = '2023bcs0058'
        DOCKER_CREDS_ID = 'dockerhub-credentials'
        DOCKER_HUB_USER = '2023bcs0058karthikdasp'
        TAG = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout the SCM automatically
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    echo "Building Docker Image: ${DOCKER_HUB_USER}/${DOCKER_IMAGE}:${TAG}..."
                    sh "docker build -t ${DOCKER_HUB_USER}/${DOCKER_IMAGE}:${TAG} -t ${DOCKER_HUB_USER}/${DOCKER_IMAGE}:latest ."
                }
            }
        }

        stage('Test Docker Image') {
            steps {
                script {
                    echo "Testing if the container runs..."
                    // Clean up any leftover container from previous builds
                    sh "docker rm -f temp-test-${TAG} || true"
                    // Start the container and verify it runs
                    sh """
                        docker run -d --name temp-test-${TAG} -p 5000:5000 ${DOCKER_HUB_USER}/${DOCKER_IMAGE}:${TAG}
                        sleep 5
                        docker ps | grep temp-test-${TAG}
                    """
                    // Clean up test container
                    sh "docker rm -f temp-test-${TAG} || true"
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    echo "Pushing Docker Image to Docker Hub..."

                    withCredentials([usernamePassword(credentialsId: env.DOCKER_CREDS_ID, usernameVariable: 'DOCKER_HUB_USER', passwordVariable: 'DOCKERHUB_PASS')]) {
                        sh """
                            echo \$DOCKERHUB_PASS | docker login -u ${DOCKER_HUB_USER} --password-stdin
                            docker push ${DOCKER_HUB_USER}/${DOCKER_IMAGE}:${TAG}
                            docker push ${DOCKER_HUB_USER}/${DOCKER_IMAGE}:latest
                            docker logout
                        """
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Pipeline finished."
            // Clean up workspace
            cleanWs()
            // Clean up local images
            sh "docker rmi ${DOCKER_HUB_USER}/${DOCKER_IMAGE}:${TAG} || true"
            sh "docker rmi ${DOCKER_HUB_USER}/${DOCKER_IMAGE}:latest || true"
        }
        success {
            echo "Build and Push was successful!"
        }
        failure {
            echo "Build or Push failed."
        }
    }
}
