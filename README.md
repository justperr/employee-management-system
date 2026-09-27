# Employee Management System

A web-based Employee Management System built using ReactJS, Ant Design, ExpressJS, Microsoft SQL Server, and RESTful APIs.

The system provides employee management, department and position management, authentication, dashboard analytics, and employee reports with CSV export and printing functionality.

---

## Features

### Authentication

* User login
* JWT-based authentication
* Protected application routes
* Role-based access control
* Admin-only management operations

### Employee Management

* View employees
* Add employees
* Edit employees
* Delete employees
* Search employees
* Assign departments and positions
* Set employee status
* Record employee contact, hire date, salary, and other information

### Department Management

* View departments
* Add departments
* Edit departments
* Delete departments
* Prevent deletion of departments currently assigned to employees or positions

### Position Management

* View positions
* Add positions
* Edit positions
* Delete positions
* Assign positions to departments
* Prevent deletion of positions currently assigned to employees

### Dashboard

* Total employee count
* Active employee count
* Inactive employee count
* Total payroll
* Employees by department
* Workforce status
* Recent hires
* Quick management actions

### Reports

* Employee Directory
* Department Headcount
* Salary Summary
* CSV export
* Print-ready reports

---

## Technology Stack

### Frontend

* ReactJS
* React Router
* Ant Design
* Axios
* Day.js

### Backend

* Node.js
* ExpressJS
* MSSQL
* JSON Web Token (JWT)
* bcryptjs

### Database

* Microsoft SQL Server

### Development Tools

* Git
* GitHub
* Visual Studio Code
* SQL Server Management Studio (SSMS)

---

## Project Structure

```text
employee-management-system/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   │
│   ├── database-schema.sql
│   ├── DATABASE_SETUP.md
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── layouts/
│   │   ├── pages/
│   │   └── services/
│   │
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

---

## Prerequisites

Install the following before running the application:

* Node.js and npm
* Microsoft SQL Server 2016 or higher
* SQL Server Management Studio (SSMS)
* Git

---

## Database Setup

The application uses Microsoft SQL Server.

### Database Information

```text
Database Name: employee_management_db

Tables:
- Users
- Departments
- Positions
- Employees
```

The database schema is located at:

```text
backend/database-schema.sql
```

Detailed database instructions are available in:

```text
backend/DATABASE_SETUP.md
```

### Setup Steps

1. Open SQL Server Management Studio.
2. Connect to your MSSQL Server.
3. Open `backend/database-schema.sql`.
4. Execute the SQL scripts.
5. Verify that the database and required tables have been created.
6. Verify that the relationships between Departments, Positions, and Employees are configured correctly.

---

## Backend Setup

Open PowerShell or another terminal in the backend directory:

```powershell
cd backend
```

Install the backend dependencies:

```powershell
npm install
```

Create a `.env` file inside the `backend` directory.

Example:

```env
DB_USER=your_sql_server_username
DB_PASSWORD=your_sql_server_password
DB_SERVER=your_sql_server_name
DB_DATABASE=employee_management_db
DB_PORT=1433

JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=development
```

Do not commit the `.env` file to GitHub.

### Start the Backend

```powershell
npm start
```

For development with automatic server restarting:

```powershell
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Backend Health Check

Open:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "message": "Server is running"
}
```

---

## Frontend Setup

Open another terminal and navigate to the frontend directory:

```powershell
cd frontend
```

Install the frontend dependencies:

```powershell
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Start the Frontend

```powershell
npm start
```

The application should be available at:

```text
http://localhost:3000
```

---

## Running the Application

Run the backend and frontend in separate terminals.

### Terminal 1 — Backend

```powershell
cd backend
npm start
```

### Terminal 2 — Frontend

```powershell
cd frontend
npm start
```

Then open:

```text
http://localhost:3000
```

---

## Sample Login Credentials

The database setup includes a sample administrator account:

```text
Email: admin@company.com
Password: admin123
```

The administrator can perform employee, department, and position management operations.

> For production use, replace sample credentials with secure credentials.

---

## User Roles

### Admin

Administrators can:

* View employees
* Add employees
* Edit employees
* Delete employees
* View departments
* Add departments
* Edit departments
* Delete departments
* View positions
* Add positions
* Edit positions
* Delete positions
* View reports

