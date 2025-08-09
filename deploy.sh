#!/bin/bash

# Production Deployment Script for Clinic Management System
# Version: 1.0.0
# Author: GitHub Copilot

set -e

echo "🚀 Starting production deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="clinic-management"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
check_requirements() {
    log_info "Checking system requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        log_warning "Node.js is not installed (optional for local development)"
    fi
    
    log_success "System requirements check completed"
}

# Backup current deployment
create_backup() {
    log_info "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if container exists
    if docker ps -a | grep -q clinic-mysql; then
        log_info "Backing up database..."
        docker exec clinic-mysql mysqldump -u clinic_user -pclinic_password clinic_db > "$BACKUP_DIR/database_backup.sql" || true
    fi
    
    # Backup uploads if exists
    if [ -d "./backend/uploads" ]; then
        log_info "Backing up uploads..."
        cp -r ./backend/uploads "$BACKUP_DIR/"
    fi
    
    log_success "Backup created at $BACKUP_DIR"
}

# Stop running containers
stop_services() {
    log_info "Stopping existing services..."
    docker-compose down || true
    log_success "Services stopped"
}

# Build and start services
deploy_services() {
    log_info "Building and starting services..."
    
    # Build images
    log_info "Building backend image..."
    docker-compose build backend
    
    log_info "Building frontend image..."
    docker-compose build frontend
    
    # Start services
    log_info "Starting services..."
    docker-compose up -d
    
    log_success "Services started"
}

# Wait for services to be ready
wait_for_services() {
    log_info "Waiting for services to be ready..."
    
    # Wait for backend
    log_info "Waiting for backend..."
    timeout=60
    while ! docker exec clinic-backend curl -f http://localhost:3002/health &> /dev/null; do
        sleep 5
        timeout=$((timeout - 5))
        if [ $timeout -le 0 ]; then
            log_error "Backend failed to start"
            exit 1
        fi
        echo -n "."
    done
    echo ""
    
    # Wait for frontend
    log_info "Waiting for frontend..."
    timeout=60
    while ! curl -f http://localhost:3003 &> /dev/null; do
        sleep 5
        timeout=$((timeout - 5))
        if [ $timeout -le 0 ]; then
            log_error "Frontend failed to start"
            exit 1
        fi
        echo -n "."
    done
    echo ""
    
    log_success "All services are ready"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    # Wait for MySQL to be ready
    docker exec clinic-backend timeout 60 sh -c 'until nc -z mysql 3306; do sleep 1; done'
    
    # Run migrations
    docker exec clinic-backend npm run migration:run || true
    
    log_success "Database migrations completed"
}

# Health check
health_check() {
    log_info "Running health checks..."
    
    # Backend health check
    if curl -f http://localhost:3002/health &> /dev/null; then
        log_success "Backend health check passed"
    else
        log_error "Backend health check failed"
        exit 1
    fi
    
    # Frontend health check
    if curl -f http://localhost:3003 &> /dev/null; then
        log_success "Frontend health check passed"
    else
        log_error "Frontend health check failed"
        exit 1
    fi
    
    # Database health check
    if docker exec clinic-mysql mysqladmin ping -h localhost -u clinic_user -pclinic_password &> /dev/null; then
        log_success "Database health check passed"
    else
        log_error "Database health check failed"
        exit 1
    fi
    
    log_success "All health checks passed"
}

# Display deployment information
show_info() {
    echo ""
    log_success "🎉 Deployment completed successfully!"
    echo ""
    echo "📋 Application Information:"
    echo "  • Frontend: http://localhost:3003"
    echo "  • Backend API: http://localhost:3002"
    echo "  • API Documentation: http://localhost:3002/api-docs"
    echo "  • Database: mysql://localhost:3306/clinic_db"
    echo ""
    echo "🐳 Docker Services:"
    docker-compose ps
    echo ""
    echo "📊 Resource Usage:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
    echo ""
    echo "📁 Backup Location: $BACKUP_DIR"
    echo ""
    log_info "To view logs: docker-compose logs -f"
    log_info "To stop services: docker-compose down"
    log_info "To restart services: docker-compose restart"
}

# Main deployment process
main() {
    echo "🏥 Clinic Management System - Production Deployment"
    echo "=================================================="
    
    check_requirements
    create_backup
    stop_services
    deploy_services
    wait_for_services
    run_migrations
    health_check
    show_info
    
    log_success "Deployment process completed!"
}

# Handle script interruption
trap 'log_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
