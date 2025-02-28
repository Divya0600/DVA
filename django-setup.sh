# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Django and dependencies
pip install django djangorestframework django-filter psycopg2-binary celery[redis] redis

# Create Django project
django-admin startproject core .

# Create apps
python manage.py startapp pipelines
python manage.py startapp sources
python manage.py startapp destinations
python manage.py startapp jobs
python manage.py startapp common

# Create directories for adapters
mkdir -p sources/adapters
mkdir -p destinations/adapters
touch sources/adapters/__init__.py
touch sources/adapters/base.py
touch sources/adapters/alm_download.py
touch destinations/adapters/__init__.py
touch destinations/adapters/base.py
touch destinations/adapters/jira_upload.py

# Create directory for settings
mkdir -p core/settings
touch core/settings/__init__.py
touch core/settings/base.py
touch core/settings/development.py
touch core/settings/production.py
