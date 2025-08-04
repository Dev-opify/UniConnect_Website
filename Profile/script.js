// Subject emojis mapping
const subjectEmojis = {
    'DECO': '📚',
    'PHYSICS': '🔬',
    'MATHEMATICS': '🔢',
    'CHEMISTRY': '⚗️',
    'BIOLOGY': '🧬',
    'ENGLISH': '📖',
    'HISTORY': '🏛️',
    'GEOGRAPHY': '🌍',
    'COMPUTER SCIENCE': '💻'
};

// Track selected subjects
let selectedSubjects = ['DECO', 'PHYSICS'];

function addSubject() {
    const select = document.getElementById('subjectSelect');
    const selectedValue = select.value;
    
    if (selectedValue && !selectedSubjects.includes(selectedValue)) {
        selectedSubjects.push(selectedValue);
        updateSubjectsDisplay();
        select.value = ''; // Reset select
        
        // Add a little animation feedback
        select.style.transform = 'scale(1.05)';
        setTimeout(() => {
            select.style.transform = 'scale(1)';
        }, 200);
    }
}

function removeSubject(button) {
    const subjectTag = button.parentElement;
    // Get the subject name by removing the emoji and button text
    const fullText = subjectTag.textContent.trim();
    
    // Find the matching subject in our array
    const matchingSubject = selectedSubjects.find(subject => 
        fullText.includes(subject)
    );
    
    if (matchingSubject) {
        // Remove from array
        selectedSubjects = selectedSubjects.filter(subject => subject !== matchingSubject);
        
        // Add exit animation
        subjectTag.style.animation = 'popOut 0.3s ease-out forwards';
        setTimeout(() => {
            updateSubjectsDisplay();
        }, 300);
    }
}

function updateSubjectsDisplay() {
    const container = document.getElementById('selectedSubjects');
    container.innerHTML = '';
    
    selectedSubjects.forEach(subject => {
        const tag = document.createElement('div');
        tag.className = 'subject-tag';
        tag.innerHTML = `
            ${subject} ${subjectEmojis[subject] || '📝'}
            <button type="button" class="remove-btn" onclick="removeSubject(this)">×</button>
        `;
        container.appendChild(tag);
    });
}

function goBack() {
    // Add exit animation
    const container = document.querySelector('.container');
    container.style.animation = 'slideDown 0.5s ease-out forwards';
    setTimeout(() => {
        alert('Going back...');
        // In a real application, you'd use history.back() or redirect here.
    }, 500);
}

function logout(event) {
    if (confirm('Are you sure you want to logout?')) {
        // Add loading animation
        const logoutBtn = event.target;
        logoutBtn.innerHTML = '🚪 Logging out... <div class="loading"></div>';
        logoutBtn.disabled = true;
        
        setTimeout(() => {
            alert('Logged out successfully!');
            logoutBtn.innerHTML = '🚪 Logout';
            logoutBtn.disabled = false;
        }, 2000);
    }
}

// Form submission with animation
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.innerHTML = 'Saving... <div class="loading"></div>';
    saveBtn.disabled = true;
    
    // Simulate save process
    setTimeout(() => {
        saveBtn.innerHTML = '✓ Saved!';
        saveBtn.style.background = 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
        
        setTimeout(() => {
            saveBtn.innerHTML = 'Save Changes';
            saveBtn.style.background = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            saveBtn.disabled = false;
        }, 2000);
    }, 1500);
});

// Initialize subjects display
updateSubjectsDisplay();