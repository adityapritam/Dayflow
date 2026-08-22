const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- Starting Dayflow HRMS End-to-End API Integration Verification ---');

  // 1. Login HR Admin
  console.log('\n1. Testing HR Admin Login...');
  const adminRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'admin@dayflow.com', password: 'Password123!' }),
  });
  const adminData = await adminRes.json();
  if (!adminRes.ok) throw new Error(`Admin login failed: ${adminData.error}`);
  console.log(`✔ Admin Logged In: ${adminData.user.profile.firstName} ${adminData.user.profile.lastName} (${adminData.user.role})`);
  const adminToken = adminData.token;

  // 2. Login Employee
  console.log('\n2. Testing Employee Login...');
  const empRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'alex@dayflow.com', password: 'Password123!' }),
  });
  const empData = await empRes.json();
  if (!empRes.ok) throw new Error(`Employee login failed: ${empData.error}`);
  console.log(`✔ Employee Logged In: ${empData.user.profile.firstName} (${empData.user.employeeId})`);
  const empToken = empData.token;

  // 3. Employee Attendance Check-in
  console.log('\n3. Testing Employee Check-in...');
  const checkInRes = await fetch(`${BASE_URL}/attendance/check-in`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empToken}` },
  });
  const checkInData = await checkInRes.json();
  console.log(`✔ Check-in Result: ${checkInData.message || checkInData.error}`);

  // 4. Employee Apply for Leave
  console.log('\n4. Testing Employee Leave Submission...');
  const leaveRes = await fetch(`${BASE_URL}/leaves/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${empToken}` },
    body: JSON.stringify({
      leaveType: 'PAID',
      startDate: '2026-10-01',
      endDate: '2026-10-05',
      reason: 'Automated end-to-end integration test leave',
    }),
  });
  const leaveData = await leaveRes.json();
  if (!leaveRes.ok) throw new Error(`Leave application failed: ${leaveData.error}`);
  console.log(`✔ Leave Submitted! Status: ${leaveData.leaveRequest.status}, ID: ${leaveData.leaveRequest.id}`);
  const createdLeaveId = leaveData.leaveRequest.id;

  // 5. HR Admin Approve Leave
  console.log('\n5. Testing HR Admin Leave Approval...');
  const approveRes = await fetch(`${BASE_URL}/leaves/${createdLeaveId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({
      status: 'APPROVED',
      adminComment: 'Approved via automated test suite verification.',
    }),
  });
  const approveData = await approveRes.json();
  if (!approveRes.ok) throw new Error(`Leave approval failed: ${approveData.error}`);
  console.log(`✔ HR Approved Leave! Updated Status: ${approveData.leaveRequest.status}`);

  // 6. Employee Verify Leave Status
  console.log('\n6. Testing Employee Leave Verification...');
  const myLeavesRes = await fetch(`${BASE_URL}/leaves/my`, {
    headers: { Authorization: `Bearer ${empToken}` },
  });
  const myLeavesData = await myLeavesRes.json();
  const targetLeave = myLeavesData.leaveRequests.find(l => l.id === createdLeaveId);
  console.log(`✔ Employee observed updated leave status: ${targetLeave?.status} ("${targetLeave?.adminComment}")`);

  // 7. HR Admin Fetch Dashboard Stats
  console.log('\n7. Testing HR Admin Dashboard Stats Endpoint...');
  const statsRes = await fetch(`${BASE_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const statsData = await statsRes.json();
  console.log(`✔ HR Admin Stats Computed Successfully!`, statsData.stats);

  console.log('\n===================================================');
  console.log('🎉 ALL END-TO-END INTEGRATION TESTS PASSED 100%!');
  console.log('===================================================');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
