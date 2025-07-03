// Global variables
let currentUser = null; // Stores the username of the currently logged-in user

// --- Utility Functions ---

// Function to get data from localStorage
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Function to save data to localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Function to get all users
function getUsers() {
    return JSON.parse(localStorage.getItem('hr_users') || '{}');
}

// Function to save all users
function saveUsers(users) {
    localStorage.setItem('hr_users', JSON.stringify(users));
}

// --- Authentication ---

// Initial seed data for users (only if no users exist)
function initialSeedData() {
    // Only seed if no users exist, ensuring it doesn't overwrite existing data
    if (!localStorage.getItem('hr_users') || Object.keys(JSON.parse(localStorage.getItem('hr_users'))).length === 0) {
        const users = {};
        // Removed default users
        saveUsers(users);
    }
    // Seed other data types if they don't exist
    if (!localStorage.getItem('hr_leaves')) saveData('hr_leaves', []);
    if (!localStorage.getItem('hr_payrolls')) saveData('hr_payrolls', []);
    if (!localStorage.getItem('hr_recruitments')) saveData('hr_recruitments', []);
    if (!localStorage.getItem('hr_onboarding_tasks')) saveData('hr_onboarding_tasks', []);
    if (!localStorage.getItem('hr_performance')) saveData('hr_performance', []);
    if (!localStorage.getItem('hr_grievances')) saveData('hr_grievances', []);
    if (!localStorage.getItem('hr_learning')) saveData('hr_learning', []);
    if (!localStorage.getItem('hr_policies')) saveData('hr_policies', []); // Initialize policies
    if (!localStorage.getItem('hr_policy_document')) saveData('hr_policy_document', "<h3>Company Policy Guidelines</h3><p>Welcome to our comprehensive company policy document. This document outlines the rules, guidelines, and expectations for all employees to ensure a safe, productive, and respectful work environment.</p><h4>1. Code of Conduct</h4><p>All employees are expected to conduct themselves professionally and ethically. This includes respecting colleagues, clients, and company property. Discrimination, harassment, or any form of unlawful behavior will not be tolerated.</p><h4>2. Work Hours & Leave</h4><p>Standard working hours are 9:00 AM to 5:00 PM, Monday to Friday. Employees are entitled to various types of leave including annual leave, sick leave, and parental leave, as per company policy and local regulations. All leave requests must be submitted through the HR portal and approved by a manager.</p><h4>3. Confidentiality</h4><p>Employees must maintain the confidentiality of all company proprietary information, trade secrets, and sensitive data. Unauthorized disclosure of such information is strictly prohibited and may lead to disciplinary action.</p><h4>4. Health & Safety</h4><p>The company is committed to providing a safe and healthy workplace. Employees are responsible for adhering to all safety procedures and reporting any hazards or incidents immediately.</p><h4>5. Learning & Development</h4><p>We encourage continuous learning and provide resources for professional development. Employees are encouraged to utilize the learning portal for courses and training opportunities.</p><h4>6. Grievance Procedure</h4><p>Employees have the right to raise grievances without fear of retaliation. All grievances will be handled confidentially and addressed in a fair and timely manner. Refer to the grievance section in the HR portal for details on how to submit a grievance.</p><p>This policy document may be updated periodically, and employees will be notified of any significant changes.</p>");
}


// Show Login Form
function showLoginForm() {
    document.getElementById('registerForm').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden');
}

// Show Register Form
function showRegisterForm() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('registerForm').classList.remove('hidden');
}

// Register User
function registerUser(e) {
    e.preventDefault();
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const role = document.getElementById('regRole').value;
    const users = getUsers();

    if (users[username]) {
        showNotification("Username already exists.", "error");
        return;
    }

    users[username] = { password: password, role: role };
    saveUsers(users);
    showNotification("Registration successful! Please login.", "success");
    showLoginForm();
}

// Login User
function loginUser(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const users = getUsers();

    if (users[username] && users[username].password === password) {
        currentUser = username;
        localStorage.setItem('lastLoggedInUser', currentUser);
        document.getElementById('authArea').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        document.getElementById('userDisplay').textContent = currentUser;
        document.getElementById('roleDisplay').textContent = users[currentUser].role;
        renderAll(); // Render all data for the logged-in user
        showTab('dashboard'); // Show dashboard on login
        updateAdminResetButtonVisibility();
        showNotification("Logged in successfully!", "success");
    } else {
        showNotification("Invalid username or password.", "error");
    }
}

// Logout User
function logout() {
    currentUser = null;
    localStorage.removeItem('lastLoggedInUser');
    document.getElementById('authArea').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('loginForm').classList.remove('hidden'); // Show login form after logout
    document.getElementById('registerForm').classList.add('hidden');
    showNotification("Logged out successfully.", "info");
}

// Update Admin Reset Button Visibility
function updateAdminResetButtonVisibility() {
    const users = getUsers();
    if (currentUser && users[currentUser] && users[currentUser].role === 'admin') {
        document.getElementById('adminResetBtn').classList.remove('hidden');
    } else {
        document.getElementById('adminResetBtn').classList.add('hidden');
    }
}

// Confirm Admin Reset
function confirmAdminReset() {
    if (confirm("WARNING: This will delete ALL data (users, leaves, payroll, etc.) and reset the application to its initial state. Are you absolutely sure?")) {
        localStorage.clear();
        initialSeedData(); // Re-seed initial data (without default users)
        logout(); // Log out after reset
        showNotification("All data has been reset to initial state.", "info");
        // After reset, ensure the register form is shown as there are no users
        showRegisterForm();
    }
}

// --- Navigation ---

// Show selected tab
function showTab(tabId) {
    // Hide all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.remove('active');
    });

    // Deactivate all nav buttons
    document.querySelectorAll('.nav-button').forEach(button => {
        button.classList.remove('active');
    });

    // Show the selected section
    document.getElementById(tabId).classList.add('active');

    // Activate the corresponding nav button
    document.querySelector(`.nav-button[onclick="showTab('${tabId}')"]`).classList.add('active');

    // Render content for the active tab
    renderContent(tabId);
}

// Render content based on active tab
function renderContent(tabId) {
    switch (tabId) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'employees':
            renderEmployees();
            break;
        case 'leave':
            renderLeaves();
            break;
        case 'payroll':
            renderPayroll();
            break;
        case 'recruitment':
            renderRecruitment();
            break;
        case 'onboarding':
            renderOnboarding();
            break;
        case 'performance':
            renderPerformance();
            break;
        case 'grievances':
            renderGrievances();
            break;
        case 'learning':
            renderLearning();
            break;
        case 'policies':
            renderPolicies();
            break;
    }
}

// Render all sections on app load
function renderAll() {
    renderDashboard();
    renderEmployees();
    renderLeaves();
    renderPayroll();
    renderRecruitment();
    renderOnboarding();
    renderPerformance();
    renderGrievances();
    renderLearning();
    renderPolicies();
}

