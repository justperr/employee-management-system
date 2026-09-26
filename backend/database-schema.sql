CREATE DATABASE employee_management_db;
GO

USE employee_management_db;
GO

CREATE TABLE Users (
    UserId INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255) NOT NULL,
    Role NVARCHAR(50) NOT NULL DEFAULT 'Employee',
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Departments (
    DepartmentId INT PRIMARY KEY IDENTITY(1,1),
    DepartmentName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Positions (
    PositionId INT PRIMARY KEY IDENTITY(1,1),
    PositionName NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Employees (
    EmployeeId INT PRIMARY KEY IDENTITY(1,1),
    FirstName NVARCHAR(50) NOT NULL,
    LastName NVARCHAR(50) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    Phone NVARCHAR(20),
    DateOfBirth DATE,
    HireDate DATE NOT NULL,
    Salary DECIMAL(10, 2),
    DepartmentId INT NOT NULL,
    PositionId INT NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Active',
    UserId INT,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (DepartmentId) REFERENCES Departments(DepartmentId),
    FOREIGN KEY (PositionId) REFERENCES Positions(PositionId),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

INSERT INTO Departments (DepartmentName, Description) VALUES 
('IT', 'Information Technology Department'),
('HR', 'Human Resources Department'),
('Sales', 'Sales Department'),
('Finance', 'Finance Department');

INSERT INTO Positions (PositionName, Description) VALUES 
('Software Engineer', 'Develops and maintains software applications'),
('Manager', 'Manages team and projects'),
('HR Executive', 'Handles HR operations'),
('Accountant', 'Handles financial accounts'),
('Sales Executive', 'Sells company products and services');

INSERT INTO Users (Email, PasswordHash, Role) VALUES 
('admin@company.com', '\$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36P4/HSK', 'Admin');