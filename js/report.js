document.addEventListener('DOMContentLoaded', function() {
    // Load report data
    loadReportData();
    
    // Set up download button
    document.getElementById('downloadPdfBtn').addEventListener('click', function() {
        // alert('PDF report generation would happen here in a real app. For now, this is a simulation.');
        // In a real app, this would generate and download a PDF
        // Use html2pdf to generate and download PDF
        const reportElement = document.querySelector('.report-container'); // Select the main report content area
        
        if (reportElement) {
            // Create a header element for the PDF
            const pdfHeader = document.createElement('div');
            pdfHeader.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                    <h1 style="color: #4361ee;">SimuHireAI Interview Report</h1>
                    <p>Date: ${new Date().toLocaleDateString()} | Time: ${new Date().toLocaleTimeString()}</p>
                    <!-- Add more invoice details here if needed -->
                </div>
            `;

            // Configure html2pdf options
            const pdfOptions = {
                margin: [15, 15, 15, 15],
                filename: 'simuhire professional interview report review.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true
                },
                pagebreak: { 
                    mode: ['avoid-all', 'css', 'legacy'],
                    before: '.question-feedback, .feedback-section'
                },
                // Add content before the element
                before: pdfHeader
            };

            // Generate and download the PDF
            html2pdf().from(reportElement).set(pdfOptions).save();

        } else {
            alert('Could not find report content to download.');
        }
    });

    // Load interview data from localStorage and display questions/answers
    const interviewDataString = localStorage.getItem('lastInterviewReportData'); // Changed key
    const questionsListDiv = document.getElementById('questionsList');
    const reportDateSpan = document.getElementById('reportDate'); // Get date element
    const reportDomainSpan = document.getElementById('reportDomain'); // Get domain element
    const reportTypeSpan = document.getElementById('reportType'); // Get type element
    const reportDifficultySpan = document.getElementById('reportDifficulty'); // Get difficulty element

    if (interviewDataString) {
        const reportData = JSON.parse(interviewDataString);

        // Populate report metadata
        if (reportData.date) reportDateSpan.textContent = reportData.date;
        if (reportData.domain) reportDomainSpan.textContent = reportData.domain;
        if (reportData.type) reportTypeSpan.textContent = reportData.type;
        if (reportData.difficulty) reportDifficultySpan.textContent = reportData.difficulty;

        // Populate questions and answers
        const interviewData = reportData.questionsAndAnswers; // Get the questions and answers array

        if (interviewData && interviewData.length > 0) {
            // Clear any placeholder content
            questionsListDiv.innerHTML = '';

            // Iterate through the saved data and display questions and answers
            interviewData.forEach((item, index) => {
                const questionElement = document.createElement('div');
                questionElement.classList.add('question-item');

                const questionNumber = index + 1;
                const questionText = item.question || 'N/A';
                const answerText = item.answer && item.answer.trim() !== '' ? item.answer : 'No answer provided'; // Handle empty answers

                questionElement.innerHTML = `
                    <h3>Question ${questionNumber}: ${questionText}</h3>
                    <div class="answer-display">
                        <h4>Your Answer:</h4>
                        <p>${answerText}</p>
                    </div>
                    <!-- You can add feedback for each question here later if you implement evaluation -->
                `;

                questionsListDiv.appendChild(questionElement);
            });
        } else {
            questionsListDiv.innerHTML = '<p>No interview data found.</p>';
        }
        
        // *** Simulate Dynamic Scores and Feedback ***
        simulateReportMetrics(interviewData ? interviewData.length : 0);

    } else {
        questionsListDiv.innerHTML = '<p>No interview data found.</p>';
        simulateReportMetrics(0); // Simulate with 0 questions if no data
    }
});

// *** Function to Simulate Report Metrics ***
function simulateReportMetrics(numberOfQuestions) {
    // Retrieve the actual interview data to base metrics on
    const interviewDataString = localStorage.getItem('lastInterviewReportData');
    let totalAnswerLength = 0;
    let technicalKeywordScore = 0;
    const technicalKeywords = ['function', 'variable', 'array', 'object', 'API', 'database', 'algorithm', 'framework', 'method', 'class', 'component', 'query', 'system', 'process', 'data', 'analysis', 'strategy', 'market', 'finance', 'patient', 'clinical', 'protocol', 'design', 'user', 'education', 'teaching', 'curriculum']; // Add relevant keywords for different domains

    if (interviewDataString) {
        const reportData = JSON.parse(interviewDataString);
        const questionsAndAnswers = reportData.questionsAndAnswers;
        
        if (questionsAndAnswers && questionsAndAnswers.length > 0) {
            questionsAndAnswers.forEach(item => {
                if (item.answer) {
                    totalAnswerLength += item.answer.length;
                    // Simple keyword check
                    const lowerCaseAnswer = item.answer.toLowerCase();
                    technicalKeywords.forEach(keyword => {
                        if (lowerCaseAnswer.includes(keyword)) {
                            technicalKeywordScore += 1;
                        }
                    });
                }
            });
            numberOfQuestions = questionsAndAnswers.length; // Ensure number of questions is correct
        }
    }

    // Simulate overall score based on number of questions and total answer length
    // This is a very basic simulation
    const overallScore = Math.min(60 + numberOfQuestions * 3 + Math.floor(totalAnswerLength / 30) + Math.min(technicalKeywordScore * 5, 20), 100); // Increased weight for answer length
    document.getElementById('overallScore').textContent = overallScore;

    // Simulate individual skill scores based on overall score and keyword count
    const baseScore = overallScore / 10;
    
    // Adjust scores based on keyword presence and answer length
    const communicationScore = Math.min(10, Math.max(5, (baseScore + (totalAnswerLength > 0 ? (Math.log(totalAnswerLength) / Math.log(10)) : 0) + Math.random() * 1).toFixed(1))); // Longer answers slightly improve communication score
    const technicalAccuracyScore = Math.min(10, Math.max(5, (baseScore + Math.min(technicalKeywordScore, 5) + Math.random() * 1).toFixed(1))); // Keyword count improves technical score
    const confidenceScore = Math.min(10, Math.max(5, (baseScore + Math.random() * 2 - 1).toFixed(1))); // Still mostly random for simplicity
    const structureScore = Math.min(10, Math.max(5, (baseScore + (totalAnswerLength > 0 ? (Math.log(totalAnswerLength) / Math.log(10)) * 0.5 : 0) + Math.random() * 1).toFixed(1))); // Longer answers slightly influence structure score

    // Update skill scores and progress bars
    document.querySelector('.score-details .detail-item:nth-child(1) .detail-label').textContent = 'Communication:'; // Ensure label is correct
    document.querySelector('.score-details .detail-item:nth-child(1) .detail-value').textContent = `${communicationScore}/10`;
    document.querySelector('.score-details .detail-item:nth-child(1) .progress-bar .progress-fill').style.width = `${communicationScore * 10}%`;

    document.querySelector('.score-details .detail-item:nth-child(2) .detail-label').textContent = 'Technical Accuracy:'; // Ensure label is correct
    document.querySelector('.score-details .detail-item:nth-child(2) .detail-value').textContent = `${technicalAccuracyScore}/10`;
    document.querySelector('.score-details .detail-item:nth-child(2) .progress-bar .progress-fill').style.width = `${technicalAccuracyScore * 10}%`;

    document.querySelector('.score-details .detail-item:nth-child(3) .detail-label').textContent = 'Confidence:'; // Ensure label is correct
    document.querySelector('.score-details .detail-item:nth-child(3) .detail-value').textContent = `${confidenceScore}/10`;
    document.querySelector('.score-details .detail-item:nth-child(3) .progress-bar .progress-fill').style.width = `${confidenceScore * 10}%`;

    document.querySelector('.score-details .detail-item:nth-child(4) .detail-label').textContent = 'Structure:'; // Ensure label is correct
    document.querySelector('.score-details .detail-item:nth-child(4) .detail-value').textContent = `${structureScore}/10`;
    document.querySelector('.score-details .detail-item:nth-child(4) .progress-bar .progress-fill').style.width = `${structureScore * 10}%`;
    
    // Simulate strengths, improvements, recommendations (more varied based on scores)
    const strengthsList = document.getElementById('strengthsList');
    const improvementsList = document.getElementById('improvementsList');
    const recommendationsList = document.getElementById('recommendationsList');

    let generatedStrengths = [];
    let generatedImprovements = [];
    let generatedRecommendations = [];

    // Simple logic to generate feedback based on scores (more advanced AI needed for real feedback)
    if (overallScore > 85) generatedStrengths.push('Overall strong performance.');
    if (communicationScore > 7.5) generatedStrengths.push('Clear and concise communication.'); else generatedImprovements.push('Work on clarity and conciseness.');
    if (technicalAccuracyScore > 7.5) generatedStrengths.push('Good understanding of concepts.'); else generatedImprovements.push('Expand on technical details.');
    if (confidenceScore > 7) generatedStrengths.push('Appeared confident.'); else generatedImprovements.push('Show more confidence.');
    if (structureScore > 7.5) generatedStrengths.push('Well-structured answers.'); else generatedImprovements.push('Structure answers more clearly.');
    
    if (generatedStrengths.length === 0) generatedStrengths.push('Needs more practice across all areas.');
    if (generatedImprovements.length === 0) generatedImprovements.push('Minor areas for refinement.');
    
    generatedRecommendations.push('Review practice interviews.');
    if (improvementsList.innerHTML.includes('structure')) generatedRecommendations.push('Practice the STAR method.');
    if (improvementsList.innerHTML.includes('technical')) generatedRecommendations.push('Review core concepts.');

    strengthsList.innerHTML = generatedStrengths.map(item => `<li>${item}</li>`).join('');
    improvementsList.innerHTML = generatedImprovements.map(item => `<li>${item}</li>`).join('');
    recommendationsList.innerHTML = generatedRecommendations.map(item => `<li>${item}</li>`).join('');

}

// Keep the original loadReportData for potential future use or remove if not needed
function loadReportData() {
    // This function is now mainly for placeholder/mock data if localStorage is empty
    // The primary logic for loading from localStorage is now in the DOMContentLoaded listener
    
    // You can remove this function entirely if you only want to load from localStorage
    // or modify it to handle cases where localStorage might not have the latest data
}

// Load voices when they become available (needed for speakQuestion in interview.js if this was one combined file)
// If auth.js is separate and loads after report.js, this might not be needed here
/*
speechSynthesis.onvoiceschanged = function() {
    // Voices are now loaded
};
*/