// --- Dashboard ---
function renderDashboard() {
    const users = getUsers();
    const role = users[currentUser].role;
    let statsHtml = '';

    // Admin Stats
    if (role === 'admin') {
        const employees = Object.keys(users).filter(u => users[u].role === 'employee').length;
        const totalLeaves = getData('hr_leaves').length;
        const pendingLeaves = getData('hr_leaves').filter(l => l.status === 'Pending').length;
        const openGrievances = getData('hr_grievances').filter(g => g.status !== 'Resolved' && g.status !== 'Closed').length;
        const totalCourses = getData('hr_learning').filter(item => item.type === 'course').length;

        statsHtml = `
            <p><strong>Total Employees:</strong> ${employees}</p>
            <p><strong>Total Leave Requests:</strong> ${totalLeaves}</p>
            <p><strong>Pending Leave Requests:</strong> ${pendingLeaves}</p>
            <p><strong>Open Grievances:</strong> ${openGrievances}</p>
            <p><strong>Available Courses:</strong> ${totalCourses}</p>
        `;
        document.getElementById('dashboardStats').innerHTML = statsHtml;

        // Hide employee-specific cards for admin
        document.getElementById('myPendingLeavesCard').classList.add('hidden');
        document.getElementById('myOnboardingProgressCard').classList.add('hidden');

    } else { // Employee Dashboard
        document.getElementById('dashboardStats').innerHTML = '<p>Your personalized dashboard provides quick access to your HR information.</p>';

        // My Pending Leaves
        const myLeaves = getData('hr_leaves').filter(l => l.user === currentUser && l.status === 'Pending');
        const myPendingLeavesSummary = document.getElementById('myPendingLeavesSummary');
        if (myLeaves.length > 0) {
            myPendingLeavesSummary.innerHTML = `You have <strong>${myLeaves.length}</strong> pending leave request(s).`;
        } else {
            myPendingLeavesSummary.textContent = 'You have no pending leave requests.';
        }
        document.getElementById('myPendingLeavesCard').classList.remove('hidden');


        // My Onboarding Progress
        const onboardingTasks = getData('hr_onboarding_tasks');
        const myOnboardingTasks = onboardingTasks.filter(task => task.employee === currentUser);

        const onboardingProgressBar = document.getElementById('onboardingProgressBar');
        const onboardingStatusSummary = document.getElementById('onboardingStatusSummary');

        if (myOnboardingTasks.length > 0) {
            const completedTasks = myOnboardingTasks.filter(task => task.completed).length;
            const progress = (completedTasks / myOnboardingTasks.length) * 100;
            onboardingProgressBar.style.width = `${progress}%`;
            onboardingProgressBar.textContent = `${Math.round(progress)}%`;
            onboardingStatusSummary.textContent = `You have completed ${completedTasks} of ${myOnboardingTasks.length} onboarding tasks.`;
            if (progress === 100) {
                onboardingStatusSummary.textContent = 'Congratulations! You have completed all your onboarding tasks.';
            }
        } else {
            onboardingProgressBar.style.width = '0%';
            onboardingProgressBar.textContent = '0%';
            onboardingStatusSummary.textContent = 'No onboarding tasks assigned to you yet.';
        }
        document.getElementById('myOnboardingProgressCard').classList.remove('hidden');
    }
}


// --- Employee Management ---
function renderEmployees() {
    const users = getUsers();
    const role = users[currentUser].role;
    let formHtml = '';
    let displayHtml = '';

    if (role === 'admin') {
        formHtml = `
            <h3>Add New Employee</h3>
            <form onsubmit="addEmployee(event)">
                <label>Username</label><input type="text" id="employeeUsername" required />
                <label>Password</label><input type="password" id="employeePassword" required />
                <label>Role</label>
                <select id="employeeRole">
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                </select>
                <button type="submit" class="submit-btn"><i class="fas fa-user-plus"></i> Add Employee</button>
            </form>
            <hr style="border-color: rgba(255,255,255,0.2); margin: 20px 0;">
        `;

        displayHtml = '<h3>All Employees</h3><table><thead><tr><th>Username</th><th>Role</th><th>Actions</th></tr></thead><tbody>';
        Object.keys(users).forEach(username => {
            if (username !== currentUser) { // Don't allow admin to delete self
                displayHtml += `
                    <tr>
                        <td>${username}</td>
                        <td>${users[username].role}</td>
                        <td>
                            <button class="delete-btn" onclick="deleteUser('${username}')"><i class="fas fa-trash"></i> Delete</button>
                        </td>
                    </tr>
                `;
            } else {
                 displayHtml += `
                    <tr>
                        <td>${username} (You)</td>
                        <td>${users[username].role}</td>
                        <td></td>
                    </tr>
                `;
            }
        });
        displayHtml += '</tbody></table>';

    } else {
        displayHtml = '<h3>My Details</h3><p><strong>Username:</strong> ' + currentUser + '</p><p><strong>Role:</strong> ' + role + '</p>';
        displayHtml += '<p>Only administrators can view and manage other employee accounts.</p>';
    }

    document.getElementById("employeeFormContainer").innerHTML = formHtml;
    document.getElementById("employeeTableContainer").innerHTML = displayHtml;
}

function addEmployee(e) {
    e.preventDefault();
    const username = document.getElementById("employeeUsername").value;
    const password = document.getElementById("employeePassword").value;
    const role = document.getElementById("employeeRole").value;
    const users = getUsers();

    if (users[username]) {
        showNotification("Username already exists.", "error");
        return;
    }

    users[username] = { password: password, role: role };
    saveUsers(users);
    renderEmployees();
    document.getElementById("employeeUsername").value = '';
    document.getElementById("employeePassword").value = '';
    showNotification(`Employee ${username} (${role}) added!`, "success");
}

function deleteUser(username) {
    if (confirm(`Are you sure you want to delete ${username}? This action is irreversible and will remove all their associated data.`)) {
        let users = getUsers();
        delete users[username]; // Remove user
        saveUsers(users);

        // Clean up associated data for the deleted user
        const dataKeys = ['hr_leaves', 'hr_payrolls', 'hr_onboarding_tasks', 'hr_performance', 'hr_grievances', 'hr_learning'];
        dataKeys.forEach(key => {
            let data = getData(key);
            if (key === 'hr_learning') { // hr_learning has both 'course' and 'assignment' types
                 data = data.filter(item => !(item.type === 'assignment' && item.employee === username));
            } else if (key === 'hr_payrolls') {
                 data = data.filter(item => item.employee !== username);
            } else {
                 data = data.filter(item => item.user !== username && item.employee !== username); // Use 'user' or 'employee' depending on context
            }
            saveData(key, data);
        });

        renderEmployees();
        showNotification(`Employee ${username} and their data deleted.`, "error");
    }
}


