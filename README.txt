# Pipeline Migration System

A flexible web application for migrating data between various systems using a modular adapter framework.

## Overview

The Pipeline Migration System allows you to create data pipelines that connect source systems (like ALM) to destination systems (like Jira) with configurable adapters. It provides a modern web interface for managing pipelines, monitoring jobs, and reviewing execution logs.

## Features

- **Dynamic Adapter System**: Easily connect to different source and destination systems
- **Pipeline Management**: Create, configure, and monitor data pipelines
- **Job Execution**: Run pipelines manually or on schedule
- **Detailed Logging**: Comprehensive logging and error reporting 
- **Asynchronous Processing**: Background job execution with Celery
- **Responsive UI**: Modern React-based interface with Chakra UI

## Technology Stack

### Backend
- **Django & Django REST Framework**: Robust Python web framework
- **PostgreSQL**: Relational database for production
- **Celery & Redis**: Asynchronous task processing
- **Docker**: Containerization and deployment

### Frontend
- **React.js**: Frontend UI library
- **Chakra UI**: Component library for consistent styling
- **React Query**: Data fetching and state management
- **React Router**: Client-side routing

## Architecture

The system follows a modular architecture:

1. **Core**: Central pipeline and job management
2. **Sources**: Adapters for extracting data from various systems
3. **Destinations**: Adapters for uploading data to target systems
4. **Jobs**: Asynchronous execution and monitoring

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js (for frontend development)
- Python 3.9+ (for backend development)

### Development Setup

1. Clone the repository
   ```
   git clone https://github.com/yourusername/pipeline-migration.git
   cd pipeline-migration
   ```

2. Start the development environment
   ```
   docker-compose up -d
   ```

3. Run migrations
   ```
   docker-compose exec backend python manage.py migrate
   ```

4. Create a superuser
   ```
   docker-compose exec backend python manage.py createsuperuser
   ```

5. Access the application
   - Frontend: http://localhost:3000
   - API: http://localhost:8000/api/
   - Admin: http://localhost:8000/admin/

### Production Deployment

For production deployment, consider:

1. Using environment-specific settings
2. Setting up proper SSL
3. Using a production-ready database setup
4. Implementing proper authentication and authorization
5. Configuring Celery for production use

## Extending the System

### Adding New Source Adapters

1. Create a new adapter in the `sources/adapters/` directory
2. Implement the required interface methods
3. Register the adapter in the adapter registry

### Adding New Destination Adapters

1. Create a new adapter in the `destinations/adapters/` directory
2. Implement the required interface methods
3. Register the adapter in the adapter registry


super user
username: superdivya
password:password@123

user
username: userdivya
password:password@234