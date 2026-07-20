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