// --- Leave Management ---
function renderLeaves() {
    const users = getUsers();
    const role = users[currentUser].role;
    const data = getData("hr_leaves");
    let formHtml = '';
    let displayHtml = '';

    if (role === 'admin') {
        formHtml = `
            <h3>Manage Leave Requests</h3>
        `;
        const leaveRows = data.map((leave, i) => `
            <tr>
                <td>${leave.user}</td>
                <td>${leave.type}</td>
                <td>${leave.startDate} to ${leave.endDate}</td>
                <td>${leave.reason.substring(0, 50)}...</td>
                <td class="${leave.status.toLowerCase()}">${leave.status}</td>
                <td>
                    <button class="edit-btn" onclick="updateLeaveStatus(${i}, 'Approved')"><i class="fas fa-check"></i> Approve</button>
                    <button class="delete-btn" onclick="updateLeaveStatus(${i}, 'Rejected')"><i class="fas fa-times"></i> Reject</button>
                    <button class="delete-btn" onclick="deleteLeave(${i})"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `).join('');
        displayHtml = `
            <table>
                <thead>
                    <tr>
                        <th>Employee</th><th>Type</th><th>Dates</th><th>Reason</th><th>Status</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${leaveRows.length > 0 ? leaveRows : '<tr><td colspan="6">No leave requests.</td></tr>'}
                </tbody>
            </table>
        `;
    } else { // Employee view
        formHtml = `
            <h3>Submit New Leave Request</h3>
            <form onsubmit="submitLeave(event)">
                <label>Leave Type</label>
                <select id="leaveType">
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Paternity Leave">Paternity Leave</option>
                </select>
                <label>Start Date</label><input type="date" id="startDate" required />
                <label>End Date</label><input type="date" id="endDate" required />
                <label>Reason</label><textarea id="leaveReason" rows="4"></textarea>
                <button type="submit" class="submit-btn"><i class="fas fa-paper-plane"></i> Submit Request</button>
            </form>
            <hr style="border-color: rgba(255,255,255,0.2); margin: 20px 0;">
        `;
        const myLeaves = data.filter(leave => leave.user === currentUser);
        const myLeaveRows = myLeaves.map(leave => `
            <tr>
                <td>${leave.type}</td>
                <td>${leave.startDate} to ${leave.endDate}</td>
                <td>${leave.reason.substring(0, 50)}...</td>
                <td class="${leave.status.toLowerCase()}">${leave.status}</td>
            </tr>
        `).join('');
        displayHtml = `
            <h3>My Leave Requests</h3>
            <table>
                <thead>
                    <tr>
                        <th>Type</th><th>Dates</th><th>Reason</th><th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${myLeaveRows.length > 0 ? myLeaveRows : '<tr><td colspan="4">You have not submitted any leave requests.</td></tr>'}
                </tbody>
            </table>
        `;
    }

    document.getElementById("leaveFormContainer").innerHTML = formHtml;
    document.getElementById("leaveTableContainer").innerHTML = displayHtml;
}

function submitLeave(e) {
    e.preventDefault();
    const data = getData("hr_leaves");
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (new Date(startDate) > new Date(endDate)) {
        showNotification("End date cannot be before start date.", "error");
        return;
    }

    data.push({
        user: currentUser,
        type: document.getElementById("leaveType").value,
        startDate: startDate,
        endDate: endDate,
        reason: document.getElementById("leaveReason").value,
        status: 'Pending'
    });
    saveData("hr_leaves", data);
    renderLeaves();
    document.getElementById("startDate").value = '';
    document.getElementById("endDate").value = '';
    document.getElementById("leaveReason").value = '';
    showNotification("Leave request submitted successfully!", "success");
}

function updateLeaveStatus(index, newStatus) { // Admin only
    const data = getData("hr_leaves");
    data[index].status = newStatus;
    saveData("hr_leaves", data);
    renderLeaves();
    showNotification(`Leave request ${newStatus.toLowerCase()}!`, "info");
}

function deleteLeave(index) { // Admin only
    let data = getData("hr_leaves");
    if (confirm("Are you sure you want to delete this leave request?")) {
        data.splice(index, 1);
        saveData("hr_leaves", data);
        renderLeaves();
        showNotification("Leave request deleted.", "error");
    }
}

// --- Payroll ---
function renderPayroll() {
    const users = getUsers();
    const role = users[currentUser].role;
    const data = getData("hr_payrolls");
    let formHtml = '';
    let displayHtml = '';

    if (role === 'admin') {
        const employees = Object.keys(users).filter(u => users[u].role === 'employee');
        formHtml = `
            <h3>Generate Payroll</h3>
            <form onsubmit="generatePayroll(event)">
                <label>Employee</label>
                <select id="payrollEmployee">
                    ${employees.map(emp => `<option value="${emp}">${emp}</option>`).join('')}
                </select>
                <label>Month</label><input type="month" id="payrollMonth" required />
                <label>Base Salary</label><input type="number" id="baseSalary" step="0.01" required />
                <label>Bonuses</label><input type="number" id="bonuses" step="0.01" value="0" />
                <label>Deductions</label><input type="number" id="deductions" step="0.01" value="0" />
                <button type="submit" class="submit-btn"><i class="fas fa-plus"></i> Generate Payslip</button>
            </form>
            <hr style="border-color: rgba(255,255,255,0.2); margin: 20px 0;">
        `;
        const payrollRows = data.map((payslip, i) => `
            <tr>
                <td>${payslip.employee}</td>
                <td>${payslip.month}</td>
                <td>$${payslip.baseSalary.toFixed(2)}</td>
                <td>$${payslip.bonuses.toFixed(2)}</td>
                <td>$${payslip.deductions.toFixed(2)}</td>
                <td>$${(payslip.baseSalary + payslip.bonuses - payslip.deductions).toFixed(2)}</td>
                <td>
                    <button class="delete-btn" onclick="deletePayslip(${i})"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `).join('');
        displayHtml = `
            <h3>Generated Payslips</h3>
            <table>
                <thead>
                    <tr>
                        <th>Employee</th><th>Month</th><th>Base Salary</th><th>Bonuses</th><th>Deductions</th><th>Net Pay</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${payrollRows.length > 0 ? payrollRows : '<tr><td colspan="7">No payslips generated yet.</td></tr>'}
                </tbody>
            </table>
        `;
    } else { // Employee view
        const myPayslips = data.filter(payslip => payslip.employee === currentUser);
        const myPayrollRows = myPayslips.map(payslip => `
            <tr>
                <td>${payslip.month}</td>
                <td>$${payslip.baseSalary.toFixed(2)}</td>
                <td>$${payslip.bonuses.toFixed(2)}</td>
                <td>$${payslip.deductions.toFixed(2)}</td>
                <td>$${(payslip.baseSalary + payslip.bonuses - payslip.deductions).toFixed(2)}</td>
            </tr>
        `).join('');
        displayHtml = `
            <h3>My Payslips</h3>
            <table>
                <thead>
                    <tr>
                        <th>Month</th><th>Base Salary</th><th>Bonuses</th><th>Deductions</th><th>Net Pay</th>
                    </tr>
                </thead>
                <tbody>
                    ${myPayrollRows.length > 0 ? myPayrollRows : '<tr><td colspan="5">No payslips available for you yet.</td></tr>'}
                </tbody>
            </table>
        `;
    }

    document.getElementById("payrollFormContainer").innerHTML = formHtml;
    document.getElementById("payrollTableContainer").innerHTML = displayHtml;
}

function generatePayroll(e) {
    e.preventDefault();
    const data = getData("hr_payrolls");
    data.push({
        employee: document.getElementById("payrollEmployee").value,
        month: document.getElementById("payrollMonth").value,
        baseSalary: parseFloat(document.getElementById("baseSalary").value),
        bonuses: parseFloat(document.getElementById("bonuses").value),
        deductions: parseFloat(document.getElementById("deductions").value)
    });
    saveData("hr_payrolls", data);
    renderPayroll();
    showNotification("Payslip generated successfully!", "success");
}

function deletePayslip(index) { // Admin only
    let data = getData("hr_payrolls");
    if (confirm("Are you sure you want to delete this payslip?")) {
        data.splice(index, 1);
        saveData("hr_payrolls", data);
        renderPayroll();
        showNotification("Payslip deleted.", "error");
    }
}

