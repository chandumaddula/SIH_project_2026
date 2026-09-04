import sys
import os

# Add backend directory and project root directory to sys.path for pytest discovery
backend_dir = os.path.abspath(os.path.dirname(__file__))
root_dir = os.path.abspath(os.path.join(backend_dir, ".."))

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

# Override DATABASE_URL to use SQLite for fast, offline pytest execution
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
