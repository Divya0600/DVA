pipeline_migration/
│
├── docker-compose.yml                 # Main Docker Compose configuration
├── README.md                          # Project documentation
│
├── backend/                           # Django backend
│   ├── Dockerfile                     # Backend Docker configuration
│   ├── manage.py                      # Django management script
│   ├── requirements.txt               # Python dependencies
│   │
│   ├── core/                          # Django project core
│   │   ├── __init__.py                # Empty file
│   │   ├── asgi.py                    # ASGI config (auto-generated)
│   │   ├── celery.py                  # Celery configuration
│   │   ├── settings/
│   │   │   ├── __init__.py            # Empty file
│   │   │   ├── base.py                # Base settings
│   │   │   ├── development.py         # Development settings
│   │   │   └── production.py          # Production settings
│   │   ├── urls.py                    # Main URL configuration
│   │   └── wsgi.py                    # WSGI config (auto-generated)
│   │
│   ├── common/                        # Common utilities
│   │   ├── __init__.py                # Empty file
│   │   ├── adapter_loader.py          # Adapter loading utility
│   │   ├── exceptions.py              # Custom exceptions (can be empty initially)
│   │   └── utils.py                   # Shared utilities (can be empty initially)
│   │
│   ├── pipelines/                     # Pipelines app
│   │   ├── __init__.py                # Empty file
│   │   ├── admin.py                   # Admin registration
│   │   ├── apps.py                    # App configuration
│   │   ├── migrations/
│   │   │   └── __init__.py            # Empty file
│   │   ├── models.py                  # Pipeline models
│   │   ├── serializers.py             # Pipeline serializers
│   │   ├── tests.py                   # Tests (can be empty)
│   │   ├── urls.py                    # URL patterns (minimal content)
│   │   └── views.py                   # Pipeline views
│   │
│   ├── sources/                       # Sources app
│   │   ├── __init__.py                # Empty file
│   │   ├── admin.py                   # Admin registration (minimal)
│   │   ├── apps.py                    # App configuration
│   │   ├── migrations/
│   │   │   └── __init__.py            # Empty file
│   │   ├── models.py                  # Models (can be empty initially)
│   │   ├── tests.py                   # Tests (can be empty)
│   │   ├── views.py                   # Views (can be empty initially)
│   │   └── adapters/
│   │       ├── __init__.py            # Empty file
│   │       ├── base.py                # Base source adapter
│   │       └── alm_download.py        # ALM source adapter
│   │
│   ├── destinations/                  # Destinations app
│   │   ├── __init__.py                # Empty file
│   │   ├── admin.py                   # Admin registration (minimal)
│   │   ├── apps.py                    # App configuration
│   │   ├── migrations/
│   │   │   └── __init__.py            # Empty file
│   │   ├── models.py                  # Models (can be empty initially)
│   │   ├── tests.py                   # Tests (can be empty)
│   │   ├── views.py                   # Views (can be empty initially)
│   │   └── adapters/
│   │       ├── __init__.py            # Empty file
│   │       ├── base.py                # Base destination adapter
│   │       └── jira_upload.py         # Jira destination adapter
│   │
│   └── jobs/                          # Jobs app
│       ├── __init__.py                # Empty file
│       ├── admin.py                   # Admin registration
│       ├── apps.py                    # App configuration
│       ├── migrations/
│       │   └── __init__.py            # Empty file
│       ├── models.py                  # Job models
│       ├── serializers.py             # Job serializers
│       ├── tasks.py                   # Celery tasks
│       ├── tests.py                   # Tests (can be empty)
│       ├── urls.py                    # URL patterns (minimal content)
│       └── views.py                   # Job views
│
└── frontend/                          # React frontend
    ├── Dockerfile                     # Frontend Docker configuration
    ├── package.json                   # NPM dependencies
    ├── .env                           # Environment variables
    │
    ├── public/                        # Public static files
    │   ├── favicon.ico                # Favicon (can be any icon)
    │   ├── index.html                 # HTML entry point
    │   └── manifest.json              # Web app manifest (minimal)
    │
    └── src/                           # Source code
        ├── App.js                     # Main app component with routes
        ├── index.js                   # JavaScript entry point
        ├── theme.js                   # Chakra UI theme
        │
        ├── components/                # Reusable components
        │   ├── JobsList.js            # Jobs list component
        │   ├── JsonEditor.js          # JSON editor component
        │   ├── JsonViewer.js          # JSON viewer component
        │   ├── Navbar.js              # Navigation bar
        │   ├── PipelineForm.js        # Pipeline edit form
        │   ├── PipelineVisualizer.js  # Pipeline visualization
        │   ├── ProtectedRoute.js      # Auth route wrapper
        │   └── Sidebar.js             # Side navigation
        │
        ├── context/                   # React contexts
        │   └── AuthContext.js         # Authentication context
        │
        ├── pages/                     # Page components
        │   ├── Dashboard.js           # Main dashboard
        │   ├── Destinations.js        # Destinations page
        │   ├── Help.js                # Help and documentation
        │   ├── JobDetail.js           # Job details page
        │   ├── JobList.js             # Jobs list page
        │   ├── Login.js               # Login page
        │   ├── NotFound.js            # 404 page
        │   ├── PipelineCreate.js      # Pipeline creation wizard
        │   ├── PipelineDetail.js      # Pipeline details page
        │   ├── PipelineEdit.js        # Pipeline edit page
        │   ├── PipelineList.js        # Pipelines list page
        │   ├── Settings.js            # Settings page
        │   └── Sources.js             # Sources page
        │
        ├── services/                  # API services
        │   └── api.js                 # API client
        │
        └── utils/                     # Utility functions
            └── index.js               # Utility functions (can be empty initially)