document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const startInterviewBtn = document.getElementById('startInterviewBtn');
    const interviewScreen = document.getElementById('interviewScreen');
    const setupScreen = document.querySelector('.interview-setup');
    const domainSelect = document.getElementById('domainSelect');
    const typeSelect = document.getElementById('typeSelect');
    const difficultySelect = document.getElementById('difficultySelect');
    const questionBox = document.getElementById('questionBox');
    const currentQuestionSpan = document.getElementById('currentQuestion');
    const totalQuestionsSpan = document.getElementById('totalQuestions');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const prevQuestionBtn = document.getElementById('prevQuestionBtn');
    const finishInterviewBtn = document.getElementById('finishInterviewBtn');
    const timeSpan = document.getElementById('time');
    const interviewDomain = document.getElementById('interviewDomain');
    const answerText = document.getElementById('answerText');
    const recordBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopBtn');
    const playBtn = document.getElementById('playBtn');
    
    // Interview state
    let currentQuestionIndex = 0;
    let questions = [];
    let timerInterval;
    let secondsLeft = 90; // 1.5 minutes per question
    let mediaRecorder;
    let audioChunks = [];
    let audioBlob;
    let audioUrl;
    let speechSynthesis = window.speechSynthesis;
    let evaluationResults = [];
    let interviewData = []; // Array to store questions and answers
    
    // Speech recognition setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;
    let isRecording = false;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            console.log('Speech recognition started.');
            recordBtn.classList.add('recording-active');
        };

        recognition.onresult = (event) => {
            console.log('Speech recognition result event:', event);
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            
            answerText.value = transcript;
            console.log('Transcription:', transcript);
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            isRecording = false;
            recordBtn.innerHTML = '<span class="icon">🎤</span> Start Recording';
        };

        recognition.onend = () => {
            console.log('Speech recognition ended.');
            isRecording = false;
            recordBtn.classList.remove('recording-active');
            // Do not change button text here, let stopRecording handle it
        };
    }
    
    // Question bank (in a real app, this would come from an API)
    const questionBank = {
        tech: {
            behavioral: {
                beginner: [
                    "Tell me about yourself.",
                    "What are your strengths and weaknesses?",
                    "Why do you want to work for our company?",
                    "Describe a time you worked in a team.",
                    "Where do you see yourself in 5 years?"
                ],
                intermediate: [
                    "Describe a time you faced a conflict at work and how you handled it.",
                    "Tell me about a time you failed and what you learned from it.",
                    "How do you handle tight deadlines or pressure?",
                    "Describe a time you had to persuade someone at work.",
                    "Tell me about a time you had to learn something new quickly."
                ],
                advanced: [
                    "Describe a situation where you had to make a difficult decision without all the information you needed.",
                    "Tell me about a time you had to adapt to a significant change at work.",
                    "Describe a time when you had to work with someone difficult.",
                    "Tell me about a time you took initiative on a project.",
                    "Describe a time you had to convince your team to adopt your idea."
                ]
            },
            technical: {
                beginner: [
                    "Explain the difference between let, const, and var in JavaScript.",
                    "What is a closure in programming?",
                    "Explain the concept of object-oriented programming.",
                    "What are the main HTTP methods and when would you use each?",
                    "What is version control and why is it important?"
                ],
                intermediate: [
                    "Explain how 'this' works in JavaScript.",
                    "What are promises in JavaScript and how do they work?",
                    "Explain the difference between SQL and NoSQL databases.",
                    "What is REST and what are its constraints?",
                    "Explain the concept of Big O notation."
                ],
                advanced: [
                    "Explain the React component lifecycle methods.",
                    "How would you optimize a slow-loading web application?",
                    "Explain the difference between authentication and authorization.",
                    "Describe how you would design a scalable microservice architecture.",
                    "Explain the CAP theorem and its implications."
                ]
            },
            mixed: {
                beginner: [
                    "Tell me about yourself.",
                    "What is your experience with version control systems?",
                    "Describe a time you solved a difficult problem.",
                    "Explain the difference between frontend and backend development.",
                    "Why did you choose to become a developer?"
                ],
                intermediate: [
                    "Describe your experience with agile methodologies.",
                    "How would you explain a technical concept to a non-technical person?",
                    "What's your approach to testing your code?",
                    "Tell me about a challenging bug you fixed.",
                    "How do you stay updated with the latest technologies?"
                ],
                advanced: [
                    "Describe your experience with system design.",
                    "How would you handle a situation where requirements change mid-sprint?",
                    "Explain how you would implement authentication in a web app.",
                    "Describe a time you had to make a technical trade-off.",
                    "How do you balance technical debt with delivering features?"
                ]
            }
        },
        business: {
            behavioral: {
                beginner: [
                    "Tell me about yourself.",
                    "Why do you want to work in this industry?",
                    "What are your strengths and weaknesses?",
                    "Where do you see yourself in five years?",
                    "Why should we hire you?"
                ],
                intermediate: [
                    "Describe a time you had to work under pressure.",
                    "Tell me about a time you had to persuade someone.",
                    "Describe a time you had to make a difficult decision.",
                    "Tell me about a time you failed and what you learned.",
                    "Describe a time you had to work with a difficult team member."
                ],
                advanced: [
                    "Describe a time you had to adapt to significant change.",
                    "Tell me about a time you took initiative on a project.",
                    "Describe a complex problem you solved.",
                    "Tell me about a time you had to manage conflicting priorities.",
                    "Describe a time you had to convince your team to adopt your idea."
                ]
            },
            technical: {
                beginner: [
                    "Explain the difference between revenue and profit.",
                    "What are the key components of a business plan?",
                    "Explain the concept of supply and demand.",
                    "What is SWOT analysis?",
                    "What are the 4 Ps of marketing?"
                ],
                intermediate: [
                    "How would you analyze a company's financial health?",
                    "Explain the concept of economies of scale.",
                    "What factors would you consider when pricing a new product?",
                    "Explain the difference between leadership and management.",
                    "What is the importance of market segmentation?"
                ],
                advanced: [
                    "How would you evaluate the potential of a new market?",
                    "Explain how you would conduct a competitive analysis.",
                    "Describe how you would develop a go-to-market strategy.",
                    "Explain the concept of disruptive innovation.",
                    "How would you approach a turnaround situation for an underperforming business unit?"
                ]
            },
            mixed: {
                beginner: [
                    "Tell me about yourself.",
                    "What interests you about this business role?",
                    "Describe a time you worked in a team.",
                    "What do you know about our company?",
                    "What are your career goals?"
                ],
                intermediate: [
                    "Describe your experience with data analysis.",
                    "How would you present complex information to stakeholders?",
                    "Tell me about a time you identified a business opportunity.",
                    "Describe a time you had to analyze data to make a decision.",
                    "How do you prioritize tasks when managing multiple projects?"
                ],
                advanced: [
                    "Describe a time you developed a strategic plan.",
                    "How would you approach entering a new international market?",
                    "Tell me about a time you had to make a difficult financial decision.",
                    "Describe a time you led a cross-functional team.",
                    "How would you evaluate the success of a business initiative?"
                ]
            }
        },
        healthcare: {
            behavioral: {
                beginner: [
                    "Tell me about yourself.",
                    "Why did you choose a career in healthcare?",
                    "What are your strengths and weaknesses?",
                    "How do you handle stressful situations?",
                    "Why do you want to work at our facility?"
                ],
                intermediate: [
                    "Describe a time you dealt with a difficult patient.",
                    "Tell me about a time you made a mistake at work and how you handled it.",
                    "Describe a time you had to work as part of a healthcare team.",
                    "Tell me about a time you had to follow strict protocols.",
                    "Describe a time you had to deliver bad news to a patient or family."
                ],
                advanced: [
                    "Describe a time you had to make a quick decision in an emergency situation.",
                    "Tell me about a time you advocated for a patient.",
                    "Describe a time you had to handle a conflict with a colleague.",
                    "Tell me about a time you improved a process at your workplace.",
                    "Describe a time you had to balance multiple urgent tasks."
                ]
            },
            technical: {
                beginner: [
                    "What are the vital signs you would monitor in a patient?",
                    "Explain HIPAA and its importance.",
                    "What is the proper hand hygiene procedure?",
                    "Explain the difference between acute and chronic conditions.",
                    "What are the steps in the nursing process?"
                ],
                intermediate: [
                    "How would you handle a patient who refuses treatment?",
                    "Explain how you would prioritize care for multiple patients.",
                    "What are the key components of patient education?",
                    "Explain the importance of cultural competence in healthcare.",
                    "How would you document a patient interaction?"
                ],
                advanced: [
                    "Describe how you would handle a medical error.",
                    "Explain how you would manage a healthcare team during a crisis.",
                    "How would you implement evidence-based practice in your work?",
                    "Describe your approach to end-of-life care discussions.",
                    "How would you handle a situation where a colleague is not following protocols?"
                ]
            },
            mixed: {
                beginner: [
                    "Tell me about yourself.",
                    "What interests you about this healthcare position?",
                    "Describe a time you provided excellent patient care.",
                    "How do you maintain patient confidentiality?",
                    "What do you find most rewarding about healthcare work?"
                ],
                intermediate: [
                    "Describe your experience with electronic health records.",
                    "How do you handle working long shifts?",
                    "Tell me about a time you had to explain a complex medical concept to a patient.",
                    "Describe a time you had to work with a difficult family member.",
                    "How do you stay current with healthcare advancements?"
                ],
                advanced: [
                    "Describe a time you had to make an ethical decision in patient care.",
                    "How would you handle a situation where a patient's family disagrees with the treatment plan?",
                    "Tell me about a time you improved patient outcomes.",
                    "Describe your experience with quality improvement initiatives.",
                    "How would you handle a situation where you suspect a colleague is impaired at work?"
                ]
            }
        },
        design: { // Adding Design domain
            behavioral: {
                beginner: [
                    "Tell me about your design process.",
                    "How do you handle feedback on your designs?",
                    "Describe a time you worked on a collaborative design project.",
                    "Where do you find inspiration for your designs?",
                    "Why are you interested in this design role?"
                ],
                intermediate: [
                    "Describe a challenging design problem you faced and how you solved it.",
                    "Tell me about a time you had to compromise on a design decision.",
                    "How do you prioritize design tasks?",
                    "Describe a time you had to present your design to stakeholders.",
                    "How do you stay updated with design trends?"
                ],
                advanced: [
                    "Describe a time you had to advocate for user needs in a project.",
                    "Tell me about your experience with user research.",
                    "How do you measure the success of your designs?",
                    "Describe a complex UX problem you tackled.",
                    "How would you approach designing for accessibility?"
                ]
            },
            technical: { // Design technical questions might be less common, adding some general ones
                beginner: [
                    "What is the difference between UI and UX design?",
                    "Explain the concept of responsive design.",
                    "What is the importance of typography in design?",
                    "What is a style guide or design system?",
                    "What file formats do you typically work with?"
                ],
                intermediate: [
                    "Explain the principles of visual hierarchy.",
                    "How do you ensure consistency across a design?",
                    "Describe your experience with design tools like Figma, Sketch, or Adobe XD.",
                    "How do you prepare design assets for developers?",
                    "Explain the concept of atomic design."
                ],
                advanced: [
                    "How do you approach designing for different platforms (web, mobile, etc.)?",
                    "Describe your experience with prototyping and user testing.",
                    "How do you incorporate user feedback into your design iterations?",
                    "Explain the concept of design debt.",
                    "How would you design a scalable and maintainable design system?"
                ]
            },
            mixed: { // Combining behavioral and technical for design
                beginner: [
                    "Tell me about yourself.",
                    "What interests you most about design?",
                    "Describe a favorite design project you've worked on.",
                    "How do you handle criticism of your work?",
                    "What are your career goals in design?"
                ],
                intermediate: [
                    "Describe a time you had to explain a technical constraint to a designer or vice versa.",
                    "How do you collaborate with developers?",
                    "Tell me about a time you had to balance business goals with user needs in a design.",
                    "Describe a time you used data to inform a design decision.",
                    "How do you stay organized during a design project?"
                ],
                advanced: [
                    "Describe your experience leading a design project.",
                    "How would you approach redesigning a complex product?",
                    "Tell me about a time you had to influence product strategy through design.",
                    "Describe your experience with design sprints or similar methodologies.",
                    "How do you measure the impact of your design work on business metrics?"
                ]
            }
        },
        education: { // Adding Education domain
            behavioral: {
                beginner: [
                    "Tell me about your teaching philosophy.",
                    "Why did you choose a career in education?",
                    "What are your strengths and weaknesses as an educator?",
                    "Describe a time you motivated a struggling student.",
                    "Where do you see yourself in five years in your teaching career?"
                ],
                intermediate: [
                    "Describe a time you dealt with a challenging student behavior.",
                    "Tell me about a time you had to adapt your teaching style for a student.",
                    "Describe a time you collaborated with other teachers or staff.",
                    "How do you handle pressure in the classroom?",
                    "Tell me about a time you had to teach a difficult concept."
                ],
                advanced: [
                    "Describe a time you implemented a new teaching strategy and its results.",
                    "Tell me about your experience with curriculum development.",
                    "How do you incorporate technology into your teaching?",
                    "Describe a time you had to communicate with a difficult parent.",
                    "How do you assess student learning and provide feedback?"
                ]
            },
            technical: { // Adding Education technical questions (might be related to educational tools/theories)
                beginner: [
                    "What is differentiated instruction?",
                    "Explain the importance of learning objectives.",
                    "What are some common educational technologies you use?",
                    "Explain Bloom's Taxonomy.",
                    "What is formative vs. summative assessment?"
                ],
                intermediate: [
                    "How do you use data to inform your teaching practices?",
                    "Explain the principles of Universal Design for Learning (UDL).",
                    "Describe your experience with learning management systems (LMS).",
                    "How do you ensure your classroom is inclusive?",
                    "Explain the concept of project-based learning."
                ],
                advanced: [
                    "Describe your experience with educational research or professional development.",
                    "How do you design assessments that accurately measure learning?",
                    "Explain a learning theory that influences your teaching.",
                    "How do you address achievement gaps in the classroom?",
                    "Describe your experience mentoring other teachers or staff."
                ]
            },
            mixed: { // Combining behavioral and technical for education
                beginner: [
                    "Tell me about yourself.",
                    "What excites you about teaching [Subject/Grade Level]?",
                    "Describe a favorite lesson you've taught.",
                    "How do you build rapport with students?",
                    "What are your goals as an educator?"
                ],
                intermediate: [
                    "Describe a time you used a specific teaching strategy to address a learning challenge.",
                    "How do you communicate student progress to parents?",
                    "Tell me about a time you collaborated on lesson planning.",
                    "Describe a time you had to adapt a lesson plan on the fly.",
                    "How do you create an engaging learning environment?"
                ],
                advanced: [
                    "Describe your experience developing curriculum units.",
                    "How do you incorporate real-world applications into your lessons?",
                    "Tell me about a time you used student feedback to improve your teaching.",
                    "Describe your experience leading professional development sessions.",
                    "How do you stay current with best practices in education?"
                ]
            }
        }
    };
    
    // Define domain names mapping
    const domainNames = {
        tech: 'Technology',
        business: 'Business',
        healthcare: 'Healthcare',
        design: 'Design',
        education: 'Education'
    };
    
    // Initialize from URL parameters if present
    const urlParams = new URLSearchParams(window.location.search);
    const domainParam = urlParams.get('domain');
    
    if (domainParam) {
        domainSelect.value = domainParam;
    }
    
    // Event Listeners
    startInterviewBtn.addEventListener('click', startInterview);
    nextQuestionBtn.addEventListener('click', nextQuestion);
    prevQuestionBtn.addEventListener('click', prevQuestion);
    finishInterviewBtn.addEventListener('click', finishInterview);
    recordBtn.addEventListener('click', startRecording);
    stopBtn.addEventListener('click', stopRecording);
    playBtn.addEventListener('click', playRecording);
    
    // Get references to video and mic buttons
    const toggleVideoBtn = document.getElementById('toggleVideoBtn');
    const toggleMicBtn = document.getElementById('toggleMicBtn');

    // Add event listeners to toggle buttons
    if (toggleVideoBtn) {
        toggleVideoBtn.addEventListener('click', () => {
            // Safely check if srcObject and video tracks exist
            const videoTrack = userVideo && userVideo.srcObject ? userVideo.srcObject.getVideoTracks()[0] : null;
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                toggleVideoBtn.textContent = videoTrack.enabled ? 'Disable Video' : 'Enable Video';
            } else {
                console.warn('Cannot toggle video: No video track found.');
            }
        });
    }

    if (toggleMicBtn) {
        toggleMicBtn.addEventListener('click', () => {
            // Safely check if srcObject and audio tracks exist
            const audioTrack = userVideo && userVideo.srcObject ? userVideo.srcObject.getAudioTracks()[0] : null;
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                toggleMicBtn.textContent = audioTrack.enabled ? 'Disable Mic' : 'Enable Mic';
            } else {
                console.warn('Cannot toggle microphone: No audio track found.');
            }
        });
    }
    
    function startInterview() {
        const domain = domainSelect.value;
        const type = typeSelect.value;
        const difficulty = difficultySelect.value;
        
        // Get questions based on selections
        questions = questionBank[domain]?.[type]?.[difficulty] || [];
        
        // Check if questions were found
        if (questions.length === 0) {
            alert(`No questions found for the selected criteria: ${domainNames[domain]} - ${type} - ${difficulty}.`);
            // Optionally reset the UI or stay on the setup screen
            setupScreen.style.display = 'block';
            interviewScreen.style.display = 'none';
            return; // Stop the function execution
        }
        
        // Update UI
        setupScreen.style.display = 'none';
        interviewScreen.style.display = 'block';
        
        // Set domain title
        interviewDomain.textContent = `${domainNames[domain]} Interview`;
        totalQuestionsSpan.textContent = questions.length;
        
        // Start with first question
        currentQuestionIndex = 0;
        showQuestion();
    }
    
    function showQuestion() {
        // Save answer for the previous question before showing the new one
        if (currentQuestionIndex > 0) {
            saveAnswer(currentQuestionIndex - 1);
        }

        // Update question text
        const question = questions[currentQuestionIndex];
        questionBox.textContent = question;
        
        // Speak the question using AI voice
        speakQuestion(question);
        
        // Update question counter
        currentQuestionSpan.textContent = currentQuestionIndex + 1;
        
        // Manage button states
        prevQuestionBtn.disabled = currentQuestionIndex === 0;
        nextQuestionBtn.style.display = currentQuestionIndex < questions.length - 1 ? 'block' : 'none';
        finishInterviewBtn.style.display = currentQuestionIndex === questions.length - 1 ? 'block' : 'none';
        
        // Reset answer field and recording
        answerText.value = '';
        resetRecording();
        
        // Stop and restart speech recognition for the new question
        if (recognition) {
            if (isRecording) {
                 recognition.stop(); // Ensure recognition is stopped if still active
                 isRecording = false; // Update state
            }
            // A small delay might be needed for some browsers after stopping before starting again
             setTimeout(() => {
                 try {
                    console.log('Attempting to start speech recognition...');
                    recognition.start();
                    isRecording = true;
                    console.log('Speech recognition started for new question.');
                 } catch (error) {
                     console.warn('Failed to start speech recognition:', error);
                     isRecording = false;
                 }
             }, 100);
        }
        
        // Reset timer
        resetTimer();
    }
    
    function speakQuestion(question) {
        if (speechSynthesis) {
            // Cancel any ongoing speech
            speechSynthesis.cancel();
            
            const utterance = new SpeechSynthesisUtterance(question);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            
            // Select a voice (try to find a natural-sounding one)
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => 
                voice.name.includes('Google') || 
                voice.name.includes('Natural') || 
                voice.name.includes('Microsoft David')
            );
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            
            speechSynthesis.speak(utterance);
        }
    }
    
    function resetTimer() {
        clearInterval(timerInterval);
        secondsLeft = 90;
        updateTimerDisplay();
        startTimer();
    }
    
    function startTimer() {
        timerInterval = setInterval(() => {
            secondsLeft--;
            updateTimerDisplay();
            
            if (secondsLeft <= 0) {
                clearInterval(timerInterval);
                // Auto move to next question if time runs out
                if (currentQuestionIndex < questions.length - 1) {
                    nextQuestion();
                }
            }
        }, 1000);
    }
    
    function updateTimerDisplay() {
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        timeSpan.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Change color when time is running low
        if (secondsLeft <= 30) {
            timeSpan.style.color = 'var(--danger-color)';
        } else {
            timeSpan.style.color = 'var(--dark-color)';
        }
    }
    
    function nextQuestion() {
        // Save answer for the current question before moving
        saveAnswer(currentQuestionIndex);

        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion();
        }
    }
    
    function prevQuestion() {
        // Save answer for the current question before moving back
        saveAnswer(currentQuestionIndex);

        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion();
        }
    }
    
    async function startRecording() {
        try {
            audioChunks = [];
            
            // Stop existing recognition if active
            if (recognition && isRecording) {
                recognition.stop();
                isRecording = false;
                console.log('Stopped existing recognition.');
            }

            // Clear previous transcription
            answerText.value = '';

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            
            // Log tracks to inspect the stream content
            console.log('Stream tracks:', stream.getTracks());

            // Display the user's video in the video element
            const userVideo = document.getElementById('userVideo');
            const videoOverlay = document.getElementById('videoOverlay');
            if (userVideo) {
                userVideo.srcObject = stream;
                // Hide the overlay once the video starts playing
                userVideo.onplay = () => {
                    if (videoOverlay) {
                        videoOverlay.style.display = 'none';
                    }
                };
            }
            
            // Use a video format that supports audio and video
            const options = { mimeType: 'video/webm' };
            
            // Check if the browser supports this mime type, fall back if necessary (though webm is widely supported)
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                console.warn(`${options.mimeType} is not supported. Recording may not work.`);
            }

            mediaRecorder = new MediaRecorder(stream, options);
            
            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                // The blob now contains both audio and video
                audioBlob = new Blob(audioChunks, { type: 'video/webm' });
                audioUrl = URL.createObjectURL(audioBlob);
                playBtn.disabled = false;
            };
            
            // Start the MediaRecorder first
            mediaRecorder.start();
            console.log('MediaRecorder started.');

            // Then attempt to start speech recognition immediately after
            if (recognition) {
                 console.log('Attempting to start speech recognition...');
                 try {
                    recognition.start();
                    isRecording = true;
                    console.log('Speech recognition started for new question.');
                 } catch (error) {
                     console.warn('Failed to start speech recognition:', error);
                     isRecording = false;
                 }
            }
            
            recordBtn.disabled = true;
            stopBtn.disabled = false;
            playBtn.disabled = true;
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    }
    
    function stopRecording() {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            recordBtn.disabled = false;
            stopBtn.disabled = true;
            
            // Stop speech recognition when recording stops
            if (recognition && isRecording) {
                recognition.stop();
                isRecording = false;
                console.log('Speech recognition stopped with recording.');
            }
            
            // Stop all tracks in the stream
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            // Update UI
            recordBtn.innerHTML = '<span class="icon">🎤</span> Start Recording';
        }
    }
    
    function playRecording() {
        if (audioUrl) {
            const userVideo = document.getElementById('userVideo');
            if (userVideo) {
                // Assign the blob URL to the video element and play
                userVideo.srcObject = null; // Disconnect the live stream
                userVideo.src = audioUrl;
                userVideo.controls = true; // Add controls to the video player
                userVideo.play();
                console.log('Playing recorded media.');
            }
        }
    }
    
    function resetRecording() {
        audioChunks = [];
        audioBlob = null;
        audioUrl = null;
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        playBtn.disabled = true;
        recordBtn.innerHTML = '<span class="icon">🎤</span> Start Recording';
    }
    
    function evaluateAnswer() {
        const question = questions[currentQuestionIndex];
        const answer = answerText.value.trim();
        
        if (answer.length === 0) {
            return; // Skip evaluation if no answer
        }
        
        // Simulate AI evaluation (in a real app, this would call an API)
        const evaluation = {
            question,
            answer,
            feedback: generateFeedback(question, answer),
            score: Math.floor(Math.random() * 40) + 60, // Random score between 60-100 for demo
            strengths: getRandomStrengths(),
            improvements: getRandomImprovements()
        };
        
        evaluationResults.push(evaluation);
    }
    
    function generateFeedback(question, answer) {
        // Simple keyword-based feedback simulation
        const feedbacks = [
            `Your answer addressed the main points of the question about "${question.split(' ')[0]}".`,
            `You provided a relevant response, but could expand more on specific details.`,
            `Good attempt at answering. Consider structuring your response more clearly next time.`,
            `Your answer shows understanding of the topic. Try to include more examples.`,
            `Well-articulated response that demonstrates your knowledge effectively.`
        ];
        
        return feedbacks[Math.floor(Math.random() * feedbacks.length)];
    }
    
    function getRandomStrengths() {
        const strengths = [
            "Clear communication",
            "Technical knowledge",
            "Problem-solving approach",
            "Relevant examples",
            "Structured response",
            "Confident delivery",
            "Industry awareness"
        ];
        
        // Return 2-3 random strengths
        return shuffleArray(strengths).slice(0, 2 + Math.floor(Math.random() * 2));
    }
    
    function getRandomImprovements() {
        const improvements = [
            "Provide more specific examples",
            "Structure your answer more clearly",
            "Expand on technical details",
            "Improve time management",
            "Show more enthusiasm",
            "Connect answers to company values",
            "Demonstrate more leadership qualities"
        ];
        
        // Return 1-2 random improvements
        return shuffleArray(improvements).slice(0, 1 + Math.floor(Math.random() * 2));
    }
    
    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }
    
    function finishInterview() {
        clearInterval(timerInterval);
        
        // Save the answer for the last question
        saveAnswer(currentQuestionIndex);

        // Stop any ongoing recording
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
        
        // Stop any speech
        if (speechSynthesis) {
            speechSynthesis.cancel();
        }
        
        alert('Interview completed! Your report is being generated.');
        
        // Gather all data to save
        const reportDataToSave = {
            date: new Date().toLocaleDateString(), // Save current date
            domain: domainSelect.value,
            type: typeSelect.value,
            difficulty: difficultySelect.value,
            questionsAndAnswers: interviewData
            // Add simulated evaluation/scores here if needed for the report structure
        };

        // Save all interview data to localStorage
        localStorage.setItem('lastInterviewReportData', JSON.stringify(reportDataToSave));

        // Redirect to report page
        window.location.href = 'report.html';
    }
    
    // Helper function to save the current question and answer
    function saveAnswer(index) {
        if (questions[index]) {
            interviewData[index] = {
                question: questions[index],
                answer: answerText.value.trim()
            };
            console.log(`Saved answer for question ${index}:`, interviewData[index]);
        }
    }
    
    // Load voices when they become available
    speechSynthesis.onvoiceschanged = function() {
        // Voices are now loaded
    };
});