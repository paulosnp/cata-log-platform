-- =====================================================
-- V1: Infraestrutura — Extensões PostgreSQL
-- Requisito: RNF-DB01 (Configuração PostgreSQL)
-- =====================================================
-- Nota: O banco 'catalog_db' é criado pelo Docker Compose.
-- Este script configura extensões úteis para a aplicação.

-- UUID: geração de identificadores universais (uso futuro)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- pg_trgm: busca por similaridade textual (ex: buscar produtos por nome aproximado)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
