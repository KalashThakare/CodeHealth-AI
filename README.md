# CodeHealth-AI

<div align="center">

![CodeHealth-AI Logo](https://github.com/KalashThakare/CodeHealth-AI/blob/main/frontend/public/web-app-manifest-192x192.png)

**AI-Powered Continuous Repository Health Analysis & Developer Intelligence Platform**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node.js-18.x-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/next.js-14.x-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/python-3.11-blue.svg)](https://www.python.org/)

[Live Demo](https://codehealth-rose.vercel.app/) • [Documentation](#) • [Report Issues](#)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technology Stack](#-technology-stack)
- [System Workflows](#-system-workflows)
- [Metrics & Scoring](#-metrics--scoring)
- [Installation & Setup](#-installation--setup)
- [Environment Configuration](#-environment-configuration)
- [Deployment](#-deployment)
- [Team & Contributions](#-team--contributions)
- [Screenshots](#-screenshots)
- [License](#-license)

---

## 🎯 Overview

**CodeHealth-AI** is a comprehensive developer intelligence platform that provides deep, automated insights into repository health, maintainability, and long-term sustainability. By combining static code analysis, commit behavior analytics, distributed job processing, and AI-driven insights, CodeHealth-AI helps development teams understand **where their codebase stands today** and **what to improve next**.

The platform operates continuously—analyzing repositories on every push and pull request, tracking quality trends over time, and proactively alerting teams when critical thresholds are breached.

### What Makes CodeHealth-AI Different?

- **Continuous Analysis**: Automated re-analysis on every push/PR using distributed workers
- **Real-Time Observability**: Live dashboards tracking code health trends over time
- **AI-Powered Insights**: Human-readable explanations and actionable recommendations
- **Proactive Alerting**: Custom threshold-based notifications via email and in-app
- **Enterprise-Grade Architecture**: Multi-server deployment with job queues and pub/sub messaging
- **Comprehensive Metrics**: From cyclomatic complexity to bus factor risk analysis

---

## ✨ Key Features

### 🔍 Deep Code Analysis
- **Static Code Metrics**: Cyclomatic complexity, Halstead volume, maintainability index
- **File-Level Risk Scoring**: Identifies refactoring priorities with actionable reasons
- **Technical Debt Quantification**: Estimates refactoring effort in developer-days
- **Distribution Analysis**: Visualizes code quality spread across the repository

### 📊 Development Intelligence
- **Commit Pattern Analysis**: Tracks velocity trends, consistency, and activity ratios
- **Bus Factor Assessment**: Identifies knowledge concentration risks
- **PR Velocity Metrics**: Measures review time, merge frequency, and throughput
- **Contributor Analytics**: Evaluates team participation and collaboration patterns

### 📈 Continuous Observability
- **Time-Series Dashboards**: Code health score, quality metrics, and activity over time
- **Activity Heatmaps**: Visualizes contribution patterns across days and hours
- **Push/Pull Tracking**: Real-time monitoring of repository events
- **Trend Detection**: Identifies improving, stable, or degrading metrics

### 🔔 Intelligent Alerting
- **Custom Thresholds**: Define acceptable ranges for any metric
- **Multi-Channel Notifications**: In-app alerts and email notifications
- **Breach Detection**: Automatic alerts when metrics fall below thresholds
- **Configurable Rules**: Set different alert levels per repository

### 🤖 AI-Driven Insights
- **Executive Summaries**: High-level repository health assessments
- **Strengths & Weaknesses**: Automated identification of quality patterns
- **Actionable Recommendations**: Specific guidance on what to improve
- **Natural Language Explanations**: Makes complex metrics understandable

---

## 🏗️ Architecture

CodeHealth-AI employs a **distributed, multi-server architecture** designed for scalability, fault tolerance, and real-time processing.

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Next.js Frontend (Vercel)                               │  │
│  │  - React Components  - D3.js Visualizations              │  │
│  │  - Real-time Updates - WebSocket Client                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS / WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express API Server (Heroku)                             │  │
│  │  - REST Endpoints    - GitHub OAuth                      │  │
│  │  - WebSocket Server  - Redis Pub/Sub                     │  │
│  │  - Authentication    - Job Scheduling                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Job Queue
┌─────────────────────────────────────────────────────────────────┐
│                      PROCESSING LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  BullMQ Workers (Heroku)                                 │  │
│  │  - Distributed Job Processing                            │  │
│  │  - Analysis Orchestration                                │  │
│  │  - Metric Aggregation                                    │  │
│  │  - Cron Jobs (DB Cleanup, PR Metrics)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ Analysis Requests
┌─────────────────────────────────────────────────────────────────┐
│                      ANALYSIS LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  FastAPI Analysis Engine (Heroku)                        │  │
│  │  - Python Static Analysis                                │  │
│  │  - Radon, Lizard Integration                             │  │
│  │  - AI Insight Generation                                 │  │
│  │  - Metric Calculation                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│  │  Supabase       │  │  Redis          │  │  GitHub API    │ │
│  │  PostgreSQL     │  │  - Job Queue    │  │  - Webhooks    │ │
│  │  - Persistence  │  │  - Pub/Sub      │  │  - Repository  │ │
│  │  - Auth         │  │  - Caching      │  │    Data        │ │
│  └─────────────────┘  └─────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

**1. Multi-Server Deployment**
- **Frontend (Vercel)**: Edge-optimized delivery, automatic scaling
- **API Server (Heroku)**: Centralized business logic and authentication
- **Workers (Heroku)**: Isolated job processing with dedicated resources
- **Analysis Engine (Heroku)**: Python-based static analysis with AI integration

**2. Distributed Job Processing**
- **BullMQ**: Redis-backed job queue for reliable task distribution
- **Worker Isolation**: Prevents analysis workloads from blocking API requests
- **Concurrency Control**: Configurable parallel job execution
- **Deadline Management**: Timeout handling for long-running analyses

**3. Real-Time Communication**
- **Redis Pub/Sub**: Event broadcasting between workers and API server
- **WebSockets**: Live updates pushed to frontend clients
- **Event-Driven Updates**: Instant dashboard refreshes on analysis completion

**4. Data Flow**
- **Write-Heavy Operations**: Analysis results written to Supabase
- **Read-Heavy Operations**: Cached in Redis for fast dashboard loads
- **Metric Aggregation**: Computed in workers, stored for historical tracking

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with SSR and App Router |
| **TypeScript** | Type-safe development |
| **Recharts** | Line charts, bar charts, area charts for metrics |
| **D3.js** | Advanced visualizations (radar charts, heatmaps, distributions) |
| **Socket.io Client** | Real-time updates and notifications |
| **Tailwind CSS** | Utility-first styling |

### Backend (Node.js)
| Technology | Purpose |
|------------|---------|
| **Express.js** | REST API framework |
| **BullMQ** | Distributed job queue and worker management |
| **Redis** | Job queue, caching, pub/sub messaging |
| **Supabase** | PostgreSQL database and authentication |
| **Socket.io** | WebSocket server for real-time events |
| **Octokit** | GitHub API client |
| **JWT** | Authentication tokens |
| **Nodemailer** | Email notifications |
| **Node-cron** | Scheduled jobs (DB cleanup, metric collection) |

### Analysis Engine (Python)
| Technology | Purpose |
|------------|---------|
| **FastAPI** | High-performance async API framework |
| **Radon** | Cyclomatic complexity and maintainability analysis |
| **Lizard** | Code metric extraction |
| **Together AI** | AI-powered insight generation |
| **Google Gemini** | Natural language processing |
| **PyGithub** | GitHub API interaction |
| **JWT** | GitHub App authentication |

### Infrastructure
| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting with edge network |
| **Heroku** | API, workers, and Python server hosting |
| **Supabase** | Managed PostgreSQL database |
| **Redis Cloud** | Managed Redis for queue and cache |
| **GitHub Apps** | Repository webhooks and permissions |

---

## 🔄 System Workflows

### 1. Full Repository Analysis


```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#1a1a1a','primaryTextColor':'#fff','primaryBorderColor':'#7C3AED','lineColor':'#10B981','secondaryColor':'#1a1a1a','tertiaryColor':'#1a1a1a','background':'#0d1117','mainBkg':'#1a1a1a','secondBkg':'#1a1a1a','lineColor':'#8B5CF6','border1':'#7C3AED','border2':'#10B981','note':'#1e293b','noteBorder':'#7C3AED','noteBkgColor':'#1e293b','noteTextColor':'#fff','actorBorder':'#7C3AED','actorBkg':'#1a1a1a','actorTextColor':'#fff','actorLineColor':'#10B981','signalColor':'#10B981','signalTextColor':'#fff','labelBoxBkgColor':'#1e293b','labelBoxBorderColor':'#7C3AED','labelTextColor':'#fff','loopTextColor':'#fff','activationBorderColor':'#7C3AED','activationBkgColor':'#1e293b','sequenceNumberColor':'#fff'}}}%%

sequenceDiagram
    autonumber
    participant User as 👤 User
    participant Frontend as 🎨 Frontend
    participant ExpressAPI as 🚀 Express API
    participant Redis as 💾 Redis Cache
    participant PythonService as 🐍 Python Service
    participant ClaudeAI as 🤖 Claude AI
    participant GitHub as 🐙 GitHub API
    participant BullMQ as 📋 BullMQ Queue
    participant ASTWorker as ⚙️ AST Worker
    participant DB as 🗄️ PostgreSQL
    participant SocketIO as 🔌 Socket.IO

    Note over User,ExpressAPI: 🎯 PHASE 1: INITIALIZATION
    User->>+Frontend: Click "Initialize Repo"
    Frontend->>+ExpressAPI: GET /:repoId/initialize
    
    alt Repo not found
        ExpressAPI-->>Frontend: 404 Not Found
    else Already initialized
        ExpressAPI-->>Frontend: 200 Already initialized
    else Max limit (>2 repos)
        ExpressAPI-->>Frontend: 400 Max limit reached
    end
    
    ExpressAPI->>DB: Update repo (initialised=true, status=processing)
    ExpressAPI->>DB: Create activity log
    ExpressAPI->>ExpressAPI: Build payload (repoId, installationId, owner, repoName, branch)
    ExpressAPI->>ExpressAPI: fullRepoAnalyse() async via setImmediate
    ExpressAPI-->>-Frontend: ✅ 200 Analysis in progress
    deactivate Frontend

    Note over ExpressAPI,PythonService: 🔄 PHASE 2: DISPATCH TO PYTHON SERVICE
    ExpressAPI->>ExpressAPI: Validate payload
    ExpressAPI->>+PythonService: POST /v1/internal/analysis/full-repo

    Note over PythonService,GitHub: 📊 PHASE 3: DATA COLLECTION
    PythonService->>PythonService: full_repo_analysis()
    
    par Parallel GitHub API Calls
        PythonService->>GitHub: get_installation_token()
        PythonService->>GitHub: fetch_repo_code()
        PythonService->>GitHub: get_contributors()
        PythonService->>GitHub: get_issues()
        PythonService->>GitHub: get_all_pr()
        PythonService->>GitHub: get_all_commits()
        PythonService->>GitHub: get_releases()
        PythonService->>GitHub: get_repo_metadata()
    end
    
    PythonService->>+ClaudeAI: analyze_commits() - AI analysis
    ClaudeAI-->>-PythonService: 💡 Commit insights
    
    PythonService->>PythonService: Count files (.py, .js, .jsx, .ts, .tsx)

    Note over PythonService,Redis: 🎬 PHASE 4: INITIALIZE TRACKING
    PythonService->>+ExpressAPI: POST /scanning/initialize-analysis (totalFiles)
    ExpressAPI->>Redis: Store totalFiles count
    ExpressAPI->>ExpressAPI: startAnalysisPolling() - Interval: 15s
    deactivate ExpressAPI

    Note over PythonService,ExpressAPI: 📤 PHASE 5: SEND METADATA
    par Parallel Metadata Uploads
        PythonService->>ExpressAPI: POST /scanning/commits
        PythonService->>ExpressAPI: POST /scanning/commits-analysis
        PythonService->>ExpressAPI: POST /scanning/repo-metadata
        PythonService->>ExpressAPI: POST /scanning/contributors
    end

    Note over PythonService,DB: 🐍 PHASE 6A: PYTHON FILE PROCESSING
    loop Batch Processing (size: 50)
        PythonService->>PythonService: analyze_py_code() - Calculate CC, MI, LOC, Halstead
        PythonService->>+ExpressAPI: POST /scanning/python-batch
        ExpressAPI->>DB: Bulk insert RepoFileMetrics
        ExpressAPI->>ExpressAPI: triggerBackgroundAnalysis()
        deactivate ExpressAPI
    end

    Note over PythonService,BullMQ: 📝 PHASE 6B: JS/TS FILE QUEUEING
    loop Batch Queueing (size: 50)
        PythonService->>+ExpressAPI: POST /scanning/enqueue-batch
        ExpressAPI->>BullMQ: Add jobs to filesQueue
        BullMQ->>Redis: Store job data
        deactivate ExpressAPI
    end
    deactivate PythonService

    Note over ASTWorker,SocketIO: ⚙️ PHASE 7: WORKER PROCESSING
    loop Concurrent Processing (Workers: 5)
        ASTWorker->>+BullMQ: Fetch next job
        deactivate BullMQ
        ASTWorker->>ASTWorker: Validate file extension
        ASTWorker->>ASTWorker: analyzeFile(content) - CC, MI, LOC, Halstead
        ASTWorker->>DB: Upsert RepoFileMetrics
        ASTWorker->>SocketIO: Emit analysis_update
        SocketIO-->>Frontend: 📡 Real-time progress update
        ASTWorker->>Redis: Increment completed count
        
        alt All files processed
            ASTWorker->>ExpressAPI: Worker "completed" event
            ExpressAPI->>ExpressAPI: triggerBackgroundAnalysis()
        end
    end

    Note over ExpressAPI,DB: 🔍 PHASE 8: POLLING MECHANISM
    loop Every 15 seconds
        ExpressAPI->>+DB: Query RepoFileMetrics.count()
        DB-->>-ExpressAPI: Current count
        alt Count >= expectedTotal
            ExpressAPI->>Redis: Stop polling
            ExpressAPI->>DB: Update status=completed
            ExpressAPI->>SocketIO: Emit completion notification
            SocketIO-->>Frontend: 🎉 Analysis completed!
            ExpressAPI->>ExpressAPI: triggerAlertScan()
        end
    end

    Note over ExpressAPI,DB: 🎯 PHASE 9: BACKGROUND ANALYSIS
    ExpressAPI->>+DB: Query all RepoFileMetrics
    ExpressAPI->>DB: Query commit data
    DB-->>-ExpressAPI: All metrics data
    ExpressAPI->>ExpressAPI: Calculate: Repo metrics, Commit patterns, Distributions, Health score
    ExpressAPI->>DB: Upsert RepositoryAnalysis
    ExpressAPI->>Redis: Cache analysis results
    ExpressAPI->>DB: Create trend record
    ExpressAPI->>DB: Create notification

    Note over User,DB: 🎊 PHASE 10: COMPLETION & DISPLAY
    Frontend->>+ExpressAPI: Fetch dashboard data
    ExpressAPI->>+DB: Query analysis data
    DB-->>-ExpressAPI: 📊 Metrics & analysis
    ExpressAPI-->>-Frontend: Dashboard data
    Frontend->>User: 🎉 Display results

    Note over User,DB: ✨ ANALYSIS COMPLETE! ✨
```

**Process Steps:**
1. User initiates analysis through frontend
2. API validates request and creates analysis record
3. Job queued in BullMQ with repository metadata
4. Worker picks up job and fetches file tree from GitHub
5. Files sent to Python analysis engine in batches
6. Python calculates complexity, maintainability, and risk scores
7. Worker aggregates results and computes repository-level metrics
8. Results persisted to database
9. Completion event published via Redis Pub/Sub
10. Frontend notified via WebSocket
11. Dashboard auto-refreshes with new data

---

### 2. Push Event Analysis


```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#1a1a1a','primaryTextColor':'#fff','primaryBorderColor':'#7C3AED','lineColor':'#10B981','secondaryColor':'#1a1a1a','tertiaryColor':'#1a1a1a','background':'#0d1117','mainBkg':'#1a1a1a','secondBkg':'#1a1a1a','lineColor':'#8B5CF6','border1':'#7C3AED','border2':'#10B981','note':'#1e293b','noteBorder':'#7C3AED','noteBkgColor':'#1e293b','noteTextColor':'#fff','actorBorder':'#7C3AED','actorBkg':'#1a1a1a','actorTextColor':'#fff','actorLineColor':'#10B981','signalColor':'#10B981','signalTextColor':'#fff','labelBoxBkgColor':'#1e293b','labelBoxBorderColor':'#7C3AED','labelTextColor':'#fff','loopTextColor':'#fff','activationBorderColor':'#7C3AED','activationBkgColor':'#1e293b','sequenceNumberColor':'#fff'}}}%%

sequenceDiagram
    autonumber
    participant GitHub as 🐙 GitHub Webhook
    participant Webhook as 🎯 Webhook Handler
    participant DB as 🗄️ PostgreSQL
    participant Redis as 💾 Redis Cache
    participant SocketIO as 🔌 Socket.IO
    participant PythonScan as 🐍 Python Scan Service
    participant PythonAnalysis as 🤖 Python Analysis Service
    participant GitHubAPI as 🔑 GitHub API
    participant BullMQ as 📋 BullMQ Queue
    participant ASTWorker as ⚙️ AST Worker

    Note over GitHub,Webhook: 🎯 PHASE 1: WEBHOOK RECEPTION
    GitHub->>+Webhook: Push Event Received
    Webhook->>Webhook: Extract payload (repository, commits, branch, pusher)
    Webhook->>+DB: Fetch Project.userId
    DB-->>-Webhook: User ID

    Note over Webhook,DB: 🔍 PHASE 2: BRANCH VALIDATION
    alt Not default branch
        Webhook->>DB: Create RepoPushEvent (analytics only)
        Webhook-->>GitHub: Return {skipped: true, reason: "branch-policy"}
    else Default branch
        Note over Webhook,DB: Continue processing
    end

    Note over Webhook,DB: 📁 PHASE 3: FILE CHANGE ANALYSIS
    Webhook->>Webhook: Analyze commits: added, modified, removed files
    Webhook->>Webhook: Deduplicate files (remove conflicts)

    alt Files removed
        Webhook->>DB: Delete from RepoFileMetrics
    end

    Note over Webhook,DB: 💾 PHASE 4: STORE COMMITS & ANALYTICS
    Webhook->>DB: Commit.bulkCreate (sha, message, author, committer, timestamps)
    Webhook->>DB: Update RepositoryAnalysis (totalCommits, lastCommit)
    Webhook->>DB: Create RepoPushEvent (commitCount, branch, pushedAt)
    Webhook->>DB: Create activity log "{pusher} pushed commits"
    Webhook->>Redis: Invalidate cache (metrics:repo:{repoId})

    Note over Webhook,SocketIO: 📢 PHASE 5: EMIT NOTIFICATIONS
    Webhook->>SocketIO: Emit notification to user
    SocketIO-->>Webhook: Notification sent
    Webhook->>DB: Create notification "New push on {repo}"

    Note over Webhook,PythonScan: 🔄 PHASE 6: TRIGGER PUSH SCAN (Parallel)
    Webhook->>Webhook: processPushScan() - Build ScanJobData
    Webhook->>+PythonScan: POST /v3/internal/pushScan/run
    
    PythonScan->>PythonScan: ScanFiles() - Initialize scan

    Note over PythonScan,GitHubAPI: 📥 PHASE 7: FETCH CHANGED FILES
    PythonScan->>+GitHubAPI: get_installation_token() - GitHub App auth
    GitHubAPI-->>-PythonScan: Access token
    PythonScan->>+GitHubAPI: fetch_changed_files_code() - Get file content
    GitHubAPI-->>-PythonScan: File contents
    PythonScan->>PythonScan: Filter files (.py, .js, .ts, .jsx, .tsx)

    Note over PythonScan,DB: 🐍 PHASE 8: PROCESS PYTHON FILES
    alt Python files found
        loop For each Python file
            PythonScan->>PythonScan: analyze_py_code() - Calculate metrics
        end
        PythonScan->>+Webhook: POST /scanning/python-batch (metrics array)
        Webhook->>DB: Bulk insert/update RepoFileMetrics
        Webhook->>Webhook: triggerBackgroundAnalysis() - Python path
        deactivate Webhook
    end

    Note over PythonScan,BullMQ: 📝 PHASE 9: PROCESS JS/TS FILES
    alt JS/TS files found
        PythonScan->>+Webhook: POST /scanning/enqueue-batch (isPushEvent=true)
        Webhook->>BullMQ: Add jobs to filesQueue
        BullMQ->>Redis: Store job data
        deactivate Webhook
    end
    deactivate PythonScan

    Note over Webhook,PythonAnalysis: 🤖 PHASE 10: TRIGGER PUSH ANALYSIS (Parallel)
    Webhook->>Webhook: processPushAnalysis() - Build analysis payload
    Webhook->>+PythonAnalysis: POST /v1/internal/analysis/run
    
    PythonAnalysis->>PythonAnalysis: push_analyze_repo() - Initialize analysis

    Note over PythonAnalysis,Webhook: 📊 PHASE 11: IMPACT ANALYSIS
    PythonAnalysis->>PythonAnalysis: seed_impact() - Calculate impact score for changed files
    PythonAnalysis->>PythonAnalysis: seed_prioritization() - Rank files by risk
    PythonAnalysis->>PythonAnalysis: Calculate final score (impact vs threshold)

    Note over PythonAnalysis,DB: 💾 PHASE 12: STORE PUSH METRICS
    PythonAnalysis->>+Webhook: POST /scanning/pushMetric (impact, prioritization, score)
    Webhook->>DB: Create PushAnalysisMetrics
    Webhook->>DB: Store: impact score, risk analysis, impacted files, candidates
    deactivate Webhook
    deactivate PythonAnalysis

    Note over ASTWorker,SocketIO: ⚙️ PHASE 13: WORKER PROCESSING (JS/TS)
    loop Concurrent Processing (Workers: 5)
        ASTWorker->>+BullMQ: Fetch next job
        deactivate BullMQ
        ASTWorker->>ASTWorker: Validate file extension
        ASTWorker->>ASTWorker: analyzeFile(content) - Calculate CC, MI, LOC, Halstead
        ASTWorker->>DB: Upsert RepoFileMetrics
        ASTWorker->>SocketIO: Emit analysis_update
        SocketIO-->>Webhook: 📡 Real-time progress update
        ASTWorker->>Redis: Increment status.completed
        
        alt All files for repo completed
            ASTWorker->>Webhook: Worker "completed" event
            Webhook->>Webhook: triggerBackgroundAnalysis() - Worker path
        end
    end

    Note over Webhook,DB: 🎯 PHASE 14: BACKGROUND ANALYSIS (Convergence)
    Note over Webhook: Both Python path & Worker path converge here
    Webhook->>+DB: Query RepoFileMetrics
    Webhook->>DB: Query commit data
    DB-->>-Webhook: All metrics data
    Webhook->>Webhook: Calculate aggregates: Repo metrics, Commit patterns, Distributions, Health score
    Webhook->>DB: Upsert RepositoryAnalysis (all calculated metrics)
    Webhook->>Redis: Cache in Redis (metrics:repo:{repoId}, TTL: 24h)
    Webhook->>DB: Create trend record (healthScore, technicalDebt, velocityTrend)
    Webhook->>Webhook: triggerAlertScan() - Check for new alerts

    Note over GitHub,DB: 🎊 PHASE 15: COMPLETION
    Webhook-->>-GitHub: ✨ Push Analysis Complete! ✨

```

**Process Steps:**
1. GitHub sends webhook on push event
2. API validates signature and extracts commit data
3. Push analysis job queued with changed file list
4. Worker identifies modified files
5. Only changed files re-analyzed by Python engine
6. File metrics updated incrementally
7. Repository health score recalculated
8. Push metrics stored (timestamp, commit count, file changes)
9. Alert system checks if thresholds breached
10. Real-time update pushed to connected clients

---

### 3. Pull Request Analysis


```mermaid
%%{init: {'theme':'dark', 'themeVariables': { 'primaryColor':'#1a1a1a','primaryTextColor':'#fff','primaryBorderColor':'#7C3AED','lineColor':'#10B981','secondaryColor':'#1a1a1a','tertiaryColor':'#1a1a1a','background':'#0d1117','mainBkg':'#1a1a1a','secondBkg':'#1a1a1a','lineColor':'#8B5CF6','border1':'#7C3AED','border2':'#10B981','note':'#1e293b','noteBorder':'#7C3AED','noteBkgColor':'#1e293b','noteTextColor':'#fff','actorBorder':'#7C3AED','actorBkg':'#1a1a1a','actorTextColor':'#fff','actorLineColor':'#10B981','signalColor':'#10B981','signalTextColor':'#fff','labelBoxBkgColor':'#1e293b','labelBoxBorderColor':'#7C3AED','labelTextColor':'#fff','loopTextColor':'#fff','activationBorderColor':'#7C3AED','activationBkgColor':'#1e293b','sequenceNumberColor':'#fff'}}}%%

sequenceDiagram
    autonumber
    participant GitHub as 🐙 GitHub Webhook
    participant Webhook as 🎯 Webhook Handler
    participant DB as 🗄️ PostgreSQL
    participant Redis as 💾 Redis Cache
    participant SocketIO as 🔌 Socket.IO
    participant Handler as 📋 PR Handler
    participant Metrics as 📊 Metrics Aggregator
    participant PythonService as 🐍 Python Analysis Service
    participant GitHubAPI as 🔑 GitHub API

    Note over GitHub,Webhook: 🎯 PHASE 1: WEBHOOK RECEPTION
    GitHub->>Webhook: Pull Request Event (pull_request)
    Webhook->>Webhook: Validate event type === "pull_request"
    Webhook->>Webhook: Extract payload: action, repoId, prNumber, sender, head/base refs/shas

    Note over Webhook,DB: 🔍 PHASE 2: PROJECT LOOKUP
    Webhook->>DB: Find Project by repoId (initialised: true)
    DB-->>Webhook: Project found

    Note over Webhook,SocketIO: 🔀 PHASE 3: ACTION ROUTING
    alt Action: "closed" + merged = true
        Webhook->>Redis: Invalidate cache (metrics:repo:{repoId})
        Webhook->>SocketIO: Send notification "PR merged"
        SocketIO-->>Webhook: Notification sent
        Webhook->>DB: Create notification in DB
    else Action: "opened"
        Webhook->>SocketIO: Send notification "PR opened"
        SocketIO-->>Webhook: Notification sent
        Webhook->>DB: Create notification in DB
    else Action: "synchronize"
        Webhook->>SocketIO: Send notification "PR updated"
        SocketIO-->>Webhook: Notification sent
        Webhook->>DB: Create notification in DB
    else Action: "reopened"
        Webhook->>SocketIO: Send notification "PR reopened"
        SocketIO-->>Webhook: Notification sent
    end

    Note over Webhook,Handler: 📋 PHASE 4: MAIN HANDLER
    Webhook->>Handler: handlePullRequest(payload)
    
    Handler->>Handler: Validate payload (repoFullName, prNumber, installationId)
    alt Invalid payload
        Handler-->>Webhook: Return {skipped: true, reason: "invalid-payload"}
    end

    Note over Handler,DB: 📊 PHASE 5: PR ANALYTICS
    Handler->>DB: Fetch Project userId
    DB-->>Handler: User ID
    Handler->>DB: Find existing PullRequestActivity (repoId + prNumber)
    DB-->>Handler: Existing PR or null

    alt Action: "opened"
        Handler->>DB: Upsert PullRequestActivity (state: "open", createdAtGitHub, reviewCount)
        Handler->>DB: Create activity log "{sender} opened PR"
        Handler->>Metrics: Trigger aggregateRepoPRMetrics (async)
    else Action: "reopened"
        Handler->>DB: Upsert PullRequestActivity (state: "open")
        Handler->>DB: Create activity log "{sender} reopened PR"
    else Action: "synchronize"
        Handler->>DB: Update existing (state: "open")
        Handler->>DB: Create activity log "{sender} updated PR"
    else Action: "closed"
        Handler->>DB: Update/Create (state: "merged" or "closed", timeToMerge, closedAtGitHub)
        Handler->>DB: Create activity log "{sender} closed/merged PR"
        Handler->>Metrics: Trigger aggregateRepoPRMetrics (async)
    end

    Note over Metrics,DB: 📈 PHASE 6: METRICS AGGREGATION (Async)
    Metrics->>DB: Query all PullRequestActivity for repo
    DB-->>Metrics: All PR data
    Metrics->>Metrics: Calculate aggregated metrics:<br/>• PRs opened/merged/closed<br/>• Open/stale PRs<br/>• Time to merge stats<br/>• Time to first review<br/>• Review distribution
    Metrics->>DB: Upsert PRVelocityMetrics

    Note over Handler,PythonService: 🤖 PHASE 7: ACTIONABLE CHECK
    Handler->>Handler: Check if actionable (opened/reopened/synchronize)
    
    alt Not actionable (closed)
        Handler-->>Webhook: Return {skipped: true, reason: "non-actionable"}
    else Actionable
        Note over Handler,PythonService: 🔬 PHASE 8: ANALYSIS PREPARATION
        Handler->>Handler: Create job data:<br/>• repoFullName, repoId<br/>• installationId<br/>• prNumber, head, base<br/>• isFromFork
        Handler->>Handler: analyzePullRequest(jobData)

        Note over Handler,PythonService: 🐍 PHASE 9: PYTHON SERVICE CALL
        Handler->>PythonService: POST /v1/internal/analysis/pr (timeout: 15 min)
        
        PythonService->>PythonService: pull_analyze_repo() - Initialize analysis

        Note over PythonService,GitHubAPI: 🔑 PHASE 10: FETCH PR DATA
        PythonService->>GitHubAPI: get_installation_token() - GitHub App auth
        GitHubAPI-->>PythonService: Access token
        PythonService->>GitHubAPI: Fetch PR files and changes
        GitHubAPI-->>PythonService: PR file data

        Note over PythonService: 🔍 PHASE 11: CODE ANALYSIS
        PythonService->>PythonService: analyze_pr_opened():<br/>• Calculate risk/complexity<br/>• Detect security issues<br/>• Check for tests/docs<br/>• Generate suggestions
        
        Note over PythonService,Handler: 📤 PHASE 12: RETURN ANALYSIS
        PythonService-->>Handler: Analysis results:<br/>• score, summary<br/>• metrics, annotations<br/>• suggestions, warnings<br/>• recommended reviewers

        Note over Handler,DB: 💾 PHASE 13: SAVE ANALYSIS
        Handler->>DB: Find or create PullRequestAnalysis
        Handler->>DB: Update analysis data:<br/>• risk score<br/>• complexity metrics<br/>• security findings<br/>• suggestions<br/>• reviewer recommendations
        DB-->>Handler: Analysis saved

        Note over Handler,Webhook: ✅ PHASE 14: COMPLETION
        Handler-->>Webhook: Return response:<br/>{enqueued: true,<br/>repoFullName, prNumber,<br/>action, jobId}
    end
    
    Webhook-->>GitHub: ✨ PR Analysis Complete! ✨

    Note over Handler,Webhook: ❌ ERROR HANDLING
    alt Analysis Error
        PythonService-->>Handler: Error response
        Handler->>Handler: Log error
        Handler-->>Webhook: Return error response
    else Timeout Error
        PythonService-->>Handler: Timeout (15 min)
        Handler->>Handler: Log timeout
        Handler-->>Webhook: Return error response
    end
```

**Process Steps:**
1. GitHub webhook triggered on PR open/update/close
2. API extracts PR number, author, reviewers, file changes
3. PR analysis job queued
4. Worker fetches diff and identifies impact scope
5. Python analyzes code changes in PR context
6. PR metadata stored with analysis results
7. PR velocity metrics calculated (time to merge, review time)
8. Aggregated PR metrics updated in database
9. Frontend notified of PR activity

---

### 4. Background Jobs & Cron Tasks

The worker server runs scheduled jobs for maintenance and metric collection:

**Cron Job Schedule:**

| Job | Schedule | Purpose |
|-----|----------|---------|
| **Push Activity Aggregation** | Every hour (0 * * * *) | Consolidate push frequency, commit patterns, and activity metrics |
| **PR Velocity Calculation** | Every 2 hours (0 */2 * * *) | Aggregate PR metrics, calculate average review times and merge velocity |
| **Notification Cleanup** | Daily at midnight (0 0 * * *) | Clean up old and read notifications from the database |
| **Resolved Alerts Deletion** | Daily at 2:00 AM (0 2 * * *) | Delete resolved alerts older than 7 days to maintain database performance |

**Implementation:**
```javascript
// Node-cron job definitions in worker server
cron.schedule('0 * * * *', async () => { await aggregatePushActivity(); });
cron.schedule('0 */2 * * *', async () => { await aggregatePRVelocity(); });
cron.schedule('0 0 * * *', async () => { await notif_cleanUp(); });
cron.schedule('0 2 * * *', async () => { await deleteResolvedAlerts(7); });

```

---

## 📊 Metrics & Scoring

### Overall Repository Health Score

The health score is a weighted composite (0-100) calculated from four dimensions:

```
Health Score = (Code Quality × 0.45)
             + (Development Activity × 0.25)
             + (Bus Factor × 0.15)
             + (Community × 0.15)
```

**Rating Scale:**
- **85-100**: Excellent – Exemplary quality and active development
- **70-84**: Good – Solid foundation with minor improvements needed
- **55-69**: Fair – Acceptable but requires attention in some areas
- **40-54**: Needs Improvement – Significant issues, refactoring recommended
- **0-39**: Critical – Severe problems requiring immediate intervention

---

### Code Quality (45%)

Derived from static analysis metrics:

**File-Level Risk Score:**
```
Risk Score = (0.35 × Normalized Complexity)
           + (0.35 × Normalized Halstead Volume)
           + (0.25 × Maintainability Penalty)
           + (0.05 × LOC Penalty)
```

**Metrics Explained:**

1. **Cyclomatic Complexity**
   - Measures number of independent code paths
   - Threshold: 12
   - Higher values indicate harder-to-test code

2. **Halstead Volume**
   - Quantifies cognitive effort to understand code
   - Threshold: 1200
   - Based on operator/operand frequency

3. **Maintainability Index**
   - Composite score (0-100) for ease of maintenance
   - Inverted to create penalty: `100 - MI`
   - Lower MI increases risk

4. **Lines of Code (LOC)**
   - Penalty for files exceeding 150 source lines
   - Large files violate single responsibility

**Technical Debt Score:**
- Average risk score across all files
- Lower values indicate healthier codebase

---

### Development Activity (25%)

Evaluates commit patterns and velocity:

```
Activity Score = (0.6 × Activity Intensity)
               + (0.4 × Consistency Score)
```

**Components:**
- **Recent Commits**: Logarithmic scaling of 30-day commit count
- **Consistency**: Based on coefficient of variation
- **Activity Ratio**: Days with commits / total days
- **Velocity Trend**: Increasing, stable, or decreasing

---

### Bus Factor (15%)

Assesses knowledge concentration risk:

```
Top Contributor Ratio = Top Contributor Commits / Total Commits

Risk Level:
  - High (35 pts): Ratio > 70%
  - Medium (65 pts): Ratio 50-70%
  - Low (90 pts): Ratio < 50%
```

---

### Community Score (15%)

Measures external engagement:

```
Community = (0.4 × log(1 + stars) × 18)
          + (0.35 × log(1 + forks) × 22)
          + (0.25 × log(1 + watchers) × 20)
```

Logarithmic scaling prevents bias toward very popular repositories.

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 18.x or higher
- **Python** 3.11 or higher
- **Redis** 6.x or higher
- **PostgreSQL** 14.x or higher (via Supabase)
- **GitHub App** configured with webhook permissions

### Local Development Setup

#### 1. Clone Repository

```bash
git clone https://github.com/your-org/codehealth-ai.git
cd codehealth-ai
```

#### 2. Frontend Setup

```bash
cd frontend
npm install

# Create .env.local file (see Environment Configuration)
cp .env.example .env.local

npm run dev
# Frontend runs on http://localhost:3000
```

#### 3. Backend Setup

```bash
cd backend
npm install

# Create .env file
cp .env.example .env

# Start API server
npm run dev
# API runs on http://localhost:5000
```

#### 4. Worker Setup

```bash
cd workers
npm install

# Workers use same .env as backend
npm run start
# Workers process jobs from Redis queue
```

#### 5. Python Analysis Engine

```bash
cd analysis-engine
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Start FastAPI server
uvicorn main:app --reload --port 8000
# Analysis engine runs on http://localhost:8000
```

#### 6. Redis Setup

```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or install locally
# macOS
brew install redis
redis-server

# Ubuntu
sudo apt-get install redis-server
sudo service redis-server start
```

---

## 🔐 Environment Configuration

### Frontend (.env.local)

```dotenv
# Authentication URLs
NEXT_PUBLIC_GITHUB_AUTH_URL=http://localhost:5000/auth/github
NEXT_PUBLIC_GOOGLE_AUTH_URL=http://localhost:5000/auth/google
NEXT_PUBLIC_LOGIN_URL=http://localhost:5000/auth/login
NEXT_PUBLIC_SIGNUP_URL=http://localhost:5000/auth/signup

# API Endpoints
NEXT_PUBLIC_AXIOS_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

# Frontend URL
NEXT_PUBLIC_Frontend_URL=http://localhost:3000

# GitHub App Permissions
NEXT_PUBLIC_GITHUB_PERMISSION_URL=https://github.com/apps/your-app-slug/installations/new

# Development Mode
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Backend (.env)

```dotenv
# Server Configuration
PORT=5000

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:5000/auth/github/callback

# GitHub App Configuration
GITHUB_APP_REDIRECT_URI=http://localhost:3000/dashboard
APP_ID=your_github_app_id
APP_SECRET=your_app_secret
PRIVATE_KEY=path/to/private-key.pem
GITHUB_WEBHOOK_SECRET=your_webhook_secret
GITHUB_APP_SLUG=your-app-slug

# GitHub App Private Key (inline)
GITHUB_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----"

# Database Configuration
DATABASE_URL=postgresql://user:password@host:5432/database
DATABASE_PASS=your_database_password

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# Frontend URL
FRONTEND_URL=http://localhost:3000
WEB_APP_REDIRECT_URI=http://localhost:3000/auth/callback

# Email Configuration
NODEMAILER_PASSKEY=your_gmail_app_password

# Redis Configuration
REDIS_PASSWORD=your_redis_password
REDIS_HOST=localhost
REDIS_PORT=6379

# Worker Configuration
ANALYSIS_CONCURRENCY=5
ANALYSIS_DEADLINE_MS=600000

# Python Analysis Engine URL
ANALYSIS_INTERNAL_URL=http://localhost:8000

# Backend Server URL (for workers)
BACKEND_SERVER=http://localhost:5000

# Ngrok (for local webhook testing)
NGROK_AUTHTOKEN=your_ngrok_token
```

### Python Analysis Engine (.env)

```dotenv
# Server Configuration
PORT=8000

# GitHub App
GITHUB_APP_ID=your_github_app_id
GITHUB_PRIVATE_KEY='-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
-----END RSA PRIVATE KEY-----'

# AI APIs
TOGETHER_API_KEY=your_together_ai_key
GEMINI_API_KEY=your_primary_gemini_key
GEMINI_API_KEY2=your_backup_gemini_key

# Express Backend URL
EXPRESS_URL=http://localhost:5000
```

---

## 🌐 Deployment

### Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Vercel)                                       │
│  - Automatic deployments from main branch               │
│  - Edge network CDN                                      │
│  - Environment variables via Vercel dashboard           │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  API Server (Heroku)                                     │
│  - Procfile: web: node src/server.js                    │
│  - Config vars set via Heroku CLI/dashboard             │
│  - Dyno type: Standard-1X                               │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Worker Server (Heroku)                                  │
│  - Procfile: worker: node src/workers/index.js          │
│  - Separate dyno from API server                        │
│  - Dyno type: Standard-2X (more CPU for analysis)       │
└─────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────┐
│  Analysis Engine (Heroku)                                │
│  - Procfile: web: uvicorn main:app --host 0.0.0.0       │
│  - Python buildpack                                      │
│  - Dyno type: Standard-1X                               │
└─────────────────────────────────────────────────────────┘
```

### Deployment Commands

**Frontend (Vercel):**
```bash
cd frontend
vercel --prod
```

**Backend (Heroku):**
```bash
cd backend
heroku create codehealth-api
git push heroku main
heroku config:set KEY=VALUE
```

**Workers (Heroku):**
```bash
cd workers
heroku create codehealth-workers
git push heroku main
heroku ps:scale worker=1
```

**Python (Heroku):**
```bash
cd analysis-engine
heroku create codehealth-analysis
heroku buildpacks:set heroku/python
git push heroku main
```

### Environment Variables in Production

Set all environment variables using:
```bash
heroku config:set VARIABLE_NAME=value --app app-name
```

For Vercel:
```bash
vercel env add VARIABLE_NAME
```

---

## 👥 Team & Contributions

This project was developed by a two-member team with clearly defined responsibilities:

### Jayesh Rajbhar
**Role:** Frontend Engineer & UI/UX Designer

**Responsibilities:**
- Complete frontend development using Next.js
- UI/UX design and component architecture
- Data visualization implementation with D3.js and Recharts
- Dashboard design and development
- WebSocket client integration for real-time updates
- Observability interface development
- Alert configuration UI
- Repository connection flow
- Authentication UI (GitHub/Google OAuth)
- Responsive design and mobile optimization
- Complete deployment

**Key Contributions:**
- Designed intuitive, data-rich dashboards
- Implemented complex visualizations (heatmaps, radar charts, distributions)
- Created real-time update system for metrics
- Built seamless GitHub integration flow
- Optimized frontend performance for large datasets

---

### Kalash Thakare
**Role:** Backend Engineer & System Architect

**Responsibilities:**
- Complete backend architecture and implementation
- Metric design and scoring algorithms
- Data modeling and database schema
- GitHub integrations and webhook handling
- BullMQ worker implementation and job orchestration
- Redis pub/sub messaging system
- Alert system and email notifications
- Cron job scheduling for maintenance tasks
- Python analysis engine integration
- API endpoint design and implementation
- Authentication and authorization logic
- Deployment and DevOps configuration

**Key Contributions:**
- Designed distributed job processing architecture
- Implemented real-time metric calculation pipeline
- Built automated re-analysis system on push/PR events
- Created technical debt scoring algorithms
- Developed worker isolation strategy for scalability

---

## 📸 Screenshots

### Analysis Dashboard
![Analysis Dashboard](https://github.com/KalashThakare/CodeHealth-AI/blob/main/frontend/public/analysisDashboard.png)
*Comprehensive repository health overview with key metrics and trends*

### Alert Configuration
![Alert Configuration](https://github.com/KalashThakare/CodeHealth-AI/blob/main/frontend/public/alertConfig.png)
*Custom threshold-based alert setup interface*

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on [GitHub Issues](#)
- Contact: [your-email@example.com](clouddrop.s3@gmail.com)

---

<div align="center">

**Built by Kalash Thakare and Jayesh Rajbhar.**

[⬆ Back to Top](#codehealth-ai)

</div>