### User

Regular users can:

* View employees
* View departments
* View positions
* View reports

Management operations are restricted to administrators through both the frontend interface and backend authorization middleware.

---

## REST API

All API endpoints use the `/api` prefix.

### Authentication

| Method | Endpoint             | Access |
| ------ | -------------------- | ------ |
| POST   | `/api/auth/login`    | Public |
| POST   | `/api/auth/register` | Admin  |

### Employees

| Method | Endpoint             | Access        |
| ------ | -------------------- | ------------- |
| GET    | `/api/employees`     | Authenticated |
| GET    | `/api/employees/:id` | Authenticated |
| POST   | `/api/employees`     | Admin         |
| PUT    | `/api/employees/:id` | Admin         |
| DELETE | `/api/employees/:id` | Admin         |

### Departments

| Method | Endpoint               | Access        |
| ------ | ---------------------- | ------------- |
| GET    | `/api/departments`     | Authenticated |
| POST   | `/api/departments`     | Admin         |
| PUT    | `/api/departments/:id` | Admin         |
| DELETE | `/api/departments/:id` | Admin         |

### Positions

| Method | Endpoint             | Access        |
| ------ | -------------------- | ------------- |
| GET    | `/api/positions`     | Authenticated |
| POST   | `/api/positions`     | Admin         |
| PUT    | `/api/positions/:id` | Admin         |
| DELETE | `/api/positions/:id` | Admin         |

### Reports

| Method | Endpoint                            | Access        |
| ------ | ----------------------------------- | ------------- |
| GET    | `/api/reports/employee-directory`   | Authenticated |
| GET    | `/api/reports/department-headcount` | Authenticated |
| GET    | `/api/reports/salary-summary`       | Authenticated |

### Health Check

| Method | Endpoint      | Access |
| ------ | ------------- | ------ |
| GET    | `/api/health` | Public |

---

## Testing the Application

### Authentication

1. Open the application.
2. Log in using the sample administrator account.
3. Verify that the dashboard is displayed.
4. Log out.
5. Verify that protected pages require authentication.

### Employee Management

1. Open **Employees**.
2. Add a new employee.
3. Select a department.
4. Verify that the Position dropdown displays positions belonging to that department.
5. Save the employee.
6. Edit the employee.
7. Verify the updated information.
8. Delete the employee.
9. Verify that the employee is removed.

### Department Management

1. Open **Departments**.
2. Add a department.
3. Edit the department.
4. Verify the updated information.
5. Delete the department when it has no dependent employee or position records.

### Position Management

1. Open **Positions**.
2. Add a position.
3. Assign it to a department.
4. Edit the position.
5. Verify the updated information.
6. Delete the position when it is not assigned to an employee.

### Reports

1. Open **Reports**.
2. Verify the summary statistics.
3. Verify the Department Headcount report.
4. Verify the Salary Summary report.
5. Verify the Employee Directory.
6. Test each **Export CSV** button.
7. Test each **Print** button.

### Responsive Layout

Test the application on desktop, tablet, and mobile screen sizes.

On smaller screens, verify that:

* The desktop sidebar is hidden.
* The hamburger menu appears.
* The navigation drawer opens correctly.
* Selecting a menu item navigates to the selected page.
* The navigation drawer closes after navigation.
* Page content remains readable.

---

## Git Workflow

Git is used for version control and the project follows feature-based commits for major development milestones.

Example commit history:

```text
feat: implement login authentication
feat: implement employee CRUD
feat: implement employee reports
fix: display sequential department numbers
feat: implement position CRUD
fix: improve responsive navigation layout
feat: add report printing
```

---

## Security Notes

* JWT is used for authentication.
* Passwords are hashed using bcryptjs.
* Protected API routes require authentication.
* Administrative API operations require the Admin role.
* Database queries use parameterized inputs.
* Database credentials are stored in environment variables.
* JWT configuration is stored in environment variables.
* `.env` files must not be committed to GitHub.
* Sample credentials should be replaced for production use.

---

## License

This project was developed as an Employee Management System application for Lloyd Laboratories Inc. assessment for a Jr. Programming position. 
