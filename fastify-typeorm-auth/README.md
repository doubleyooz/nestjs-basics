## Project Overview

This API project aims to implement robust user authentication leveraging a modern Node.js stack. The main objectives are security, scalability, and maintainability.

## Tech Stack

- **NestJS** with Fastify adapter for high performance HTTP server
- **TypeORM** as ORM
- **PostgreSQL** as the database

## Core Features

- User registration & authentication (JWT-based)
- API documentation with Swagger
- Unit and integration testing
- Role-based access control (planned)
- Secure password storage (bcrypt)
- Environment-based configuration management

## Main Packages Used

- `@nestjs/core`, `@nestjs/platform-fastify` (NestJS & Fastify integration)
- `@nestjs/swagger` (OpenAPI/Swagger docs)
- `typeorm` (ORM)
- `pg` (PostgreSQL driver)
- `@nestjs/jwt`, `passport`, `passport-jwt` (Authentication)
- `bcrypt` (Password hashing)
- `jest`, `@nestjs/testing` (Testing)

## Roadmap

- [x] Set up project scaffolding with NestJS and Fastify
- [x] Configure PostgreSQL database and TypeORM entities
- [x] Implement user registration & login endpoints
- [x] Add JWT authentication middleware
- [x] Set up Swagger documentation
- [ ] Implement role-based access control
- [ ] Expand integration and unit test coverage
- [ ] Add password reset and email verification
- [ ] Containerize with Docker for deployment

---
