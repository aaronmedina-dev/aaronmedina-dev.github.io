# PERT Estimate Calculator

A web-based tool for calculating project time estimates using the Program Evaluation and Review Technique (PERT).

## What is PERT?

PERT uses three-point estimation to calculate realistic project timelines:

```
PERT Estimate = (Optimistic + 4 x Likely + Pessimistic) / 6
```

This weighted average accounts for uncertainty in task duration, giving more weight to the most likely scenario while considering best and worst cases.

## Features

- **Dynamic task management** - Add and remove tasks as needed
- **Flexible time units** - Minutes, hours, days, weeks, or months
- **Complexity tracking** - Tag tasks as low, medium, or high complexity (reference only)
- **Template system** - Save and load task lists as JSON files
- **Multiple export formats**:
  - Plain text (clipboard)
  - Rich HTML (clipboard)
  - PNG image (clipboard)

## Usage

1. Add tasks with optimistic, likely, and pessimistic time estimates
2. Select your preferred time unit
3. Click "Calculate" to generate PERT estimates
4. Export results in your preferred format

## Live Demo

[https://aaronmedina-dev.github.io/pert/](https://aaronmedina-dev.github.io/pert/)
