// Frontend JavaScript - Fetches data from Backend API

// Backend API URL - uses current host with port 5000
const API_BASE_URL = window.location.protocol + '//' + window.location.hostname + ':5000/api';

// DOM Elements
const studentName = document.getElementById('student-name');
const studentRoll = document.getElementById('student-roll');
const apiStatus = document.getElementById('api-status');

// Fetch student data from backend API
async function fetchStudentData() {
    try {
        const response = await fetch(`${API_BASE_URL}/student`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update DOM with student data
        studentName.textContent = data.name;
        studentRoll.textContent = data.roll_number;
        
        // Update status
        apiStatus.textContent = 'Connected to Backend API';
        apiStatus.className = 'status connected';
        
    } catch (error) {
        console.error('Error fetching student data:', error);
        
        // Show error state
        studentName.textContent = 'Error loading';
        studentName.className = 'value error';
        studentRoll.textContent = 'Error loading';
        studentRoll.className = 'value error';
        
        apiStatus.textContent = `Backend API Error: ${error.message}`;
        apiStatus.className = 'status disconnected';
    }
}

// Health check function
async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        console.log('Backend health:', data);
        return data.status === 'healthy';
    } catch (error) {
        console.error('Health check failed:', error);
        return false;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchStudentData();
});
