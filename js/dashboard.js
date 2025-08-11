document.addEventListener('DOMContentLoaded', function() {
    // Load user data
    loadUserData();
    
    // Load interview history
    loadInterviewHistory();
    
    // Logout button
    document.getElementById('logoutButton').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('simuHireUser');
        window.location.href = 'index.html';
    });
});

function loadUserData() {
    // In a real app, this would come from an API
    // For demo, we'll use mock data
    document.getElementById('userName').textContent = 'Aayushi';
    document.getElementById('completedInterviews').textContent = '3';
    document.getElementById('averageScore').textContent = '82%';
    document.getElementById('improvementAreas').textContent = 'Communication, Technical Depth';
}

function loadInterviewHistory() {
    // Mock interview history data
    const history = [
        { date: '2025-03-20', domain: 'Technology', score: '85%', report: 'report1.pdf' },
        { date: '2025-03-22', domain: 'Business', score: '78%', report: 'report2.pdf' },
        { date: '2025-03-24', domain: 'Technology', score: '82%', report: 'report3.pdf' }
    ];
    
    const tableBody = document.getElementById('historyTableBody');
    
    if (history.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">No interview history yet</td></tr>';
        return;
    }
    
    tableBody.innerHTML = '';
    
    history.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.date}</td>
            <td>${item.domain}</td>
            <td>${item.score}</td>
            <td><a href="report.html?report=${item.report}" class="view-report">View Report</a></td>
        `;
        
        tableBody.appendChild(row);
    });
}