// --- Recruitment ---
function renderRecruitment() {
    const users = getUsers();
    const role = users[currentUser].role;
    const data = getData("hr_recruitments");
    let formHtml = '';
    let displayHtml = '';

    if (role === 'admin') {
        formHtml = `
            <h3>Add New Job Opening</h3>
            <form onsubmit="addJobOpening(event)">
                <label>Job Title</label><input type="text" id="jobTitle" required />
                <label>Department</label><input type="text" id="jobDepartment" required />
                <label>Description</label><textarea id="jobDescription" rows="4"></textarea>
                <label>Status</label>
                <select id="jobStatus">
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                    <option value="On Hold">On Hold</option>
                </select>
                <button type="submit" class="submit-btn"><i class="fas fa-plus"></i> Add Job</button>
            </form>
            <hr style="border-color: rgba(255,255,255,0.2); margin: 20px 0;">
        `;
        const jobRows = data.map((job, i) => `
            <tr>
                <td>${job.title}</td>
                <td>${job.department}</td>
                <td>${job.description.substring(0, 50)}...</td>
                <td class="${job.status.toLowerCase().replace(/\s/g, '-')}">${job.status}</td>
                <td>
                    <button class="edit-btn" onclick="editJobOpening(${i})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" onclick="deleteJobOpening(${i})"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `).join('');
        displayHtml = `
            <h3>Current Job Openings</h3>
            <table>
                <thead>
                    <tr>
                        <th>Title</th><th>Department</th><th>Description</th><th>Status</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${jobRows.length > 0 ? jobRows : '<tr><td colspan="5">No job openings added yet.</td></tr>'}
                </tbody>
            </table>
        `;
    } else { // Employee view
        const openJobs = data.filter(job => job.status === 'Open');
        if (openJobs.length === 0) {
            displayHtml = '<p>No job openings currently available.</p>';
        } else {
            displayHtml = `<div class="card-grid">`;
            openJobs.forEach((job, i) => {
                displayHtml += `
                    <div class="card" style="animation-delay: ${i * 0.05}s;">
                        <h4><i class="fas fa-briefcase"></i> ${job.title}</h4>
                        <p><strong>Department:</strong> ${job.department}</p>
                        <p>${job.description}</p>
                        <div class="actions">
                            <button class="action-btn" onclick="applyForJob('${job.title}')"><i class="fas fa-paper-plane"></i> Apply Now</button>
                        </div>
                    </div>
                `;
            });
            displayHtml += `</div>`;
        }
        displayHtml = '<h3>Available Job Openings</h3>' + displayHtml;
    }

    document.getElementById("recruitmentFormContainer").innerHTML = formHtml;
    document.getElementById("recruitmentTableContainer").innerHTML = displayHtml;
}

function addJobOpening(e) {
    e.preventDefault();
    const data = getData("hr_recruitments");
    data.push({
        title: document.getElementById("jobTitle").value,
        department: document.getElementById("jobDepartment").value,
        description: document.getElementById("jobDescription").value,
        status: document.getElementById("jobStatus").value
    });
    saveData("hr_recruitments", data);
    renderRecruitment();
    document.getElementById("jobTitle").value = '';
    document.getElementById("jobDepartment").value = '';
    document.getElementById("jobDescription").value = '';
    document.getElementById("jobStatus").value = 'Open';
    showNotification("Job opening added successfully!", "success");
}

function editJobOpening(index) { // Admin only
    const data = getData("hr_recruitments");
    const job = data[index];
    const newTitle = prompt("Edit Job Title:", job.title);
    const newDepartment = prompt("Edit Department:", job.department);
    const newDescription = prompt("Edit Description:", job.description);
    const newStatus = prompt("Edit Status (Open, Closed, On Hold):", job.status);

    if (newTitle !== null) job.title = newTitle;
    if (newDepartment !== null) job.department = newDepartment;
    if (newDescription !== null) job.description = newDescription;
    if (newStatus !== null && ['Open', 'Closed', 'On Hold'].includes(newStatus)) {
        job.status = newStatus;
    } else if (newStatus !== null) {
        showNotification("Invalid status entered.", "warning");
    }

    saveData("hr_recruitments", data);
    renderRecruitment();
    showNotification("Job opening updated!", "info");
}

function deleteJobOpening(index) { // Admin only
    let data = getData("hr_recruitments");
    if (confirm("Are you sure you want to delete this job opening?")) {
        data.splice(index, 1);
        saveData("hr_recruitments", data);
        renderRecruitment();
        showNotification("Job opening deleted.", "error");
    }
}

function applyForJob(jobTitle) { // Employee only
    showNotification(`You have applied for the "${jobTitle}" position. Good luck!`, "success");
}

// --- Onboarding ---
function renderOnboarding() {
    const users = getUsers();
    const role = users[currentUser].role;
    const allOnboardingTasks = getData("hr_onboarding_tasks"); // Get all tasks
    let formHtml = '';
    let displayHtml = '';

    if (role === 'admin') {
        const employees = Object.keys(users).filter(u => users[u].role === 'employee');
        formHtml = `
            <h3>Assign New Onboarding Task</h3>
            <form onsubmit="assignOnboardingTask(event)">
                <label>Employee</label>
                <select id="onboardingEmployee">
                    ${employees.map(emp => `<option value="${emp}">${emp}</option>`).join('')}
                </select>
                <label>Task Name</label><input type="text" id="onboardingTaskName" required />
                <label>Due Date</label><input type="date" id="onboardingDueDate" />
                <button type="submit" class="submit-btn"><i class="fas fa-plus"></i> Assign Task</button>
            </form>
            <hr style="border-color: rgba(255,255,255,0.2); margin: 20px 0;">
        `;

        displayHtml += '<h3>Onboarding Progress for All Employees</h3>';
        if (employees.length === 0) {
            displayHtml += '<p>No employees to manage onboarding for yet.</p>';
        } else {
            employees.forEach(employee => {
                const employeeTasks = allOnboardingTasks.filter(task => task.employee === employee);
                const completedTasks = employeeTasks.filter(task => task.completed).length;
                const totalTasks = employeeTasks.length;
                const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

                displayHtml += `
                    <div class="card grievance-item" style="cursor: default; margin-bottom: 15px;">
                        <div style="flex-grow: 1;">
                            <h4><i class="fas fa-user-check"></i> ${employee}'s Onboarding Tasks</h4>
                            <p style="font-size: 0.9em; margin-bottom: 5px;">Progress: <strong>${Math.round(progress)}%</strong> (${completedTasks}/${totalTasks} completed)</p>
                            <div class="progress-container" style="height: 15px;">
                                <div class="progress-bar" style="width: ${progress}%;">${Math.round(progress)}%</div>
                            </div>
                            <ul style="list-style: none; padding: 0; margin-top: 10px;">
                `;
                if (employeeTasks.length > 0) {
                    employeeTasks.forEach((task, i) => {
                        // Find the global index of the task to allow deletion/editing of individual tasks
                        const globalIndex = allOnboardingTasks.findIndex(t => t.employee === task.employee && t.task === task.task && t.dueDate === task.dueDate);

                        displayHtml += `
                            <li style="display: flex; align-items: center; margin-bottom: 5px; color: ${task.completed ? '#90ee90' : '#e0e0e0'};">
                                <input type="checkbox" id="task-${employee}-${i}" ${task.completed ? 'checked' : ''} onclick="toggleOnboardingTaskStatus(${globalIndex})">
                                <label for="task-${employee}-${i}" style="margin: 0; display: inline; font-weight: normal; cursor: pointer;">
                                    ${task.task} ${task.dueDate ? `(Due: ${task.dueDate})` : ''}
                                </label>
                                <button class="delete-btn" style="padding: 4px 8px; font-size: 0.75em; margin-left: auto;" onclick="deleteOnboardingTask(${globalIndex})"><i class="fas fa-trash"></i></button>
                            </li>
                        `;
                    });
                } else {
                    displayHtml += `<li style="color: #c0c0c0;">No onboarding tasks assigned for ${employee}.</li>`;
                }
                displayHtml += `
                            </ul>
                        </div>
                    </div>
                `;
            });
        }
    } else { // Employee view
        const myTasks = allOnboardingTasks.filter(task => task.employee === currentUser);
        formHtml = `
            <h3>My Onboarding Checklist</h3>
        `;
        if (myTasks.length === 0) {
            displayHtml += '<p>No onboarding tasks assigned to you yet.</p>';
        } else {
            displayHtml += `
                <div class="card-grid">
                    <div class="card" style="cursor: default;">
                        <h4>Your Tasks</h4>
                        <ul style="list-style: none; padding: 0;">
            `;
            myTasks.forEach((task, i) => {
                // Find the global index of the task to update its status
                const globalIndex = allOnboardingTasks.findIndex(t => t.employee === task.employee && t.task === task.task && t.dueDate === task.dueDate);
                displayHtml += `
                    <li style="display: flex; align-items: center; margin-bottom: 10px; color: ${task.completed ? '#90ee90' : '#e0e0e0'};">
                        <input type="checkbox" id="myTask-${i}" ${task.completed ? 'checked' : ''} onclick="toggleOnboardingTaskStatus(${globalIndex})">
                        <label for="myTask-${i}" style="margin: 0; display: inline; font-weight: normal; cursor: pointer;">
                            ${task.task} ${task.dueDate ? `(Due: ${task.dueDate})` : ''}
                        </label>
                    </li>
                `;
            });
            displayHtml += `
                        </ul>
                    </div>
                </div>
            `;
        }
    }

    document.getElementById("onboardingFormContainer").innerHTML = formHtml;
    document.getElementById("onboardingTableContainer").innerHTML = displayHtml;
}

