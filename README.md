<p align="center">
  <img src="logo.svg" alt="Cata Log Logo" width="300"/>
</p>

<h1 align="center">Cata Log</h1>

<p align="center">
  <strong>Hub de Visibilidade e Letramento Digital para Microempreendedores da Cultura Pernambucana</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Em%20Desenvolvimento-brightgreen" alt="Status">
  <img src="https://img.shields.io/badge/Java-17+-orange?logo=openjdk" alt="Java">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.3.5-6DB33F?logo=springboot" alt="Spring Boot">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Flutter-Mobile-02569B?logo=flutter" alt="Flutter">
  <img src="https://img.shields.io/badge/Docker-Container-2496ED?logo=docker" alt="Docker">
</p>

<br>

## 📖 Sobre o Projeto

O **Cata Log** é um Marketplace Cultural (Hub) desenhado especificamente para abstrair a complexidade tecnológica e dar visibilidade aos artesãos e produtores culturais de Pernambuco.

A plataforma atua aliada a um processo de **letramento digital**, garantindo a autonomia desses empreendedores sem a complexidade operacional de um e-commerce tradicional.

> **Cata** (A Familiaridade) — Remete à palavra "Catálogo", termo que os microempreendedores já usam todos os dias.  
> **Log** (A Tecnologia) — Na área de sistemas, "Log" significa o registro histórico de eventos e dados. Representa o diferencial da plataforma: não é apenas uma vitrine, mas um sistema que registra, organiza e guarda o histórico de pedidos, estoque e métricas do lojista.

---

## 🎯 O Problema e a Solução

### O Problema
O avanço do comércio digital criou um novo padrão de consumo, porém, o setor de artesanato local — que possui enorme força cultural e econômica em Pernambuco (movimentando espaços como o Centro de Artesanato no Marco Zero e a Fenearte) — ainda encontra severas barreiras para se digitalizar. Mestres artesãos e pequenos produtores dependem quase exclusivamente de feiras físicas e canais informais (como o WhatsApp) para vender suas peças únicas, gerando desorganização operacional, dificuldade na gestão de peças exclusivas e perda de histórico de clientes.

### A Solução
Um Marketplace Cultural com **fricção zero** para o consumidor, integrando um catálogo online unificado ao fechamento de vendas consultivas de forma direta. O grande diferencial ocorre nas peças únicas já vendidas: o cliente aciona o botão **"Encomendar Obra Similar"**, abrindo um canal de negociação privado diretamente na plataforma.

---

## 🏗️ Arquitetura do Sistema

O ecossistema foi projetado com separação de responsabilidades (*Separation of Concerns*) dividido em três frentes de acesso:

| Frente | Público | Descrição |
|---|---|---|
| **🌐 Vitrine Digital (Web)** | Consumidor (B2C) | Catálogo unificado, público e responsivo. Filtros, carrinho de compras e checkout transparente com Mercado Pago e Melhor Envio integrados. Inclui o módulo de "Encomenda Personalizada". |
| **📱 Aplicativo Mobile** | Artesão (B2B) | Ferramenta de bolso exclusiva do criador. CRUD de produtos com câmera, dashboard financeiro, ativação de promoções e chat interno de negociação. |
| **🔒 Painel Super Admin** | Gestão Interna | Curadoria do marketplace, concessão de Selos de Verificação, gestão de categorias oficiais e acompanhamento dos Logs de Auditoria. |
| **⚙️ API RESTful** | Todos | Motor central que gerencia persistência, segurança (JWT) e regras de negócio. |

---

## 🏆 Diferencial Competitivo

1. **E-commerce Híbrido (Pronta Entrega + Negociação Consultiva)** — Diferente de e-commerces tradicionais, o Cata Log lida com obras exclusivas. Se a peça foi vendida, o sistema aciona o "Motor de Encomendas" para negociação direta via chat seguro.
2. **Usabilidade Focada no Ateliê** — O artesão usa o aplicativo móvel para cadastrar a obra na hora em que fica pronta, tirando uma foto e publicando na vitrine unificada sem interromper seu processo criativo.
3. **Preservação Cultural (ODS 8 e 10)** — O projeto inclui um ecossistema de letramento digital, democratizando a tecnologia e permitindo que a cultura regional alcance novos públicos com autonomia econômica.

