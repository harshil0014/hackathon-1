export const mockClaims = [
  {
    id: "1", // mapped from _id
    studentId: "student-1",
    mentorIds: [],
    title: "GDG TechSprint 2024",
    description: "Participated in GDG TechSprint hackathon",
    category: "Hackathon",
    proofUrl: null,
    status: "PENDING",
    reviewRemarks: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: "2024-11-20T00:00:00.000Z",
    updatedAt: "2024-11-20T00:00:00.000Z"
  },
  {
    id: "2",
    studentId: "student-1",
    mentorIds: ["mentor-1"],
    title: "State Level Quiz",
    description: "Secured position in state level quiz",
    category: "Academic",
    proofUrl: null,
    status: "APPROVED",
    reviewRemarks: "Well done",
    reviewedBy: "proctor-1",
    reviewedAt: "2024-11-12T00:00:00.000Z",
    createdAt: "2024-11-10T00:00:00.000Z",
    updatedAt: "2024-11-12T00:00:00.000Z"
  }
];