function assignOnboardingTask(e) {
    e.preventDefault();
    const data = getData("hr_onboarding_tasks");
    const employee = document.getElementById("onboardingEmployee").value;
    const taskName = document.getElementById("onboardingTaskName").value;
    const dueDate = document.getElementById("onboardingDueDate").value;

    // Check for duplicate task for the same employee
    const existingTask = data.find(task => task.employee === employee && task.task === taskName);
    if (existingTask) {
        showNotification(`"${taskName}" is already assigned to ${employee}.`, "warning");
        return;
    }

    data.push({
        employee: employee,
        task: taskName,
        dueDate: dueDate,
        completed: false
    });
    saveData("hr_onboarding_tasks", data);
    renderOnboarding();
    document.getElementById("onboardingTaskName").value = '';
    document.getElementById("onboardingDueDate").value = '';
    showNotification(`Onboarding task assigned to ${employee}!`, "success");
}

function toggleOnboardingTaskStatus(index) {
    const data = getData("hr_onboarding_tasks");
    if (data[index]) {
        data[index].completed = !data[index].completed;
        saveData("hr_onboarding_tasks", data);
        renderOnboarding(); // Re-render to reflect changes
        showNotification(`Task status updated!`, "info");
    }
}

function deleteOnboardingTask(index) { // Admin only
    let data = getData("hr_onboarding_tasks");
    if (confirm("Are you sure you want to delete this onboarding task?")) {
        data.splice(index, 1);
        saveData("hr_onboarding_tasks", data);
        renderOnboarding();
        showNotification("Onboarding task deleted.", "error");
    }
}


// --- Performance ---
function renderPerformance() {
    const users = getUsers();
    const role = users[currentUser].role;
    const data = getData("hr_performance");
    let formHtml = '';
    let displayHtml = '';

    if (role === 'admin') {
        const employees = Object.keys(users).filter(u => users[u].role === 'employee');
        formHtml = `
            <h3>Add Performance Review</h3>
            <form onsubmit="addPerformanceReview(event)">
                <label>Employee</label>
                <select id="performanceEmployee">
                    ${employees.map(emp => `<option value="${emp}">${emp}</option>`).join('')}
                </select>
                <label>Review Date</label><input type="date" id="reviewDate" required />
                <label>Reviewer</label><input type="text" id="reviewerName" value="${currentUser}" required />
                <label>Rating (1-5)</label><input type="number" id="performanceRating" min="1" max="5" required />
                <label>Comments</label><textarea id="performanceComments" rows="4"></textarea>
                <button type="submit" class="submit-btn"><i class="fas fa-plus"></i> Add Review</button>
            </form>
            <hr style="border-color: rgba(255,255,255,0.2); margin: 20px 0;">
        `;
        const reviewRows = data.map((review, i) => `
            <tr>
                <td>${review.employee}</td>
                <td>${review.reviewDate}</td>
                <td>${review.reviewer}</td>
                <td>${review.rating}</td>
                <td>${review.comments.substring(0, 50)}...</td>
                <td>
                    <button class="edit-btn" onclick="editPerformanceReview(${i})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" onclick="deletePerformanceReview(${i})"><i class="fas fa-trash"></i> Delete</button>
                </td>
            </tr>
        `).join('');
        displayHtml = `
            <h3>Performance Reviews</h3>
            <table>
                <thead>
                    <tr>
                        <th>Employee</th><th>Date</th><th>Reviewer</th><th>Rating</th><th>Comments</th><th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${reviewRows.length > 0 ? reviewRows : '<tr><td colspan="6">No performance reviews added yet.</td></tr>'}
                </tbody>
            </table>
        `;
    } else { // Employee view
        const myReviews = data.filter(review => review.employee === currentUser);
        const myReviewRows = myReviews.map(review => `
            <tr>
                <td>${review.reviewDate}</td>
                <td>${review.reviewer}</td>
                <td>${review.rating}</td>
                <td>${review.comments}</td>
            </tr>
        `).join('');
        displayHtml = `
            <h3>My Performance Reviews</h3>
            <table>
                <thead>
                    <tr>
                        <th>Date</th><th>Reviewer</th><th>Rating</th><th>Comments</th>
                    </tr>
                </thead>
                <tbody>
                    ${myReviewRows.length > 0 ? myReviewRows : '<tr><td colspan="4">No performance reviews available for you yet.</td></tr>'}
                </tbody>
            </table>
        `;
    }

    document.getElementById("performanceFormContainer").innerHTML = formHtml;
    document.getElementById("performanceTableContainer").innerHTML = displayHtml;
}

function addPerformanceReview(e) {
    e.preventDefault();
    const data = getData("hr_performance");
    data.push({
        employee: document.getElementById("performanceEmployee").value,
        reviewDate: document.getElementById("reviewDate").value,
        reviewer: document.getElementById("reviewerName").value,
        rating: parseInt(document.getElementById("performanceRating").value),
        comments: document.getElementById("performanceComments").value
    });
    saveData("hr_performance", data);
    renderPerformance();
    document.getElementById("performanceEmployee").value = Object.keys(getUsers()).filter(u => getUsers()[u].role === 'employee')[0] || ''; // Reset to first employee
    document.getElementById("reviewDate").value = '';
    document.getElementById("performanceRating").value = '';
    document.getElementById("performanceComments").value = '';
    showNotification("Performance review added!", "success");
}

