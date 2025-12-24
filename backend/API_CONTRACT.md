# Backend API Contract

## Authorization

All protected endpoints require the following header:

Authorization: Bearer <JWT_TOKEN>

---

## Authentication

### POST /auth/google
- Role: public
- Body:
  - idToken: string
- Response:
  - token: string
  - user: {
      id: string,
      name: string,
      email: string,
      role: student | proctor | mentor
    }

---

## Claims

### GET /claims/proctor
- Role: proctor
- Description:
  - Fetch all PENDING claims for review
- Response:
  - claims: Claim[]

---

### PATCH /claims/proctor/:claimId
- Role: proctor
- Description:
  - Approve, reject, or put a claim on hold
- Body:
  - status: APPROVED | REJECTED | ON_HOLD
  - reviewRemarks?: string
- Response:
  - claim: Claim

---

### GET /claims/mentor
- Role: mentor
- Description:
  - Fetch APPROVED claims mentored by the logged-in mentor
- Response:
  - claims: Claim[]

---

## Data Models

### Claim
{
  _id: string,
  studentId: string,
  mentorIds: string[],
  title: string,
  description: string,
  category: string,
  proofUrl: string,
  status: PENDING | ON_HOLD | APPROVED | REJECTED,
  reviewRemarks: string,
  reviewedBy: string | null,
  reviewedAt: string | null,
  createdAt: string,
  updatedAt: string
}
