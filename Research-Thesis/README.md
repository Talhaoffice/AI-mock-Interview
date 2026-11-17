# Research Materials: The Fluency Trap

This folder contains the data and scripts for the thesis: **"The Fluency Trap: Comparing a Large Language Model Scorer and a Heuristic Scorer on Short Technical Interview Answers."**

### Files
*   `final_analysis_data.csv`: Contains the 16 evaluated answers. Profiles P01 (Strong), P02 (Partial), P03 (Confidently Wrong), and P04 (Near-Reference) were scored by two independent human raters, Gemini 2.5 Flash, and a custom keyword heuristic.
*   `analyze.py`: A pure-Python script (no external libraries required) that calculates the Spearman Rank Correlation and Mean Absolute Error for the study.

### How to Reproduce the Results
1. Ensure Python 3 is installed.
2. Run the script:
   ```bash
   python analyze.py
   ```

The script will output the exact statistical figures used in Chapter 4 of the thesis.