function editPerformanceReview(index) { // Admin only
    const data = getData("hr_performance");
    const review = data[index];
    const newDate = prompt("Edit Review Date:", review.reviewDate);
    const newReviewer = prompt("Edit Reviewer:", review.reviewer);
    const newRating = prompt("Edit Rating (1-5):", review.rating);
    const newComments = prompt("Edit Comments:", review.comments);

    if (newDate !== null) review.reviewDate = newDate;
    if (newReviewer !== null) review.reviewer = newReviewer;
    if (newRating !== null && !isNaN(parseInt(newRating)) && parseInt(newRating) >= 1 && parseInt(newRating) <= 5) {
        review.rating = parseInt(newRating);
    } else if (newRating !== null) {
        showNotification("Invalid rating. Please enter a number between 1 and 5.", "warning");
    }
    if (newComments !== null) review.comments = newComments;

    saveData("hr_performance", data);
    renderPerformance();
    showNotification("Performance review updated!", "info");
}

function deletePerformanceReview(index) { // Admin only
    let data = getData("hr_performance");
    if (confirm("Are you sure you want to delete this performance review?")) {
        data.splice(index, 1);
        saveData("hr_performance", data);
        renderPerformance();
        showNotification("Performance review deleted.", "error");
    }
}


// --- Grievance Management ---
function renderGrievances() {
    const users = getUsers();
    const role = users[currentUser].role;
    const data = getData("hr_grievances");
    let formHtml = '';
    let displayHtml = '';

    if (role === 'admin') {
        formHtml = `<h3>All Grievances</h3>`;
        if (data.length === 0) {
            displayHtml += '<p>No grievances submitted yet.</p>';
        } else {
            displayHtml += `<div class="card-grid">`;
            data.forEach((grievance, i) => {
                let icon = '';
                let statusColor = '';
                switch (grievance.status) {
                    case 'Pending': icon = 'fa-hourglass-half'; statusColor = 'orange'; break;
                    case 'In Progress': icon = 'fa-cogs'; statusColor = 'blue'; break;
                    case 'Resolved': icon = 'fa-check-circle'; statusColor = 'green'; break;
                    case 'Closed': icon = 'fa-folder-closed'; statusColor = 'grey'; break;
                    case 'Escalated': icon = 'fa-triangle-exclamation'; statusColor = 'red'; break;
                }
                displayHtml += `
                    <div class="card grievance-item" style="animation-delay: ${i * 0.05}s;">
                        <div style="flex-grow: 1;">
                            <h4><i class="fas fa-tag"></i> ${grievance.subject}</h4>
                            <p><strong>Filed By:</strong> ${grievance.user} on ${grievance.date}</p>
                            <p>${grievance.details.substring(0, 150)}...</p>
                            <p>Status: <span class="${grievance.status.toLowerCase().replace(/\s/g, '-')}" style="font-weight: bold; color: ${statusColor};"><i class="fas ${icon}"></i> ${grievance.status}</span></p>
                        </div>
                        <div class="actions">
                            <button class="edit-btn" onclick="editGrievance(${i})"><i class="fas fa-edit"></i> Update Status</button>
                            <button class="delete-btn" onclick="deleteGrievance(${i})"><i class="fas fa-trash"></i> Delete</button>
                        </div>
                    </div>
                `;
            });
            displayHtml += `</div>`;
        }
    } else { // Employee view
        formHtml = `
            <h3>Submit New Grievance</h3>
            <form onsubmit="submitGrievance(event)">
                <label>Subject</label><input type="text" id="grievanceSubject" required />
                <label>Details</label><textarea id="grievanceDetails" rows="6" required></textarea>
                <button type="submit" class="submit-btn"><i class="fas fa-paper-plane"></i> Submit Grievance</button>
            </form>
            <hr style="border-color: rgba(255,255,255,0.2); margin: 20px 0;">
        `;
        const myGrievances = data.filter(g => g.user === currentUser);
        displayHtml = '<h3>My Submitted Grievances</h3>';
        if (myGrievances.length === 0) {
            displayHtml += '<p>You have not submitted any grievances yet.</p>';
        } else {
            displayHtml += `<div class="card-grid">`;
            myGrievances.forEach((grievance, i) => {
                let icon = '';
                let statusColor = '';
                switch (grievance.status) {
                    case 'Pending': icon = 'fa-hourglass-half'; statusColor = 'orange'; break;
                    case 'In Progress': icon = 'fa-cogs'; statusColor = 'blue'; break;
                    case 'Resolved': icon = 'fa-check-circle'; statusColor = 'green'; break;
                    case 'Closed': icon = 'fa-folder-closed'; statusColor = 'grey'; break;
                    case 'Escalated': icon = 'fa-triangle-exclamation'; statusColor = 'red'; break;
                }
                displayHtml += `
                    <div class="card grievance-item" style="cursor: default; animation-delay: ${i * 0.05}s;">
                        <div style="flex-grow: 1;">
                            <h4><i class="fas fa-tag"></i> ${grievance.subject}</h4>
                            <p>Filed on: ${grievance.date}</p>
                            <p>${grievance.details}</p>
                            <p>Status: <span class="${grievance.status.toLowerCase().replace(/\s/g, '-')}" style="font-weight: bold; color: ${statusColor};"><i class="fas ${icon}"></i> ${grievance.status}</span></p>
                        </div>
                    </div>
                `;
            });
            displayHtml += `</div>`;
        }
    }
    document.getElementById("grievanceFormContainer").innerHTML = formHtml;
    document.getElementById("grievanceTableContainer").innerHTML = displayHtml;
}

function submitGrievance(e) {
    e.preventDefault();
    const data = getData("hr_grievances");
    data.push({
        user: currentUser,
        date: new Date().toISOString().slice(0, 10),
        subject: document.getElementById("grievanceSubject").value,
        details: document.getElementById("grievanceDetails").value,
        status: 'Pending'
    });
    saveData("hr_grievances", data);
    renderGrievances();
    document.getElementById("grievanceSubject").value = '';
    document.getElementById("grievanceDetails").value = '';
    showNotification("Grievance submitted successfully! We will review it shortly.", "success");
}

function editGrievance(index) { // Admin only
    const data = getData("hr_grievances");
    const grievance = data[index];

    const newStatus = prompt(`Update status for grievance "${grievance.subject}" (Current: ${grievance.status})\nOptions: Pending, In Progress, Resolved, Closed, Escalated`, grievance.status);
    if (newStatus !== null && ['Pending', 'In Progress', 'Resolved', 'Closed', 'Escalated'].includes(newStatus)) {
        grievance.status = newStatus;
        saveData("hr_grievances", data);
        renderGrievances();
        showNotification("Grievance status updated!", "info");
    } else if (newStatus !== null) {
        showNotification("Invalid status entered.", "warning");
    }
}

function deleteGrievance(index) { // Admin only
    let data = getData("hr_grievances");
    if (confirm("Are you sure you want to delete this grievance?")) {
        data.splice(index, 1);
        saveData("hr_grievances", data);
        renderGrievances();
        showNotification("Grievance deleted.", "error");
    }
}

