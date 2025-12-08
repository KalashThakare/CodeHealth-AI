pipeline {
    agent any

    environment {
        APP_DIR = "/root/CodeHealth-AI-main"
    }

    stages {
        stage('Pull Latest Code') {
            steps {
                git branch: 'main', url: 'https://github.com/friend-repo/CodeHealth-AI-main.git'
            }
        }

        stage('Sync to Deploy Folder') {
            steps {
                sh """
                rsync -av --delete ./ $APP_DIR/
                """
            }
        }

        stage('Build & Run Docker') {
            steps {
                sh """
                cd $APP_DIR
                docker-compose down
                docker-compose up -d --build
                """
            }
        }
    }

    post {
        success {
            echo "Deployment successful!"
        }
        failure {
            echo "Deployment failed!"
        }
    }
}
