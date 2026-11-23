

\# Transaction and Rollback Testing



\## Objective



Implement a transactional operation to move a task between projects while recording the operation in the audit\_logs table.



\## API Endpoint



PATCH /api/tasks/:id/move



Request body:

```json

{

&#x20; "newProjectId": 2

}

```



\## Transaction Implementation



The moveTaskToProject service uses a PostgreSQL transaction:



1\. BEGIN starts the transaction.

2\. SELECT ... FOR UPDATE locks the task.

3\. UPDATE changes the task's project\_id.

4\. INSERT records the movement in audit\_logs.

5\. COMMIT saves both operations.



If an error occurs, ROLLBACK reverses all changes.



\## Successful Transaction Test



Task ID: 1



Original project: 1



Destination project: 2



Result:

\- API returned success.

\- Task project\_id changed to 2.

\- Audit log was successfully created.

\- Action recorded: TASK\_MOVED.



\## Rollback Test



A temporary PostgreSQL trigger was created to simulate an audit-log insertion failure.



Test operation:

\- Attempted to move Task ID 1 from Project 2 back to Project 1.

\- Task update was attempted.

\- Audit-log insertion raised an exception.

\- API returned: Simulated audit log failure.



Rollback verification:



```sql

SELECT id, project\_id, title

FROM tasks

WHERE id = 1;

```



Observed result:

\- Task ID: 1

\- project\_id: 2



The task remained in Project 2, proving that the earlier update was rolled back.



\## Cleanup



The temporary test trigger and function were dropped after testing.



\## Conclusion



The transaction ensures that task movement and audit logging succeed or fail together. The rollback test confirms database consistency when an operation fails.