// --- Learning Management --- (Enhanced)
function renderLearning() {
    const users = getUsers();
    const role = users[currentUser].role;
    const allCourses = getData("hr_learning").filter(item => item.type === 'course');
    const assignments = getData("hr_learning").filter(item => item.type === 'assignment');

    let formHtml = '';
    let displayHtml = '';

    if (role === 'admin') {
        formHtml = `
            <h3>Add New Learning Course</h3>
            <form onsubmit="submitCourse(event)">
                <label>Course Title</label><input type="text" id="courseTitle" required />
                <label>Description</label><textarea id="courseDesc" rows="4"></textarea>
                <label>Link</label><input type="url" id="courseLink" placeholder="e.g., https://coursera.org/course" />
                <button type="submit" class="submit-btn"><i class="fas fa-plus"></i> Add Course</button>
            </form>
            <hr style="border-color: rgba(255,255,255,0.2); margin: 20px 0;">

            <h3>Assign Course to Employee</h3>
            <form onsubmit="assignCourse(event)">
                <label>Employee</label>
                <select id="assignEmployee">
                    ${Object.keys(users).filter(u => users[u].role === 'employee').map(u => `<option value="${u}">${u}</option>`).join('')}
                </select>
                <label>Course</label>
                <select id="assignCourseTitle">
                    ${allCourses.map(c => `<option value="${c.title}">${c.title}</option>`).join('')}
                </select>
                <button type="submit" class="submit-btn"><i class="fas fa-user-plus"></i> Assign Course</button>
            </form>
            <hr style="border-color: rgba(255,255,255,0.2); margin: 20px 0;">
        `;

        displayHtml += '<h3>All Courses</h3>';
        if (allCourses.length === 0) {
            displayHtml += '<p>No courses available yet.</p>';
        } else {
            displayHtml += `<div class="card-grid">`;
            allCourses.forEach((course, i) => {
                displayHtml += `
                    <div class="card" style="animation-delay: ${i * 0.05}s;">
                        <h4><i class="fas fa-graduation-cap"></i> ${course.title}</h4>
                        <p>${course.desc}</p>
                        <p><a href="${course.link}" target="_blank" style="color: #66b3ff;">Go to Course <i class="fas fa-external-link-alt"></i></a></p>
                        <div class="actions">
                            <button class="edit-btn" onclick="editCourse(${i})"><i class="fas fa-edit"></i> Edit</button>
                            <button class="delete-btn" onclick="deleteCourse(${i})"><i class="fas fa-trash"></i> Delete</button>
                        </div>
                    </div>
                `;
            });
            displayHtml += `</div>`;
        }

        displayHtml += '<h3 style="margin-top: 30px;">Course Assignments</h3>';
        const assignmentRows = assignments.map((assign, i) => `<tr>
            <td>${assign.employee}</td><td>${assign.courseTitle}</td>
            <td class="${assign.status.toLowerCase().replace(/\s/g, '-')}">${assign.status}</td>
            <td>
                <button class="edit-btn" onclick="updateAssignmentStatus(${i}, '${assign.employee}', 'Completed')"><i class="fas fa-check"></i> Complete</button>
                <button class="delete-btn" onclick="deleteAssignment(${i}, '${assign.employee}')"><i class="fas fa-trash"></i> Delete</button>
            </td>
        </tr>`).join('');
        displayHtml += `
            <table><thead><tr><th>Employee</th><th>Course</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            ${assignmentRows || '<tr><td colspan="4">No assignments yet.</td></tr>'}
            </tbody></table>`;

    } else { // Employee view
        displayHtml += '<h3>Available Courses</h3>';
        if (allCourses.length === 0) {
            displayHtml += '<p>No courses currently available.</p>';
        } else {
            displayHtml += `<div class="card-grid">`;
            allCourses.forEach((course, i) => {
                const assignedToUser = assignments.some(assign => assign.employee === currentUser && assign.courseTitle === course.title);
                const assignedStatus = assignments.find(assign => assign.employee === currentUser && assign.courseTitle === course.title)?.status || 'Not Assigned';
                displayHtml += `
                    <div class="card ${assignedToUser ? 'assigned' : ''}" style="animation-delay: ${i * 0.05}s;">
                        <h4><i class="fas fa-book"></i> ${course.title}</h4>
                        <p>${course.desc}</p>
                        <p><a href="${course.link}" target="_blank" style="color: #66b3ff;">Go to Course <i class="fas fa-external-link-alt"></i></a></p>
                        <div class="actions">
                            <button class="action-btn" ${assignedToUser ? 'disabled' : ''} onclick="assignCourseToMe('${course.title}')">
                                ${assignedToUser ? '<i class="fas fa-check"></i> Assigned' : '<i class="fas fa-plus"></i> Assign to Me'}
                            </button>
                        </div>
                        <p style="font-size: 0.85em; margin-top: 10px;">Your Status: <span class="${assignedStatus.toLowerCase().replace(/\s/g, '-')}">${assignedStatus}</span></p>
                    </div>
                `;
            });
            displayHtml += `</div>`;
        }

        displayHtml += '<h3 style="margin-top: 30px;">My Assigned Courses</h3>';
        const myAssignments = assignments.filter(assign => assign.employee === currentUser);
        if (myAssignments.length === 0) {
            displayHtml += '<p>You have no courses assigned to you.</p>';
        } else {
            displayHtml += `<div class="card-grid">`;
            myAssignments.forEach((assign, i) => {
                const courseDetails = allCourses.find(c => c.title === assign.courseTitle);
                displayHtml += `
                    <div class="card" style="animation-delay: ${i * 0.05}s;">
                        <h4><i class="fas fa-tasks"></i> ${assign.courseTitle}</h4>
                        <p>${courseDetails ? courseDetails.desc : 'Description not available.'}</p>
                        ${courseDetails ? `<p><a href="${courseDetails.link}" target="_blank" style="color: #66b3ff;">Start Course <i class="fas fa-play-circle"></i></a></p>` : ''}
                        <p>Status: <span class="${assign.status.toLowerCase().replace(/\s/g, '-')}">${assign.status}</span></p>
                        <div class="actions">
                            <button class="action-btn" ${assign.status === 'Completed' ? 'disabled' : ''} onclick="updateMyAssignmentStatus(${i}, 'Completed')">
                                ${assign.status === 'Completed' ? '<i class="fas fa-trophy"></i> Completed' : '<i class="fas fa-check-double"></i> Mark Complete'}
                            </button>
                        </div>
                    </div>
                `;
            });
            displayHtml += `</div>`;
        }
    }

    document.getElementById("learningFormContainer").innerHTML = formHtml;
    document.getElementById("learningTableContainer").innerHTML = displayHtml;
}

// Learning Management CRUD operations
function submitCourse(e) {
    e.preventDefault();
    const data = getData("hr_learning");
    data.push({
        type: 'course',
        title: document.getElementById("courseTitle").value,
        desc: document.getElementById("courseDesc").value,
        link: document.getElementById("courseLink").value
    });
    saveData("hr_learning", data);
    renderLearning();
    document.getElementById("courseTitle").value = '';
    document.getElementById("courseDesc").value = '';
    document.getElementById("courseLink").value = '';
    showNotification("Course added successfully!", "success");
}

function assignCourse(e) {
    e.preventDefault();
    const data = getData("hr_learning");
    const employee = document.getElementById("assignEmployee").value;
    const courseTitle = document.getElementById("assignCourseTitle").value;

    const existingAssignment = data.find(item => item.type === 'assignment' && item.employee === employee && item.courseTitle === courseTitle);
    if (existingAssignment) {
        showNotification(`${employee} is already assigned to "${courseTitle}".`, "warning");
        return;
    }

    data.push({
        type: 'assignment',
        employee: employee,
        courseTitle: courseTitle,
        status: 'Assigned'
    });
    saveData("hr_learning", data);
    renderLearning();
    showNotification(`Course "${courseTitle}" assigned to ${employee}!`, "success");
}

