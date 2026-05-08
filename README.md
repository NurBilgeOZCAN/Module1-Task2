# Precision Lab: From Vague to Precise Prompts

## Overview

This project was created as part of the **Precision Lab: From Vague to Precise Prompts** activity.

The purpose of this lab is to observe how prompt precision affects AI output quality. In this exercise, the same feature is requested from an AI assistant three times with increasing levels of detail.

The selected feature is a **user authentication system** including:

- User login
- User registration
- Password management

Each round focuses on improving the prompt by adding more context, constraints, examples, success criteria, security requirements, and expected output formats.

## Lab Context

**Module:** Precision Principle  
**Lab Name:** From Vague to Precise Prompts  
**Duration:** 30 minutes  
**AI Tool:** GitHub Copilot Chat  
**Main Topic:** Prompt Precision  
**Deliverable:** Three prompts showing progression from vague to precise  

## Objective

The objective of this lab is to compare how AI-generated outputs change when prompts become more specific and structured.

The lab demonstrates that vague prompts often lead to hidden assumptions, missing requirements, and more rework, while precise prompts can produce more complete and reliable results.

## Feature

The feature used in all three rounds is:

```txt
Build a user authentication system with:
- User login
- User registration
- Password management
```

This feature is intentionally broad in Round 1. More detail is added in Round 2 and Round 3.

## Project Structure

```txt
PRECISION-LAB/
├── README.md
├── prompts/
│   ├── round-1-natural-baseline.md
│   ├── round-2-precision-techniques.md
│   └── round-3-maximum-precision.md
└── outputs/
    ├── round-1-ai-output.md
    ├── round-2-ai-output.md
    └── round-3-ai-output.md
```

## Round 1: Natural Baseline

### Goal

Write the prompt naturally, without overthinking or adding detailed requirements.

The purpose of this round is to capture the baseline AI output and identify what the AI assumes by itself.

### Round 1 Prompt

```txt
Create a user authentication system.
```

### Quick Assessment

#### What AI Assumed

| Area | AI Assumption |
| ---- | ------------- |
| Tech stack | React / Node.js assumed |
| Auth method | Email and password based authentication |
| Database | A database structure was assumed without a clear choice |
| Password rules | Basic password validation assumed |
| Error handling | Generic error handling assumed |

#### Missing Critical Pieces

- [x] Security measures
- [x] API structure
- [x] Data validation
- [x] Error messages
- [ ] Other: Detailed session and token expiration rules

#### Confidence Level

```txt
Confidence Level: 4/10
```

### Round 1 Notes

The first prompt was too vague. The AI produced a general solution, but it made several decisions without explicit guidance.

Important missing details included password hashing rules, rate limiting, database choice, API response format, and specific validation requirements.

## Round 2: Apply Precision Techniques

### Goal

Improve the prompt using several precision techniques.

Techniques applied in this round:

- Clear and direct instructions
- Context and tech stack specification
- Step-by-step task breakdown
- Success criteria
- Basic security requirements

### Round 2 Prompt

```txt
Create a user authentication system for a web application.

Requirements:
- Users must be able to register with email and password.
- Users must be able to log in with email and password.
- Users must be able to reset their password via email.
- Password must be at least 8 characters long.
- Password must include at least 1 uppercase letter and 1 number.
- Passwords must be hashed before saving.

Tech Stack:
- React + TypeScript frontend
- Node.js + Express backend
- PostgreSQL database

Authentication:
- Use JWT tokens after successful login.
- Return the token to the frontend after login.
- Store user records in PostgreSQL.

Success Criteria:
- User can register successfully.
- User can log in successfully.
- User can request password reset.
- Passwords are not stored in plain text.
- Errors are displayed clearly to the user.
```

### Quick Assessment

#### Techniques Applied

- [x] Clear and direct
- [x] Role/context given
- [ ] Examples provided
- [x] Steps broken down
- [x] Tech stack specified

#### Improvements from Round 1

| Question | Answer |
| -------- | ------ |
| AI no longer assumed | The tech stack, authentication method, and database |
| Now includes | Password rules, JWT usage, and basic success criteria |
| Better handling of | Registration, login, password reset, and validation |

#### Confidence Level

```txt
Confidence Level: 7/10
Previous Confidence Level in Round 1: 4/10
```

### Round 2 Notes

The second prompt produced a more focused and useful output. The AI had fewer assumptions to make because the requirements, tech stack, and success criteria were clearly stated.

However, the prompt still missed detailed error responses, rate limiting, token expiry, endpoint definitions, and exact response schema.

## Round 3: Maximum Precision

### Goal

Create the most complete and precise prompt possible by adding security requirements, API endpoints, error handling rules, response format, and production-readiness expectations.

### Round 3 Prompt

