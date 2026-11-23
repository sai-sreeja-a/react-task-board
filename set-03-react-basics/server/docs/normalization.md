# Database Normalization – Task Tracker

## 1. Introduction

Database normalization is the process of organizing data into related tables to reduce duplication, maintain data consistency, and prevent insertion, update, and deletion anomalies.

Our Task Tracker database follows Third Normal Form (3NF).

## 2. First Normal Form (1NF)

A table satisfies 1NF when:
- Each column contains atomic (single) values.
- Each row is uniquely identifiable.
- There are no repeating groups or arrays of values in a column.

How our database satisfies 1NF:
- Each user has a separate row in the users table.
- Each task has a separate row in the tasks table.
- Comments are stored as individual rows.
- Tags are stored separately rather than as comma-separated values.
- Multiple tags assigned to a task are represented using the task_tags table.

Example:

Instead of storing tags like:

| task_id | tags |
|---|---|
| 1 | React, Testing, Frontend |

We store them separately in tags and task_tags.

## 3. Second Normal Form (2NF)

A table satisfies 2NF when:
- It already satisfies 1NF.
- Every non-key column depends on the entire primary key, not just part of it.

How our database satisfies 2NF:
- Most tables use a single-column primary key, so their non-key attributes depend on that key.
- The task_tags table uses a composite primary key (task_id, tag_id).
- It contains no additional non-key columns, avoiding partial dependencies.

## 4. Third Normal Form (3NF)

A table satisfies 3NF when:
- It already satisfies 2NF.
- Non-key columns depend only on the primary key, not on other non-key columns.

How our database satisfies 3NF:
- User information is stored only in the users table.
- Project information is stored only in the projects table.
- Task information is stored only in the tasks table.
- Comment information is stored only in the comments table.
- Tag names are stored separately in the tags table.
- Relationships between tasks and tags are maintained through task_tags.
- Audit information is stored separately in audit_logs.

For example, project owner details are not repeated in every task. The task refers to its project through project_id, and the project refers to its owner through user_id.

## 5. Benefits of Normalization

- Reduces unnecessary data duplication.
- Improves data consistency.
- Prevents insertion, update, and deletion anomalies.
- Makes database maintenance easier.
- Keeps relationships clear through primary and foreign keys.

## 6. Conclusion

The Task Tracker database is designed using normalized relational tables and follows 1NF, 2NF, and 3NF principles. This structure supports data integrity, maintainability, and efficient querying as the application grows.
