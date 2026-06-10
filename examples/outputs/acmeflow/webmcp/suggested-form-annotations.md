# Suggested Form Annotations

These are conservative AgentLayer suggestions. They do not grant agents
permission to submit forms.

## contact_sales

Source: http://localhost:3001/contact Suggested purpose: Find the path for
contacting sales. Requires human confirmation: true Form operability score: 100
Sensitivity: medium

Suggested fields:

- name (text) - required
- email (email) - required
- company (text) - required
- message (textarea)

## book_demo

Source: http://localhost:3001/demo Suggested purpose: Find the path for booking
a product demo. Requires human confirmation: true Form operability score: 100
Sensitivity: medium

Suggested fields:

- name (text) - required
- email (email) - required
- company (text) - required
- preferredTime (text)
- message (textarea)

## request_support

Source: http://localhost:3001/support Suggested purpose: Find the support
request path. Requires human confirmation: true Form operability score: 100
Sensitivity: medium

Suggested fields:

- name (text) - required
- email (email) - required
- message (textarea) - required