```txt
Build a production-ready user authentication system for a web application.

Feature Scope:
- User registration
- User login
- Password reset request
- Password reset confirmation
- Password validation
- JWT-based authentication

Tech Stack:
- Frontend: React + TypeScript
- Backend: Node.js + Express
- Database: PostgreSQL
- Password hashing: bcrypt
- Token format: JWT

Security Requirements:
- Hash passwords using bcrypt with cost factor 12.
- Never store plain-text passwords.
- Apply rate limiting for login attempts.
- Limit login attempts to 5 failed attempts per hour.
- Lock the account temporarily after too many failed attempts.
- JWT session expiry must be 24 hours.
- Validate all user inputs on the backend.
- Do not reveal whether the email or password is incorrect.

Password Rules:
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- Must not be empty
- Must be validated before submission and again on the backend

API Endpoints:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/reset-password
- POST /api/auth/confirm-reset-password

Expected API Response Format:
{
  "success": true,
  "data": {
    "token": "jwt-token-value",
    "expiresIn": 86400
  },
  "error": null
}

Error Response Format:
{
  "success": false,
  "data": null,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}

Required Error Messages:
- Invalid credentials: "Invalid email or password"
- Locked account: "Too many attempts. Try again in 1 hour."
- Network error: "Connection failed. Please try again."
- Weak password: "Password must be at least 8 characters and include 1 uppercase letter and 1 number."
- Existing email: "An account with this email already exists."

Frontend Requirements:
- Registration form
- Login form
- Password reset request form
- Clear validation messages
- Loading state during API requests
- Error state when request fails
- Success message after password reset request

Backend Requirements:
- Express route handlers
- Request validation
- Password hashing with bcrypt
- JWT generation
- PostgreSQL user table schema
- Rate limiting middleware
- Consistent response format

Database Schema:
users table:
- id: UUID, primary key
- email: string, unique, required
- password_hash: string, required
- failed_login_attempts: integer, default 0
- locked_until: timestamp, nullable
- created_at: timestamp
- updated_at: timestamp

Success Criteria:
- A new user can register with a valid email and password.
- A registered user can log in successfully.
- Invalid login attempts return a generic error message.
- Passwords are hashed before being saved.
- JWT token expires after 24 hours.
- Login is blocked after 5 failed attempts within 1 hour.
- Password reset flow uses clear API endpoints and consistent responses.
- All API responses follow the same response format.
```

### Quick Assessment

#### Additional Techniques Applied

- [x] Security requirements
- [x] Error scenarios
- [x] API endpoints defined
- [x] Success criteria
- [x] Data schemas
- [x] Performance constraints

#### Production Readiness

- [ ] Could deploy as-is
- [x] Needs minor tweaks only
- [ ] Still needs significant work

#### Confidence Level

```txt
Confidence Level: 9/10
Round 1 Confidence Level: 4/10
Round 2 Confidence Level: 7/10
```

### Round 3 Notes

The third prompt produced the most complete and controlled output. It reduced ambiguity by defining technical choices, security expectations, API structure, response schemas, validation rules, and error messages.

The AI had much less room to make hidden assumptions.

## Compare and Measure

### Quality Assessment

| Metric | Round 1 | Round 2 | Round 3 |
| ------ | ------- | ------- | ------- |
| Prompt Length | 1 line | 20+ lines | 70+ lines |
| Quality Score | 4/10 | 7/10 | 9/10 |
| Assumptions Made by AI | Many | Some | Few |
| Rework Needed | Hours | Minutes | Minimal |
| Production Ready? | No | No | Almost |

## Time Investment

| Round | Prompt Time | Fixing Time | Total |
| ----- | ----------- | ----------- | ----- |
| Round 1 | 2 min | 30 min | 32 min |
| Round 2 | 5 min | 15 min | 20 min |
| Round 3 | 10 min | 5 min | 15 min |

## Key Insights

### Which techniques had the biggest impact?

The most useful techniques were:

- Defining the tech stack clearly
- Adding security requirements
- Specifying API endpoints
- Providing response formats
- Listing success criteria
- Defining exact error messages

### Was the extra precision time worth it?

Yes. Although the precise prompt took longer to write, it reduced rework and improved output quality.

The Round 3 prompt produced a more complete and reliable result compared to the vague Round 1 prompt.

### Where would this be useful in real work?

This approach would be useful for:

- Writing Jira stories
- Creating feature implementation prompts
- Preparing backend API tasks
- Defining frontend component requirements
- Writing documentation
- Creating test cases
- Reviewing AI-generated code

## The Precision Paradox

Writing precise prompts may feel slower at the beginning, but it usually saves time later.

A vague prompt can lead to:

- More debugging
- More clarification
- More missing requirements
- More rework

A precise prompt leads to:

- Better first output
- Fewer assumptions
- Clearer implementation
- Higher confidence
- Easier handoff

## Apply This Week

### Pick One Real Task

- [x] Writing a Jira story
- [ ] Code review comment
- [ ] Documentation
- [ ] Feature implementation
- [ ] Bug fix
- [ ] Other: ___________

### Commit

```txt
This week I will apply precision techniques to writing clearer Jira stories and feature implementation prompts.
```

## Final Reflection

This lab showed that prompt quality directly affects AI output quality.

Round 1 was fast but vague.  
Round 2 was clearer and more useful.  
Round 3 required more upfront effort but produced the strongest result.

The main lesson is:

```txt
It is not about writing more.
It is about being specific.
```

## Author

Nur Bilge ÖZCAN
