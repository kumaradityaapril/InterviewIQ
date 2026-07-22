import axios from "axios";

const API_URL = "http://localhost:3000/api/interview";

export async function generateReport(formData) {
    try {
        const response = await axios.post(API_URL, formData, {
            withCredentials: true,
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (err) {
        console.error("Error generating report:", err);
        throw err;
    }
}

export async function getReports() {
    try {
        const response = await axios.get(API_URL, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Error fetching reports:", err);
        throw err;
    }
}

export async function getReportById(id) {
    try {
        const response = await axios.get(`${API_URL}/${id}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Error fetching report by ID:", err);
        throw err;
    }
}

export async function startPracticeSession(reportId) {
    try {
        const response = await axios.post(`${API_URL}/practice/start`, { reportId }, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Error starting practice session:", err);
        throw err;
    }
}

export async function respondPracticeQuestion(payload) {
    try {
        const response = await axios.post(`${API_URL}/practice/respond`, payload, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Error evaluating practice response:", err);
        throw err;
    }
}

export async function savePracticeSession(payload) {
    try {
        const response = await axios.post(`${API_URL}/practice/save`, payload, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Error saving practice session:", err);
        throw err;
    }
}

export async function getPracticeHistory() {
    try {
        const response = await axios.get(`${API_URL}/practice/history`, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Error fetching practice history:", err);
        throw err;
    }
}

export async function tailorResume(id) {
    try {
        const response = await axios.get(`${API_URL}/reports/${id}/tailor`, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Error tailoring resume:", err);
        throw err;
    }
}

export async function tailorCustomResume(formBody) {
    try {
        const response = await axios.post(`${API_URL}/resume/tailor-custom`, formBody, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Error tailoring custom resume:", err);
        throw err;
    }
}

export async function parseResumeToForm(id) {
    try {
        const response = await axios.get(`${API_URL}/reports/${id}/parse-resume-to-form`, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Error parsing resume context to form:", err);
        throw err;
    }
}
