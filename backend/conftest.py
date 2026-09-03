import sys
import os

# Add backend directory to sys.path for pytest discovery
backend_dir = os.path.abspath(os.path.dirname(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Override DATABASE_URL to use SQLite for fast, offline pytest execution
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
