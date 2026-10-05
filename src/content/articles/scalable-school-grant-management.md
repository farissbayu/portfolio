---
title: "Designing a School Grant Management Platform"
description: "Lessons from building SGS Pendidikan: multi-role workflows, verification states, and reporting."
publishedDate: 2026-01-09
tags: ["Laravel", "React", "MySQL", "Product"]
---

SGS Pendidikan is a grant management platform used by schools under the Pasuruan Regency Education Office. It handles the full lifecycle: school data, applications, verification, and reporting.

## Model the workflow, not the screens

The temptation is to build screens first. The better move is to model the states a grant application can be in, then let screens fall out of that model.

```text
draft -> submitted -> verified -> funded -> reported
             \-> rejected
```

Once the state machine is explicit, permissions become tractable: who can move an application from `submitted` to `verified`, and what evidence is required at each transition.

## Data integrity at the edges

Grant data arrives from many schools with inconsistent formats. Validation belongs at the boundary. Normalize early, store clean, and make the reporting layer boring.

## What I would do differently

Start with the reporting requirements. Reports are the reason the system exists, and designing backwards from them surfaces missing fields far earlier than building the application form first.
