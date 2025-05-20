# Cloud IDE - Real-time Collaborative Development Environment

## Overview
A full-stack web application providing an isolated cloud-based development environment with real-time collaboration features, allowing multiple users to code together seamlessly.

## Features

### Development Environment
- **Containerized Workspaces**
  - Isolated Docker containers for each project
  - Pre-configured development environments
  - Supports multiple programming languages (C, C++, Node.js)
  - Dedicated terminal access for each user

### Real-time Collaboration
- Multiple users can work simultaneously
- Real-time code editing with cursor tracking
- Live file system updates
- Individual terminal instances for each collaborator

### Project Management
- Create and manage multiple projects
- Share projects with specific users
- Track project history and last accessed time
- JWT-based authentication for secure access

### Editor Features
- Monaco Code Editor integration
- Syntax highlighting
- File system navigation
- Integrated terminal
- Real-time code execution

## Tech Stack

### Frontend
- React.js
- TailwindCSS
- Socket.IO Client
- Monaco Editor
- XTerm.js
- React Router DOM

### Backend
- Express.js
- Socket.IO
- MongoDB/Mongoose
- Docker
- JWT
- Ngrok

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Docker
- MongoDB
- Git

### Installation Steps

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/cloud-ide.git
cd cloud-ide
```

2. **Setup Environment Variables**
```bash
# In server directory
cp .env.example .env
```

Required variables:
```
MONGODB_CONNECTION_STRING=
JWT_SECRET=
DOCKER_HOST=
NGROK_AUTH_TOKEN=
```

3. **Install Dependencies**
```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

4. **Build Docker Image**
```bash
cd Docker
docker build -t cloud-ide-env .
```

5. **Start the Application**
```bash
# Start backend
cd server
npm run dev

# Start frontend (in new terminal)
cd client
npm run dev
```

## Known Limitations
- Not deployed due to infrastructure costs
- Limited to C, C++, and Node.js environments
- Requires local Docker installation for development

## Future Enhancements
- Additional programming language support
- Integrated debugging capabilities
- Custom themes
- File upload/download functionality
- Video/audio collaboration features

## Contributing
This project is currently in development and not open for contributions.

<!-- ## License
This project is private and not licensed for public use. -->