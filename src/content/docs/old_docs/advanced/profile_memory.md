---
title: Profiling &amp; Memory
description: Placeholder content for Profiling &amp; Memory.
order: 1
---

# Profiling &amp; Memory

To profile your **FastAPI + SQLAlchemy + PostgreSQL** app, you can use different profiling tools to analyze performance bottlenecks and optimize your application. Below are the detailed steps for using **cProfile + snakeviz, py-spy, memory_profiler, and line_profiler** effectively.

---

## 1️⃣ **Using cProfile + SnakeViz (Function Call Profiling)**
**cProfile** helps analyze function execution times, while **SnakeViz** provides a visual representation.

### 🔹 Install Dependencies:
```sh
pip install snakeviz
```

### 🔹 Profile FastAPI App Using `cProfile`
Run your FastAPI app with **cProfile**:
```sh
python -m cProfile -o profile_data.prof main.py
```

### 🔹 Visualize Profile Data with SnakeViz:
After running the app, visualize the profiling results:
```sh
snakeviz profile_data.prof
```
This will open an interactive **call graph** in your browser.

---

## 2️⃣ **Using `py-spy` (Detect CPU-Intensive Parts)**
**py-spy** helps identify which functions consume the most CPU time.

### 🔹 Install `py-spy`
```sh
pip install py-spy
```

### 🔹 Run `py-spy` While the App is Running:
Start your FastAPI app and then run:
```sh
py-spy top --pid $(pgrep -f "python main.py")
```
🔹 To generate a flame graph:
```sh
py-spy record -o profile.svg --pid $(pgrep -f "python main.py")
```
Open the **profile.svg** file in a browser to analyze performance visually.

---

## 3️⃣ **Using `memory_profiler` (Detect High Memory Usage)**
To find memory leaks and optimize RAM usage.

### 🔹 Install `memory_profiler`
```sh
pip install memory_profiler
```

### 🔹 Add `@profile` Decorator to a Function
Modify your function to analyze memory usage:
```python
from memory_profiler import profile

@profile
def fetch_data():
    session = SessionLocal()
    data = session.query(User).all()
    session.close()
    return data
```

### 🔹 Run the Script with Memory Profiler:
```sh
python -m memory_profiler main.py
```
This will display the **line-by-line memory consumption**.

---

## 4️⃣ **Using `line_profiler` (Line-by-Line Execution Time)**
For detailed line-by-line performance insights.

### 🔹 Install `line_profiler`
```sh
pip install line-profiler
```

### 🔹 Profile a Function
Add the `@profile` decorator:
```python
from line_profiler import LineProfiler

def fetch_data():
    session = SessionLocal()
    data = session.query(User).all()
    session.close()
    return data

lp = LineProfiler()
lp.add_function(fetch_data)
lp.enable_by_count()
fetch_data()
lp.print_stats()
```
Run the script to get **execution time for each line**.

---

## 🔥 **Integrating Profiling with FastAPI Endpoints**
Modify your FastAPI routes to use `cProfile`:
```python
import cProfile
import pstats
from fastapi import FastAPI
from io import StringIO
from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User

app = FastAPI()

@app.get("/profile")
def profile_query():
    pr = cProfile.Profile()
    pr.enable()

    session = SessionLocal()
    users = session.query(User).all()
    session.close()

    pr.disable()
    s = StringIO()
    ps = pstats.Stats(pr, stream=s).sort_stats("cumulative")
    ps.print_stats()
    return {"profile_data": s.getvalue()}
```
- **Start FastAPI**, then call `GET /profile` to see performance stats.

---

## ✅ **Best Practices for Profiling FastAPI + SQLAlchemy**
1. **Profile database queries**  
   - Use `EXPLAIN ANALYZE` in PostgreSQL.
   - Use `sqlalchemy.orm.baked_queries` for query caching.

2. **Profile API requests**  
   - Use `py-spy` for real-time CPU profiling.
   - Use `memory_profiler` to track memory leaks.

3. **Optimize Query Performance**  
   - Use `async SQLAlchemy` for better concurrency.
   - Use **indexes** and optimize SQL queries.

4. **Run Profiling in Production** (Minimal Overhead)
   - Use **py-spy** instead of `cProfile`.
   - Enable profiling **only when needed** (avoid slowing down APIs).

---

Would you like help automating this with scripts? 🚀