# Project Instructions

## Project Overview

This repository contains the company website, content platform, search, and administration system.

## Architecture

Request flow:

Browser → Next.js → Spring Boot REST API

Backend data services:

- PostgreSQL is the primary database and source of truth.
- Redis is used only for caching.
- Elasticsearch is used only for full-text search.
- Elasticsearch indexes must be rebuildable from PostgreSQL.

## Technology Stack

- Frontend: Next.js, React, TypeScript, Node.js 24 LTS
- Backend: Java 25 LTS, Spring Boot, Maven
- Infrastructure: PostgreSQL, Redis, Elasticsearch, Docker Compose

## Development Rules

- Keep the application as a modular monolith unless requirements change.
- Do not introduce microservices, Kafka, RabbitMQ, Kubernetes, or MongoDB without an explicit architectural decision.
- Verify Spring Boot, Spring Data Elasticsearch, and Elasticsearch version compatibility before upgrades.
- Use REST APIs between the frontend and backend.
- Use Maven Wrapper for consistent backend builds.
- Keep secrets out of Git.
- Store real local values in `.env`.
- Keep only safe example values in `.env.example`.
- Prefer project-level configuration so all developers use the same environment.

## Backend Request Flow

Controller → Service → Repository → PostgreSQL

Controllers handle HTTP requests.
Services contain business logic.
Repositories handle database access.
DTOs define API input and output.
