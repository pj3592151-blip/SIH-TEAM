export const documents = [
  { id: 1, name: 'FIR_0425.pdf', case: 'Case #2025_18', type: 'PDF', uploaded: '12 Sep 2026' },
  { id: 2, name: 'Evidence_Image_01.jpg', case: 'Case #2025_18', type: 'Image', uploaded: '11 Sep 2026' },
  { id: 3, name: 'Witness_Statement.docx', case: 'Case #2025_17', type: 'Document', uploaded: '10 Sep 2026' },
  { id: 4, name: 'Forensic_Report.pdf', case: 'Case #2025_16', type: 'PDF', uploaded: '09 Sep 2026' },
  { id: 5, name: 'CCTV_Footage.mp4', case: 'Case #2025_16', type: 'Video', uploaded: '08 Sep 2026' },
]
export const activities = [
  { icon: 'upload', tone: 'blue', title: 'You uploaded FIR_0425.pdf', time: 'Today, 10:24 AM' },
  { icon: 'share', tone: 'green', title: 'Shared Case Files with A. Singh', time: 'Today, 09:12 AM' },
  { icon: 'view', tone: 'purple', title: 'Evidence_Image_01.jpg viewed', time: 'Yesterday, 06:45 PM' },
  { icon: 'edit', tone: 'orange', title: 'Case #2025_18 updated', time: 'Yesterday, 02:30 PM' },
  { icon: 'user', tone: 'blue', title: 'New user added – R. Mehta', time: '12 Sep 2026, 11:20 AM' },
]
export const cases = [
  { id: 'CASE #2025_18', title: 'Financial Misconduct Investigation', status: 'Active', investigator: 'Pranshu Jain', documents: 26, updated: 'Updated today', priority: 'High' },
  { id: 'CASE #2025_17', title: 'Witness Statement Review', status: 'Active', investigator: 'A. Singh', documents: 14, updated: 'Updated yesterday', priority: 'Medium' },
  { id: 'CASE #2025_16', title: 'Surveillance Evidence Archive', status: 'Closed', investigator: 'R. Mehta', documents: 42, updated: 'Updated 08 Sep', priority: 'Low' },
  { id: 'CASE #2025_15', title: 'Vendor Compliance Matter', status: 'Active', investigator: 'Pranshu Jain', documents: 9, updated: 'Updated 06 Sep', priority: 'High' },
]
export const auditLogs = [
  { id: 1, user: 'Pranshu Jain', action: 'Uploaded document', subject: 'FIR_0425.pdf', time: '12 Sep 2026, 10:24 AM', device: '10.84.16.42 · Chrome', result: 'Success' },
  { id: 2, user: 'A. Singh', action: 'Viewed document', subject: 'Evidence_Image_01.jpg', time: '12 Sep 2026, 09:48 AM', device: '10.84.16.31 · Edge', result: 'Success' },
  { id: 3, user: 'Pranshu Jain', action: 'Shared document', subject: 'Case #2025_18', time: '11 Sep 2026, 04:05 PM', device: '10.84.16.42 · Chrome', result: 'Success' },
  { id: 4, user: 'R. Mehta', action: 'Downloaded document', subject: 'Forensic_Report.pdf', time: '11 Sep 2026, 11:12 AM', device: '10.84.16.25 · Safari', result: 'Success' },
  { id: 5, user: 'Administrator', action: 'Modified permissions', subject: 'Case #2025_16', time: '10 Sep 2026, 03:36 PM', device: '10.84.16.2 · Admin', result: 'Success' },
  { id: 6, user: 'System', action: 'Verified blockchain record', subject: 'FIR_0425.pdf', time: '10 Sep 2026, 10:25 AM', device: 'Verification service', result: 'Success' },
]
export const users = [
  { initials: 'PJ', name: 'Pranshu Jain', role: 'Investigation Officer', department: 'Investigations', access: 'Full', status: 'Active', lastActive: 'Now' },
  { initials: 'AS', name: 'A. Singh', role: 'Legal Officer', department: 'Legal Affairs', access: 'Edit', status: 'Active', lastActive: '18 min ago' },
  { initials: 'RM', name: 'R. Mehta', role: 'Analyst', department: 'Forensics', access: 'Edit', status: 'Active', lastActive: '2 hours ago' },
  { initials: 'LM', name: 'L. Menon', role: 'Viewer', department: 'Compliance', access: 'View', status: 'Inactive', lastActive: '4 days ago' },
]
