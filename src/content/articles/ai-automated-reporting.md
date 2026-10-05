---
title: "AI-Assisted Automated Reporting with LLMs"
description: "How I automated monthly project reporting by feeding completed GitLab tasks into an LLM pipeline."
publishedDate: 2026-02-18
tags: ["AI", "LLM", "Laravel", "GitLab"]
featured: true
---

Monthly reporting is one of those tasks that is high value and low joy. Every month, someone has to read through dozens of completed tasks and turn them into a narrative. This is exactly the kind of work an LLM is good at — if you feed it structured data.

## The pipeline

1. Pull completed tasks and activity from a self-hosted GitLab instance.
2. Normalize each task into a compact record: title, description, labels, closed date.
3. Group records by developer and project.
4. Send the grouped records to an LLM with a strict output schema.
5. Persist the generated report for human review before publishing.

## Why structure matters

The quality of generated reports depends almost entirely on the input shape. Instead of dumping raw issue bodies, I reduce each task to a few fields. This keeps token usage predictable and makes the output far less prone to hallucination.

```php
$records = $tasks->map(fn (Task $task) => [
    'title' => $task->title,
    'labels' => $task->labels->pluck('name'),
    'closed_at' => $task->closed_at->toDateString(),
]);
```

## Keeping a human in the loop

Automation is not the same as autonomy. The report is generated as a draft. A reviewer can accept, edit, or regenerate it. That single checkpoint turns a risky feature into a reliable one.