---

## 📊 Análise de Mercado

| Categoria | Exemplos | Pontos Fortes | Pontos Fracos |
|:---|:---|:---|:---|
| **Informais** | WhatsApp, Cadernos | Sem barreira de aprendizado; adesão popular. | Desorganização; perda de histórico. |
| **Diretos** | Kyte, OlaClick, Goomer | Foco em mobilidade e facilidade. | Genéricos; sem letramento digital; mensalidades altas. |
| **Indiretos** | Shopify, Nuvemshop | Altamente customizáveis; muitas integrações. | Barreira técnica intransponível; alto custo. |

---

## 🚀 Tecnologias Utilizadas

### Backend
* **Java 17+** — Linguagem principal
* **Spring Boot 3.3.5** — Web, Security, Data JPA, Validation
* **PostgreSQL 16** — Banco de dados relacional
* **Flyway** — Migrações versionadas do banco
* **Docker** — Conteinerização dos serviços

### Frontend Web
* **React** (Vite) — SPA para Vitrine e Painel Admin
* **Tailwind CSS / Bootstrap** — Estilização
* **React Router DOM / Axios** — Navegação e requisições HTTP

### Frontend Mobile
* **Flutter** — Aplicativo cross-platform (Android/iOS)
* **Dart** — Linguagem do Flutter

### Integrações Externas
* **Mercado Pago** — Checkout e Split Financeiro (divisão automática de lucros)
* **Melhor Envio** — Cotações automáticas de frete (PAC/Sedex)
* **JWT** — Autenticação e autorização segura

---

## 🌍 Impacto Social (ODS)

| ODS | Relação com o Projeto |
|---|---|
| **8 — Emprego Digno e Crescimento Econômico** | Promove a formalização, modernização e expansão das vendas de microempreendimentos locais. |
| **10 — Redução das Desigualdades** | Fornece infraestrutura tecnológica acessível, democratizando a inovação e reduzindo a desigualdade entre grandes varejistas e produtores periféricos. |

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos
* **Java 17+**
* **Docker** e **Docker Compose**
* **Git**

### 1. Clonar o repositório
```bash
git clone https://github.com/paulosnp/cata-log-platform
cd cata-log-platform
```

### 2. Subir o banco de dados (PostgreSQL via Docker)
```bash
docker compose up -d
```

### 3. Executar a API (Spring Boot)
```bash
cd catalog-api

# Linux / Mac
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

> 💡 O **Flyway** executa automaticamente as 10 migrações do banco na primeira inicialização, criando todas as 13 tabelas e inserindo os dados iniciais (admin e categorias).

---

## 📁 Estrutura do Projeto

```
cata-log-platform/
├── docker-compose.yml          # PostgreSQL 16 conteinerizado
├── README.md
├── logo.svg
└── catalog-api/                # API RESTful (Spring Boot)
    ├── pom.xml
    ├── mvnw / mvnw.cmd         # Maven Wrapper
    └── src/main/
        ├── java/br/com/catalog/api/
        │   └── CatalogApiApplication.java
        └── resources/
            ├── application.properties
            └── db/migration/   # 10 scripts Flyway (V1 a V10)
```

---

## 🎯 Público-Alvo

* **Produtores Culturais e Artesãos (B2B)** — Ceramistas, mestres artesãos, rendeiras, xilógrafos e pequenos produtores de Recife e região.
* **Consumidores Finais e Turistas (B2C)** — Clientes locais ou turistas que buscam cultura pernambucana com experiência de compra rápida e visual.

---

## 👥 Equipe do Projeto

| Membro | Função |
|---|---|
| **Paulo Ricardo Cardoso G. de Araújo** | Líder do Projeto / Desenvolvedor Backend |
| **João Pedro Pontes** | Desenvolvedor Frontend / UX/UI Design |
| **Eduardo Dourado** | Desenvolvedor Backend |
| **Vitória** | Documentação / Dreamshaper |
| **Caio Henrique** | Documentação / Dreamshaper |
| **Rafael Santana** | Documentação / Dreamshaper |

---

<p align="center">
  Feito com ❤️ para a cultura pernambucana
</p>
