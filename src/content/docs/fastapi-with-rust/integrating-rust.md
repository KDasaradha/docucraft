---
title: Integrating Rust Extensions with FastAPI
---

# Integrating Rust Extensions with FastAPI

**Original Description**: Leveraging Rust for performance-critical components within a FastAPI application using Python bindings.

While FastAPI offers excellent performance for I/O-bound tasks thanks to `asyncio`, certain CPU-bound operations (complex calculations, heavy data processing, simulations) within your Python code can still become bottlenecks, especially limited by Python's Global Interpreter Lock (GIL) for true CPU parallelism in standard CPython.

Rust is a systems programming language known for its performance (comparable to C/C++), memory safety guarantees (without a garbage collector), and excellent concurrency features. You can write performance-critical code sections in Rust and call them from your Python/FastAPI application, effectively bypassing the GIL for those sections and achieving significant speedups for CPU-bound tasks.

**Tools and Libraries for Python-Rust Integration:**

1.  **PyO3**:
    *   **Description**: The most popular and comprehensive library for creating Python extensions in Rust. It provides ergonomic bindings to call Rust code from Python and vice-versa. Supports `asyncio` integration.
    *   **Website**: [https://pyo3.rs/](https://pyo3.rs/)

2.  **Maturin**:
    *   **Description**: A build tool specifically designed for building and publishing Python packages written (partially or wholly) in Rust using PyO3 or other binding generators. It simplifies the build process significantly.
    *   **Website**: [https://github.com/PyO3/maturin](https://github.com/PyO3/maturin)

**General Workflow:**

1.  **Set up Rust Environment**: Install Rust using `rustup` ([https://rustup.rs/](https://rustup.rs/)).
2.  **Create Rust Library Project**: Use Cargo (Rust's package manager) to create a new Rust library project (`cargo new --lib my_rust_extension`).
3.  **Configure `Cargo.toml`**:
    *   Add `pyo3` as a dependency, potentially enabling features like `extension-module`.
    *   Configure the library type to `cdylib` (C dynamic library) so Python can load it.
    ```toml
    # Cargo.toml
    [package]
    name = "my_rust_extension"
    version = "0.1.0"
    edition = "2021"

    [lib]
    name = "my_rust_extension" # Name of the compiled library (e.g., my_rust_extension.so/pyd)
    crate-type = ["cdylib"]    # Compile as a C dynamic library

    [dependencies]
    pyo3 = { version = "0.21", features = ["extension-module"] } # Use latest PyO3 version
    # Add other Rust dependencies needed for your logic (e.g., rayon for parallelism)
    # rayon = "1.8" 
    ```
4.  **Write Rust Code with PyO3 Bindings**:
    *   Use the `#[pyfunction]` attribute to expose Rust functions to Python.
    *   Use the `#[pymodule]` attribute on a function to define the Python module interface.
    *   Handle type conversions between Python objects (like lists, strings, numbers passed as `PyAny` or specific PyO3 types) and Rust types.

    ```rust
    // src/lib.rs (Rust code)
    use pyo3::prelude::*;
    // Example using Rayon for CPU-bound parallelism (install with `cargo add rayon`)
    // use rayon::prelude::*; 

    /// Processes a list of numbers in Rust, potentially in parallel.
    /// This function receives a Python list, converts it, processes, and returns a Python list.
    #[pyfunction]
    fn process_numbers_rust(data: Vec<i64>) -> PyResult<Vec<i64>> {
        println!("Rust: Received data (length {})", data.len());
        
        // --- CPU-Bound work example (Parallel sum using Rayon) ---
        // let processed_data: Vec<i64> = data.par_iter() // Parallel iterator
        //                                      .map(|&x| x * x + 1) // Example calculation
        //                                      .collect();
        
        // --- CPU-Bound work example (Synchronous single-threaded) ---
        let mut processed_data = Vec::with_capacity(data.len());
        for &x in data.iter() {
             // Simulate heavy computation
             let mut val = x;
             for _ in 0..1000 { // Adjust loop count to simulate work
                  val = val.wrapping_add(1).wrapping_mul(2) % 1_000_000_007;
             }
             processed_data.push(val); // Store result
        }
        
        println!("Rust: Finished processing.");
        Ok(processed_data) // Return the result (PyO3 handles conversion back to Python list)
    }

    /// Calculates the sum of squares, demonstrating argument passing.
    #[pyfunction]
    fn sum_squares_rust(a: i64, b: i64) -> PyResult<i64> {
        Ok(a * a + b * b)
    }

    /// Defines the Python module. The name `my_rust_extension` should match `lib.name` in Cargo.toml.
    #[pymodule]
    fn my_rust_extension(_py: Python<'_>, m: &PyModule) -> PyResult<()> {
        m.add_function(wrap_pyfunction!(process_numbers_rust, m)?)?;
        m.add_function(wrap_pyfunction!(sum_squares_rust, m)?)?;
        Ok(())
    }

    ```
5.  **Build the Rust Extension with Maturin**:
    *   Install Maturin: `pip install maturin`
    *   Build the extension (compiles Rust code and creates Python wheel):
        ```bash
        # Run in the directory containing Cargo.toml
        maturin build --release # Build optimized release version
        # Or build and install directly into current Python environment's site-packages:
        # maturin develop
        ```
    *   This produces a `.so` (Linux/macOS) or `.pyd` (Windows) file in `target/release` or `target/wheels`.

6.  **Import and Use in FastAPI/Python**:
    *   Make sure the built wheel is installed (`pip install target/wheels/my_rust_extension*.whl`) or you used `maturin develop`.
    *   Import the Rust module in your Python code just like any other Python module.
    *   Call the exposed Rust functions.

    ```python
    # main.py (FastAPI app)
    from fastapi import FastAPI, HTTPException
    from fastapi.concurrency import run_in_threadpool # Might still be needed if Rust function is blocking CPU heavily
    from pydantic import BaseModel
    from typing import List

    # Import the compiled Rust module
    try:
        import my_rust_extension 
    except ImportError:
        print("Error: Could not import Rust extension 'my_rust_extension'.")
        print("Ensure you have built it using 'maturin build --release' and installed the wheel, or run 'maturin develop'.")
        my_rust_extension = None # Indicate module is not available

    app = FastAPI()

    class NumberList(BaseModel):
        numbers: List[int]

    @app.post("/process-numbers-rust")
    async def process_numbers(data: NumberList):
        if not my_rust_extension:
             raise HTTPException(status_code=501, detail="Rust extension not available.")
             
        input_numbers = data.numbers
        
        # --- Calling the potentially CPU-bound Rust function ---
        # Even though Rust bypasses GIL, if the Rust function takes a long time 
        # and BLOCKS its calling thread, it will still block the FastAPI threadpool worker.
        # For truly non-blocking CPU-bound Rust work from an async endpoint, 
        # you should use `run_in_threadpool` or ensure the Rust code uses async/spawns threads.
        # PyO3 has features for integrating with asyncio (`pyo3-asyncio`), but that adds complexity.
        
        # Option 1: Simpler, rely on FastAPI's threadpool for sync endpoints (if this endpoint was `def`)
        # Or if the Rust call is very fast.
        # result = my_rust_extension.process_numbers_rust(input_numbers) 

        # Option 2: Use run_in_threadpool for long-blocking Rust calls in async endpoint
        try:
             print(f"Python: Calling Rust function with {len(input_numbers)} numbers...")
             processed_result = await run_in_threadpool(my_rust_extension.process_numbers_rust, input_numbers)
             print("Python: Received result from Rust.")
             return {"original_count": len(input_numbers), "processed_result": processed_result}
        except Exception as e:
             # Catch potential errors from Rust (PyO3 converts Rust panics/errors)
             print(f"Error calling Rust extension: {e}")
             raise HTTPException(status_code=500, detail=f"Error during Rust processing: {e}")

    @app.get("/sum-squares-rust")
    async def sum_squares(a: int = 5, b: int = 10):
         if not my_rust_extension:
             raise HTTPException(status_code=501, detail="Rust extension not available.")
         
         # This Rust function is likely very fast, run_in_threadpool probably overkill
         result = my_rust_extension.sum_squares_rust(a, b)
         return {"a": a, "b": b, "sum_of_squares": result}

    # To run:
    # 1. cargo new --lib my_rust_extension
    # 2. Update Cargo.toml and src/lib.rs as above
    # 3. maturin develop # Installs extension in current venv
    # 4. uvicorn main:app --reload
    ```

**Key Considerations:**

*   **CPU-Bound Work**: Best suited for computationally intensive tasks where Python's performance is a bottleneck (e.g., numerical algorithms, complex data transformations, simulations, parts of ML inference). It won't significantly speed up I/O-bound operations (FastAPI's `asyncio` already handles that well).
*   **GIL Bypass**: Rust code runs natively without Python's GIL, allowing true parallelism for CPU-bound tasks if you use Rust concurrency features like Rayon within your Rust code.
*   **Blocking Behavior**: Remember that even native Rust code, if run synchronously and taking a long time, will block the Python thread that called it. Use `run_in_threadpool` from async FastAPI endpoints for potentially long-running synchronous Rust functions to avoid blocking the event loop's thread pool workers. Alternatively, explore `pyo3-asyncio` for tighter integration with Python's event loop if the Rust code itself can be made async or offload work.
*   **Build Complexity**: Adds Rust toolchain and build steps (Maturin) to your project.
*   **Error Handling**: Need to handle errors and panics in Rust and propagate them appropriately to Python (PyO3 helps with this, converting errors to Python exceptions).
*   **Data Serialization**: Converting data between Python objects and Rust types has some overhead, though PyO3 is efficient. For very large data structures, consider performant serialization formats if needed (e.g., Apache Arrow via PyArrow if PyO3 supports it well).

Integrating Rust extensions can be a powerful way to optimize critical bottlenecks in your FastAPI application, offering significant performance gains for CPU-intensive code while keeping the rest of your application logic in Python.

    