
import MySQLdb
import os
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_USER = os.getenv('DB_USER', 'root')
DB_PASSWORD = os.getenv('DB_PASSWORD', '')
DB_PORT = int(os.getenv('DB_PORT', 3306))
DB_NAME = os.getenv('DB_NAME', 'quiz_ai')

try:
    print(f"Connecting to MySQL at {DB_HOST}:{DB_PORT} as {DB_USER}...")
    # Connect to MySQL Server (no db selected)
    db = MySQLdb.connect(host=DB_HOST, user=DB_USER, passwd=DB_PASSWORD, port=DB_PORT)
    cursor = db.cursor()
    
    print(f"Creating database '{DB_NAME}' if it doesn't exist...")
    cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
    print("Database created successfully.")
    
    cursor.close()
    db.close()
except Exception as e:
    print(f"Error creating database: {e}")
    exit(1)