function assignCourseToMe(courseTitle) {
    const data = getData("hr_learning");
    const existingAssignment = data.find(item => item.type === 'assignment' && item.employee === currentUser && item.courseTitle === courseTitle);
    if (existingAssignment) {
        showNotification(`You are already assigned to "${courseTitle}".`, "info");
        return;
    }

    data.push({
        type: 'assignment',
        employee: currentUser,
        courseTitle: courseTitle,
        status: 'Assigned'
    });
    saveData("hr_learning", data);
    renderLearning();
    showNotification(`Course "${courseTitle}" assigned to your learning path!`, "success");
}

function updateMyAssignmentStatus(index, newStatus) {
    let allData = getData("hr_learning");
    const myAssignments = allData.filter(item => item.type === 'assignment' && item.employee === currentUser);
    const assignmentToUpdate = myAssignments[index];

    const globalIndex = allData.findIndex(item =>
        item.type === 'assignment' &&
        item.employee === assignmentToUpdate.employee &&
        item.courseTitle === assignmentToUpdate.courseTitle
    );

    if (globalIndex !== -1) {
        allData[globalIndex].status = newStatus;
        saveData("hr_learning", allData);
        renderLearning();
        showNotification("Your course status updated!", "info");
    }
}

function updateAssignmentStatus(index, employee, newStatus) { // Admin can update any
    let allData = getData("hr_learning");
    const assignments = allData.filter(item => item.type === 'assignment');
    const assignmentToUpdate = assignments[index];

    const globalIndex = allData.findIndex(item =>
        item.type === 'assignment' &&
        item.employee === assignmentToUpdate.employee &&
        item.courseTitle === assignmentToUpdate.courseTitle
    );

    if (globalIndex !== -1) {
        allData[globalIndex].status = newStatus;
        saveData("hr_learning", allData);
        renderLearning();
        showNotification(`Assignment for ${employee} updated to ${newStatus}!`, "info");
    }
}

function editCourse(index) { // Admin only
    let allData = getData("hr_learning");
    const courses = allData.filter(item => item.type === 'course');
    const courseToEdit = courses[index];

    const globalIndex = allData.indexOf(courseToEdit);
    if (globalIndex === -1) { showNotification("Course not found.", "error"); return; }

    const newTitle = prompt("Edit Course Title:", allData[globalIndex].title);
    const newDesc = prompt("Edit Description:", allData[globalIndex].desc);
    const newLink = prompt("Edit Link:", allData[globalIndex].link);

    if (newTitle !== null) allData[globalIndex].title = newTitle;
    if (newDesc !== null) allData[globalIndex].desc = newDesc;
    if (newLink !== null) allData[globalIndex].link = newLink;

    saveData("hr_learning", allData);
    renderLearning();
    showNotification("Course updated!", "info");
}

function deleteCourse(index) { // Admin only
    let allData = getData("hr_learning");
    const courses = allData.filter(item => item.type === 'course');
    const courseToDelete = courses[index];

    const globalIndex = allData.indexOf(courseToDelete);
    if (globalIndex === -1) { showNotification("Course not found.", "error"); return; }

    if (confirm("Are you sure you want to delete this course? This will also remove all related assignments.")) {
        allData.splice(globalIndex, 1);
        const remainingData = allData.filter(item => !(item.type === 'assignment' && item.courseTitle === courseToDelete.title));
        saveData("hr_learning", remainingData);
        renderLearning();
        showNotification("Course and its assignments deleted.", "error");
    }
}

function deleteAssignment(index, employee) { // Admin can delete any
    let allData = getData("hr_learning");
    const assignments = allData.filter(item => item.type === 'assignment');
    const assignmentToDelete = assignments[index];

    const globalIndex = allData.findIndex(item =>
        item.type === 'assignment' &&
        item.employee === assignmentToDelete.employee &&
        item.courseTitle === assignmentToDelete.courseTitle
    );

    if (globalIndex === -1) { showNotification("Assignment not found.", "error"); return; }

    if (confirm(`Are you sure you want to delete this assignment for ${employee}?`)) {
        allData.splice(globalIndex, 1);
        saveData("hr_learning", allData);
        renderLearning();
        showNotification("Assignment deleted.", "error");
    }
}


// --- Policies ---
function renderPolicies() {
    const users = getUsers();
    const role = users[currentUser].role;
    let formHtml = '';
    let displayHtml = '';

    const policyDocumentContent = getData("hr_policy_document");

    if (role === 'admin') {
        formHtml = `
            <h3>Edit Company Policy Document</h3>
            <form onsubmit="updatePolicyDocument(event)">
                <label>Policy Content (HTML allowed):</label>
                <textarea id="policyContent" rows="15" style="font-family: monospace; font-size: 0.9em;">${policyDocumentContent}</textarea>
                <button type="submit" class="submit-btn"><i class="fas fa-save"></i> Save Policy</button>
            </form>
        `;
        displayHtml = `
            <h3>Current Policy Preview</h3>
            <div class="card">
                ${policyDocumentContent}
            </div>
        `;
    } else {
        displayHtml = `
            <h3>Company Policy Document</h3>
            <p>Please review the official company policies below:</p>
            <div class="card">
                ${policyDocumentContent}
            </div>
        `;
    }

    document.getElementById("policyFormContainer").innerHTML = formHtml;
    document.getElementById("policyTableContainer").innerHTML = displayHtml; // Reusing table container for display

    // Set content for the modal when the policy tab is rendered
    document.getElementById("policyDocumentContent").innerHTML = policyDocumentContent;
}

function updatePolicyDocument(e) {
    e.preventDefault();
    const newContent = document.getElementById("policyContent").value;
    saveData("hr_policy_document", newContent);
    renderPolicies();
    showNotification("Company policy updated successfully!", "success");
}

function openPolicyModal() {
    const policyDocumentContent = getData("hr_policy_document");
    document.getElementById("policyDocumentContent").innerHTML = policyDocumentContent;
    document.getElementById("policyModal").classList.remove("hidden");
}

function closePolicyModal() {
    document.getElementById("policyModal").classList.add("hidden");
}


// --- General Notifications ---
function showNotification(message, type = "info") {
    const notificationsDiv = document.getElementById("notifications");
    const notification = document.createElement("div");
    notification.className = `notif ${type}`;
    notification.textContent = message;
    notificationsDiv.appendChild(notification);

    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
            notificationsDiv.removeChild(notification);
        }, 500);
    }, 3000); // Notification disappears after 3 seconds
}


// --- Initial Load Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // Check if initial data exists, if not, seed it.
    initialSeedData(); // This will only seed if data doesn't exist

    const lastUser = localStorage.getItem('lastLoggedInUser');
    const users = getUsers();
    if (lastUser && users[lastUser]) {
        currentUser = lastUser;
        document.getElementById('authArea').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        document.getElementById('userDisplay').textContent = currentUser;
        document.getElementById('roleDisplay').textContent = users[currentUser].role;
        renderAll();
        showTab('dashboard'); // Show a default tab
        updateAdminResetButtonVisibility();
    } else {
        // If no persisted user or user doesn't exist, show register form initially
        // This ensures a fresh start for the user if they've cleared data or no users are set up.
        document.getElementById('registerForm').classList.remove('hidden');
        document.getElementById('loginForm').classList.add('hidden');
    }
});