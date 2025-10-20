terraform {
  cloud {
    organization = "forum-anonymous"
    
    workspaces {
      name = "anonymous-forum-2"
    }
  }
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configure the AWS provider
provider "aws" {
  region = "eu-central-1"
}

# Variables for GitHub Container Registry
variable "github_username" {
  description = "Your GitHub username for GHCR"
  type        = string
  default     = "0xtimberj"
}

variable "github_token" {
  description = "GitHub Personal Access Token for GHCR login"
  type        = string
  sensitive   = true
}

# Generate SSH key
resource "tls_private_key" "forum_key" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Create key pair
resource "aws_key_pair" "forum_key_pair" {
  key_name   = "forum-key"
  public_key = tls_private_key.forum_key.public_key_openssh
}

# Store private key locally
resource "local_file" "private_key" {
  content         = tls_private_key.forum_key.private_key_pem
  filename        = "${path.module}/forum-key.pem"
  file_permission = "0600"
}

# Create a security group for EC2
resource "aws_security_group" "forum_sg" {
  name        = "forum-sg"
  description = "Security group for forum instances"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] 
  }

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "forum-sg"
  }
}

# Create Postgres instance
resource "aws_instance" "postgres_instance" {
  ami                    = "ami-0bcffb19cf767c618" # Amazon Linux 2 AMI for eu-central-1
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.forum_sg.id]
  key_name               = aws_key_pair.forum_key_pair.key_name
  associate_public_ip_address = true

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker
    systemctl start docker
    systemctl enable docker
    usermod -a -G docker ec2-user
    
    # Install Docker Compose v2
    mkdir -p /home/ec2-user/.docker/cli-plugins/
    curl -SL https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-linux-x86_64 -o /home/ec2-user/.docker/cli-plugins/docker-compose
    chmod +x /home/ec2-user/.docker/cli-plugins/docker-compose
    ln -s /home/ec2-user/.docker/cli-plugins/docker-compose /usr/bin/docker-compose
    
    # Login to GitHub Container Registry
    echo "${var.github_token}" | docker login ghcr.io -u ${var.github_username} --password-stdin
    
    # Create docker-compose.yml for Postgres
    cat > /home/ec2-user/docker-compose.yml << 'COMPOSE_EOF'
services:
  postgres:
    image: postgres:latest
    restart: always
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=unVraiMotDePasseUltraSolide
      - POSTGRES_DB=forum
    volumes:
      - postgres-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - internal
volumes:
  postgres-data:
networks:
  internal:
    driver: bridge
COMPOSE_EOF
    
    cd /home/ec2-user
    docker-compose up -d postgres
    EOF

  tags = {
    Name = "postgres-instance"
  }
}

# Create API instance
resource "aws_instance" "api_instance" {
  ami                    = "ami-0bcffb19cf767c618" # Amazon Linux 2 AMI for eu-central-1
  instance_type          = "t2.micro"
  vpc_security_group_ids = [aws_security_group.forum_sg.id]
  key_name               = aws_key_pair.forum_key_pair.key_name
  associate_public_ip_address = true

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker aws-cli
    systemctl start docker
    systemctl enable docker
    usermod -a -G docker ec2-user
    
    # Install Docker Compose v2
    mkdir -p /home/ec2-user/.docker/cli-plugins/
    curl -SL https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-linux-x86_64 -o /home/ec2-user/.docker/cli-plugins/docker-compose
    chmod +x /home/ec2-user/.docker/cli-plugins/docker-compose
    ln -s /home/ec2-user/.docker/cli-plugins/docker-compose /usr/bin/docker-compose
    
    # Login to GitHub Container Registry
    echo "${var.github_token}" | docker login ghcr.io -u ${var.github_username} --password-stdin
    
    # Create docker-compose.yml for API
    cat > /home/ec2-user/docker-compose.yml << 'COMPOSE_EOF'
services:
  api:
    image: ghcr.io/${var.github_username}/anonymous-forum-2/api:latest
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:unVraiMotDePasseUltraSolide@${aws_instance.postgres_instance.private_ip}:5432/forum
    networks:
      - internal
    labels:
      - "com.centurylinklabs.watchtower.enable=true"
  
  watchtower:
    image: containrrr/watchtower
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /home/ec2-user/.docker/config.json:/config.json
    environment:
      - WATCHTOWER_POLL_INTERVAL=60
      - WATCHTOWER_CLEANUP=true
      - WATCHTOWER_LABEL_ENABLE=true
    command: --interval 60
    networks:
      - internal
networks:
  internal:
    driver: bridge
COMPOSE_EOF
    
    cd /home/ec2-user
    docker-compose up -d
    EOF

  tags = {
    Name = "api-instance"
  }
}

# Output public IPs
output "postgres_public_ip" {
  value = aws_instance.postgres_instance.public_ip
  description = "Public IP of the Postgres instance"
}

output "postgres_private_ip" {
  value = aws_instance.postgres_instance.private_ip
  description = "Private IP of the Postgres instance"
}

output "api_public_ip" {
  value = aws_instance.api_instance.public_ip
  description = "Public IP of the API instance"
}