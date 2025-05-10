---
title: Pytest Commands
description: Placeholder content for Pytest Commands.
order: 5
---

# Pytest Commands

### **Comprehensive Pytest Commands with Explanations**  

Below is a list of **important Pytest commands** along with their explanations.

---

### **1. Running All Tests**
```bash
pytest
```
✅ Runs **all test cases** in the current directory and subdirectories.  
✅ It automatically detects files that start with `test_` or end with `_test.py`.  

---

### **2. Running Tests with Verbose Output**
```bash
pytest -v
```
✅ `-v` (verbose) mode shows **detailed output**, including which test is running and its result.

---

### **3. Running a Specific Test File**
```bash
pytest test_main.py
```
✅ Runs only the tests defined in `test_main.py`.  

---

### **4. Running a Specific Test Function**
```bash
pytest test_main.py::test_create_user
```
✅ Runs only `test_create_user` from `test_main.py`.  
✅ Helps when debugging a specific test case.

---

### **5. Running Tests in Parallel**
```bash
pytest -n auto
```
✅ Runs tests in **parallel** using all available CPU cores.  
✅ Requires `pytest-xdist` (`pip install pytest-xdist`).  
✅ **Speeds up test execution** in large projects.  

---

### **6. Running Tests with an Async Mode**
```bash
pytest --asyncio-mode=auto
```
✅ Required for **async FastAPI applications**.  
✅ Ensures Pytest **handles async functions properly**.  

---

### **7. Running Tests with a Specific Marker**
```bash
pytest -m slow
```
✅ Runs only tests **marked with `@pytest.mark.slow`**.  
✅ Useful for running long-running tests separately.  

Example:
```python
@pytest.mark.slow
async def test_slow_function():
    await asyncio.sleep(5)
    assert True
```

---

### **8. Skipping Tests**
```bash
pytest -k "not test_create_user"
```
✅ Runs all tests **except** `test_create_user`.  
✅ Useful when you need to **exclude failing or unnecessary tests** temporarily.  

---

### **9. Running Tests with Output Capturing Disabled**
```bash
pytest -s
```
✅ `-s` allows printing `print()` statements directly in the console.  
✅ Useful for **debugging test outputs**.  

---

### **10. Running Tests with a Maximum Fail Limit**
```bash
pytest --maxfail=3
```
✅ Stops execution after **3 test failures**.  
✅ Saves time by **not running unnecessary tests** once failures are found.

---

### **11. Running Tests with Code Coverage**
```bash
pytest --cov=main --cov-report=term
```
✅ Requires `pytest-cov` (`pip install pytest-cov`).  
✅ Shows **how much of the code is covered** by tests.  

---

### **12. Generating HTML Coverage Reports**
```bash
pytest --cov=main --cov-report=html
```
✅ Generates a **detailed HTML report** of test coverage.  
✅ The report is saved in `htmlcov/index.html`.  

---

### **13. Running Tests and Stopping on First Failure**
```bash
pytest -x
```
✅ Stops execution **immediately** after the first failure.  
✅ Saves time when debugging failing tests.  

---

### **14. Running Tests and Logging Output to a File**
```bash
pytest --result-log=log.txt
```
✅ Saves **test results** in `log.txt`.  
✅ Useful for reviewing logs later.

---

### **15. Running Tests with Debugging Support**
```bash
pytest --pdb
```
✅ Drops into a **Python debugger** (`pdb`) when a test fails.  
✅ Allows **interactive debugging** inside failed tests.  

---

### **16. Running Tests with a Custom Test Directory**
```bash
pytest tests/
```
✅ Runs tests inside the `tests/` directory.  

---

### **17. Running Tests with a Custom Test Name Pattern**
```bash
pytest --pyargs my_package.tests
```
✅ Runs tests inside `my_package/tests/` folder.  
✅ Useful when working with **large projects**.  

---

### **18. Running Tests with Profiling**
```bash
pytest --durations=3
```
✅ Shows the **slowest 3 test cases**.  
✅ Helps in **optimizing slow test cases**.  

---

### **19. Running Tests with Random Order**
```bash
pytest --random-order
```
✅ Requires `pytest-randomly` (`pip install pytest-randomly`).  
✅ Helps **detect hidden dependencies** between tests.  

---

### **20. Running Only Failed Tests from Last Run**
```bash
pytest --lf
```
✅ Runs **only the tests that failed in the last execution**.  
✅ Saves time during debugging.  

---

### **21. Running Tests and Capturing Logs**
```bash
pytest --log-cli-level=INFO
```
✅ Enables **live logging output** during tests.  
✅ Useful when debugging logs inside tests.  

---

### **22. Running Tests with Test Fixtures**
```bash
pytest --setup-show
```
✅ Shows **detailed fixture setup and teardown process**.  
✅ Helps understand how fixtures are initialized.  

---

### **23. Running Tests with a Custom Configuration File**
```bash
pytest -c pytest.ini
```
✅ Uses **custom Pytest configurations** from `pytest.ini`.  
✅ Example `pytest.ini` file:
```ini
[pytest]
testpaths = tests
addopts = -v --tb=short
```

---

### **24. Running Tests and Saving JUnit XML Reports**
```bash
pytest --junitxml=report.xml
```
✅ Saves test results in an XML format.  
✅ Useful for **CI/CD pipelines** (Jenkins, GitHub Actions, etc.).  

---

### **25. Running Tests with a Custom Timeout**
```bash
pytest --timeout=10
```
✅ Requires `pytest-timeout` (`pip install pytest-timeout`).  
✅ Kills tests **that exceed 10 seconds**.  
✅ Useful for **preventing infinite loops** in tests.  

---

## 🚀 **Final Thoughts**
| **Command** | **Purpose** |
|-------------|------------|
| `pytest -v` | Detailed output |
| `pytest test_main.py::test_create_user` | Run specific test |
| `pytest -n auto` | Run tests in parallel |
| `pytest --cov=main --cov-report=html` | Generate coverage report |
| `pytest --maxfail=3` | Stop after 3 failures |
| `pytest --lf` | Run last failed tests |
| `pytest --pdb` | Debug failing tests |
| `pytest --timeout=10` | Stop tests exceeding 10s |

These **commands help in debugging, optimizing, and automating** FastAPI tests. 🚀